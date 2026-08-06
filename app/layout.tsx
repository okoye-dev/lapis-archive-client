import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";

// Apple's actual San Francisco font isn't licensed for use outside Apple
// platform apps/marketing, so it can't be pulled from a CDN legitimately.
// -apple-system (set in tailwind.config.ts) gives real SF on macOS/iOS for
// free; Inter is the open-source, SF-like fallback for everyone else.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" className={inter.variable}>
      <ClientLayout>{children}</ClientLayout>
    </html>
  );
}
