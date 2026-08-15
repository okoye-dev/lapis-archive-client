import { create } from "zustand";
import { persist } from "zustand/middleware";

export type QueueStatus =
  | "queued"
  | "uploading"
  | "storing"
  | "paused"
  | "done"
  | "error";

export interface CompletedPart {
  partNumber: number;
  etag: string;
}

export interface QueueItem {
  id: string;
  name: string;
  size: number;
  type: string;
  status: QueueStatus;
  progress: number;
  error?: string;
  // Multipart fields; absent for small single-PUT files.
  storageKey?: string;
  uploadId?: string;
  partSize?: number;
  partCount?: number;
  parts?: CompletedPart[];
}

// Bytes the bucket has confirmed, capped at the file size.
export function confirmedBytes(item: QueueItem): number {
  if (!item.partSize || !item.parts) return 0;
  return Math.min(item.parts.length * item.partSize, item.size);
}

export function derivedProgress(item: QueueItem): number {
  if (item.status === "done") return 100;
  if (item.size <= 0) return 0;
  return Math.min(99, Math.round((confirmedBytes(item) / item.size) * 100));
}

interface QueueState {
  items: QueueItem[];
  addItems: (items: QueueItem[]) => void;
  patchItem: (id: string, next: Partial<QueueItem>) => void;
  removeItem: (id: string) => void;
  clearDone: () => void;
  // After a reload, multipart items wait as paused; single-PUT restart.
  resetInterrupted: () => void;
}

export const useUploadQueueStore = create<QueueState>()(
  persist(
    (set, get) => ({
      items: [],

      addItems: (items) => set({ items: [...get().items, ...items] }),

      patchItem: (id, next) =>
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, ...next } : item,
          ),
        }),

      removeItem: (id) =>
        set({ items: get().items.filter((item) => item.id !== id) }),

      clearDone: () =>
        set({ items: get().items.filter((item) => item.status !== "done") }),

      resetInterrupted: () =>
        set({
          items: get().items.map((item) => {
            const interrupted =
              item.status === "uploading" || item.status === "storing";
            const status = interrupted
              ? item.uploadId
                ? "paused"
                : "queued"
              : item.status;
            return { ...item, status, progress: derivedProgress({ ...item, status }) };
          }),
        }),
    }),
    {
      name: "upload-queue",
      version: 1,
      migrate: (state) => {
        // v0 items predate multipart; the optional fields just stay absent.
        const old = state as
          | { items?: (QueueItem & { progress?: number })[] }
          | undefined;
        return {
          items: (old?.items ?? []).map(({ progress: _p, ...rest }) => rest),
        };
      },
      // progress is derived, so don't persist a stale copy.
      partialize: (state) => ({
        items: state.items.map(({ progress: _progress, ...rest }) => rest),
      }),
    },
  ),
);
