"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";
import { Toaster } from "./ui/toaster";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isSigninPage = pathname === "/signin";
  const isSignupPage = pathname === "/signup";
  const isSharePage = pathname.startsWith("/share");
  const isHomePage = pathname === "/";

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <body
      className={cn(
        "relative overflow-x-hidden leading-[1.25rem] text-black",
        isSigninPage || isSignupPage || isSharePage ? "pt-0" : "pt-20",
        isHomePage || isSigninPage || isSignupPage || isSharePage
          ? "bg-gradient-to-b from-primary/10 to-background"
          : ""
      )}
    >
      <Navbar />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        {children}
        <Toaster />
      </div>
    </body>
  );
}
