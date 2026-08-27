import type { Metadata } from "next";
import type { ReactNode } from "react";

// Share pages expose a slug + filename before any code, so keep them out of
// search indexes and link-unfurl caches.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ShareLayout({ children }: { children: ReactNode }) {
  return children;
}
