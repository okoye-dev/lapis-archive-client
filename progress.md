# Lapis Archive — Client

Where the frontend stands and what still needs doing.

## Done

- **Uploads** — pick a file and it goes straight to storage over a presigned URL. No account required.
- **Sharing** — create a share and get a public link plus an access code. Shares live on the backend now, so a link works on any device, not only the browser that made it.
- **Receiving** — the `/share/[slug]` page takes the code and downloads the file through a presigned URL.
- **Accounts** — passwordless email sign-in (Supabase OTP). History and revoke are wired to the backend for signed-in users.
- **Housekeeping** — expired shares are purged by a backend worker. The dashboard tracks its own uploads locally, since the backend no longer lists the bucket.
- **UI** — a landing page whose main call to action goes straight to uploading, and a dashboard that's responsive across phone, tablet, and desktop.

## What we need done

- **Account page** — show the signed-in user's email and their shares, with a revoke button. The API exists; the page doesn't.
- **Email delivery** — actually send the access code to the recipient (Resend's free tier is the likely path). Today the sharer copies and sends it themselves.
- ~~**Retention display**~~ — done. Files are deleted 3 days after upload (7 if signed in at upload time); a retention worker enforces it server-side and the dashboard shows a per-file countdown plus a cost-framed notice.
- **Landing polish** — rewrite the motivation paragraph with the real reason we built this, and replace the placeholder graphics with real screenshots.

## Notes

- The email asked for on share is a contact channel and light friction, not a security control. Real verification is later work if we ever need it.
- Sign-in needs the Supabase env vars set, and the backend needs a database and a JWKS URL — otherwise the share endpoints return a 503 maintenance message.
