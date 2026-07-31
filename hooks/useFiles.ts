import { useState, useEffect, useCallback } from "react";
import { getFiles, uploadFiles, downloadFile, FileData } from "@/api/files";
import { useToast } from "./useToast";

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
    
    try {
      setUploading(true);
      setUploadProgress(0);
      const uploadedFiles: FileData[] = [];
      
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
        const formData = new FormData();
        formData.append("file", file);
        
        const uploadedFile = await uploadFiles(formData, (progress) => {
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
      }

      // Mark upload as complete and show success toast
      isUploading = false;
      progressToast.update({
        id: progressToast.id,
        title: "Upload complete! 🎉",
        description: `Successfully uploaded ${fileList.length} file${fileList.length > 1 ? 's' : ''}`,
        onOpenChange: undefined, // Allow dismissal after completion
      });

      await fetchFiles();
      return uploadedFiles;
    } catch (err) {
      console.error("Failed to upload files:", err);
      isUploading = false;
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
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