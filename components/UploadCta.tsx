"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Lucide's ChevronsRight draws both heads the same height; this one leads with
// a taller head so the pair reads as motion rather than a repeated glyph.
function DoubleChevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 3.5 14.5 12 6 20.5" />
      <path d="M15 6 20 12 15 18" />
    </svg>
  );
}

// The landing page's primary call to action, used in the hero and the closing
// section so both stay identical.
export default function UploadCta({ className }: { className?: string }) {
  return (
    <Button
      asChild
      size="lg"
      className={cn(
        // h-auto: the lg size pins h-11, which would cap the vertical padding.
        "group h-auto rounded-full px-9 py-6 text-2xl font-semibold tracking-tighter",
        "sm:px-11 sm:py-7 sm:text-3xl",
        className,
      )}
    >
      <Link href="/dashboard">
        {/* Gradient clipped to the glyphs, so the orange reads as a glow
            rising off the baseline rather than a colour change. */}
        <span className="bg-gradient-to-t from-orange-200 via-white via-75% to-white bg-clip-text text-transparent">
          Upload now
        </span>
        {/* ! is required: the Button base sets [&_svg]:size-4, and that
            descendant selector out-specifies a plain h-/w- utility. */}
        <DoubleChevron className="ml-1 !h-7 !w-7 text-orange-300 transition-transform duration-500 ease-out group-hover:translate-x-1 group-active:translate-x-1.5 sm:!h-8 sm:!w-8" />
      </Link>
    </Button>
  );
}
