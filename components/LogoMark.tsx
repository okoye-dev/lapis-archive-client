interface LogoMarkProps {
  className?: string;
}

// A rounded squircle with a smaller rotated rounded-square "facet" inside —
// echoes lapis lazuli's cut-gem look while keeping every shape built from
// the same rounded-corner language as the rest of the app. The gradient
// runs brand blue into primary purple into the same orange used in the
// hero's blobs, so the mark echoes that accent instead of just the navbar.
const LogoMark = ({ className }: LogoMarkProps) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="logoMarkGradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--brand))" />
          <stop offset="0.55" stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(24 90% 58%)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="9" fill="url(#logoMarkGradient)" />
      <rect
        x="11.5"
        y="11.5"
        width="9"
        height="9"
        rx="2.5"
        fill="#FBFAFF"
        fillOpacity="0.4"
        transform="rotate(45 16 16)"
      />
    </svg>
  );
};

export default LogoMark;
