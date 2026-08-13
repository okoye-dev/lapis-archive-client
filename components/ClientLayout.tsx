"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";
import Footer from "./Footer";
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
        isHomePage || isSigninPage || isSignupPage || isSharePage
          ? "bg-gradient-to-b from-primary/10 to-background"
          : ""
      )}
    >
      <Navbar />
      {/* The navbar offset lives here, not on body: Radix's scroll lock
          rewrites body padding when a dialog opens and would zero it out,
          shifting the page up. */}
      <div className="pt-20">
        {isHomePage ? (
          <>
            {children}
            <Footer />
            <Toaster />
          </>
        ) : (
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
            {children}
            <Toaster />
          </div>
        )}
      </div>
    </body>
  );
}
