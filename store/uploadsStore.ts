import { create } from "zustand";
import { persist } from "zustand/middleware";

// The backend no longer lists files (GET /files is gone), so each browser
// remembers what it uploaded here. Persisted to localStorage so the dashboard
// survives reloads. The access token still gates downloads server-side.
export interface UploadRecord {
  id: string;
  name: string;
  storageKey: string;
  size: number;
  // Signed in at upload time? Picks the 3 vs 7 day retention window.
  owned?: boolean;
  uploadedAt: string;
}

interface UploadsState {
  uploads: UploadRecord[];
  addUpload: (upload: Omit<UploadRecord, "uploadedAt">) => void;
}

export const useUploadsStore = create<UploadsState>()(
  persist(
    (set, get) => ({
      uploads: [],

      addUpload: (upload) =>
        set({
          uploads: [
            { ...upload, uploadedAt: new Date().toISOString() },
            ...get().uploads,
          ],
        }),
    }),
    { name: "uploads" },
  ),
);
