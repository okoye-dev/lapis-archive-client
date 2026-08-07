import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// The app's shared "soft surface" look: rounded corners, a faint tint of a
// color as the background, and a more visible tint of that same color as
// the border. Used for buttons, the upload dropzone, and file/link list
// rows so they read as one consistent design language. Add a key here
// (rather than writing the bg/border pair inline at each call site) to
// keep every surface in the app in sync when the palette changes.
export const softSurface = {
  primary: "rounded-xl border border-primary/25 bg-primary/10",
  slate: "rounded-xl border border-slate-400/30 bg-slate-400/10",
  destructive: "rounded-xl border border-destructive/25 bg-destructive/10",
} as const;
