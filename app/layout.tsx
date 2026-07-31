import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import ClientLayout from "@/components/ClientLayout";

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

const generalSans = localFont({
  src: [
    {
      path: "./fonts/GeneralSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/GeneralSans-Medium.woff2",
      weight: "500",
      style: "medium",
    },
    {
      path: "./fonts/GeneralSans-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/GeneralSans-Bold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-general-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${generalSans.variable}`}>
      <ClientLayout>{children}</ClientLayout>
    </html>
  );
}
