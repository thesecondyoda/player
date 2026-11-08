# KIRIN Reader

A minimal, read-only manga reader shell. The public interface is intentionally limited to a chapter library and reader. No promotional copy, descriptions, comments, social feed, or download controls are included.

## Included
- Chapter library, search, chapter reader
- Scroll and single-page modes
- RTL-ready layout, language toggle (EN / AR / JA)
- Dark/light toggle
- Local reading position
- Minimal single-admin control page for chapter uploads
- Supabase SQL migration and Edge Function for private image storage + short-lived signed URLs

## Important security limitation
A browser must receive image bytes to display them. A normal website cannot guarantee prevention of screenshots, screen recording, browser developer tools, or photographing the screen. This project adds deterrents (no download UI, context-menu/drag/copy suppression, short-lived signed URLs, private storage, no public page-path table access). It is not DRM and cannot provide absolute anti-capture protection.

## Setup
1. Create a Supabase project.
2. In Authentication, create the one administrator account. Disable public sign-ups.
3. Run `supabase/migrations/001_kirin.sql` in the SQL Editor.
4. Copy the administrator's Auth user UUID and insert it:
   `insert into public.kirin_admins(user_id) values ('YOUR-AUTH-USER-UUID');`
5. Set the function secrets:
   `supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...`
6. Deploy:
   `supabase functions deploy chapter-pages`
7. Fill `js/config.js` with the project URL and anon key.
8. Host the folder on HTTPS static hosting.

## Operational notes
- Keep the Storage bucket `chapter-pages` private.
- Never put the service-role key in `js/config.js` or any browser asset.
- Disable Supabase email/password signups after creating the administrator.
- Uploading a chapter creates it as unpublished, uploads the pages, then publishes it.
- The admin uploader is a simple starter. For production, add upload rollback, rate limits, image validation/re-encoding, audit logs, and server-side admin checks to every mutation.
- The browser may cache rendered images despite short signed URL expiry. For stronger confidentiality, use a native app / DRM-capable delivery stack; even then screenshots cannot be fully prevented on every device.
