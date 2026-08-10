# Lapis Archive Client — Idiomatic Cleanup, in Commit Stages

## Status (2026-08-04)

Stage 1 is done. Stages 2-7 below are paused — we're deferring most of this until the backend is ready, and prioritizing the two MVP feature views (upload/share and the public redeem page) in the meantime. This doc still reflects the original audit and intended sequence for when we pick it back up.

## Context

This app is going to the client, and the ask is to bring it up to senior-level idiomatic standards through a sequence of focused, reviewable commits rather than one big rewrite.

**The actual MVP:** users upload a file and get a public share link plus an access code that they can copy and send to anyone themselves; emailing the code is an optional nice-to-have on top of that, not the primary mechanism (the backend won't have email wired up for a while since it isn't free). That's the product this frontend needs to serve — worth keeping in mind since several parts of the current code (see below) don't reflect it.

A three-part audit (component/UI layer, data/state layer, tooling/config) plus targeted verification turned up a codebase that is smaller and more fixable than it first looks, once one fact is accounted for: **most of the apparent mess is in code that isn't actually running.** Confirmed by grep (zero import sites outside their own file):

- 11 of 12 custom components in `components/` are unreachable from any route (a payment-form stub, share/edit/delete detail UI, a mobile side-nav, modals, a duplicate `Button`).
- A fully-built token-based auth system (`store/authStore.ts` + `api/auth-service.ts`, expecting `/auth/signup` / `/auth/signin` / `/auth/refresh`) is never wired up. The live `signin`/`signup` pages instead run code explicitly commented `// Dummy authentication logic` that just writes flags to `localStorage`.
- Checked the sibling backend repo (`lapis-archive-file-service`, Go): it has **no auth routes at all** — only `user.go` (Create/Get/Update), `file.go`, `health.go`. So wiring the real auth stack up is a cross-repo feature project, not a frontend cleanup commit.

**Decision (confirmed with you):** the orphaned components and the unused auth stack stay parked exactly as they are — this plan does not delete, wire up, or otherwise touch their reachability. All stages below scope to the code that's actually live.

**Decision (confirmed with you):** `app/signup/page.tsx` step 2 used to collect crop types and Nigerian languages ("Join thousands of users using AI for better harvests") — leftover from a farm-app template that got ported in. You confirmed this and asked that purging it be the *first* stage, including any naming leakage beyond the page itself. Grep found farm-domain fields in two more places: `types/types.ts`'s `LinkData.cropType`/`.farmSize`/`.location`, and `store/authStore.ts`'s (parked) `SignupData.crop_type`. The backend's real `User` model is just `first_name`, `last_name`, `email`, `password` — that's what real signup collects now. `LinkData` (the type for a generated share link, currently unused anywhere) got its farm fields replaced with what the actual MVP needs: `accessCode` and `recipientEmail`.

### Standards this plan aligns to

- **Next.js App Router structure** — Server Components by default, `"use client"` pushed as deep as possible, route-based organization ([Next.js App Router best practices, javascriptdoctor.blog](https://www.javascriptdoctor.blog/2026/07/nextjs-app-router-best-practices-for.html); [DEV: patterns that actually scale](https://dev.to/whoffagents/nextjs-14-app-router-project-structure-the-patterns-that-actually-scale-7a6)). This codebase already does the one clearly-correct instance of this well (`app/layout.tsx` → `ClientLayout` is the client boundary) — the goal is to make the rest of the live tree consistent with it.
- **Bulletproof React** — unidirectional dependencies, one shared abstraction reused everywhere instead of N ad hoc reimplementations, types centralized rather than scattered ([alan2207/bulletproof-react](https://github.com/alan2207/bulletproof-react), [project-structure.md](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)). Directly motivates Stage 4 (one fetch/error/retry implementation instead of five) and Stage 1/4's type centralization.
- **Senior TypeScript/React patterns** — explicit return types on exported functions, no unchecked `any`, discriminated/validated shapes instead of trusting `Promise<T>` casts ([DEV: TS patterns senior React engineers use in 2026](https://dev.to/jsgurujobs/typescript-patterns-senior-react-engineers-actually-use-in-2026-3i9h)).
- **React Hook Form + Zod** — schemas centralized and colocated with the form, not scattered or (as found here) imported-but-unused ([Contentful: RHF + Zod](https://www.contentful.com/blog/react-hook-form-validation-zod/), [DEV: RHF+Zod 2026 guide](https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1)). Relevant to a *later* stage — see the note on Stage 1 below.

---

## Stage 1 — Purge the farm-app content — ✅ done

**Files:** `app/signup/page.tsx`, `types/types.ts`, `store/authStore.ts` (type-only edit).

Rebuilt `app/signup/page.tsx` collecting exactly what the backend's `User` model supports: first name, last name, email, password. Dropped the crop-type checkboxes, the language `<Select>`, the "Farm Details" step, the 🌾 emoji and "AI for better harvests" copy, and the two-step wizard state entirely — replaced with the 📁 emoji already used elsewhere (`app/page.tsx`, `Navbar.tsx`) and copy that reflects the actual file-sharing product.

Kept the same raw-`useState` form pattern `app/signin/page.tsx` already uses (rather than introducing RHF+Zod here) so this stage stays a pure content/field purge, not an architecture change — migrating both auth pages to RHF+Zod is worth doing but deserves its own dedicated stage/commit (candidate: insert as a new stage before or alongside Stage 5) rather than being smuggled into "purge farm content."

In `types/types.ts`, replaced `LinkData.cropType`/`.farmSize`/`.location` with `accessCode: string` and `recipientEmail: string` — the fields the real MVP (share link + emailed access code) actually needs. `LinkData` is still unused anywhere in the app (that's a separate, later concern — the type itself wasn't deleted, just corrected, per the "don't touch reachability" decision above). In `store/authStore.ts`, removed `crop_type` from `SignupData` — left `phone_number`/`location_id`/`language` alone, they aren't farm-specific and that file is otherwise parked.

## Stage 2 — Stand up CI and test scaffolding

**Files (new):** `.github/workflows/ci.yml`, `vitest.config.ts`, `vitest.setup.ts`. **Files (edited):** `package.json` (add `test`/`test:ci` scripts and devDependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`).

Nothing here exists today — no test runner, no CI, confirmed by repo-wide search. Doing this now, before the larger structural stages (4 and 5), means those stages land under a safety net instead of being unverified refactors. The workflow runs `pnpm install`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, and `pnpm test` on push/PR. A single smoke test (e.g. on `utils/formatFileSize.ts`, which is pure and trivial) is enough to prove the pipeline works — real coverage comes in Stage 6.

## Stage 3 — Fix isolated correctness bugs

**Files:** `components/DisconnectModal.tsx`, `components/NavItem.tsx`, `components/ui/button.tsx`, `tailwind.config.ts`, `app/page.tsx`, `store/authStore.ts`, `api/api-service.ts`, `app/api/[...path]/route.ts`.

Independent, low-risk, high-confidence fixes — grouped into one stage so each is easy to review/revert on its own, and kept separate from the structural stages so a diff never mixes "changed behavior" with "changed shape":

- `DisconnectModal.tsx:15` — `` `${!isOpen && "hidden"} ...` `` stringifies to the literal text `"false"` in the className when open (raw `&&` in a template literal, not routed through `cn()`). Fix: use `cn(!isOpen && "hidden", ...)`.
- `NavItem.tsx:19` — `` `...top-0${active ? "opacity-0" : "opacity-100"}` `` is missing a space, producing invalid tokens like `top-0opacity-0`.
- `components/ui/button.tsx:47` — `"duration-300, transition-all"` has a stray comma, so neither the duration nor the transition class actually applies as intended.
- `tailwind.config.ts:22` — `border: "EBEBEB"` is missing its `#` prefix (invalid hex; currently masked because `theme.extend.colors.border` shadows it — fix both the malformed value and the duplicate key).
- `app/page.tsx` — the "Choose Files" control is `<Button asChild disabled={uploading}><span>...</span></Button>`; `asChild` renders the child `<span>`, so `disabled` never reaches a real disableable element. Fix by removing `asChild` or moving the label inside a real `<button>`.
- `store/authStore.ts:150` — `refreshToken` builds `` `${baseUrl}/v1/auth/refresh` `` while `signUp`/`signIn` in the same file build `` `${baseUrl}/auth/signup` ``/`signin` (no extra `/v1`); since `getApiBaseUrl()` already defaults to `/api/v1`, this resolves to a broken `/api/v1/v1/...` path. (Touching this one file/line is a bug fix, not "wiring up" the parked system — leaving the mismatched endpoint in place would just be a latent landmine for whoever revives this stack later.)
- `api/api-service.ts:86` — on 401-retry, the retried response is returned via `.json()` with no `.ok` check, unlike the initial request path; a failed retry silently returns an error body typed as success.
- `app/api/[...path]/route.ts:62-66` — the multipart/non-multipart branches are identical (`body = await request.arrayBuffer()` either way); collapse to one line. Also remove the dead `'PATCH'` check in the same condition since no `PATCH` handler is exported.
- `app/page.tsx` — the icon-only download `<Button>` (`<DownloadCloud />`, no text) has no accessible name; add `aria-label="Download"`.

## Stage 4 — Consolidate the live data layer

**Files:** `api/api-service.ts`, `api/files.ts`, `api/helpers.ts`, `hooks/useFiles.ts`, `app/api/[...path]/route.ts`, `types/types.ts`, `env.example`. (`store/authStore.ts`, `api/auth-service.ts`, `hooks/useAuth.ts` are the parked auth stack — excluded per your decision.)

Right now this is five independently-invented error conventions and two copies of the same exponential-backoff retry algorithm, per the audit. Consolidate:

- Move `RequestOptions` (`api-service.ts`), `FileData`/`FilesResponse` (`files.ts`), `UseMutationOptions`/`UseQueryOptions` (`helpers.ts`) into `types/types.ts` so it's an actual single source of truth for the live layer.
- Add explicit return types to every exported function in these files (`getApiBaseUrl`, the `apiService.get/post/put/patch/delete` methods, `useMutation`, `useQuery`, `useFiles`, the route handlers as `Promise<NextResponse>`).
- Remove the remaining `any`s: `api/helpers.ts`'s `useMutation<T, V = any>` default and `dependencies: any[]`, `app/api/[...path]/route.ts`'s `body: any`.
- Pick one error shape (e.g. `{ message: string; status?: number }`) and one normalization function; have `api-service.ts`, `files.ts`, and the route proxy all throw/return through it instead of each reinventing `errorData.message`-vs-`.error`-vs-`statusText` handling.
- De-duplicate `mutateWithRetry`/`fetchWithRetry` (`api/helpers.ts`) into one retry implementation both call.
- Rewrite `hooks/useFiles.ts` to use the existing (currently unused) `useQuery`/`useMutation` from `api/helpers.ts` instead of hand-rolled `useState`/`useEffect` fetch logic — this is the one concrete case in the live tree where an abstraction already exists and just isn't being used.
- Fix `uploadMultipleFiles` (`hooks/useFiles.ts`) to report partial success instead of discarding the whole batch when one file in the loop fails.
- `api/files.ts`'s `downloadFile`/`getFileViewUrl` send no `Authorization` header (unlike `getFiles`) — make header attachment consistent across all three.
- Reconcile env var naming: code reads `NEXT_PUBLIC_API_URL` (`api-service.ts`) and `BACKEND_URL` (route proxy), but `env.example` documents neither — update `env.example` to match what's actually read.

## Stage 5 — Clean up the live UI layer

**Files:** `components/Navbar.tsx`, `components/ClientLayout.tsx`, `app/layout.tsx`, `app/signin/layout.tsx`, `app/signup/layout.tsx`, `components/ui/alert-dialog.tsx`, `components/ui/toast.tsx`.

- Delete `Navbar.tsx`'s ~80 lines of commented-out mobile-nav markup/imports/state (lines 2-11, 23-31, 85-136) — this is dead code sitting inside a live file, distinct from the parked components decision.
- Extract the route-flag checks duplicated in `ClientLayout.tsx` (`isSigninPage`/`isSignupPage`) and `Navbar.tsx` (`isAdminPage`/`isSigninPage`/`isSignupPage`) into one small shared hook (e.g. `hooks/useRouteFlags.ts`), and centralize the route strings (`/signin`, `/signup`, `/admin`) as named constants instead of repeating literals across both files plus `app/signin/page.tsx`/`app/signup/page.tsx`.
- Extract the `GeneralSans` `localFont` config duplicated verbatim in `app/layout.tsx`, `app/signin/layout.tsx`, `app/signup/layout.tsx` into one shared module.
- `components/ui/alert-dialog.tsx:30` — `AlertDialogContent: any` deviates from the stock shadcn primitive (every sibling in the file preserves its forwardRef typing); restore proper typing.
- `components/ui/toast.tsx`'s icon-only `ToastClose` has no `sr-only` text, unlike the equivalent close button in `dialog.tsx`; match that pattern.
- (Candidate addition, see Stage 1 note: migrate `app/signin/page.tsx` and `app/signup/page.tsx` to React Hook Form + Zod together, as one focused commit, so both auth pages share one validation approach instead of raw `useState`.)

## Stage 6 — Backfill real test coverage

**Files:** new `__tests__`/`*.test.ts(x)` alongside the files touched in Stages 4–5.

Now that the data layer has one retry/error implementation and `useFiles` runs through `useQuery`/`useMutation`, write tests against those stable interfaces rather than against code about to change. Priority order: the consolidated `api/helpers.ts` retry/error logic (easy to unit test, highest risk if subtly wrong), `utils/formatFileSize.ts`, then a component-level test for the signup form verifying validation errors surface correctly.

## Stage 7 — Ratchet tooling strictness

**Files:** `tsconfig.json`, `.eslintrc.json`, `package.json` (devDependencies: `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-unused-imports`, `eslint-config-prettier`).

Add `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch` to `tsconfig.json`; extend ESLint with `plugin:@typescript-eslint/recommended`, `@typescript-eslint/no-explicit-any`, `unused-imports/no-unused-imports`, and wire `eslint-config-prettier` so formatting and linting stop being two disconnected tools. This is deliberately last: by this point the live codebase already satisfies these rules (Stages 1–5 removed the `any`s, dead imports, and unused variables that would otherwise make this a noisy commit), so it lands as a clean "raise the bar" change that documents the new standard going forward — including for whenever the parked components/auth stack get revived.

---

## Sequencing note

Implementing and committing one stage at a time, checking in after each before starting the next, rather than running all seven unattended — Stage 4 changes real request/error behavior and is worth a look before building on top of it.

## Verification

- After every stage: `pnpm install` (only changes deps in Stages 2/7), `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` must all pass.
- Stage 1: run the dev server, walk through `/signup` manually — confirm the form only asks for first/last name, email, password, and still routes to `/dashboard` on submit.
- After Stage 2: confirm `pnpm test` runs the smoke test locally and the new GitHub Actions workflow goes green on the branch.
- After Stage 3: manually confirm the disconnect-modal visibility class, the nav active-indicator opacity, and the button transition class all render correctly (no `false`/malformed tokens in the DOM `class` attribute via devtools).
- After Stage 4: exercise the file upload/download flow in the browser end-to-end against the running backend; confirm a simulated mid-batch upload failure now reports which files succeeded.
- After Stage 6: `pnpm test` covers the retry/error logic and the signup form.
- After Stage 7: `pnpm exec tsc --noEmit` and `pnpm lint` should pass with zero new errors, proving the earlier stages actually closed the gaps.
