"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Zap } from "lucide-react";

import PlaceholderImage from "@/components/PlaceholderImage";
import UploadCta from "@/components/UploadCta";
import HeroBlobs from "@/components/HeroBlobs";
import FeatureShowcase from "@/components/FeatureShowcase";
import { useInView } from "@/hooks/useInView";
import CreatorSection from "@/components/CreatorSection";
import StatCard from "@/components/StatCard";

// All 6-9 letters, but chosen and ordered by rendered width rather than
// letter count, which is what actually moves the centred heading. Measured
// at the hero's 72px size: Pictures 242, Backups 260, Anything 271,
// Mockups 278, Podcasts 278, Receipts 260. Ordering them as a climb and
// then back down keeps every neighbouring step small, including the wrap
// from the last back to the first, so no single change is worse than 18px.
// The previous set ran 210px ("Photos") to 347px ("Documents"), and that
// 137px swing is what shoved "Share" around.
const heroWords = ["Pictures", "Backups", "Anything", "Mockups", "Podcasts", "Receipts"];

const Home = () => {
  const router = useRouter();
  // `previous` keeps the outgoing word around long enough to play an exit,
  // instead of it blinking out the instant the next one arrives.
  const [word, setWord] = useState<{ index: number; previous: number | null }>({
    index: 0,
    previous: null,
  });

  // The cycling words differ in width, and the heading is centred, so every
  // swap used to shove "Share" sideways in a single frame. Measuring the new
  // word and transitioning its holder's width lets the centring resolve over
  // time instead, so "Share" glides to its new position.
  const wordRef = useRef<HTMLSpanElement>(null);
  const [wordWidth, setWordWidth] = useState<number>();

  // Cycling stops once the hero scrolls away: no point burning a timer and
  // repainting a word nobody can see, and it means scrolling back finds the
  // sequence where you left it rather than mid-flight.
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef);

  useEffect(() => {
    if (!heroInView) return;
    const interval = setInterval(() => {
      // Both fields move in one update. Tracking the outgoing word in a
      // separate state would land a render later, showing one frame where
      // the old word is already gone and nothing is animating out.
      setWord((w) => ({
        index: (w.index + 1) % heroWords.length,
        previous: w.index,
      }));
    }, 3400);
    return () => clearInterval(interval);
  }, [heroInView]);

  // Deliberately useEffect, not useLayoutEffect: this renders on the server
  // too, where useLayoutEffect warns. Running after paint is also what we
  // want — the holder keeps the previous width for one frame, which is the
  // starting point the width transition animates away from.
  useEffect(() => {
    if (wordRef.current) setWordWidth(wordRef.current.offsetWidth);
  }, [word.index]);

  return (
    <div className="min-h-content">
      <section ref={heroRef} className="px-4 pb-8 pt-2 sm:px-6 sm:pb-12 sm:pt-4">
        <div className="container relative mx-auto flex min-h-[85vh] flex-col items-center justify-center overflow-hidden rounded-[2.5rem] bg-slate-950 px-6 py-20 text-center sm:rounded-[3rem] sm:py-28">
          <HeroBlobs />

          <div className="relative z-10 flex flex-col items-center">
            <h1 className="mx-auto flex max-w-3xl flex-wrap items-baseline justify-center gap-x-3 gap-y-2">
              <span className="text-4xl font-bold tracking-tighter text-white sm:text-6xl md:text-7xl">
                Share
              </span>
              <span
                className="relative inline-block text-left transition-[width] duration-700 ease-out"
                style={{ width: wordWidth }}
              >
                {word.previous !== null && (
                  <span
                    key={`out-${word.previous}-${word.index}`}
                    aria-hidden
                    className="animate-word-out absolute left-0 top-0 whitespace-nowrap text-4xl font-bold tracking-tighter text-primary sm:text-6xl md:text-7xl"
                  >
                    {heroWords[word.previous]}
                  </span>
                )}
                <span
                  ref={wordRef}
                  key={heroWords[word.index]}
                  className="animate-word-in inline-block whitespace-nowrap text-4xl font-bold tracking-tighter text-primary sm:text-6xl md:text-7xl"
                >
                  {heroWords[word.index]}
                </span>
              </span>
            </h1>
            <p className="mx-auto px-[5%] text-balance mt-6 max-w-xl text-base text-slate-300 sm:text-lg">
              Got a file on this device that needs to be on that one?
              Upload it, send a link and the code.
              Free.
            </p>
            <div className="mt-10 flex justify-center">
              <UploadCta />
            </div>
            <p className="mt-3 text-xs font-medium text-slate-400/60 lg:text-sm">
              No, you don&apos;t need to login.
            </p>
          </div>
        </div>
        <div className="my-6 text-center">
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            peekaboo.
          </button>
        </div>
      </section>

      <section className="bg-slate-950 py-28 text-white sm:py-40">
        <div className="container mx-auto grid gap-10 px-6 sm:px-8 md:grid-cols-2 md:items-stretch md:gap-14 lg:px-12">
          <div className="flex flex-col">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
             minimalist
            </p>
            <h2 className="mb-3 text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl">
              Built for one job.
            </h2>
            <p className="mb-4 text-xl font-medium text-slate-300 sm:text-2xl">
              Give anyone access to a file, fast.
            </p>
            <p className="max-w-md text-base text-slate-400">
              I built this as a way to fling files between my devices that
              weren&apos;t compatible. Upload, get
              a code, send the code. Done.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <StatCard
                icon={Zap}
                title="3 steps"
                description="Upload, copy, send. That's the whole manual."
              />
              <StatCard
                icon={KeyRound}
                title="1 little code"
                description="The only thing between your file and strangers."
              />
            </div>
            <p className="mt-8 border-t border-slate-800 pt-3 text-sm leading-relaxed text-slate-500 md:mt-auto">
              It&apos;s a quick helper. No accounts needed from anyone.
            </p>
          </div>
          <PlaceholderImage
            label="Graphic: product mark or abstract visual matching the brand, dark background"
            gradient="from-primary/40 via-primary/10 to-slate-950"
            aspect="aspect-square"
            className="rounded-[2.5rem] border-slate-800 text-slate-400"
          />
        </div>
      </section>

      <FeatureShowcase />

      <CreatorSection />

      <section className="flex min-h-[100vh] items-center justify-center bg-gradient-to-b from-transparent via-primary/[0.12] to-orange-500/25 px-8 py-24 text-center sm:px-16 lg:px-28 xl:px-36">
        <div className="container mx-auto">
          <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
            Go on, send something.
          </h2>
          <p className="mx-auto mb-10 max-w-md text-muted-foreground sm:text-lg">
            It takes less time than finding the right USB cable (uh...sometimes).
          </p>
          <UploadCta className="border border-orange-500/40" />
        </div>
      </section>
    </div>
  );
};

export default Home;
