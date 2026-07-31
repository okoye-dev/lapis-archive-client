"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";
import { Toaster } from "./ui/toaster";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isSigninPage = pathname === "/signin";
  const isSignupPage = pathname === "/signup";
  const isHomePage = pathname === "/";

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <body
      className={cn(
        "relative overflow-x-hidden font-generalSans leading-[1.25rem] tracking-tight text-black",
        isSigninPage || isSignupPage ? "pt-0" : "pt-20",
        isHomePage || isSigninPage || isSignupPage
          ? "bg-gradient-to-b from-primary/10 to-background"
          : ""
      )}
    >
      <Navbar />
      <div className="mx-auto max-w-[1440px] px-6">
        {children}
        <Toaster />
      </div>
    </body>
  );
}
