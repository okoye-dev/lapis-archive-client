Lapis Archive Client - Progress Log

Formatting rules for this file
- plain text and "-" bullet points only, nothing else
- no headers, no bold or italics, no tables, no nested formatting

2026-08-04
- reviewed the codebase for obfuscated code and npm supply-chain risks before install, nothing found
- added .gitignore
- audited the whole frontend (components, data layer, tooling/config) against senior frontend practices, wrote CLEANUP_PLAN.md with a 7 stage cleanup plan
- found the app actually contained two unrelated leftover feature sets (a ported farm app and a payment dashboard) mixed in with the real product
- confirmed the backend (lapis-archive-file-service) has no auth routes and no email sending capability at all
- purged farm app content from the signup page and from the LinkData/SignupData types, signup now collects first name, last name, email, password to match the backend's real user model
- replaced React.SomeType namespace references with named imports from "react" across the live app files
- added a share dialog on the upload page: pick a file, enter a recipient email, get a generated access code and public link with copy buttons, email send is simulated with a toast since no email provider is wired up yet
- added a public /share/[slug] page: enter the access code, on match see the file and download it through the real, already working backend file endpoint
- added store/shareStore.ts to hold share records in localStorage, same persist pattern as the existing authStore.ts
- known limitation: a generated share link only works in the browser that created it, there is no backend yet to make it work across devices
- clarified the share spec: recipient email is optional, the code and link themselves are the primary thing the sharer copies and sends however they want, email is a nice to have for later once the backend supports it
- made the share dialog match that: email field no longer required, wording updated, copy still simulated only when an email is actually given
- made the app responsive across mobile, tablet, and desktop: home page hero, upload card, file list rows, features section, share dialog, navbar, and the signin/signup/share cards
- noted in CLEANUP_PLAN.md that stages 2 through 7 are paused until the backend is ready, we are prioritizing the MVP feature views for now
- added a Shared Links section on the home page listing every share created so far (file name, date, link, access code, copy buttons, whether it was emailed), reusing the existing but previously unused useFormatDate helper
- built a new marketing landing page at / (chainlink style: cycling word hero, dark platform statement section, tabbed feature showcase, closing CTA), moved the actual upload and share functionality to a new /dashboard route
- this also fixes a pre-existing dead link: signin and signup already redirected to /dashboard, which did not exist until now
- added components/PlaceholderImage.tsx, a reusable colored/gradient box with a text label, used everywhere a real screenshot or graphic should eventually go
- found and fixed a real pre-existing bug in tailwind.config.ts: the base theme.colors block fully replaced Tailwind's default palette with no shade ramps at all, so every existing bg-gray-50/text-gray-400/text-gray-500/text-gray-900/border-gray-300 class in the app (upload dropzone, file list) has never actually rendered a color. Restored gray and added zinc via theme.extend.colors using tailwindcss/colors
- the tabbed feature showcase is hand built (plain buttons and state, proper aria roles) rather than using a Radix tabs component, since @radix-ui/react-tabs is not an installed dependency and installing it wasn't an option
- the landing page copy is a first draft grounded in the software's actual functionality, one paragraph is explicitly marked in the code as the spot to personalize with the real motivation for building this

2026-08-06
- wrote MVP.md, a short plain tracker of what's done, deferred, or needs a decision for the MVP, separate from CLEANUP_PLAN.md
- installed dependencies and ran the real dev server for the first time this session (you set up node/npm/pnpm for this, previously unavailable), approved exactly one vetted install script (unrs-resolver's platform-binary postinstall, an ESLint tooling dependency, confirmed harmless before approving)
- looked at the actual running app and found the dashboard page was visibly rougher than the new landing page: fixed the icon, spacing, and color tokens, and added visible error/loading states for the file list that were previously silently missing
- found and fixed a real hydration bug: the redeem page and the shared links list read the localStorage-backed share store during their first render, which can mismatch between server and client since localStorage doesn't exist on the server. Fixed by gating on a mounted flag
- found and fixed a real bug: copying a link or code had no error handling, a failed clipboard write failed completely silently with no feedback
- could not test real file upload through the sandboxed browser (no file picker automation available) or through Claude in Chrome (extension not connected in this environment); verified the share and redeem flows instead by seeding a test record directly into the same store the app already uses, then interacting with the real UI normally
- changed the core flow per your direction: upload is now completely open, no account needed, the landing page's main CTA is now a big "Upload something" button going straight to /dashboard instead of /signup
- moved the signup requirement to the share action itself: sharing a file now asks for the sharer's email first (no password, no code sent, since real email sending isn't set up), before generating a link and code
- discussed a real gap you raised: a plain unverified email field is trivially fakeable as an anti-abuse measure. Agreed to ship it as-is for now (it's a contact channel and mild friction, not security) and treat real verification via Resend's free tier as a later, separate piece of work if it's ever needed
- captured a new requirement: files should be kept 24 hours if not shared, 3 days if the sharer's email is on file. Not built yet, the backend's file list endpoint doesn't return an upload timestamp at all, so even the display can't be made accurate without backend changes first
