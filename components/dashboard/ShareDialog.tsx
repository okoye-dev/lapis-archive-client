"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
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
import { cn, softSurface } from "@/lib/utils";
import { formatFileSize } from "@/utils/formatFileSize";
import { useShareStore } from "@/store/shareStore";
import { useToast } from "@/hooks/useToast";
import { useCopy } from "@/hooks/useCopy";
import type { UploadRecord } from "@/store/uploadsStore";
import type { CreatedShare } from "@/api/shares";

interface ShareDialogProps {
  file: UploadRecord | null;
  onClose: () => void;
}

export default function ShareDialog({ file, onClose }: ShareDialogProps) {
  const createShare = useShareStore((state) => state.createShare);
  const sharerEmail = useShareStore((state) => state.sharerEmail);
  const setSharerEmail = useShareStore((state) => state.setSharerEmail);
  const { toast } = useToast();
  const copy = useCopy();

  const [ownerEmail, setOwnerEmail] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [result, setResult] = useState<CreatedShare | null>(null);
  const [link, setLink] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!file) return;
    setOwnerEmail(sharerEmail ?? "");
    setRecipientEmail("");
    setResult(null);
    setLink("");
  }, [file, sharerEmail]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || creating) return;

    // Attaching your email is optional and never blocks link creation.
    if (ownerEmail.trim()) setSharerEmail(ownerEmail.trim());

    setCreating(true);
    try {
      const share = await createShare({
        fileName: file.name,
        storageKey: file.storageKey,
        fileSize: file.size,
        recipientEmail: recipientEmail || undefined,
      });
      setResult(share);
      setLink(`${window.location.origin}/share/${share.slug}`);
      toast({
        title: "Link ready",
        description: "Copy the link and code below before you close this.",
      });
    } catch (err) {
      toast({
        title: "Couldn't create share",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share a file</DialogTitle>
          <DialogDescription>
            {result
              ? recipientEmail
                ? `Send the link and code below to ${recipientEmail}. We don't email them for you.`
                : "Send the link and code below to whoever you like. We don't email them for you."
              : "You'll get a link and an access code to pass along however you like. Adding an email is optional, and nothing gets sent for you."}
          </DialogDescription>
        </DialogHeader>

        {/* min-w-0: a grid child defaults to min-width:auto, which lets an
            unbroken filename widen the dialog instead of truncating. */}
        <div className={cn(softSurface.primary, "min-w-0 p-3")}>
          <span className="block truncate text-sm font-medium text-foreground">
            {file?.name}
          </span>
          {file?.size ? (
            <span className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
          ) : null}
        </div>

        {!result ? (
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Deliberately recessed: these are optional, so they shouldn't
                compete with the file or the action. */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground/50">
                  Optional
                </p>
                <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground/60">
                  Sending coming soon
                </span>
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="ownerEmail"
                  className="text-[11px] font-normal text-muted-foreground/70"
                >
                  Your email
                </Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  placeholder="you@example.com"
                  className="h-8 border-border/60 bg-transparent text-xs placeholder:text-[11px] placeholder:text-muted-foreground/40"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="recipientEmail"
                  className="text-[11px] font-normal text-muted-foreground/70"
                >
                  Recipient email
                </Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="friend@example.com"
                  className="h-8 border-border/60 bg-transparent text-xs placeholder:text-[11px] placeholder:text-muted-foreground/40"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? "Generating..." : "Generate link"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() =>
                  copy(
                    `${link}\nAccess code: ${result.code}`,
                    "Link and code copied",
                  )
                }
              >
                Copy link and code
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Grabs both at once, ready to paste into a message.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Share link</Label>
              <div className="flex gap-2">
                <Input readOnly value={link} className="min-w-0 flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => copy(link)}
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
                  value={result.code}
                  className="min-w-0 flex-1 tracking-widest"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => copy(result.code)}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Save the link and code somewhere safe before you close this. The
                code is only shown once, and without both of them this file
                can&apos;t be opened again.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" className="w-full" onClick={onClose}>
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
