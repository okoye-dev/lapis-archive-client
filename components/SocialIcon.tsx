"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type SocialIconName = "github" | "linkedin" | "email" | "portfolio";

interface SocialIconProps {
  name: SocialIconName;
  href: string;
  label: string;
  className?: string;
}

// Solid, fill-based paths so the gradient reads clearly. GitHub and
// LinkedIn are their standard brand marks; email and portfolio are simple
// filled glyphs drawn on the same 24x24 grid.
const paths: Record<SocialIconName, string> = {
  github:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  email:
    "M1.5 5.25A2.25 2.25 0 0 1 3.75 3h16.5a2.25 2.25 0 0 1 2.25 2.25v.522l-10.5 6.3-10.5-6.3V5.25zm0 3.148V18.75A2.25 2.25 0 0 0 3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V8.398l-9.83 5.898a1.25 1.25 0 0 1-1.34 0L1.5 8.398z",
  portfolio:
    "M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21zm7.926 9.375h-3.462c-.135-2.704-.833-5.107-1.897-6.727a8.267 8.267 0 0 1 5.359 6.727zM12 21.75c-1.35 0-3.05-2.897-3.287-7.125h6.574C15.05 18.853 13.35 21.75 12 21.75zm-3.287-9.375C8.95 8.147 10.65 5.25 12 5.25s3.05 2.897 3.287 7.125H8.713zm.72-9.727c-1.064 1.62-1.762 4.023-1.897 6.727H4.074a8.267 8.267 0 0 1 5.359-6.727zM4.074 14.625h3.462c.135 2.704.833 5.107 1.897 6.727a8.267 8.267 0 0 1-5.359-6.727zm12.493 6.727c1.064-1.62 1.762-4.023 1.897-6.727h3.462a8.267 8.267 0 0 1-5.359 6.727z",
};

// Two stacked copies of the same glyph: a grey one that fades out and a
// gradient one (same stops as LogoMark) that fades in on hover.
const SocialIcon = ({ name, href, label, className }: SocialIconProps) => {
  const gradientId = useId();

  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className={cn("group relative block h-6 w-6", className)}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="absolute inset-0 h-full w-full fill-gray-400 transition-opacity duration-300 group-hover:opacity-0"
      >
        <path d={paths[name]} />
      </svg>
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="24"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="hsl(var(--brand))" />
            <stop offset="0.55" stopColor="hsl(var(--primary))" />
            <stop offset="1" stopColor="hsl(24 90% 58%)" />
          </linearGradient>
        </defs>
        <path d={paths[name]} fill={`url(#${gradientId})`} />
      </svg>
    </a>
  );
};

export default SocialIcon;
