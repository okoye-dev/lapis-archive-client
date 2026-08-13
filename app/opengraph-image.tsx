import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Lapis Archive, simple and private file sharing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Values are inlined rather than read from globals.css: this renders in
// Satori, which has no stylesheet and no CSS custom properties. They mirror
// --background, --brand, --primary and the hero blobs' orange.
const BACKGROUND = "#F5F4FB";
const BRAND = "#2064B6";
const PRIMARY = "#7C63DE";
const ORANGE = "#F48134";
const MUTED = "#6B677E";

// Google serves woff2 to modern user agents, and Satori can't parse woff2.
// An old UA string gets the ttf variant back instead.
async function loadGoogleFont(query: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${query}&display=swap`,
      { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8)" } },
    ).then((res) => res.text());

    const url = css.match(/src: url\((.+?)\) format\('(truetype|opentype)'\)/)?.[1];
    if (!url) return null;

    return await fetch(url).then((res) => res.arrayBuffer());
  } catch {
    // The image still renders with ImageResponse's default font — a missing
    // face shouldn't fail the whole OG image.
    return null;
  }
}

export default async function OpengraphImage() {
  // Both faces are loaded: with only one font registered Satori falls back to
  // it for every string, which would set the sans tagline in the wordmark's
  // serif italic too.
  const [fraunces, inter] = await Promise.all([
    loadGoogleFont("Fraunces:ital,wght@1,600"),
    loadGoogleFont("Inter:wght@400"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BACKGROUND,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="132" height="132" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient
                id="mark"
                x1="2"
                y1="2"
                x2="30"
                y2="30"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor={BRAND} />
                <stop offset="0.55" stopColor={PRIMARY} />
                <stop offset="1" stopColor={ORANGE} />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="28" height="28" rx="9" fill="url(#mark)" />
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

          <div
            style={{
              fontFamily: fraunces ? "Fraunces" : undefined,
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: 104,
              letterSpacing: "-0.03em",
              color: BRAND,
            }}
          >
            LapisArchive
          </div>
        </div>

        <div
          style={{
            marginTop: 36,
            fontFamily: inter ? "Inter" : undefined,
            fontSize: 34,
            color: MUTED,
          }}
        >
          Upload a file, get a link and a code. Send both.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(fraunces
          ? [{ name: "Fraunces", data: fraunces, style: "italic" as const, weight: 600 as const }]
          : []),
        ...(inter
          ? [{ name: "Inter", data: inter, style: "normal" as const, weight: 400 as const }]
          : []),
      ],
    },
  );
}
