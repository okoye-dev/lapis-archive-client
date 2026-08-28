# Lapis Archive Web Client

The frontend for [Lapis Archive](https://github.com/okoye-dev), a small open-source tool for getting a file from one device to another. Upload a file, get a link and a one-time access code, and send both to whoever needs it.

Built with Next.js. It talks to the [file service](https://github.com/okoye-dev/lapis-archive-file-service) for presigned uploads and shares, and file bytes move **directly between the browser and the storage bucket**, never through a server.

## Status

The anonymous quick-share flow is the working product:

| Feature | State |
| --- | --- |
| Upload (click to select, direct to bucket, progress) | Working |
| Create a share (link plus one-time access code) | Working |
| Recipient unlock page (`/share/<slug>`) and download | Working |
| Marketing landing page | Working (some placeholder art) |
| Email-OTP sign-in | Working (needs Supabase env set) |
| Signed-in account page (shares list and revoke) | Working (needs sign-in) |

## How it works

1. **Upload.** The client asks the backend for a presigned URL and PUTs the file straight to the bucket.
2. **Share.** It calls the backend to create a share, which returns a slug and a single access code (shown once; only a hashed copy is kept).
3. **Receive.** The recipient opens `/share/<slug>`, enters the code, and the backend returns a presigned download URL.

Share history is remembered per browser in `localStorage` for now; durable cross-device history arrives with accounts.

## Quickstart

Requires Node 24+, pnpm, and a running [file service](https://github.com/okoye-dev/lapis-archive-file-service) (see its README for `make dev` and `make run`).

```bash
pnpm install
cp env.example .env.local     # point NEXT_PUBLIC_* at your backend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

Set in `.env.local` (see `env.example`):

| Variable | Purpose |
| --- | --- |
| `BACKEND_URL` | Where the Next proxy forwards (the file service); server-side only |
| `NEXT_PUBLIC_API_URL` | Optional client base path; defaults to `/api/v1` (via the proxy) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for Email-OTP sign-in |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe publishable key |
| `NEXT_PUBLIC_SITE_URL` | Absolute site URL for link previews; set to the real domain in production |

Requests to the backend go through a Next.js route handler (`app/api/[...path]`) that proxies to the service, so the browser only ever calls same-origin `/api/v1/...`.

## Scripts

```bash
pnpm dev      # start the dev server
pnpm build    # production build
pnpm start    # serve the production build
pnpm lint     # eslint
pnpm test     # vitest
pnpm format   # prettier --write .
```

## Tech stack

- Next.js 14 (App Router) and TypeScript
- Tailwind CSS, Radix UI, Lucide icons
- Zustand for local state; forms are plain controlled React (useState)

## Project layout

```
app/               routes: landing, /dashboard, /share/[slug], /account, /signin
  api/[...path]/   proxy to the backend
api/               typed API clients (files, shares)
components/        UI, dashboard, and landing sections
store/             zustand stores (uploads, shares)
hooks/             upload queue, toast, copy, download, and other hooks
utils/             small helpers (formatting)
```

## Roadmap

- Replace placeholder landing visuals with screenshots of the real flow
- Email delivery of access codes

## License

[MIT](LICENSE)
