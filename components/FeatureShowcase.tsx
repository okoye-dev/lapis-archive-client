"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

import PlaceholderImage from "@/components/PlaceholderImage";
import { cn } from "@/lib/utils";

const SLIDE_DURATION_MS = 11000;
// Must match the fade-out animation length in tailwind.config.ts, since
// that's how long the outgoing slide stays mounted before being replaced.
const EXIT_DURATION_MS = 700;

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

const FeatureShowcase = () => {
  const router = useRouter();
  // activeIndex is the slide we're heading to; shownIndex is the one still
  // on screen. They differ only while the outgoing slide plays its exit.
  const [activeIndex, setActiveIndex] = useState(0);
  const [shownIndex, setShownIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const isLeaving = activeIndex !== shownIndex;

  // Hold the outgoing slide mounted for the length of its fade, then swap
  // in the new one so it can play its own entrance.
  useEffect(() => {
    if (!isLeaving) return;
    const id = setTimeout(() => setShownIndex(activeIndex), EXIT_DURATION_MS);
    return () => clearTimeout(id);
  }, [isLeaving, activeIndex]);

  // One timeout per slide instead of a long-lived interval: any change to
  // activeIndex (auto or manual) restarts the countdown, so a manual click
  // never gets an auto-advance firing a moment later.
  useEffect(() => {
    if (!isPlaying) return;
    const id = setTimeout(() => {
      setActiveIndex((activeIndex + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => clearTimeout(id);
  }, [isPlaying, activeIndex]);

  const goTo = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  const slide = slides[shownIndex];

  return (
    <section className="bg-gradient-to-b from-slate-950 via-[#0a0b0d] to-[#0a0b0d] px-6 py-16 text-white sm:px-10 sm:py-24 lg:px-16">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="What Lapis Archive does"
        className="mx-auto max-w-6xl rounded-[3rem] bg-[#131419] px-6 py-10 sm:rounded-[4rem] sm:px-14 sm:py-12"
      >
        {/* Keyed on the slide id so every swap replays the entrance
            animation on the text column and the artwork together. While a
            change is pending, the wrapper fades the old slide out first. */}
        <div
          key={slide.id}
          className={cn(
            "grid gap-8 md:grid-cols-2 md:items-center md:gap-16",
            isLeaving && "animate-fade-out",
          )}
        >
          <div className="flex animate-rise-in flex-col items-start">
            <h2 className="mb-5 text-4xl font-bold leading-[1.05] sm:text-5xl">
              {slide.heading}
            </h2>
            <p className="mb-7 max-w-md text-base text-zinc-400 sm:text-lg">
              {slide.body}
            </p>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              // duration-500 is avoided here on purpose: tailwindcss-animate
              // makes duration-* set animation-duration too, which would
              // shorten the pop-in. The arbitrary property only hits the
              // transition.
              className="animate-pop-in rounded-full bg-white px-8 py-4 text-base font-semibold text-[#0a0b0d] transition-colors [transition-duration:500ms] hover:bg-zinc-200"
            >
              {slide.cta}
            </button>
          </div>

          <PlaceholderImage
            label={slide.imageLabel}
            gradient="from-primary/30 via-[#15161a] to-[#0a0b0d]"
            aspect="aspect-[4/3]"
            className="animate-rise-in rounded-[3rem] border-zinc-800 text-zinc-400"
          />
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
                <Pause key="pause" className="h-4 w-4 animate-pop-in" />
              ) : (
                <Play key="play" className="h-4 w-4 animate-pop-in" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Previous slide"
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition-[color,border-color,transform] duration-500 ease-spring hover:scale-110 hover:border-zinc-500 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5 transition-transform duration-500 ease-spring group-hover:-translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Next slide"
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition-[color,border-color,transform] duration-500 ease-spring hover:scale-110 hover:border-zinc-500 hover:text-white"
            >
              <ArrowRight className="h-5 w-5 transition-transform duration-500 ease-spring group-hover:translate-x-0.5" />
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
