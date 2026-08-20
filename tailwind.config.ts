import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    colors: {
      // This replaces Tailwind's default palette, so restore these two.
      transparent: "transparent",
      current: "currentColor",
      // Not pure #FFF: a hint of brand purple in every white surface.
      white: "#FBFAFF",
      border: "EBEBEB",
      blue: "#3B72FF",
      gray: "#F7F7F7",
      textGray: "#8C8C8C",
      orange: "#FFA9441A",
      green: "#23AC00",
      red: "#F71C1C",
    },
    extend: {
      // Viewport minus the navbar offset, so pages don't overflow by pt-20.
      minHeight: {
        content: "calc(100vh - 5rem)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "var(--font-inter)",
          "system-ui",
          "sans-serif",
        ],
        logo: ["var(--font-logo)", "-apple-system", "sans-serif"],
      },
      colors: {
        gray: colors.gray,
        zinc: colors.zinc,
        slate: colors.slate,
        orange: colors.orange,
        black: "#212121",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: "hsl(var(--brand))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Soft spring: eases out past the target by ~8% and settles back.
      // The y1 value (1.35) controls how far it overshoots; keep it small
      // so movement reads as a gentle bounce, not a wobble.
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.35, 0.64, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Navbar on first paint: a quiet fade and grow, no theatrics.
        "nav-drop": {
          "0%": { opacity: "0", transform: "translateY(-8px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        // The mobile menu panel glides down and settles with a soft
        // bounce: full travel first, then barely past the resting point
        // (~10% of the distance), then home.
        "menu-open": {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "70%": { opacity: "1", transform: "translateY(1.5px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Carousel slide content: drift up into place while fading in.
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Smaller sibling of rise-in for labels that swap in place.
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "word-in": {
          "0%": { opacity: "0", transform: "translateY(-38px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "word-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "85%": { opacity: "0" },
          "100%": { opacity: "0", transform: "translateY(48px)" },
        },
        // Counterpart to rise-in: the outgoing slide drifts up and fades
        // instead of vanishing the instant the next one is requested.
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-16px)" },
        },
        // Progress-bar breathing while a part uploads (no spinner needed).
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        // Modal open/close. The -50%,-50% centering translate is repeated in
        // every frame, so only scale and opacity move; the panel can never
        // slide in from a corner.
        "dialog-in": {
          "0%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.95)" },
          "100%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        "dialog-out": {
          "0%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
          "100%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.95)" },
        },
        "overlay-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "overlay-out": { "0%": { opacity: "1" }, "100%": { opacity: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "nav-drop": "nav-drop 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "menu-open": "menu-open 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
        "rise-in": "rise-in 1.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pop-in": "pop-in 1.2s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-out": "fade-out 0.7s cubic-bezier(0.4, 0, 1, 1) both",
        "word-in": "word-in 0.9s cubic-bezier(0.33, 0, 0.2, 1) both",
        "word-out": "word-out 0.6s cubic-bezier(0.33, 0, 0.2, 1) both",
        "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
        "dialog-in": "dialog-in 220ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "dialog-out": "dialog-out 180ms cubic-bezier(0.4, 0, 1, 1) both",
        "overlay-in": "overlay-in 220ms ease-out both",
        "overlay-out": "overlay-out 180ms ease-in both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
