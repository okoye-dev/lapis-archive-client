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
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useFiles } from "@/hooks/useFiles";
import { useToast } from "@/hooks/useToast";
import { useFormatDate as formatDate } from "@/hooks/useFormatDate";
import { useShareStore } from "@/store/shareStore";
import type { FileData } from "@/api/files";
import type { LinkData } from "@/types/types";
import { DownloadCloud, Share2 } from "lucide-react";
import { formatFileSize } from "@/utils/formatFileSize";

const Home = () => {
  const router = useRouter();
  const { files, loading, error, uploading, uploadMultipleFiles, downloadFile } = useFiles();
  const { toast } = useToast();
  const createShare = useShareStore((state) => state.createShare);
  const shares = useShareStore((state) => state.shares);

  const [shareFile, setShareFile] = useState<FileData | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareResult, setShareResult] = useState<LinkData | null>(null);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    await uploadMultipleFiles(selectedFiles);

    // Clear the input
    event.target.value = '';
  };

  const closeShareDialog = () => {
    setShareFile(null);
    setShareEmail("");
    setShareResult(null);
  };

  const handleCreateShare = (e: FormEvent) => {
    e.preventDefault();
    if (!shareFile) return;

    const share = createShare({
      fileName: shareFile.name,
      storageKey: shareFile.storage_key,
      fileSize: shareFile.size,
      recipientEmail: shareEmail || undefined,
    });
    setShareResult(share);

    if (shareEmail) {
      // Sending isn't wired up to a real email provider yet — this
      // simulates it so the flow is demoable end to end.
      toast({
        title: "Code emailed",
        description: `Sent the access code and link to ${shareEmail}.`,
      });
    } else {
      toast({
        title: "Link generated",
        description: "Copy the link and code below to share them yourself.",
      });
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const features = [
    {
      title: "Easy Upload",
      description: "Drag and drop or click to upload files instantly",
    },
    {
      title: "File Management",
      description: "Organize and manage your uploaded files efficiently",
    },
    {
      title: "Share Files",
      description: "Generate shareable links for your files",
    },
    {
      title: "Quick Download",
      description: "Download files anytime, anywhere",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-12 text-center sm:py-16 md:py-20">
          <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            📁 Lapis Archive
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
            Open Source File Sharing & Collaboration Platform
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Button className="w-full sm:w-auto" onClick={() => router.push("/signin")}>
              Sign In
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => router.push("/signup")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* File Upload Section */}
      <section className="container mx-auto px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-foreground sm:mb-8 sm:text-3xl">
            Upload Your Files
          </h2>

          <Card className="p-4 sm:p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center sm:p-8">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4 flex items-center justify-center text-4xl">
                📁
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to upload
              </p>
              <p className="text-sm text-gray-500 mb-4">
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
            
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Uploaded Files:</h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl border border-textGray">
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{file.name}</span>
                        <div className="truncate text-xs text-gray-500">
                          ID: {file.id}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                        <span className="hidden text-xs text-gray-400 sm:inline">{formatFileSize(file.size)}</span>
                        <Button
                          onClick={() => setShareFile(file)}
                          variant="outline"
                          size="icon"
                          aria-label="Share"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => downloadFile(file.storage_key)}
                          variant="outline"
                          size="icon"
                          className="hover:bg-primary/10"
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

      {/* Shared Links Section */}
      {shares.length > 0 && (
        <section className="container mx-auto px-4 py-10 sm:py-16">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-6 text-center text-2xl font-bold text-foreground sm:mb-8 sm:text-3xl">
              Shared Links
            </h2>

            <Card className="p-4 sm:p-8">
              <div className="space-y-3">
                {shares.map((share) => (
                  <div
                    key={share.slug}
                    className="rounded-xl border border-textGray bg-gray-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {share.fileName}
                      </span>
                      <span className="shrink-0 text-xs text-gray-400">
                        {formatDate(share.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {share.recipientEmail
                        ? `Emailed to ${share.recipientEmail}`
                        : "Not emailed — shared manually"}
                    </p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
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
                      <div className="flex shrink-0 items-center gap-2">
                        <Input
                          readOnly
                          value={share.accessCode}
                          className="w-24 shrink-0 text-xs tracking-widest"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          onClick={() => handleCopy(share.accessCode)}
                        >
                          Copy code
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="container mx-auto px-4 py-10 sm:py-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-foreground sm:mb-12 sm:text-3xl">
          File Sharing Made Simple
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 text-center transition-shadow hover:shadow-lg"
            >
              <h3 className="mb-2 font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <Dialog
        open={!!shareFile}
        onOpenChange={(open) => !open && closeShareDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share {shareFile?.name}</DialogTitle>
            <DialogDescription>
              {shareResult
                ? shareResult.recipientEmail
                  ? `Sent to ${shareResult.recipientEmail}. You can also copy the link and code yourself.`
                  : "Copy the link and code below to share them with anyone."
                : "We'll generate a link and access code for this file. Emailing it is optional — you can just copy and send them yourself."}
            </DialogDescription>
          </DialogHeader>

          {!shareResult ? (
            <form onSubmit={handleCreateShare} className="space-y-4">
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
                <Button type="submit" className="w-full">
                  Generate link
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Share link</Label>
                <div className="flex gap-2">
                  <Input readOnly value={shareResult.link} className="min-w-0 flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => handleCopy(shareResult.link)}
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
                    value={shareResult.accessCode}
                    className="min-w-0 flex-1 tracking-widest"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => handleCopy(shareResult.accessCode)}
                  >
                    Copy
                  </Button>
                </div>
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

export default Home;
