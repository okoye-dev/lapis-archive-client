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
      <section className="px-4 pt-2 sm:px-6 sm:pt-4">
        <div className="group container relative mx-auto flex min-h-[85vh] flex-col items-center justify-center overflow-hidden rounded-2xl bg-slate-950 px-6 py-20 text-center sm:rounded-3xl sm:py-28">
          {/* Decorative blurred blobs — purely visual, clipped to the panel's rounded corners by the parent's overflow-hidden */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl transition-transform duration-700 ease-out group-hover:scale-125 group-hover:-translate-x-4"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl transition-transform duration-700 ease-out group-hover:scale-125 group-hover:translate-x-4"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-1/4 top-1/4 h-56 w-56 rounded-full bg-primary/20 blur-3xl transition-transform duration-700 ease-out group-hover:scale-110"
          />

          <div className="relative z-10 flex flex-col items-center">
            <p className="mb-4 text-sm font-medium text-slate-400 sm:text-base">
              Open source. No account needed to upload.
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
              Upload a file, get a public link and an access code, send both
              to whoever needs it — we only ask for an email when you're
              ready to share.
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
      <section className="bg-slate-950 py-16 text-white sm:py-24">
        <div className="container mx-auto grid gap-10 px-4 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <h2 className="mb-6 text-4xl font-bold sm:text-5xl">
              Built for one job: get a file from you to someone else, safely
            </h2>
            {/* Personalize this paragraph with your own reason for building Lapis Archive */}
            <p className="text-base text-slate-400 sm:text-lg">
              We built Lapis Archive because sharing a single file shouldn't
              require signing up for another account, installing another
              app, or trusting another company with a permanent copy.
              Upload it, get a code, send the code. That's the whole idea.
            </p>
          </div>
          <PlaceholderImage
            label="Graphic: product mark or abstract visual matching the brand, dark background"
            gradient="from-primary/40 via-primary/10 to-slate-950"
            aspect="aspect-square"
            className="border-slate-800"
          />
        </div>
      </section>

      {/* Feature Showcase Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <h2 className="mb-10 text-center text-3xl font-bold text-foreground sm:mb-14 sm:text-4xl">
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
            <h3 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
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
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
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
