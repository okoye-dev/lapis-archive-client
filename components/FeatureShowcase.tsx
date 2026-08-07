"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

import PlaceholderImage from "@/components/PlaceholderImage";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

const SLIDE_DURATION_MS = 11000;
// Kept in sync with the track's transition below: it's how long we wait
// after landing on the trailing clone before snapping back to the real
// first slide.
const TRANSITION_MS = 250;

interface Slide {
  id: string;
  heading: string;
  body: string;
  cta: string;
  imageLabel: string;
}

const slides: Slide[] = [
  {
    id: "upload",
    heading: "Drop a file in, get a link out",
    body: "Drag a file in and it's on its way. A moment later you've got a link you can hand to anyone. That's it. That's the feature.",
    cta: "Toss a file in",
    imageLabel:
      "Illustration idea: dark scene, a hand dropping a single file card onto a rising stack, purple to orange glow underneath, Coinbase-illustration style with bold flat shapes",
  },
  {
    id: "access-code",
    heading: "A code only your recipient has",
    body: "Every share comes with a little code. The link without the code opens nothing. Send both by text, chat, email, or a very reliable pigeon.",
    cta: "Share something",
    imageLabel:
      "Illustration idea: dark scene, oversized 6-character access code on a card, a keyhole glowing purple, small file icons waiting behind it, bold flat shapes",
  },
  {
    id: "open-source",
    heading: "Nothing hidden, nothing locked in",
    body: "The whole thing is open source. Peek inside, run your own copy, or just enjoy knowing there's no mystery box between you and your files.",
    cta: "Poke around",
    imageLabel:
      "Illustration idea: dark scene, an open box with code brackets floating out, purple and orange accent lines, friendly and geometric, no text-heavy UI",
  },
];

interface SlideViewProps {
  slide: Slide;
  onCta: () => void;
  active: boolean;
}

// One slide in the track. w-full is measured against the track, which is a
// single panel wide, so every slide is exactly one panel across; shrink-0
// stops flex from squeezing them all into that one panel's width.
const SlideView = ({ slide, onCta, active }: SlideViewProps) => (
  <div
    aria-hidden={!active}
    // px here rather than on the container: the track now spans the full
    // container width so slides can travel to the curve, so each slide is
    // responsible for insetting its own content.
    // No opacity fade any more. Fading a departing slide made it vanish in
    // open space partway through its travel; letting it stay opaque means
    // the rounded edge is what takes it out of view.
    className="grid w-full shrink-0 gap-8 px-6 sm:px-14 md:grid-cols-2 md:items-center md:gap-16"
  >
    {/* min-w-0 on both columns: grid items default to min-width:auto, which
        refuses to shrink below their content and lets a long word push the
        column — and the artwork beside it — past the slide's right edge. */}
    <div className="flex min-w-0 flex-col items-start">
      <h2 className="mb-5 text-4xl font-bold leading-[1.05] sm:text-5xl">
        {slide.heading}
      </h2>
      <p className="mb-7 max-w-md text-base text-zinc-400 sm:text-lg">
        {slide.body}
      </p>
      <button
        type="button"
        onClick={onCta}
        // Off-screen slides stay in the DOM, so keep their button out of the
        // tab order until the slide is the one on show.
        tabIndex={active ? undefined : -1}
        className="rounded-full bg-white px-8 py-4 text-base font-semibold text-[#0a0b0d] transition-colors duration-500 hover:bg-zinc-200"
      >
        {slide.cta}
      </button>
    </div>

    <PlaceholderImage
      label={slide.imageLabel}
      gradient="from-primary/30 via-[#15161a] to-[#0a0b0d]"
      aspect="aspect-[4/3]"
      className="min-w-0 rounded-[3rem] border-zinc-800 text-zinc-400"
    />
  </div>
);

// The track renders one extra slide: a copy of the first, parked after the
// last. Advancing off the end travels forward onto that copy, then we
// silently jump back to the real first slide, so the loop never rewinds.
const track = [...slides, slides[0]];
const CLONE_INDEX = slides.length;

const FeatureShowcase = () => {
  const router = useRouter();
  // position indexes `track`, so it can reach CLONE_INDEX; activeIndex is
  // the real slide that position corresponds to.
  const [position, setPosition] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const pendingPrev = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef);

  const activeIndex = position % slides.length;

  // Clamped at the clone. Without this, clicks arriving faster than the
  // snap-back could push position past the clone into empty track, where
  // the reset never fires because it only watches for CLONE_INDEX.
  const advance = () =>
    setPosition((p) => (p >= CLONE_INDEX ? p : p + 1));

  // One timeout per slide instead of a long-lived interval: any change to
  // position (auto or manual) restarts the countdown, so a manual click
  // never gets an auto-advance firing a moment later. Gated on inView as
  // well, so the carousel doesn't quietly run through its slides while
  // off-screen and leave you looking at slide 3 when you scroll down.
  useEffect(() => {
    if (!isPlaying || snapping || !inView) return;
    const id = setTimeout(advance, SLIDE_DURATION_MS);
    return () => clearTimeout(id);
  }, [isPlaying, position, snapping, inView]);

  // Once the slide onto the clone has finished, cut the transition and move
  // to the real first slide. They render identically, so the swap is
  // invisible — it just resets the runway.
  useEffect(() => {
    if (position !== CLONE_INDEX) return;
    const id = setTimeout(() => {
      setSnapping(true);
      setPosition(0);
    }, TRANSITION_MS);
    return () => clearTimeout(id);
  }, [position]);

  // Put the transition back once the snap has been committed. Safe at any
  // delay: `transition: none` and the new transform land in the same render,
  // so the jump is never animated, and re-enabling later changes no
  // position. Deliberately a timeout, not requestAnimationFrame — rAF does
  // not run in a hidden tab, which left this stuck mid-snap with transitions
  // off and the autoplay loop (which skips while snapping) halted for good.
  useEffect(() => {
    if (!snapping) return;
    const id = setTimeout(() => {
      setSnapping(false);
      if (pendingPrev.current) {
        pendingPrev.current = false;
        setPosition(CLONE_INDEX - 1);
      }
    }, 50);
    return () => clearTimeout(id);
  }, [snapping]);

  const goTo = (index: number) => setPosition(index);

  const goNext = advance;

  // Stepping back off the front: jump to the clone first (identical to the
  // first slide), then animate backwards from there.
  const goPrev = () => {
    if (position === 0) {
      pendingPrev.current = true;
      setSnapping(true);
      setPosition(CLONE_INDEX);
      return;
    }
    setPosition((p) => p - 1);
  };

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-slate-950 via-[#0a0b0d] to-[#0a0b0d] px-6 py-16 text-white sm:px-10 sm:py-24 lg:px-16"
    >
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="What Lapis Archive does"
        // overflow-hidden here, not on the track's viewport: it makes the
        // rounded edge itself the clipping boundary, so a departing slide
        // travels all the way out to the curve before it vanishes.
        className="mx-auto max-w-6xl overflow-hidden rounded-[3rem] bg-[#131419] px-6 py-10 sm:rounded-[4rem] sm:px-14 sm:py-12"
      >
        {/* A plain horizontal track. The percentage translate resolves
            against the track's own width, and the track is exactly one
            panel wide (its children overflow it), so -100% advances by
            exactly one slide regardless of how many slides there are. */}
        {/* Negative margins cancel the container's horizontal padding so the
            runway reaches the container's edges. Without this the track was
            clipped at a rectangle inset by that padding, and slides
            disappeared at an invisible line short of the curve. Each slide
            puts the padding back on its own content. */}
        <div className="-mx-6 sm:-mx-14">
          <div
            className="flex"
            style={{
              transform: `translateX(-${position * 100}%)`,
              // Linear, so the slide holds one speed and doesn't coast to a
              // stop at the end. Dropped entirely while snapping back off
              // the clone, so that reset isn't animated.
              transition: snapping
                ? "none"
                : `transform ${TRANSITION_MS}ms linear`,
            }}
          >
            {track.map((slide, index) => (
              // Keyed by index, not slide.id: the clone repeats the first
              // slide's id, and duplicate keys would collapse the two.
              <SlideView
                key={index}
                slide={slide}
                onCta={() => router.push("/dashboard")}
                active={index === position}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {slides.map((s, index) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Go to slide ${index + 1}: ${s.heading}`}
                  aria-current={index === activeIndex}
                  onClick={() => goTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-[width,background-color] duration-500 ease-spring",
                    index === activeIndex
                      ? "w-10 bg-white"
                      : "w-2 bg-zinc-600 hover:w-4 hover:bg-zinc-400",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition-[color,border-color,transform] duration-500 ease-spring hover:scale-110 hover:border-zinc-500 hover:text-white"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous slide"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-[color,border-color] duration-500 hover:border-zinc-500 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next slide"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-[color,border-color] duration-500 hover:border-zinc-500 hover:text-white"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-2xl px-4 text-center text-sm text-zinc-500">
        The pictures are placeholders while I draw better ones. The sharing
        itself works for real.
      </p>
    </section>
  );
};

export default FeatureShowcase;
