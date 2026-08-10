# Lapis Archive — Web Client

The frontend for [Lapis Archive](https://github.com/okoye-dev), a small open-source tool for getting a file from one device to another. Upload a file, get a link and a one-time access code, and send both to whoever needs it.

Built with Next.js. It talks to the [file service](https://github.com/okoye-dev/lapis-archive-file-service) for presigned uploads and shares, and file bytes move **directly between the browser and the storage bucket** — never through a server.

## Status

The anonymous quick-share flow is the working product:

| Feature | State |
| --- | --- |
| Upload (drag-and-drop, direct-to-bucket, progress) | ✅ working |
| Create a share → link + one-time access code | ✅ working |
| Recipient unlock page (`/share/<slug>`) → download | ✅ working |
| Marketing landing page | ✅ working (some placeholder art) |
| Accounts / login / cross-device history | 🟡 planned (Email OTP); the current Sign In/Sign Up screens are non-functional scaffolding |

## How it works

1. **Upload** — the client asks the backend for a presigned URL and PUTs the file straight to the bucket.
2. **Share** — it calls the backend to mint a share, which returns a slug and a one-time access code (shown once; only a hashed copy is kept).
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
| `NEXT_PUBLIC_DEV_SERVER_URL` | Backend base URL in development |
| `NEXT_PUBLIC_APP_SERVER_URL` | Backend base URL in production |
| `NEXT_PUBLIC_SUPABASE_URL` | Auth provider URL (for the planned Email-OTP login) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe publishable key (planned login) |

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
- Zustand for local state, React Hook Form + Zod for forms

## Project layout

```
app/               routes: landing, /dashboard, /share/[slug], /signin, /signup
  api/[...path]/   proxy to the backend
api/               typed API clients (files, shares)
components/        UI + landing sections
store/             zustand stores (shares, auth)
hooks/             useFiles, useToast, ...
```

## Roadmap

- Email-OTP login and real cross-device share history
- Replace placeholder landing visuals with screenshots of the real flow
- Per-file upload error reporting and a pre-upload size check
- Revoke action for created shares

## License

[MIT](https://github.com/okoye-dev)
