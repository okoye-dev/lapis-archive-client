"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/hooks/useUser";
import { listMyShares, revokeShare, type ShareMeta } from "@/api/shares";
import { useFormatDate as formatDate } from "@/hooks/useFormatDate";
import { formatFileSize } from "@/utils/formatFileSize";
import { cn, softSurface } from "@/lib/utils";

const Account = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [shares, setShares] = useState<ShareMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setShares(await listMyShares());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't load your shares.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRevoke = async (slug: string) => {
    if (revoking) return;
    setRevoking(slug);
    try {
      await revokeShare(slug);
      setShares((prev) => prev.filter((s) => s.slug !== slug));
      toast({ title: "Share revoked" });
    } catch (err) {
      toast({
        title: "Couldn't revoke",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setRevoking(null);
    }
  };

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email ??
    "";

  return (
    <div className="min-h-content">
      <section className="py-10 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Your account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {displayName ? (
                <>
                  Signed in as{" "}
                  <span className="font-medium text-foreground">
                    {displayName}
                  </span>
                  .
                </>
              ) : (
                "Your shares, wherever you sign in."
              )}
            </p>
          </div>

          <Card className="p-4 sm:p-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Your shares
            </h2>

            {loading ? (
              <p className="text-center text-sm text-muted-foreground">
                Loading your shares…
              </p>
            ) : error ? (
              <div className="text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={load}
                >
                  Try again
                </Button>
              </div>
            ) : shares.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                You haven&apos;t created any shares while signed in yet.
              </p>
            ) : (
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.slug}
                    className={cn(
                      softSurface.primary,
                      "flex items-center justify-between gap-2 p-3",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {share.fileName}
                      </span>
                      <div className="truncate text-xs text-muted-foreground">
                        {share.fileSize
                          ? formatFileSize(share.fileSize)
                          : "Size unavailable"}
                        {" · "}
                        {share.expired
                          ? "expired"
                          : `expires ${formatDate(share.expiresAt)}`}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      disabled={revoking === share.slug}
                      onClick={() => handleRevoke(share.slug)}
                    >
                      {revoking === share.slug ? "Revoking…" : "Revoke"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Account;
