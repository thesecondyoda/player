# KIRIN CMS v2

A static visitor website plus a private single/multi-admin CMS powered by Supabase.

## Visitor website
- `index.html`: published works library, search, genre filters, sorting.
- `work.html`: work information and published chapter list.
- `reader.html`: vertical-scroll and single-page reader, previous/next chapter, fullscreen, local reading position.

## Admin control center
Open `/admin.html` after deployment.
- Overview and publishing counts
- Create/edit/delete works, metadata, genres, cover images and draft/published state
- Create/edit/delete chapters, multi-image page upload, page ordering, publish/unpublish
- Customize site name, subtitle, accent/background/text colors, logo text, footer
- Configure default language, reader mode and progress setting

## Deployment and database
1. Back up your existing Supabase project.
2. Use your existing KIRIN Supabase project (or create a new one).
3. In SQL Editor run `supabase/migrations/002_kirin_cms.sql`. It upgrades the original starter schema, preserves old chapters, and places them in a published `Legacy Library` work.
4. Create the administrator user in Supabase Authentication. Disable public signups.
5. Copy that user's UUID and run:
   `insert into public.kirin_admins(user_id) values ('YOUR-AUTH-USER-UUID');`
6. In `js/config.js`, set only the Supabase Project URL and anon/public key.
7. Set Edge Function secrets:
   `supabase secrets set SUPABASE_URL=https://YOUR_PROJECT.supabase.co SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY`
8. Deploy the Edge Function:
   `supabase functions deploy chapter-pages`
9. Upload the full contents of this folder to Cloudflare Pages (not the parent folder). Keep the folder structure.
10. Visit `/admin.html`, sign in, create a work, add a chapter and upload pages.

## Migration note
The migration is designed for the original KIRIN starter schema: it adds the CMS fields to the existing `chapters` table and preserves its existing chapter/page rows. Existing chapters are attached to a new published work named `Legacy Library`. If you manually changed the original schema, review the SQL against your changes and back up first.

## Security notes
- Never expose the Supabase service-role key in `js/config.js`, HTML, or browser code.
- The chapter image bucket is private. The Edge Function issues signed image URLs for published chapters only.
- Covers are public images so the visitor catalog can display them. Do not upload private or sensitive images as covers.
- A browser must receive image bytes to display them. Websites cannot guarantee blocking screenshots, screen recordings, developer tools, or photographing the display. This project removes obvious download UI and blocks context-menu/drag on reader images as deterrents, not as DRM.
- For a production service, add image re-encoding/validation, upload rollback, audit logs, rate limiting, and robust pagination. Test with a staging Supabase project before replacing a live deployment.
