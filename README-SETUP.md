# Constituent Engagement Portal — Supabase + Vercel

This package preserves the existing public site's visual design and adds persistence for its two forms, plus a separate private admin dashboard.

## Package contents

- `index.html` — updated public website HTML; existing design/classes are retained. Replace the website's current root `index.html` with this file.
- `api/volunteers.js` and `api/feedback.js` — public submission endpoints.
- `api/admin/*` — authenticated dashboard endpoints.
- `api/config.js` — exposes only the Supabase project URL and anon/public key to the admin login page.
- `admin.html` — private dashboard at `/admin.html`.
- `supabase-schema.sql` — database tables, indexes, update triggers and restrictive RLS setup.
- `.env.example` — required Vercel environment variables.

## 1. Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor**, paste `supabase-schema.sql`, and run it.
3. In **Project Settings → API**, copy the Project URL, anon/public key, and service_role/secret key.
4. In **Authentication → Providers / Sign In**, keep Email enabled. Disable public sign-ups after creating the administrator account. Use a strong password and enable MFA if available.

## 2. Create the administrator account

1. In Supabase **Authentication → Users**, create/invite the admin account with the office email address.
2. Copy that user's UUID.
3. In SQL Editor, run this statement with the actual UUID:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where id = 'PASTE-ADMIN-USER-UUID-HERE';
```

The API checks the verified user's `app_metadata.role` and denies access unless it is exactly `admin`. Do not put this role in user-editable `user_metadata`.

## 3. Add files to the existing GitHub/Vercel project

Copy the following into the root of the existing website repository, keeping the paths exactly as shown:

- Replace root `index.html` with this package's `index.html`.
- Copy the `api/` folder.
- Copy `admin.html` to the project root.
- Copy `package.json` to the project root. Vercel automatically detects the Node.js API functions; no custom `vercel.json` is required.

Keep all your existing `assets/` folders, images, videos, audio files, and any other site resources. This package intentionally does not replace those assets.

## 4. Set Vercel environment variables

In Vercel → Project → Settings → Environment Variables, add:

- `SUPABASE_URL` = Supabase project URL
- `SUPABASE_ANON_KEY` = anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` = service-role secret key

Set them for Production (and Preview/Development if needed), then redeploy.

**Security:** The service-role key is server-side only. Never add it to `index.html`, `admin.html`, GitHub source, or any variable prefixed with `NEXT_PUBLIC_`/`VITE_`. The `SUPABASE_ANON_KEY` is designed to be public; the database's RLS and server API protect the records.

## 5. Open the dashboard

After deployment, visit `https://YOUR-DOMAIN/admin.html`, sign in with the admin email/password, and review submissions. The dashboard refreshes every 30 seconds and also has a manual Refresh button. Status changes are saved immediately. CSV export is available for both lists.

## 6. Form behavior

- Volunteer registration requires name, phone, ward, volunteer area, and explicit consent.
- Feedback details and category are required; name and contact are optional. A blank name and contact are stored as anonymous feedback.
- Each successful submission receives a reference code (`VOL-...` or `FB-...`).
- New submissions appear in the admin dashboard; no email notifications are sent.
- The existing visual design, form section, tab behavior, and success-toast mechanism are retained.

## Before public launch

- Test one volunteer submission and one anonymous feedback submission on the deployed Preview URL.
- Verify both appear in the admin dashboard and status changes persist.
- Confirm an ordinary authenticated user without `app_metadata.role=admin` receives HTTP 403 from admin endpoints.
- Consider adding a managed rate-limit service (e.g. Upstash) before high-traffic launch. The included hidden honeypot is basic bot friction, not a substitute for a production rate limiter or CAPTCHA.
- Publish a short privacy notice explaining purpose, access, retention, and a contact for privacy requests. Keep volunteer and feedback data restricted to authorized office staff.
