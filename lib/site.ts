const FALLBACK_SITE_URL = "http://localhost:3000";

// A malformed value would otherwise throw during `next build`.
export function resolveSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    try {
      return new URL(configured);
    } catch {
      console.warn(
        `NEXT_PUBLIC_SITE_URL is not a valid URL (${configured}); falling back to ${FALLBACK_SITE_URL}. Link previews will point at the fallback.`,
      );
    }
  }
  return new URL(FALLBACK_SITE_URL);
}
