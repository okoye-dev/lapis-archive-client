"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

import Logo from "./Logo";
import { Button } from "./ui/button";

const navLinks = [
  { href: "/dashboard", label: "Upload" },
  { href: "/signin", label: "Sign In" },
];

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goTo = (href: string) => {
    setMobileOpen(false);
    router.push(href);
  };

  return (
    <header className="fixed left-0 top-0 z-20 w-full">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex h-11 w-fit items-center justify-self-start rounded-full border border-orange-500/40 bg-background/95 px-4 backdrop-blur-md">
          <Logo />
        </div>

        <nav className="hidden h-11 items-center gap-1 rounded-full border border-orange-500/40 bg-background/95 px-2 backdrop-blur-md md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex h-full items-center rounded-full px-5 text-base font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden justify-self-end md:block">
          <Button
            size="lg"
            className="rounded-full border border-black/15 text-base"
            onClick={() => goTo("/signup")}
          >
            Sign Up
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center justify-self-end rounded-full border border-border/60 bg-background/95 text-foreground backdrop-blur-md md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mx-4 mt-2 rounded-2xl border border-border/60 bg-background p-4 shadow-lg sm:mx-6 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Button className="mt-2 w-full rounded-full" onClick={() => goTo("/signup")}>
              Sign Up
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
