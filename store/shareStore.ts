import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createShare as createShareApi,
  type CreatedShare,
} from "@/api/shares";

// A single share the sharer created, remembered locally for the dashboard
// history. The access code is deliberately NOT stored: the backend only
// keeps it hashed and shows it once, so a lost code means re-sharing.
export interface ShareRecord {
  slug: string;
  link: string;
  fileName: string;
  fileSize: number;
  storageKey: string;
  recipientEmail?: string;
  shareCount: number;
  createdAt: string;
  expiresAt: string;
}

interface CreateShareInput {
  fileName: string;
  storageKey: string;
  fileSize: number;
  recipientEmail?: string;
}

interface ShareState {
  shares: ShareRecord[];
  sharerEmail: string | null;
  setSharerEmail: (email: string) => void;
  createShare: (input: CreateShareInput) => Promise<CreatedShare>;
}

export const useShareStore = create<ShareState>()(
  persist(
    (set, get) => ({
      shares: [],
      sharerEmail: null,

      setSharerEmail: (email) => set({ sharerEmail: email }),

      createShare: async ({ fileName, storageKey, fileSize, recipientEmail }) => {
        const created = await createShareApi({
          storageKey,
          ownerEmail: get().sharerEmail ?? undefined,
          recipientEmail,
        });

        const record: ShareRecord = {
          slug: created.slug,
          link: `${window.location.origin}/share/${created.slug}`,
          fileName: created.fileName || fileName,
          fileSize: created.fileSize || fileSize,
          storageKey,
          recipientEmail,
          shareCount: created.shareCount,
          createdAt: new Date().toISOString(),
          expiresAt: created.expiresAt,
        };

        // A file keeps one link for life (the backend rotates its code), so
        // re-sharing replaces the existing entry instead of stacking a copy.
        set({
          shares: [
            record,
            ...get().shares.filter((s) => s.storageKey !== storageKey),
          ],
        });
        return created;
      },
    }),
    { name: "share-storage" },
  ),
);
