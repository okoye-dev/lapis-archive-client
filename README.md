# Lapis Archive — Web Client

The frontend for [Lapis Archive](https://github.com/okoye-dev), a small open-source tool for getting a file from one device to another. Upload a file, get a link and a one-time access code, and send both to whoever needs it.

Built with Next.js. It talks to the [file service](https://github.com/okoye-dev/lapis-archive-file-service) for presigned uploads and shares, and file bytes move **directly between the browser and the storage bucket** — never through a server.

## Status

The anonymous quick-share flow is the working product:

| Feature | State |
| --- | --- |
| Upload (click-to-select, direct-to-bucket, progress) | ✅ working |
| Create a share → link + one-time access code | ✅ working |
| Recipient unlock page (`/share/<slug>`) → download | ✅ working |
| Marketing landing page | ✅ working (some placeholder art) |
| Email-OTP sign-in | ✅ working (needs Supabase env set) |
| Signed-in account page (email + shares) | 🟡 planned; the history/revoke API is wired |

## How it works

1. **Upload** — the client asks the backend for a presigned URL and PUTs the file straight to the bucket.
2. **Share** — it calls the backend to mint a share, which returns a slug and a single access code (shown once; only a hashed copy is kept).
3. **Receive** — the recipient opens `/share/<slug>`, enters the code, and the backend returns a presigned download URL.

Share history is remembered per-browser in `localStorage` for now; durable cross-device history arrives with accounts.

## Quickstart

Requires Node 18+, pnpm, and a running [file service](https://github.com/okoye-dev/lapis-archive-file-service) (see its README for `make dev` / `make run`).

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

Requests to the backend go through a Next.js route handler (`app/api/[...path]`) that proxies to the service, so the browser only ever calls same-origin `/api/v1/...`.

## Scripts

```bash
pnpm dev      # start the dev server
pnpm build    # production build
pnpm start    # serve the production build
pnpm lint     # eslint
```

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS, Radix UI, Lucide icons
- Zustand for local state; forms are plain controlled React (useState)

## Project layout

```
app/               routes: landing, /dashboard, /share/[slug], /signin, /signup
  api/[...path]/   proxy to the backend
api/               typed API clients (files, shares)
components/        UI + landing sections
store/             zustand stores (uploads, shares, auth)
hooks/             useFiles, useToast, ...
```

## Roadmap

- Signed-in account page (email + share history + revoke)
- Replace placeholder landing visuals with screenshots of the real flow
- Revoke action for created shares

## License

[MIT](LICENSE)
