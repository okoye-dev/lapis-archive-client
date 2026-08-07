"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

import Logo from "./Logo";
import { Button } from "./ui/button";

const navLinks = [
  { href: "/dashboard", label: "Upload" },
  { href: "/signin", label: "Sign In" },
];

const Navbar = () => {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goTo = (href: string) => {
    setMobileOpen(false);
    router.push(href);
  };

  return (
    <header className="fixed left-0 top-0 z-20 w-full">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <Logo />

        <nav className="hidden items-center gap-1 rounded-full bg-background/95 p-1.5 shadow-sm backdrop-blur-md md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button className="rounded-full shadow-sm" onClick={() => goTo("/signup")}>
            Sign Up
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-full bg-background/95 p-2.5 text-foreground shadow-sm backdrop-blur-md md:hidden"
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
