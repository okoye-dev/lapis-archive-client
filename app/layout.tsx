import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";

// Apple's actual San Francisco font isn't licensed for use outside Apple
// platform apps/marketing, so it can't be pulled from a CDN legitimately.
// -apple-system (set in tailwind.config.ts) gives real SF on macOS/iOS for
// free; Inter is the open-source, SF-like fallback for everyone else.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// A distinct display face for the wordmark only — gives the logo its own
// character instead of just being body text set bigger.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-logo",
});

export const metadata: Metadata = {
  title: "Lapis Archive - File Sharing Platform",
  description: "Open Source File Sharing & Collaboration Platform",
  openGraph: {
    title: "Lapis Archive - File Sharing Platform",
    description: "Open Source File Sharing & Collaboration Platform",
    images: ["/opengraph-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lapis Archive - File Sharing Platform",
    description: "Open Source File Sharing & Collaboration Platform",
    images: ["/opengraph-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <ClientLayout>{children}</ClientLayout>
    </html>
  );
}
