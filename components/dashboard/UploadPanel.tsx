"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, softSurface } from "@/lib/utils";
import { formatFileSize } from "@/utils/formatFileSize";
import { useUploadQueue } from "@/hooks/useUploadQueue";
import { useHasMounted } from "@/hooks/useHasMounted";
import type { QueueItem } from "@/store/uploadQueueStore";

// "storing" is the gap between the last byte leaving the browser and the
// bucket confirming it, so 100% never reads as done before it is.
const statusLabel = (item: QueueItem) => {
  switch (item.status) {
    case "queued":
      return "Waiting";
    case "uploading":
      return `${item.progress}%`;
    case "storing":
      return "Finishing up";
    case "done":
      return "Uploaded";
    case "error":
      return item.error ?? "Failed";
  }
};

// Long enough to read "Uploaded", short enough not to linger.
const SETTLE_MS = 1000;
const EXIT_MS = 300;

export default function UploadPanel() {
  const { queue, waiting, uploading, stageFiles, startUploads, discard } =
    useUploadQueue();
  const hasMounted = useHasMounted();

  // A finished file already lives in the list below, so it retires from the
  // queue on its own. It collapses rather than vanishing, so nothing jumps.
  const [leaving, setLeaving] = useState<string[]>([]);
  const scheduled = useRef<Set<string>>(new Set());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    queue.forEach((item) => {
      if (item.status !== "done" || scheduled.current.has(item.id)) return;
      scheduled.current.add(item.id);

      timers.current.push(
        setTimeout(() => {
          setLeaving((prev) => [...prev, item.id]);
          timers.current.push(
            setTimeout(() => {
              discard(item.id);
              setLeaving((prev) => prev.filter((id) => id !== item.id));
              scheduled.current.delete(item.id);
            }, EXIT_MS),
          );
        }, SETTLE_MS),
      );
    });
  }, [queue, discard]);

  // Nothing leaves the browser until Upload is pressed.
  const handleSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (selected.length > 0) await stageFiles(selected);
  };

  return (
    <>
      <div
        className={cn(
          softSurface.primary,
          "border-dashed p-6 text-center sm:p-12",
        )}
      >
        <UploadCloud className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <p className="mb-1 text-base font-medium text-foreground sm:text-lg">
          Pick the files you want to share
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Any file type. Nothing is sent until you press upload.
        </p>
        <input
          type="file"
          multiple
          onChange={handleSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button asChild disabled={uploading}>
            <span>{queue.length > 0 ? "Add more files" : "Choose files"}</span>
          </Button>
        </label>
      </div>

      {hasMounted && (
        <div
          className={cn(
            "grid transition-all duration-300 ease-out",
            queue.length > 0
              ? "mt-6 grid-rows-[1fr] opacity-100"
              : "mt-0 grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Uploads
          </h3>

          <div>
            {queue.map((item) => {
              const isLeaving = leaving.includes(item.id);
              return (
                <div
                  key={item.id}
                  // Height and margin both collapse, so the rows below slide up
                  // smoothly instead of snapping.
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-out",
                    isLeaving
                      ? "mb-0 max-h-0 opacity-0"
                      : "mb-2 max-h-24 opacity-100",
                  )}
                >
                  <div className={cn(softSurface.primary, "p-2")}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {item.name}
                        </span>
                        <span
                          className={cn(
                            "text-xs",
                            item.status === "error"
                              ? "text-destructive"
                              : "text-muted-foreground",
                          )}
                        >
                          {formatFileSize(item.size)} · {statusLabel(item)}
                        </span>
                      </div>
                      {!uploading && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${item.name}`}
                          className="h-8 w-8 shrink-0"
                          onClick={() => discard(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {item.status !== "error" && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-200"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {waiting > 0 && (
            <Button
              className="mt-4 w-full"
              disabled={uploading}
              onClick={startUploads}
            >
              {uploading
                ? "Uploading..."
                : `Upload ${waiting} file${waiting === 1 ? "" : "s"}`}
            </Button>
          )}
          </div>
        </div>
      )}
    </>
  );
}
