"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useFiles } from "@/hooks/useFiles";
import { useToast } from "@/hooks/useToast";
import { useFormatDate as formatDate } from "@/hooks/useFormatDate";
import { useShareStore } from "@/store/shareStore";
import { cn, softSurface } from "@/lib/utils";
import type { UploadRecord } from "@/store/uploadsStore";
import type { CreatedShare } from "@/api/shares";
import { DownloadCloud, Share2, UploadCloud } from "lucide-react";
import { formatFileSize } from "@/utils/formatFileSize";

const Dashboard = () => {
  const { files, uploading, uploadMultipleFiles, downloadFile } = useFiles();
  const { toast } = useToast();
  const createShare = useShareStore((state) => state.createShare);
  const shares = useShareStore((state) => state.shares);
  const sharerEmail = useShareStore((state) => state.sharerEmail);
  const setSharerEmail = useShareStore((state) => state.setSharerEmail);

  const [shareFile, setShareFile] = useState<UploadRecord | null>(null);
  const [gateEmail, setGateEmail] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareResult, setShareResult] = useState<CreatedShare | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [creatingShare, setCreatingShare] = useState(false);

  // shares comes from a localStorage-persisted store, unavailable during
  // server rendering — gate on mount so the server and the client's first
  // render agree on whether this section exists at all.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    await uploadMultipleFiles(selectedFiles);

    // Clear the input
    event.target.value = '';
  };

  const openShareDialog = (file: UploadRecord) => {
    setShareFile(file);
    // Prefill with the sharer's email if we've already collected one.
    setGateEmail(sharerEmail ?? "");
  };

  const closeShareDialog = () => {
    setShareFile(null);
    setGateEmail("");
    setShareEmail("");
    setShareResult(null);
    setShareLink("");
  };

  const handleCreateShare = async (e: FormEvent) => {
    e.preventDefault();
    if (!shareFile || creatingShare) return;

    // Attaching your email is optional and never blocks link creation. When
    // provided it's kept locally and sent as owner_email. No email is sent.
    if (gateEmail.trim()) {
      setSharerEmail(gateEmail.trim());
    }

    setCreatingShare(true);
    try {
      const share = await createShare({
        fileName: shareFile.name,
        storageKey: shareFile.storageKey,
        fileSize: shareFile.size,
        recipientEmail: shareEmail || undefined,
      });
      setShareResult(share);
      setShareLink(`${window.location.origin}/share/${share.slug}`);

      toast({
        title: "Link ready",
        description:
          "Copy the link and code below. The code is shown once, so grab it now.",
      });
    } catch (err) {
      toast({
        title: "Couldn't create share",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingShare(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({
        title: "Couldn't copy",
        description: "Select and copy the text manually instead.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-content">
      <section className="py-10 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Files you&apos;ve uploaded here
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Upload a file to get a shareable link and access code for it.
            </p>
          </div>

          <Card className="p-4 sm:p-8">
            <div className={cn(softSurface.primary, "border-dashed p-6 text-center sm:p-12")}>
              <UploadCloud className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <p className="mb-1 text-base font-medium text-foreground sm:text-lg">
                Drop files here or click to upload
              </p>
              <p className="mb-6 text-sm text-muted-foreground">
                Support for all file types
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button asChild disabled={uploading}>
                  <span>{uploading ? "Uploading..." : "Choose Files"}</span>
                </Button>
              </label>
            </div>

            {hasMounted && files.length === 0 && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                No files yet. Upload one and it will show up here.
              </p>
            )}

            {hasMounted && files.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Uploaded Files
                </h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className={cn(softSurface.primary, "flex items-center justify-between gap-2 p-3")}>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{file.name}</span>
                        <div className="truncate text-xs text-muted-foreground">
                          {file.size ? formatFileSize(file.size) : "Size unavailable"}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                        <Button
                          onClick={() => openShareDialog(file)}
                          variant="outline"
                          size="icon"
                          aria-label="Share"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => downloadFile(file.storageKey)}
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
              </div>
            )}
          </Card>
        </div>
      </section>

      {hasMounted && shares.length > 0 && (
        <section className="py-10 sm:py-16">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 text-center sm:mb-8">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Shared Links
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This history is only saved in this browser for now.
              </p>
            </div>

            <Card className="p-4 sm:p-8">
              <div className="space-y-3">
                {shares.map((share) => (
                  <div
                    key={share.slug}
                    className={cn(softSurface.primary, "p-3")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                        {share.fileName}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(share.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {share.recipientEmail
                        ? `Recipient: ${share.recipientEmail}`
                        : "No recipient set"}
                      {" · expires "}
                      {formatDate(share.expiresAt)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        readOnly
                        value={share.link}
                        className="min-w-0 flex-1 text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => handleCopy(share.link)}
                      >
                        Copy link
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      The access code was shown once when you created this. It
                      isn&apos;t stored, so re-share if you&apos;ve lost it.
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      )}

      <Dialog
        open={!!shareFile}
        onOpenChange={(open) => !open && closeShareDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share a file</DialogTitle>
            <DialogDescription>
              {shareResult
                ? shareEmail
                  ? `Send the link and code below to ${shareEmail}. We don't email them for you.`
                  : "Send the link and code below to whoever you like. We don't email them for you."
                : "You'll get a link and an access code to pass along however you like. Adding an email is optional, and nothing gets sent for you."}
            </DialogDescription>
          </DialogHeader>

          <div className={cn(softSurface.primary, "p-3")}>
            <span className="block truncate text-sm font-medium text-foreground">
              {shareFile?.name}
            </span>
            {shareFile?.size ? (
              <span className="text-xs text-muted-foreground">
                {formatFileSize(shareFile.size)}
              </span>
            ) : null}
          </div>

          {!shareResult ? (
            <form onSubmit={handleCreateShare} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Your email (optional)</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={gateEmail}
                  onChange={(e) => setGateEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Recipient email (optional)</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="friend@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={creatingShare}>
                  {creatingShare ? "Generating..." : "Generate link"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Share link</Label>
                <div className="flex gap-2">
                  <Input readOnly value={shareLink} className="min-w-0 flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => handleCopy(shareLink)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Access code</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={shareResult.code}
                    className="min-w-0 flex-1 tracking-widest"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => handleCopy(shareResult.code)}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Save the link and code somewhere safe before you close this.
                  The code is only shown once, and without both of them this
                  file can&apos;t be opened again.
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  className="w-full"
                  onClick={closeShareDialog}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
