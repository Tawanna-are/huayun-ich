# Deployment

## 1. Requirements

- Node.js 20+
- Supabase project
- Vercel or any Node host that supports Next.js 15

## 2. Local Run

```bash
npm install
npm run generate:assets
npm run dev
```

If PowerShell blocks `npm.ps1`, use `npm.cmd`.

## 3. Supabase

Run `supabase/schema.sql` in the Supabase SQL Editor.

The schema creates:

- `category`
- `heritage`
- `inheritor`
- `media`
- `heritage_timeline`
- `heritage_related`
- `heritage-media` storage bucket

Configure environment variables:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SENTRY_DSN=your-public-sentry-dsn
SENTRY_DSN=your-server-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
SENTRY_AUTH_TOKEN=your-source-map-upload-token
SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_API_KEY=your-admin-key
SUPABASE_DB_URL=your-postgres-connection-string-for-backup
```

The frontend reads Supabase first. If Supabase env vars are missing, local development uses seed-shaped content so the app remains runnable.

## 4. Admin

Visit `/admin`.

- `GET /api/admin/heritage`: list content
- `POST /api/admin/heritage`: create heritage item, requires `x-admin-key`
- `PATCH /api/admin/heritage/:id`: update heritage item, requires `x-admin-key`
- `POST /api/admin/media`: upload image/video to Supabase Storage, requires `x-admin-key`

## 5. Vercel

1. Import the repository.
2. Build command: `npm run build`.
3. Add the environment variables above.
4. Optional build command for generated local assets:

```bash
npm run generate:assets && npm run build
```

## 6. Verification

```bash
npm run test
npm run typecheck
npm run build
npm exec lighthouse -- http://127.0.0.1:3001 --only-categories=performance,seo --chrome-flags="--headless --no-sandbox"
```

Latest local Lighthouse result:

- Performance: 91
- SEO: 100

## 7. Release Candidate Operations

Before production launch:

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
powershell -ExecutionPolicy Bypass -File scripts/supabase-backup.ps1
```

After deployment:

- Check `/api/health` returns `ok: true`.
- Confirm Sentry receives events with the current release and source maps.
- Run `scripts/load-test.ps1` against the deployed URL or a production-like preview.
- Confirm admin media upload and TUS video upload still work with `x-admin-key`.

See `docs/rc-production-readiness.md` for the RC gate.
