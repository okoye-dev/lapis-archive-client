import type { Metadata } from "next";
import type { ReactNode } from "react";

// Private account view; keep it out of search indexes.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children;
}
