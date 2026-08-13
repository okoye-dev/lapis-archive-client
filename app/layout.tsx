import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Inter, Fraunces } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import { resolveSiteUrl } from "@/lib/site";

// Apple's actual San Francisco font isn't licensed for use outside Apple
// platform apps/marketing, so it can't be pulled from a CDN legitimately.
// -apple-system (set in tailwind.config.ts) gives real SF on macOS/iOS for
// free; Inter is the open-source, SF-like fallback for everyone else.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// A distinct display face for the wordmark only — an elegant serif reads as
// "fancy" in a way another bold grotesque wouldn't, so this deliberately
// breaks from the rest of the UI's sans-serif, rounded-geometric language.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600"],
  style: ["italic"],
  variable: "--font-logo",
});

const siteDescription =
  "Upload a file, get a link and an access code, send both to whoever needs them. Open source and friendly.";

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: "Lapis Archive - Simple, Private File Sharing",
  description: siteDescription,
  // No `images` here on purpose: app/opengraph-image.tsx is a Next file
  // convention, so Next generates the og:image and twitter:image tags (with
  // the correct absolute, hashed URL) on its own. Listing a path by hand
  // here would override that with one Next never actually serves.
  openGraph: {
    title: "Lapis Archive - Simple, Private File Sharing",
    description: siteDescription,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lapis Archive - Simple, Private File Sharing",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <ClientLayout>{children}</ClientLayout>
    </html>
  );
}
