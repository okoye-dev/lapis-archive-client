"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Mail } from "lucide-react";
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
import { ApiError } from "@/api/api-service";
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
  const { toast } = useToast();
  const copy = useCopy();

  const [result, setResult] = useState<CreatedShare | null>(null);
  const [link, setLink] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!file) return;
    setResult(null);
    setLink("");
  }, [file]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || creating) return;

    setCreating(true);
    try {
      const share = await createShare({
        fileName: file.name,
        storageKey: file.storageKey,
        fileSize: file.size,
      });
      setResult(share);
      setLink(`${window.location.origin}/share/${share.slug}`);
      toast({
        title: "Link ready",
        description: "Copy the link and code below before you close this.",
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast({
          title: "Share limit reached",
          description:
            "This file has had its 3 codes. Upload it again to keep sharing.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Couldn't create share",
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "destructive",
        });
      }
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
              ? result.rotated
                ? "Same link as before, brand-new code. The old code stopped working."
                : "Send the link and code below to whoever you like. We don't email them for you."
              : "You'll get a link and an access code to pass along however you like."}
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
            {/* Recessed vs the file card above so the hierarchy reads:
                the file matters, this note is just an aside. */}
            <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-left">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground/70" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Code emailing is coming soon.
                </p>
                <p className="text-[11px] leading-tight text-muted-foreground/60">
                  For now, copy the link+code and send them to whoever.
                </p>
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
                Save the link and code before you close this. The code shows
                once. Resharing keeps the link but swaps in a new code, 3 times
                max. This is code {result.shareCount} of 3.
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
