Lapis Archive

What it is
A free way to move a file from one device to another. You upload a file with no account, get a link and an access code, and send both to whoever needs it. They open the link, enter the code, and download. Files move straight between the browser and storage, so they never pass through our server.

The core loop
Anyone can upload for free, no sign-up. Creating a share asks for the sharer's email first, which is optional and never blocks the link, then hands back a public link and an access code. The recipient enters the code on a public page and downloads.

What's live
Open uploads over presigned URLs. Server-side shares that work on any device, not just the one that made them. The public unlock-and-download page. History and revoke for signed-in users. Passwordless email sign-in. A background worker that deletes expired shares and logs each deletion. The landing page points people straight at uploading, and the whole app works on mobile, tablet, and desktop.

What's next
Real email delivery of the access code, so we send it for you instead of you copying it yourself. A signed-in account page for your email and your shares; the API is ready, the page is not. Still to decide: rewriting the landing page's motivation copy with the real reason we built this, and swapping the placeholder graphics for real screenshots.

Running it end to end
Email sign-in needs the Supabase URL and publishable key set, or it shows "login isn't configured yet." The backend needs a database and the auth JWKS URL; without a database, the share endpoints return a 503 maintenance message.
