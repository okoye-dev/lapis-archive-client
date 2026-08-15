"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useShareStore } from "@/store/shareStore";
import { useCopy } from "@/hooks/useCopy";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useFormatDate as formatDate } from "@/hooks/useFormatDate";

export default function SharedLinks() {
  const shares = useShareStore((state) => state.shares);
  const copy = useCopy();
  const hasMounted = useHasMounted();

  if (!hasMounted || shares.length === 0) return null;

  return (
    <section className="pb-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Shared links
        </h2>

        <Card className="px-3 py-1">
          <ul className="divide-y divide-primary/10">
            {shares.map((share) => (
              <li key={share.slug} className="flex items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {share.fileName}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {share.link}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground/70">
                    code {share.shareCount ?? 1} of 3 · expires{" "}
                    {formatDate(share.expiresAt)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Copy link for ${share.fileName}`}
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
                  onClick={() => copy(share.link)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
