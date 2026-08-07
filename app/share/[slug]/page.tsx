"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "next/navigation";
import { DownloadCloud, File as FileIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { useShareStore } from "@/store/shareStore";
import { downloadFile } from "@/api/files";
import { formatFileSize } from "@/utils/formatFileSize";

const SharePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const share = useShareStore((state) => state.getShareBySlug(slug));
  const recordAccess = useShareStore((state) => state.recordAccess);

  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // The share store persists to localStorage, which isn't available during
  // server rendering. Rendering based on `share` before the client has
  // mounted would make the server's "not found" HTML mismatch whatever the
  // client renders once localStorage data is available, so we wait one
  // extra render before trusting the store's data.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleUnlock = (e: FormEvent) => {
    e.preventDefault();
    if (!share) return;

    if (code.trim().toUpperCase() === share.accessCode) {
      setUnlocked(true);
      recordAccess(share.slug);
    } else {
      toast({
        title: "Incorrect code",
        description: "That access code doesn't match this link.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!share) return;
    setDownloading(true);
    try {
      await downloadFile(share.storageKey);
    } catch {
      toast({
        title: "Download failed",
        description: "Couldn't reach the file server. Try again shortly.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  if (!hasMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 text-center sm:p-8">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  if (!share) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 text-center sm:p-8">
          <h1 className="mb-2 text-xl font-semibold text-foreground">
            Link not found
          </h1>
          <p className="text-sm text-muted-foreground">
            This share link is invalid, expired, or was created in a
            different browser.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            {unlocked ? "Here's your file" : "Enter your access code"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {unlocked
              ? "This file was shared with you."
              : "Enter the code emailed to you to view this file."}
          </p>
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
            <Button type="submit" className="w-full">
              Unlock file
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border p-4">
              <FileIcon className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">
                  {share.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(share.fileSize)}
                </p>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full"
            >
              <DownloadCloud className="mr-2 h-4 w-4" />
              {downloading ? "Preparing download..." : "Download file"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SharePage;
