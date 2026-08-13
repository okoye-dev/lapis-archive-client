"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, softSurface } from "@/lib/utils";
import { useShareStore } from "@/store/shareStore";
import { useCopy } from "@/hooks/useCopy";
import { useHasMounted } from "@/hooks/useHasMounted";

export default function SharedLinks() {
  const shares = useShareStore((state) => state.shares);
  const copy = useCopy();
  const hasMounted = useHasMounted();

  if (!hasMounted || shares.length === 0) return null;

  return (
    <section className="py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center sm:mb-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Shared links
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This history is only saved in this browser for now.
          </p>
        </div>

        <Card className="p-4 sm:p-8">
          <div className="space-y-3">
            {shares.map((share) => (
              <div key={share.slug} className={cn(softSurface.primary, "p-3")}>
                <span className="block truncate text-xs text-muted-foreground">
                  {share.fileName}
                </span>
                <div className="mt-2 flex items-center gap-2">
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
                    onClick={() => copy(share.link)}
                  >
                    Copy link
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
