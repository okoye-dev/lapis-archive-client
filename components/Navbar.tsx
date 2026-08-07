"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

import Logo from "./Logo";
import { Button } from "./ui/button";

// Each menu item lands 100ms after the one above it. Transitions rather
// than keyframes because the panel is always mounted: a CSS animation would
// only replay if the element remounted, and there is nothing to key off.
const ITEM_STAGGER_MS = 100;

const itemMotion = (open: boolean) =>
  cn(
    "transition-[opacity,transform,background-color,color] duration-300 ease-out",
    open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
  );

// Stagger only on the way in. Closing runs them out together, so the panel
// doesn't linger while the last item finishes leaving.
const itemDelay = (open: boolean, index: number) => ({
  transitionDelay: open ? `${index * ITEM_STAGGER_MS}ms` : "0ms",
});

const navLinks = [
  { href: "/dashboard", label: "Upload" },
  { href: "/signin", label: "Sign In" },
];

// Long enough that clipping a corner of the menu on the way to it doesn't
// dismiss it, short enough that a deliberate exit still feels responsive.
const CLOSE_DELAY_MS = 400;

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMenu = () => {
    cancelClose();
    setMobileOpen(true);
  };

  const closeNow = () => {
    cancelClose();
    setMobileOpen(false);
  };

  // Hovering out starts a countdown rather than closing outright, so small
  // cursor wobbles near the edge don't snap the menu shut.
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setMobileOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(() => cancelClose, []);

  const goTo = (href: string) => {
    closeNow();
    router.push(href);
  };

  return (
    <header className="fixed left-0 top-0 z-20 w-full animate-nav-drop">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div className="group relative flex h-11 w-fit items-center justify-self-start overflow-hidden rounded-full border border-orange-500/25 bg-background px-4">
          {/* Orange circle sprung from the bottom-left corner. Anchored at
              that corner with a matching transform-origin, so scaling alone
              carries it across the pill; overflow-hidden on the parent clips
              it to the pill's shape. Radial gradient rather than a solid
              disc for the same reason as HeroBlobs — Safari clips blur() and
              hard-edged shapes to a rectangle inside overflow-hidden. */}
          <span
            aria-hidden
            // The circle grows from its own centre, so that centre decides
            // which part of the pill it reaches first. The pill measures
            // ~243x44 with a horizontal midpoint around 118px; the centre
            // sits at x=104, just left of it, so the glow rises from below
            // with a gentle lean toward the left end. Dropping it to
            // 88px below the bottom edge (from 64px) lengthens the vertical
            // run, which is what makes the motion read as coming from below.
            className="pointer-events-none absolute -bottom-[19.5rem] -left-[7.5rem] h-[28rem] w-[28rem] scale-0 rounded-full opacity-0 group-hover:scale-100 group-hover:opacity-100"
            style={{
              // Tighter stops than before: the colour holds most of its
              // strength out to ~62% of the radius and only then falls
              // away, so the glow reads as a defined shape rather than a
              // diffuse haze. Alphas are up across the board too.
              background:
                "radial-gradient(circle, hsl(24 90% 58% / 0.42) 0%, hsl(24 90% 58% / 0.4) 38%, hsl(24 90% 58% / 0.32) 62%, hsl(24 90% 58% / 0.16) 80%, hsl(24 90% 58% / 0.04) 91%, transparent 100%)",
              // Opacity lands almost immediately while the scale takes its
              // time. Fading both over the same 700ms meant the circle was
              // still invisible while it was small, so the only thing you
              // ever saw was a large shape fading in left-to-right.
              transition:
                "transform 1300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms linear",
            }}
          />
          <span className="relative">
            <Logo />
          </span>
        </div>

        <nav className="hidden h-11 items-center gap-0.5 rounded-full border border-orange-500/25 bg-background px-1 md:flex">
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
            are display:none on mobile, so without it this would be
            auto-placed into the middle column instead of the right one.
            Button and panel share one hover region so moving between them
            never counts as leaving. */}
        <div
          className="relative col-start-3 justify-self-end md:hidden"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <button
            type="button"
            onClick={() => (mobileOpen ? closeNow() : openMenu())}
            // hover:bg-secondary, not a translucent primary: an alpha colour
            // replaces the opaque background outright, which made the button
            // see-through against whatever section was behind it.
            className="flex h-11 w-11 items-center justify-center rounded-full border border-orange-500/25 bg-background text-foreground transition-colors duration-500 hover:bg-secondary"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Always mounted so opening and closing both animate — a
              conditional mount can only ever animate the entrance, since the
              element is gone before an exit could play. pt-2 is a hover
              bridge: it puts the gap under the button inside this element's
              box, so crossing it doesn't trigger the parent's mouseleave. */}
          <div
            aria-hidden={!mobileOpen}
            className={cn(
              // origin-top-right so it grows out of the button it belongs to.
              "absolute right-0 top-full w-64 origin-top-right pt-2",
              mobileOpen
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0",
            )}
            // The y1 of 1.12 carries the scale ~2% past its target before it
            // settles — just enough to register as a bounce without wobbling.
            style={{
              transition:
                "opacity 200ms ease-out, transform 320ms cubic-bezier(0.34, 1.12, 0.64, 1)",
            }}
          >
            {/* Starts square-ish and rounds off as it arrives. Lands at
                300ms against the 200ms fade, so it finishes a beat after the
                panel settles and reads as a faint flourish. Much longer than
                that and the whole rounding plays out while the panel is
                already opaque, which looks like it began after the fade. */}
            <div
              className={cn(
                "border border-orange-500/25 bg-background p-4 shadow-lg",
                // Explicit values: this config remaps rounded-lg/md/sm onto
                // --radius (20px), so the named steps are all too close
                // together to read as a change.
                mobileOpen ? "rounded-[1.5rem]" : "rounded-[0.5rem]",
              )}
              // Inline, not duration-[...]: tailwindcss-animate makes
              // duration-* set animation-duration as well, so the class is
              // ambiguous. Inline always resolves to the transition.
              style={{ transition: "border-radius 520ms ease-out" }}
            >
              <nav className="flex flex-col gap-1">
                <div className="grid grid-cols-2 gap-2">
                  {navLinks.map((link, index) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeNow}
                      tabIndex={mobileOpen ? undefined : -1}
                      className={cn(
                        "flex items-center justify-center rounded-full bg-primary/[0.07] px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-primary/20 hover:text-[hsl(252,55%,45%)]",
                        itemMotion(mobileOpen),
                      )}
                      style={itemDelay(mobileOpen, index)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <Button
                  className={cn(
                    "mt-2 w-full rounded-full",
                    itemMotion(mobileOpen),
                  )}
                  tabIndex={mobileOpen ? undefined : -1}
                  style={itemDelay(mobileOpen, navLinks.length)}
                  onClick={() => goTo("/signup")}
                >
                  Sign Up
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
