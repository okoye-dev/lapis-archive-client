import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LinkData } from "@/types/types";

// No 0/O/1/I — avoids characters that are easy to misread when typed by hand.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SLUG_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

function randomString(length: number, alphabet: string): string {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (n) => alphabet[n % alphabet.length]).join("");
}

interface CreateShareInput {
  fileName: string;
  storageKey: string;
  fileSize: number;
  recipientEmail: string;
}

interface ShareState {
  shares: LinkData[];
  createShare: (input: CreateShareInput) => LinkData;
  getShareBySlug: (slug: string) => LinkData | undefined;
  recordAccess: (slug: string) => void;
}

export const useShareStore = create<ShareState>()(
  persist(
    (set, get) => ({
      shares: [],

      createShare: ({ fileName, storageKey, fileSize, recipientEmail }) => {
        const now = new Date().toISOString();
        const slug = randomString(8, SLUG_ALPHABET);

        const share: LinkData = {
          slug,
          link: `${window.location.origin}/share/${slug}`,
          accessCode: randomString(6, CODE_ALPHABET),
          recipientEmail,
          fileName,
          storageKey,
          fileSize,
          date: now,
          clicks: 0,
          createdAt: now,
        };

        set({ shares: [share, ...get().shares] });
        return share;
      },

      getShareBySlug: (slug) => get().shares.find((share) => share.slug === slug),

      recordAccess: (slug) => {
        set({
          shares: get().shares.map((share) =>
            share.slug === slug ? { ...share, clicks: share.clicks + 1 } : share,
          ),
        });
      },
    }),
    { name: "share-storage" },
  ),
);
