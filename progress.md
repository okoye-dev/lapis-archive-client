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
