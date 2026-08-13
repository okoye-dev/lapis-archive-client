"use client";

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

export default function UploadPanel() {
  const {
    queue,
    waiting,
    uploading,
    stageFiles,
    startUploads,
    discard,
    clearDone,
  } = useUploadQueue();
  const hasMounted = useHasMounted();

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

      {hasMounted && queue.length > 0 && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Uploads
            </h3>
            {!uploading && queue.some((item) => item.status === "done") && (
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-500 hover:bg-orange-500/10 hover:text-orange-600"
                onClick={clearDone}
              >
                Clear finished
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {queue.map((item) => (
              <div key={item.id} className={cn(softSurface.primary, "p-3")}>
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
                      className="shrink-0"
                      onClick={() => discard(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {item.status !== "error" && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-200"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
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
      )}
    </>
  );
}
