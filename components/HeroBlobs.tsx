"use client";

import { cn } from "@/lib/utils";

interface HeroBlobsProps {
  offset?: { x: number; y: number };
}

// Soft glows built from radial gradients, not filter: blur(). Safari clips
// blur() against an overflow-hidden ancestor by its rectangular bounding
// box, not the element's rounded shape, which shows up as faint square
// edges. A gradient just fades to transparent on its own, so there's no
// hard edge for Safari to clip in the first place. Each stop fades in
// gradually and the shapes are large relative to the panel, so there's no
// point where the eye can trace a distinct circular outline.
const blobs = [
  {
    size: "h-[34rem] w-[34rem]",
    position: "-left-40 -top-40",
    depth: 0.03,
    background:
      "radial-gradient(circle, hsl(var(--primary) / 0.32) 0%, hsl(var(--primary) / 0.16) 30%, hsl(var(--primary) / 0.05) 55%, transparent 75%)",
  },
  {
    size: "h-[50rem] w-[50rem]",
    position: "-bottom-72 -right-56",
    depth: 0.015,
    background:
      "radial-gradient(circle, hsl(24 90% 58% / 0.28) 0%, hsl(24 90% 58% / 0.14) 30%, hsl(24 90% 58% / 0.05) 55%, transparent 75%)",
  },
  {
    size: "h-[26rem] w-[26rem]",
    position: "right-[10%] top-[10%]",
    depth: 0.05,
    background:
      "radial-gradient(circle, hsl(var(--primary) / 0.22) 0%, hsl(var(--primary) / 0.1) 35%, transparent 70%)",
  },
];

const HeroBlobs = ({ offset = { x: 0, y: 0 } }: HeroBlobsProps) => {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((blob, index) => (
        <div
          key={index}
          className={cn("absolute rounded-full transition-transform duration-[1500ms] ease-out", blob.size, blob.position)}
          style={{
            background: blob.background,
            transform: `translate3d(${offset.x * blob.depth}px, ${offset.y * blob.depth}px, 0)`,
          }}
        />
      ))}
    </div>
  );
};

export default HeroBlobs;
