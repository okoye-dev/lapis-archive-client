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
    <header className="fixed left-0 top-0 z-20 w-full animate-nav-drop">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex h-11 w-fit items-center justify-self-start rounded-full border border-orange-500/25 bg-background/95 px-4 backdrop-blur-md transition-colors duration-500 hover:bg-primary/[0.08]">
          <Logo />
        </div>

        <nav className="hidden h-11 items-center gap-0.5 rounded-full border border-orange-500/25 bg-background/95 px-1 backdrop-blur-md md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  // h-9 inside the h-11 pill leaves a 1px breathing gap so
                  // the hover background never touches the bubble's edges.
                  "group relative flex h-9 items-center rounded-full px-5 text-base font-medium transition-colors duration-500",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-[hsl(252,55%,45%)]",
                )}
              >
                {/* Separate layer so the background can scale up without
                    dragging the label's size along with it. */}
                {!isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-0 scale-90 rounded-full bg-primary/20 opacity-0 transition-[transform,opacity] duration-500 ease-spring group-hover:scale-100 group-hover:opacity-100"
                  />
                )}
                <span className="relative">{link.label}</span>
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

        {/* col-start-3 is load-bearing: the desktop nav and Sign Up button
            are display:none on mobile, so without it this button would be
            auto-placed into the middle column instead of the right one. */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="col-start-3 flex h-11 w-11 items-center justify-center justify-self-end rounded-full border border-orange-500/25 bg-background/95 text-foreground backdrop-blur-md transition-colors duration-500 hover:bg-primary/[0.08] md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* mr-auto + max-w keeps the panel hugging the left edge on small
          screens instead of stretching the full width. */}
      {mobileOpen && (
        <div className="ml-4 mr-auto mt-2 max-w-xs animate-menu-open rounded-2xl border border-orange-500/25 bg-background p-4 shadow-lg sm:ml-6 md:hidden">
          <nav className="flex flex-col gap-1">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center rounded-full bg-primary/[0.07] px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-500 ease-spring hover:bg-primary/20 hover:text-[hsl(252,55%,45%)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
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
