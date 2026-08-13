"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "next/navigation";
import { DownloadCloud, File as FileIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { getShare, unlockShare, type ShareMeta } from "@/api/shares";
import { ApiError } from "@/api/api-service";
import { triggerBrowserDownload } from "@/api/files";
import { formatFileSize } from "@/utils/formatFileSize";

type Status = "loading" | "ready" | "not-found" | "expired" | "error";

const SharePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();

  const [status, setStatus] = useState<Status>("loading");
  const [meta, setMeta] = useState<ShareMeta | null>(null);
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    getShare(slug)
      .then((share) => {
        if (!active) return;
        setMeta(share);
        setStatus(share.expired ? "expired" : "ready");
      })
      .catch((err) => {
        if (!active) return;
        // A real 404 means the share is gone or expired. Anything else
        // (network hiccup, 5xx) is transient — let the visitor retry.
        if (err instanceof ApiError && err.status === 404) {
          setStatus("not-found");
        } else {
          setStatus("error");
        }
      });
    return () => {
      active = false;
    };
  }, [slug, reloadKey]);

  const handleUnlock = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (unlocking || !code.trim()) return;

      setUnlocking(true);
      try {
        const result = await unlockShare(slug, code.trim(), true);
        setUnlocked(true);
        triggerBrowserDownload(result.url, result.fileName);
        toast({
          title: "Unlocked",
          description: "Your download should be starting.",
        });
      } catch (err) {
        toast({
          title: "Couldn't unlock",
          description: err instanceof Error ? err.message : "Try again.",
          variant: "destructive",
        });
      } finally {
        setUnlocking(false);
      }
    },
    [slug, code, unlocking, toast],
  );

  const handleDownloadAgain = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const result = await unlockShare(slug, code.trim(), true);
      triggerBrowserDownload(result.url, result.fileName);
    } catch (err) {
      toast({
        title: "Download failed",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  }, [slug, code, downloading, toast]);

  if (status === "loading") {
    return (
      <div className="flex min-h-content items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 text-center sm:p-8">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="flex min-h-content items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 text-center sm:p-8">
          <h1 className="mb-2 text-xl font-semibold text-foreground">
            Link not found
          </h1>
          <p className="text-sm text-muted-foreground">
            This share link is invalid or has expired.
          </p>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-content items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 text-center sm:p-8">
          <h1 className="mb-2 text-xl font-semibold text-foreground">
            Couldn&apos;t load this share
          </h1>
          <p className="mb-4 text-sm text-muted-foreground">
            Something went wrong reaching the server. This usually clears up on
            its own, so give it another try.
          </p>
          <Button onClick={() => setReloadKey((k) => k + 1)}>Retry</Button>
        </Card>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="flex min-h-content items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 text-center sm:p-8">
          <h1 className="mb-2 text-xl font-semibold text-foreground">
            This share has expired
          </h1>
          <p className="text-sm text-muted-foreground">
            Ask the sender to share it again.
          </p>
          {meta?.fileName ? (
            <p className="mt-2 truncate text-sm font-medium text-foreground">
              {meta.fileName}
            </p>
          ) : null}
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-content items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            {unlocked ? "Here's your file" : "Enter your access code"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {unlocked
              ? "Someone sent this to you. It's ready whenever you are."
              : "Enter the code that was shared with you to unlock this file."}
          </p>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-lg border border-border p-4">
          <FileIcon className="h-8 w-8 text-muted-foreground" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{meta?.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {meta ? formatFileSize(meta.fileSize) : ""}
            </p>
          </div>
        </div>

        {!unlocked ? (
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Access code</Label>
              <Input
                id="code"
                type="text"
                placeholder="e.g. 7K2P9Q"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="tracking-widest"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={unlocking}>
              {unlocking ? "Unlocking..." : "Unlock file"}
            </Button>
          </form>
        ) : (
          <Button
            onClick={handleDownloadAgain}
            disabled={downloading}
            className="w-full"
          >
            <DownloadCloud className="mr-2 h-4 w-4" />
            {downloading ? "Preparing download..." : "Download again"}
          </Button>
        )}
      </Card>
    </div>
  );
};

export default SharePage;
