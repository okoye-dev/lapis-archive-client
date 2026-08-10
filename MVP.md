Lapis Archive - MVP Tracker

Formatting rules for this file
- plain text and "-" bullet points only, nothing else
- no headers, no bold or italics, no tables, no nested formatting
- mark each item done or not done, keep it short, update in place as things change

Core MVP loop: anyone can upload a file for free, no account needed. Sharing it (getting the public link and access code) asks for the sharer's email first. The recipient enters the code on a public page and downloads the file.

Done
- upload a file, open to anyone, no signup required, via presigned PUT straight to the bucket (bytes never touch the server)
- generate a share link and one-time access code for a file, stored server side (works across devices, not just the creating browser)
- recipient enters the code on a public page and downloads the file via a presigned URL
- share history and revoke for signed-in users (backend GET /shares and DELETE /shares/:slug, owner-scoped)
- Email OTP sign-in (Supabase, plain fetch, paste-friendly code entry), no passwords
- expired shares are purged server side by a background worker, each deletion recorded in an audit trail
- marketing landing page at / with a big "Upload something" CTA that goes straight to /dashboard, not signup
- dashboard page at /dashboard; uploads are tracked per-browser in localStorage (the backend no longer lists the bucket)
- optional sharer email captured on share (owner_email), never blocks link creation, not called signup
- responsive on mobile, tablet, desktop
- honesty pass: removed the fake demo/admin sign-in and the /admin dead link, corrected "emailed to" wording (nothing is emailed), split 404 vs transient errors on the redeem page

Not done, deferred on purpose
- real email sending (Resend's free tier is a cheap path if we revisit; needs a backend integration and a Resend account)
- account page showing the signed-in user's email + their shares (history/revoke API exists; the page itself is next)

Not done, needs a decision
- personalize the landing page's platform statement paragraph with the real motivation for building this
- replace the PlaceholderImage placeholders on the landing page with real screenshots or graphics once available

Requires configuration to run end to end
- Email OTP needs NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY set; until then sign-in surfaces "Login isn't configured yet"
- the backend needs DATABASE_URL (shares) and AUTH_JWKS_URL (verify OTP tokens); without a DB the share endpoints return a 503 maintenance message
