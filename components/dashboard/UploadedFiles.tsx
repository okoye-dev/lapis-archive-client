"use client";

import { DownloadCloud, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, softSurface } from "@/lib/utils";
import { formatFileSize } from "@/utils/formatFileSize";
import { useUploadsStore, type UploadRecord } from "@/store/uploadsStore";
import { useDownload } from "@/hooks/useDownload";
import { useHasMounted } from "@/hooks/useHasMounted";

interface UploadedFilesProps {
  onShare: (file: UploadRecord) => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Mirrors the server's retention windows: 3 days anonymous, 7 signed-in.
const retentionLabel = (file: UploadRecord): string => {
  const windowMs = (file.owned ? 7 : 3) * DAY_MS;
  const left = new Date(file.uploadedAt).getTime() + windowMs - Date.now();
  if (left <= 0) return "may already be deleted";
  const days = Math.ceil(left / DAY_MS);
  return days === 1 ? "expires today" : `expires in ${days}d`;
};

export default function UploadedFiles({ onShare }: UploadedFilesProps) {
  const files = useUploadsStore((state) => state.uploads);
  const download = useDownload();
  const hasMounted = useHasMounted();

  if (!hasMounted) return null;

  if (files.length === 0) {
    return (
      <p className="mt-6 text-center text-sm text-muted-foreground">
        No files yet. Upload one and it will show up here.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Uploaded files
      </h3>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.storageKey}
            className={cn(
              softSurface.primary,
              "flex items-center justify-between gap-2 p-3",
            )}
          >
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {file.name}
              </span>
              <div className="truncate text-xs text-muted-foreground">
                {file.size ? formatFileSize(file.size) : "Size unavailable"}
                {" · "}
                {retentionLabel(file)}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <Button
                onClick={() => onShare(file)}
                variant="outline"
                size="icon"
                aria-label="Share"
                className="border-orange-400/40 bg-orange-400/10 text-orange-500 hover:border-orange-400/60 hover:bg-orange-400/20 hover:text-orange-600"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => download(file.storageKey)}
                variant="outline"
                size="icon"
                aria-label="Download"
              >
                <DownloadCloud className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-tight text-muted-foreground/70">
        To keep hosting costs down, files are deleted 3 days after upload, or 7
        if you were signed in. Files from before this policy may already be
        gone.
      </p>
    </div>
  );
}
