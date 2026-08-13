import { useCallback, useEffect, useRef, useState } from "react";
import { uploadFile } from "@/api/files";
import { useUploadsStore } from "@/store/uploadsStore";
import { useUploadQueueStore, type QueueItem } from "@/store/uploadQueueStore";
import * as vault from "@/lib/fileVault";
import { useToast } from "./useToast";

// Client-side upload cap. Matches the backend MAX_UPLOAD_MB default so we can
// reject oversized files before wasting a round-trip.
export const MAX_UPLOAD_MB = 512;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function useUploadQueue() {
  const addUpload = useUploadsStore((state) => state.addUpload);

  const queue = useUploadQueueStore((state) => state.items);
  const addItems = useUploadQueueStore((state) => state.addItems);
  const patchItem = useUploadQueueStore((state) => state.patchItem);
  const removeItem = useUploadQueueStore((state) => state.removeItem);
  const clearDone = useUploadQueueStore((state) => state.clearDone);
  const resetInterrupted = useUploadQueueStore((state) => state.resetInterrupted);

  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const running = useRef(false);

  // A reload leaves items marked in-flight that no longer have a request
  // behind them; flip them back to queued and drop any orphaned bytes.
  useEffect(() => {
    resetInterrupted();
    vault.pruneExcept(useUploadQueueStore.getState().items.map((i) => i.id));
  }, [resetInterrupted]);

  const stageFiles = useCallback(
    async (selected: File[]) => {
      const items: QueueItem[] = [];

      for (const file of selected) {
        const id = newId();
        const oversized = file.size > MAX_UPLOAD_BYTES;

        if (!oversized) {
          try {
            await vault.putFile(id, file);
          } catch {
            toast({
              title: "Couldn't stage that file",
              description: `${file.name} is too large for this browser to hold.`,
              variant: "destructive",
            });
            continue;
          }
        }

        items.push({
          id,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          status: oversized ? "error" : "queued",
          progress: 0,
          error: oversized ? `Over the ${MAX_UPLOAD_MB}MB limit` : undefined,
        });
      }

      if (items.length > 0) addItems(items);
    },
    [addItems, toast],
  );

  const discard = useCallback(
    async (id: string) => {
      removeItem(id);
      await vault.deleteFile(id);
    },
    [removeItem],
  );

  const startUploads = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setUploading(true);

    let uploaded = 0;
    let failed = 0;

    try {
      // Read the queue fresh each pass so items added mid-run are picked up.
      for (;;) {
        const next = useUploadQueueStore
          .getState()
          .items.find((item) => item.status === "queued");
        if (!next) break;

        const file = await vault.getFile(next.id);
        if (!file) {
          failed++;
          patchItem(next.id, {
            status: "error",
            error: "The file is no longer available. Pick it again.",
          });
          continue;
        }

        patchItem(next.id, {
          status: "uploading",
          progress: 0,
          error: undefined,
        });

        try {
          const result = await uploadFile(file, (pct) =>
            patchItem(next.id, {
              progress: pct,
              status: pct >= 100 ? "storing" : "uploading",
            }),
          );

          patchItem(next.id, { status: "done", progress: 100 });
          addUpload({
            id: result.id,
            name: result.name,
            storageKey: result.storage_key,
            size: result.size,
          });
          // The bucket has it now, so the local copy is just exposure.
          await vault.deleteFile(next.id);
          uploaded++;
        } catch (err) {
          failed++;
          patchItem(next.id, {
            status: "error",
            error: err instanceof Error ? err.message : "Upload failed",
          });
        }
      }

      if (uploaded > 0 && failed === 0) {
        toast({
          title: `Uploaded ${uploaded} file${uploaded === 1 ? "" : "s"}`,
          description: "They're ready to share below.",
        });
      } else if (failed > 0) {
        toast({
          title: uploaded === 0 ? "Nothing was uploaded" : "Some files failed",
          description: "See the details next to each file.",
          variant: "destructive",
        });
      }
    } finally {
      running.current = false;
      setUploading(false);
    }
  }, [addUpload, patchItem, toast]);

  const waiting = queue.filter(
    (item) => item.status === "queued" || item.status === "error",
  ).length;

  return {
    queue,
    waiting,
    uploading,
    stageFiles,
    startUploads,
    discard,
    clearDone,
  };
}
