import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FileRowProps {
  as?: "div" | "li";
  className?: string;
  name: string;
  // The muted line(s) under the name; caller supplies the exact markup.
  meta: ReactNode;
  // Trailing control(s), e.g. share/download/revoke/copy buttons.
  action?: ReactNode;
}

// Presentational row: a truncating filename with a meta line and a trailing
// action. Shared by the uploaded-files list, the account shares list, and the
// shared-links list, which only differ in their meta text and action.
export function FileRow({ as: Tag = "div", className, name, meta, action }: FileRowProps) {
  return (
    <Tag className={cn("flex items-center gap-2", className)}>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {name}
        </span>
        {meta}
      </div>
      {action ? (
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">{action}</div>
      ) : null}
    </Tag>
  );
}
