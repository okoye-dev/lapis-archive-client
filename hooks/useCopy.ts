import { useCallback } from "react";
import { useToast } from "./useToast";

export function useCopy() {
  const { toast } = useToast();

  return useCallback(
    async (text: string, title = "Copied to clipboard") => {
      try {
        await navigator.clipboard.writeText(text);
        toast({ title });
      } catch {
        toast({
          title: "Couldn't copy",
          description: "Select and copy the text manually instead.",
          variant: "destructive",
        });
      }
    },
    [toast],
  );
}
