import { useCallback, useEffect, useRef, useState } from "react";
import {
  uploadFile,
  initMultipartUpload,
  presignPart,
  putPartToBucket,
  multipartStatus,
  completeMultipart,
  abortMultipart,
  UploadAbortedError,
  PART_SIZE,
  MULTIPART_THRESHOLD,
} from "@/api/files";
import { ApiError } from "@/api/api-service";
import { useUploadsStore } from "@/store/uploadsStore";
import {
  useUploadQueueStore,
  confirmedBytes,
  type QueueItem,
} from "@/store/uploadQueueStore";
import * as vault from "@/lib/fileVault";
import { useToast } from "./useToast";
import { useUser } from "./useUser";

// Client-side upload cap. Matches the backend MAX_UPLOAD_MB default so we can
// reject oversized files before wasting a round-trip.
export const MAX_UPLOAD_MB = 512;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const item = (id: string): QueueItem | undefined =>
  useUploadQueueStore.getState().items.find((i) => i.id === id);

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
  const { user } = useUser();
  const running = useRef(false);
  // Abort handles per item, so pause can stop a transfer mid-part.
  const aborts = useRef<Map<string, () => void>>(new Map());
  // A ref so a mid-session sign-in reaches already-queued uploads.
  const signedIn = useRef(false);
  useEffect(() => {
    signedIn.current = !!user;
  }, [user]);

  // Settle items left in-flight by a reload, and drop orphaned bytes.
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
        const multipart = !oversized && file.size > MULTIPART_THRESHOLD;

        if (!oversized) {
          try {
            if (multipart) {
              const partCount = Math.ceil(file.size / PART_SIZE);
              for (let n = 1; n <= partCount; n++) {
                await vault.putChunk(
                  id,
                  n,
                  file.slice((n - 1) * PART_SIZE, Math.min(n * PART_SIZE, file.size)),
                );
              }
            } else {
              await vault.putFile(id, file);
            }
          } catch {
            await vault.deleteAllFor(id);
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
          ...(multipart
            ? { partSize: PART_SIZE, partCount: Math.ceil(file.size / PART_SIZE), parts: [] }
            : {}),
        });
      }

      if (items.length > 0) addItems(items);
    },
    [addItems, toast],
  );

  const discard = useCallback(
    async (id: string) => {
      const current = item(id);
      aborts.current.get(id)?.();
      removeItem(id);
      if (current?.storageKey && current.uploadId && current.status !== "done") {
        abortMultipart(current.storageKey, current.uploadId).catch(() => {
          // The bucket lifecycle rule reaps abandoned sessions.
        });
      }
      await vault.deleteAllFor(id);
    },
    [removeItem],
  );

  const pause = useCallback(
    (id: string) => {
      patchItem(id, { status: "paused" });
      aborts.current.get(id)?.();
    },
    [patchItem],
  );

  // Single-PUT path: whole file in one request; resume restarts it.
  const runSinglePut = async (next: QueueItem): Promise<boolean> => {
    const file = await vault.getFile(next.id);
    if (!file) {
      patchItem(next.id, {
        status: "error",
        error: "The file is no longer available. Pick it again.",
      });
      return false;
    }

    patchItem(next.id, { status: "uploading", progress: 0, error: undefined });
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
        owned: signedIn.current,
        size: result.size,
      });
      await vault.deleteAllFor(next.id);
      return true;
    } catch (err) {
      patchItem(next.id, {
        status: "error",
        error: err instanceof Error ? err.message : "Upload failed",
      });
      return false;
    }
  };

  // Multipart path: each confirmed part frees its chunk from the vault.
  const runMultipart = async (next: QueueItem): Promise<boolean> => {
    const fail = (error: string) => {
      patchItem(next.id, { status: "error", error });
      return false;
    };

    patchItem(next.id, { status: "uploading", error: undefined });

    let { storageKey, uploadId } = next;
    let parts = [...(next.parts ?? [])];

    try {
      if (!uploadId || !storageKey) {
        const init = await initMultipartUpload(next.name, next.size, next.type);
        if (init.part_size !== next.partSize) {
          // Both sides pin 8MiB; a mismatch means a stale build.
          return fail("Upload settings changed. Remove the file and pick it again.");
        }
        storageKey = init.storage_key;
        uploadId = init.upload_id;
        parts = [];
        patchItem(next.id, { storageKey, uploadId, parts });
      } else {
        // Resuming: trust the bucket for which parts are done.
        const remote = await multipartStatus(storageKey, uploadId);
        parts = remote.map((p) => ({ partNumber: p.part_number, etag: p.etag }));
        patchItem(next.id, { parts });
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // Session gone bucket-side and confirmed chunks are already freed.
        return fail("The upload session expired. Remove the file and pick it again.");
      }
      return fail(err instanceof Error ? err.message : "Upload failed");
    }

    if (!storageKey || !uploadId) {
      // Unreachable: both branches above assign or return.
      return fail("Upload failed");
    }

    const done = new Set(parts.map((p) => p.partNumber));
    const partCount = next.partCount ?? 0;

    for (let n = 1; n <= partCount; n++) {
      if (done.has(n)) continue;
      // Pause may have landed between parts.
      if (item(next.id)?.status === "paused") return false;

      const chunk = await vault.getChunk(next.id, n);
      if (!chunk) {
        return fail("Part of the file is no longer available. Pick it again.");
      }

      try {
        const url = await presignPart(storageKey, uploadId, n);
        const confirmed = confirmedBytes({ ...next, parts });
        const handle = putPartToBucket(url, chunk, (loaded) => {
          const pct = Math.min(99, Math.round(((confirmed + loaded) / next.size) * 100));
          if (pct !== item(next.id)?.progress) patchItem(next.id, { progress: pct });
        });
        aborts.current.set(next.id, handle.abort);
        const { etag } = await handle.promise;

        parts = [...parts, { partNumber: n, etag }];
        patchItem(next.id, { parts });
        await vault.deleteChunk(next.id, n);
      } catch (err) {
        if (err instanceof UploadAbortedError) {
          // pause() set the status; just stop.
          return false;
        }
        if (err instanceof ApiError && err.status === 404) {
          return fail("The upload session expired. Remove the file and pick it again.");
        }
        return fail(err instanceof Error ? err.message : "Upload failed");
      } finally {
        aborts.current.delete(next.id);
      }
    }

    patchItem(next.id, { status: "storing", progress: 100 });
    try {
      const result = await completeMultipart(
        storageKey,
        uploadId,
        parts.map((p) => ({ part_number: p.partNumber, etag: p.etag })),
      );
      patchItem(next.id, { status: "done", progress: 100 });
      addUpload({
        id: result.id,
        name: result.name,
        storageKey: result.storage_key,
        owned: signedIn.current,
        size: next.size,
      });
      await vault.deleteAllFor(next.id);
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return fail("The upload session expired. Remove the file and pick it again.");
      }
      return fail(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const startUploads = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setUploading(true);

    let uploaded = 0;
    let failed = 0;

    try {
      // Re-read each pass so items added mid-run are picked up.
      for (;;) {
        const next = useUploadQueueStore
          .getState()
          .items.find((i) => i.status === "queued");
        if (!next) break;

        const ok = next.partCount
          ? await runMultipart(next)
          : await runSinglePut(next);
        if (ok) uploaded++;
        else if (item(next.id)?.status === "error") failed++;
        // paused items just wait.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addUpload, patchItem, toast]);

  const resume = useCallback(
    (id: string) => {
      patchItem(id, { status: "queued" });
      void startUploads();
    },
    [patchItem, startUploads],
  );

  const waiting = queue.filter((i) => i.status === "queued").length;

  return {
    queue,
    waiting,
    uploading,
    stageFiles,
    startUploads,
    pause,
    resume,
    discard,
    clearDone,
  };
}
