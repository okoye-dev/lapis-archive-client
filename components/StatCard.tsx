"use client";

import { useId } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

const StatCard = ({ icon: Icon, title, description, className }: StatCardProps) => {
  const gradientId = useId();

  return (
    <div
      className={cn(
        // min-h + justify-between makes the card read as a square-ish tile:
        // the padding stays tight while the icon and the text push apart to
        // fill the height, instead of the box collapsing to a wide strip.
        "group relative flex flex-col justify-between gap-6 overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/[0.17] p-4 backdrop-blur-sm transition-[background-color,border-color] duration-500 ease-spring hover:border-primary/40 hover:bg-primary/[0.24] sm:min-h-[13.5rem] sm:p-7",
        className,
      )}
    >
      {/* Orange glow parked off the bottom-right corner. On hover it grows
          and drifts inward at the same time, so it reads as light sweeping
          in from outside the card rather than a dot inflating in place. The
          element is centred on the corner, so scaling alone keeps it in the
          corner; the translate is what carries it in.
          Built from a radial gradient rather than blur() for the same
          reason HeroBlobs is: Safari clips blur() to a rectangle inside an
          overflow-hidden parent, which would show square edges here. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[15rem] -right-[15rem] h-[30rem] w-[30rem] scale-90 opacity-0 group-hover:-translate-x-20 group-hover:-translate-y-20 group-hover:scale-[1.75] group-hover:opacity-100"
        style={{
          // Very gradual stops so the edge is never traceable: it reads as
          // a soft haze rather than a circle with a blurred outline.
          background:
            "radial-gradient(circle, hsl(24 90% 58% / 0.18) 0%, hsl(24 90% 58% / 0.13) 20%, hsl(24 90% 58% / 0.075) 42%, hsl(24 90% 58% / 0.03) 66%, hsl(24 90% 58% / 0.01) 82%, transparent 94%)",
          transition:
            "transform 1400ms cubic-bezier(0.65, 0, 0.35, 1), opacity 1100ms cubic-bezier(0.65, 0, 0.35, 1)",
        }}
      />

      {/* Invisible svg hosting the gradient the colorful icon references */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="hsl(var(--brand))" />
            <stop offset="0.55" stopColor="hsl(var(--primary))" />
            <stop offset="1" stopColor="hsl(24 90% 58%)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative h-5 w-5 transition-transform duration-700 ease-spring group-hover:-rotate-[18deg] group-hover:skew-x-6 group-hover:scale-[1.45] sm:h-6 sm:w-6">
        <Icon
          aria-hidden
          className="absolute inset-0 h-full w-full text-slate-500 transition-opacity duration-700 ease-out group-hover:opacity-0"
        />
        <Icon
          aria-hidden
          stroke={`url(#${gradientId})`}
          className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
        />
      </div>

      {/* Wrapped so the card's justify-between splits icon vs. text as two
          blocks, rather than spreading the title and description apart. */}
      <div className="relative">
        <p className="font-logo text-xl font-semibold italic tracking-tight text-[hsl(28,90%,78%)] sm:text-[1.375rem]">
          {title}
        </p>
        <p className="mt-1.5 text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
};

export default StatCard;
