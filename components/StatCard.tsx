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

// Aave-style stat card: icon up top, big title, quiet description. The
// icon is drawn twice, a dull grey copy and a copy stroked with the
// brand's purple-to-orange gradient; hovering the card crossfades them
// (same trick as SocialIcon) and gives the icon a little lift.
const StatCard = ({ icon: Icon, title, description, className }: StatCardProps) => {
  const gradientId = useId();

  return (
    <div
      className={cn(
        "group rounded-3xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7",
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

      <div className="relative mb-10 h-7 w-7 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
        <Icon
          aria-hidden
          className="absolute inset-0 h-full w-full text-gray-400 transition-opacity duration-300 group-hover:opacity-0"
        />
        <Icon
          aria-hidden
          stroke={`url(#${gradientId})`}
          className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </div>

      <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {title}
      </p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default StatCard;
