"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileRow } from "@/components/dashboard/FileRow";
import { useShareStore } from "@/store/shareStore";
import { useCopy } from "@/hooks/useCopy";
import { useHasMounted } from "@/hooks/useHasMounted";
import { formatDate } from "@/utils/formatDate";

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
              <FileRow
                key={share.slug}
                as="li"
                className="gap-3 py-2"
                name={share.fileName}
                meta={
                  <>
                    <span className="block truncate text-xs text-muted-foreground">
                      {share.link}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground/70">
                      code {share.shareCount ?? 1} of 3 · expires{" "}
                      {formatDate(share.expiresAt)}
                    </span>
                  </>
                }
                action={
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
                }
              />
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
