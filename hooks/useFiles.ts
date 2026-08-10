import { useState, useEffect, useCallback } from "react";
import { getFiles, uploadFile, downloadFile, FileData } from "@/api/files";
import { useToast } from "./useToast";

// Client-side upload cap. Matches the backend MAX_UPLOAD_MB default so we can
// reject oversized files before wasting a round-trip.
export const MAX_UPLOAD_MB = 512;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export const useFiles = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getFiles();
      setFiles(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, []);

  const uploadMultipleFiles = useCallback(async (fileList: File[]): Promise<FileData[]> => {
    let isUploading = true;
    const uploadedFiles: FileData[] = [];
    const failures: { name: string; reason: string }[] = [];

    try {
      setUploading(true);
      setUploadProgress(0);

      // Show initial toast (non-dismissible during upload)
      const progressToast = toast({
        title: "Uploading files...",
        description: `0% complete`,
        onOpenChange: (open) => {
          // Prevent manual dismissal during upload
          if (!open && isUploading) {
            // Force it to stay open by returning false
            return false;
          }
        },
      });

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        // Reject oversized files up front instead of failing mid-upload.
        if (file.size > MAX_UPLOAD_BYTES) {
          failures.push({
            name: file.name,
            reason: `over the ${MAX_UPLOAD_MB} MB limit`,
          });
          continue;
        }

        // Upload files independently so one bad file doesn't sink the batch.
        try {
          const uploadedFile = await uploadFile(file, (progress) => {
            const fileProgress = (i / fileList.length) * 100 + (progress / fileList.length);
            const totalProgress = Math.round(fileProgress);
            setUploadProgress(totalProgress);

            // Update toast with progress
            progressToast.update({
              id: progressToast.id,
              title: "Uploading files...",
              description: `${totalProgress}% complete`,
            });
          });
          uploadedFiles.push(uploadedFile);
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          failures.push({
            name: file.name,
            reason: err instanceof Error ? err.message : "upload failed",
          });
        }
      }

      // Mark upload as complete and report per-file outcome.
      isUploading = false;

      if (failures.length === 0) {
        progressToast.update({
          id: progressToast.id,
          title: "Upload complete! 🎉",
          description: `Successfully uploaded ${uploadedFiles.length} file${uploadedFiles.length === 1 ? "" : "s"}`,
          onOpenChange: undefined, // Allow dismissal after completion
        });
      } else if (uploadedFiles.length === 0) {
        progressToast.update({
          id: progressToast.id,
          title: "Upload failed",
          description:
            failures.length === 1
              ? `${failures[0].name} — ${failures[0].reason}.`
              : `None of the ${failures.length} files could be uploaded.`,
          variant: "destructive",
          onOpenChange: undefined,
        });
      } else {
        progressToast.update({
          id: progressToast.id,
          title: `Uploaded ${uploadedFiles.length} of ${fileList.length} files`,
          description: `Skipped: ${failures.map((f) => `${f.name} (${f.reason})`).join(", ")}`,
          variant: "destructive",
          onOpenChange: undefined,
        });
      }

      if (uploadedFiles.length > 0) {
        await fetchFiles();
      }

      return uploadedFiles;
    } finally {
      isUploading = false;
      setUploading(false);
      setUploadProgress(0);
    }
  }, [fetchFiles, toast]);

  const handleDownload = useCallback(async (fileName: string) => {
    try {
      await downloadFile(fileName);
      toast({
        title: "Download started",
        description: "File download has been initiated",
      });
    } catch (err) {
      console.error("Failed to download file:", err);
      toast({
        title: "Download failed",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    files,
    loading,
    error,
    uploading,
    uploadProgress,
    refetchFiles: fetchFiles,
    uploadMultipleFiles,
    downloadFile: handleDownload,
  };
};