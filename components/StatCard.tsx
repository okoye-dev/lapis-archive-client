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

// Aave-style stat card, tuned for the dark statement section: a faint
// purple-tinted pane rather than solid white. The icon is drawn twice, a
// dull copy and a copy stroked with the brand's purple-to-orange gradient;
// hovering the card slowly crossfades them (same trick as SocialIcon) and
// lifts the whole card.
const StatCard = ({ icon: Icon, title, description, className }: StatCardProps) => {
  const gradientId = useId();

  return (
    <div
      className={cn(
        "group rounded-3xl border border-primary/20 bg-primary/[0.07] p-5 backdrop-blur-sm transition-[background-color,border-color,transform] duration-500 ease-spring hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/[0.14] sm:p-7",
        className,
      )}
    >
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

      <div className="relative mb-5 h-6 w-6 transition-transform duration-500 ease-spring group-hover:-translate-y-1 group-hover:rotate-[-6deg] group-hover:scale-110 sm:mb-10 sm:h-7 sm:w-7">
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

      <p className="text-xl font-bold tracking-tight text-white sm:text-3xl">
        {title}
      </p>
      <p className="mt-1.5 text-sm text-slate-400 sm:mt-2">{description}</p>
    </div>
  );
};

export default StatCard;
