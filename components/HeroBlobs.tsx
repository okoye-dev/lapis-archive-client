"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { cn } from "@/lib/utils";

interface BlobConfig {
  size: string;
  position: string;
  background: string;
  duration: string;
  growth: number;
}

// Soft glows built from radial gradients, not filter: blur(). Safari clips
// blur() against an overflow-hidden ancestor by its rectangular bounding
// box, not the element's rounded shape, which shows up as faint square
// edges. A gradient just fades to transparent on its own, so there's no
// hard edge for Safari to clip in the first place. Each stop fades in
// gradually and the shapes are large relative to the panel, so there's no
// point where the eye can trace a distinct circular outline.
const blobConfigs: BlobConfig[] = [
  {
    size: "h-[34rem] w-[34rem]",
    position: "-left-40 -top-40",
    background:
      "radial-gradient(circle, hsl(var(--primary) / 0.32) 0%, hsl(var(--primary) / 0.16) 30%, hsl(var(--primary) / 0.05) 55%, transparent 75%)",
    duration: "duration-[1800ms]",
    growth: 0.3,
  },
  {
    size: "h-[50rem] w-[50rem]",
    position: "-bottom-72 -right-56",
    background:
      "radial-gradient(circle, hsl(24 90% 58% / 0.28) 0%, hsl(24 90% 58% / 0.14) 30%, hsl(24 90% 58% / 0.05) 55%, transparent 75%)",
    duration: "duration-[2200ms]",
    growth: 0.2,
  },
  {
    size: "h-[26rem] w-[26rem]",
    position: "right-[10%] top-[10%]",
    background:
      "radial-gradient(circle, hsl(var(--primary) / 0.22) 0%, hsl(var(--primary) / 0.1) 35%, transparent 70%)",
    duration: "duration-[1400ms]",
    growth: 0.4,
  },
];

interface BlobProps {
  config: BlobConfig;
  layerRef: RefObject<HTMLDivElement>;
  active: boolean;
}

// Each blob tracks its own distance to the cursor and grows on its own —
// nothing here is shared with or synchronized to the other blobs. One
// blob reacting has no bearing on what the others are doing.
function Blob({ config, layerRef, active }: BlobProps) {
  const blobRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!active) {
      setScale(1);
      return;
    }

    // The blob layer itself is pointer-events-none (so it never blocks
    // clicks on the real content), which also means it never receives
    // mouse events — walk up one level to the actual hero panel, which is
    // interactive and spans the same area.
    const heroPanel = layerRef.current?.parentElement;
    const blobEl = blobRef.current;
    if (!heroPanel || !blobEl) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const rect = blobEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      const proximity = Math.max(0, 1 - distance / rect.width);
      setScale(1 + proximity * config.growth);
    };

    const handleMouseLeave = () => setScale(1);

    heroPanel.addEventListener("mousemove", handleMouseMove);
    heroPanel.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      heroPanel.removeEventListener("mousemove", handleMouseMove);
      heroPanel.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [active, config.growth, layerRef]);

  return (
    <div
      ref={blobRef}
      className={cn("absolute rounded-full transition-transform ease-out", config.duration, config.size, config.position)}
      style={{ background: config.background, transform: `scale(${scale})` }}
    />
  );
}

// Fully self-contained: drop <HeroBlobs /> in as a direct child of the
// panel it should decorate and it wires itself up to that parent — the
// page using it doesn't own or manage any tracking/animation logic. An
// IntersectionObserver stops everything the moment the panel scrolls out
// of view, so nothing keeps running once you've scrolled past it.
const HeroBlobs = () => {
  const layerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const heroPanel = layerRef.current?.parentElement;
    if (!heroPanel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(heroPanel);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={layerRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobConfigs.map((config, index) => (
        <Blob key={index} config={config} layerRef={layerRef} active={active} />
      ))}
    </div>
  );
};

export default HeroBlobs;
