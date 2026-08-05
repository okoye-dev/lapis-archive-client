import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Dashboard - Lapis Archive",
  description: "Upload, manage, and share your files",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
