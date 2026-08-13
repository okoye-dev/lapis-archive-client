import { create } from "zustand";
import { persist } from "zustand/middleware";

export type QueueStatus =
  | "queued"
  | "uploading"
  | "storing"
  | "done"
  | "error";

export interface QueueItem {
  id: string;
  name: string;
  size: number;
  type: string;
  status: QueueStatus;
  progress: number;
  error?: string;
}

interface QueueState {
  items: QueueItem[];
  addItems: (items: QueueItem[]) => void;
  patchItem: (id: string, next: Partial<QueueItem>) => void;
  removeItem: (id: string) => void;
  clearDone: () => void;
  // A reload kills the in-flight XHR, so anything left mid-flight is stale.
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
          items: get().items.map((item) =>
            item.status === "uploading" || item.status === "storing"
              ? { ...item, status: "queued", progress: 0 }
              : item,
          ),
        }),
    }),
    { name: "upload-queue" },
  ),
);
