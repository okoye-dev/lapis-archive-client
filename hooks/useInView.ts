"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

/**
 * True while the referenced element is intersecting the viewport.
 *
 * Used to park looping animations the moment they scroll out of sight. A
 * carousel that keeps advancing off-screen, or a word that keeps cycling,
 * costs timers and repaints for something nobody can see — and leaves the
 * user arriving mid-sequence when they scroll back. HeroBlobs already did
 * this with its own observer; this is the shared version.
 *
 * Starts false: an element that has never been observed is treated as
 * off-screen, so nothing animates until it is confirmed visible.
 */
export function useInView(ref: RefObject<Element | null>, threshold = 0.1) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}
