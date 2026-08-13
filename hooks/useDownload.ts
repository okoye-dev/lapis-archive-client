import { useCallback } from "react";
import { downloadFile } from "@/api/files";
import { useToast } from "./useToast";

export function useDownload() {
  const { toast } = useToast();

  return useCallback(
    async (storageKey: string) => {
      try {
        await downloadFile(storageKey);
        toast({
          title: "Download started",
          description: "Your file is on its way.",
        });
      } catch (err) {
        console.error("Failed to download file:", err);
        toast({
          title: "Download failed",
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "destructive",
        });
      }
    },
    [toast],
  );
}
