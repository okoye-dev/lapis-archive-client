"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import PlaceholderImage from "@/components/PlaceholderImage";
import { cn } from "@/lib/utils";

const heroWords = ["Documents", "Photos", "Contracts", "Design Files", "Backups", "Anything"];

interface Tab {
  id: string;
  label: string;
  heading: string;
  bullets: string[];
  imageLabel: string;
}

const tabs: Tab[] = [
  {
    id: "upload",
    label: "Upload & Share",
    heading: "Drop a file in, get a link out",
    imageLabel: "Screenshot: the upload dropzone with a file mid-upload",
    bullets: [
      "Drag and drop or click to upload — no size-limit surprises, no complicated setup",
      "Every upload immediately gets its own shareable link",
      "Built on straightforward, presigned storage — your file, not a copy of a copy",
    ],
  },
  {
    id: "access-code",
    label: "Access Codes",
    heading: "A code only your recipient has",
    imageLabel: "Screenshot: the share dialog showing a generated link and access code",
    bullets: [
      "Every share gets a unique access code alongside its link",
      "The link alone isn't enough to get in — they need the code too",
      "Copy both and send them however you already talk to people: text, chat, email",
    ],
  },
  {
    id: "open-source",
    label: "Open Source",
    heading: "Nothing hidden, nothing locked in",
    imageLabel: "Screenshot or graphic: the GitHub repo / architecture diagram",
    bullets: [
      "The full source is open — inspect it, self-host it, fork it",
      "No proprietary format holding your files hostage",
      "Built to be small and understandable, not a black box",
    ],
  },
];

const Home = () => {
  const router = useRouter();
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto grid gap-10 px-4 py-16 sm:py-20 md:grid-cols-[1.4fr_1fr] md:items-center md:py-28">
          <div>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
                Share
              </span>
              <span
                key={heroWords[activeWordIndex]}
                className="text-4xl font-bold text-primary transition-opacity duration-500 sm:text-5xl md:text-6xl"
              >
                {heroWords[activeWordIndex]}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {heroWords.map((word, index) => (
                <div
                  key={word}
                  className={cn(
                    "text-lg font-medium transition-colors duration-500 sm:text-xl",
                    index === activeWordIndex
                      ? "text-foreground"
                      : "text-muted-foreground/40",
                  )}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-base text-muted-foreground sm:text-lg">
              Upload a file, get a public link and an access code, send both
              to whoever needs it. No account required to upload — we only
              ask for an email when you're ready to share.
            </p>
            <div className="flex flex-col items-start gap-3">
              <Button
                size="lg"
                className="w-full text-lg sm:w-auto sm:px-10 sm:py-7 sm:text-xl"
                onClick={() => router.push("/dashboard")}
              >
                Upload something
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <button
                type="button"
                onClick={() => router.push("/signin")}
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statement Section */}
      <section className="bg-zinc-950 py-16 text-white sm:py-24">
        <div className="container mx-auto grid gap-10 px-4 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
              Built for one job: get a file from you to someone else, safely
            </h2>
            {/* Personalize this paragraph with your own reason for building Lapis Archive */}
            <p className="text-base text-zinc-400 sm:text-lg">
              We built Lapis Archive because sharing a single file shouldn't
              require signing up for another account, installing another
              app, or trusting another company with a permanent copy.
              Upload it, get a code, send the code. That's the whole idea.
            </p>
          </div>
          <PlaceholderImage
            label="Graphic: product mark or abstract visual matching the brand, dark background"
            gradient="from-primary/40 via-primary/10 to-zinc-950"
            aspect="aspect-square"
            className="border-zinc-800"
          />
        </div>
      </section>

      {/* Feature Showcase Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <h2 className="mb-10 text-center text-2xl font-bold text-foreground sm:mb-14 sm:text-3xl">
          Powering simple, private file sharing
        </h2>

        <div
          role="tablist"
          aria-label="Product capabilities"
          className="flex flex-wrap justify-center gap-2 border-b border-border"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={tab.id === activeTab}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                tab.id === activeTab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`panel-${currentTab.id}`}
          aria-labelledby={`tab-${currentTab.id}`}
          className="mt-10 grid gap-8 md:grid-cols-2 md:items-center md:gap-12"
        >
          <PlaceholderImage label={currentTab.imageLabel} />
          <div>
            <h3 className="mb-4 text-2xl font-bold text-foreground">
              {currentTab.heading}
            </h3>
            <ul className="space-y-3">
              {currentTab.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3 text-sm text-muted-foreground sm:text-base">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="border-t border-border bg-muted/30 py-16 text-center sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
            Ready to share your first file?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-muted-foreground">
            It takes less time than writing the email you'd send instead.
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
