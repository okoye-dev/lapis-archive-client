Lapis Archive - MVP Tracker

Formatting rules for this file
- plain text and "-" bullet points only, nothing else
- no headers, no bold or italics, no tables, no nested formatting
- mark each item done or not done, keep it short, update in place as things change

Core MVP loop: anyone can upload a file for free, no account needed. Sharing it (getting the public link and access code) asks for the sharer's email first. The recipient enters the code on a public page and downloads the file.

Done
- upload a file, open to anyone, no signup required
- generate a public share link and access code for a file
- recipient enters the code on a public page and downloads the file through the real backend endpoint
- optional email notice when creating a share (simulated only, no real email provider yet)
- list of shares already created, with copy buttons
- marketing landing page at / with a big "Upload something" CTA that goes straight to /dashboard, not signup
- dashboard page at /dashboard for the actual file and share functionality, publicly reachable
- lightweight email gate on the share action itself: no password, no code sent, just captures an email before a link can be generated
- responsive on mobile, tablet, desktop
- fixed a dead link: signin/signup redirected to /dashboard before that route existed
- fixed a real hydration bug: pages that read the localStorage-backed share store on first render (the redeem page, the shared links list) could mismatch between server and client, now gated on mount
- fixed a real bug: copying a link or code had no error handling at all, a failed clipboard write (real browsers can deny this) failed completely silently

Not done, deferred on purpose
- real backend support for share codes (currently generated and stored client side only, only works in the browser that created them)
- real email sending (backend won't have this for a while, not free) - Resend's free tier (3000/month, no card) is a cheap path if we revisit this, needs a backend integration and the user's own Resend account
- real user accounts and auth (backend has no auth routes yet, signin/signup are placeholders)
- revoke or delete a previously created share

Not done, needs backend work first
- retention policy: files should be kept 24 hours if the uploader hasn't shared/emailed, 3 days if they have. Cannot build even the display for this yet because the backend's file list endpoint does not return an upload timestamp at all, and actual deletion has to happen server side regardless, a frontend countdown cannot enforce it

Not done, needs a decision
- the navbar checks for an /admin page that does not exist and never routes anywhere real, decide whether to remove that or build it
- personalize the landing page's platform statement paragraph with the real motivation for building this
- replace the PlaceholderImage placeholders on the landing page with real screenshots or graphics once available
- the email gate only asks for an email with zero verification, so it's trivially fakeable - acceptable for now per your call, revisit if abuse becomes a real problem

Verified in a real browser (2026-08-06)
- installed dependencies and ran the actual dev server for the first time this session
- landing page hero, dark section, tabbed showcase all render correctly
- dashboard upload error state shows correctly when the backend is unreachable (was previously silent, now fixed)
- share dialog and shared links list work correctly end to end using seeded test data (real upload couldn't be tested, no backend running)
- redeem page's wrong-code / correct-code / unlock states work correctly against seeded test data
- could not test real file upload or the backend-dependent parts of the flow, no backend server was started this session
