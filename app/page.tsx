"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import PlaceholderImage from "@/components/PlaceholderImage";
import HeroBlobs from "@/components/HeroBlobs";
import FeatureShowcase from "@/components/FeatureShowcase";
import CreatorSection from "@/components/CreatorSection";
import StatCard from "@/components/StatCard";

const heroWords = ["Documents", "Photos", "Contracts", "Design Files", "Backups", "Anything"];

const Home = () => {
  const router = useRouter();
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="px-4 pt-2 sm:px-6 sm:pt-4">
        <div className="container relative mx-auto flex min-h-[85vh] flex-col items-center justify-center overflow-hidden rounded-[2.5rem] bg-slate-950 px-6 py-20 text-center sm:rounded-[3rem] sm:py-28">
          <HeroBlobs />

          <div className="relative z-10 flex flex-col items-center">
            <p className="mb-4 text-sm font-medium text-slate-400 sm:text-base">
              Open source, no account needed, no strings.
            </p>
            <h1 className="mx-auto flex max-w-3xl flex-wrap items-baseline justify-center gap-x-3 gap-y-2">
              <span className="text-4xl font-bold tracking-tighter text-white sm:text-6xl md:text-7xl">
                Share
              </span>
              <span
                key={heroWords[activeWordIndex]}
                className="text-4xl font-bold tracking-tighter text-primary transition-opacity duration-500 sm:text-6xl md:text-7xl"
              >
                {heroWords[activeWordIndex]}
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-slate-300 sm:text-lg">
              Got a file on this device that needs to be on that one?
              Upload it, grab the link and the little code, send both.
              No cables, no cloud drama.
            </p>
            <div className="mt-10 flex justify-center">
              <Button
                size="lg"
                className="rounded-full text-lg sm:px-10 sm:py-7 sm:text-xl"
                onClick={() => router.push("/dashboard")}
              >
                Upload something
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Already have an account? Sign in
          </button>
        </div>
      </section>

      {/* Platform Statement Section */}
      <section className="bg-slate-950 py-20 text-white sm:py-28">
        <div className="container mx-auto grid gap-10 px-4 md:grid-cols-2 md:items-stretch md:gap-16">
          <div className="flex flex-col">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              The whole point
            </p>
            <h2 className="mb-4 text-6xl font-bold leading-[0.95] sm:text-7xl lg:text-8xl">
              Built for one job.
            </h2>
            <p className="mb-6 text-2xl font-medium text-slate-300 sm:text-3xl">
              Get a file from you to someone else, safely.
            </p>
            <p className="max-w-md text-base text-slate-400 sm:text-lg">
              This started as a way to fling files between devices that
              refuse to talk to each other. Phone to laptop, work machine
              to home machine, your computer to your friend's. Upload, get
              a code, send the code. Done.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
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
            <p className="mt-10 border-t border-slate-800 pt-6 text-sm leading-relaxed text-slate-500 md:mt-auto">
              No account for your recipient, no apps, nothing to uninstall
              later. The file just goes where you point it.
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

      {/* Feature Showcase Section */}
      <FeatureShowcase />

      {/* Creator Section */}
      <CreatorSection />

      {/* Final CTA Section */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="container mx-auto rounded-[2.5rem] bg-muted/50 px-4 py-16 text-center sm:rounded-[3rem] sm:py-20">
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            Go on, send something
          </h2>
          <p className="mx-auto mb-8 max-w-md text-muted-foreground">
            It takes less time than finding the right USB cable.
          </p>
          <Button
            size="lg"
            className="text-lg sm:px-10 sm:py-7"
            onClick={() => router.push("/dashboard")}
          >
            Upload something
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
