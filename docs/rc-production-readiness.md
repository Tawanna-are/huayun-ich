# Release Candidate Production Readiness

RC scope is limited to monitoring, security, rate limiting, backup, load testing and launch operations. New product features stay frozen until the checklist below is green.

## Monitoring

- Sentry is configured for App Router client, server and edge runtimes.
- `app/global-error.tsx` captures React global errors.
- AI, semantic search and Supabase fallback errors call `captureAppException`.
- Verify after deploy by opening Sentry Issues and checking `environment`, `release`, `module` and `operation` tags.

## Security

- Middleware applies CSP, HSTS, frame, content type, referrer and permissions headers.
- Admin API key comparison uses `timingSafeEqual`.
- Service role key stays server-only.
- Admin endpoints must require `x-admin-key`.

## Rate Limiting

- `/api/assistant`: 20 requests per minute per client IP.
- `/api/search`: 60 requests per minute per client IP.
- `/api/admin/media`: 30 requests per minute per client IP.
- `/api/admin/media/tus/*`: 120 requests per minute per client IP.

For multi-region production traffic, replace process-local buckets with Redis or Upstash.

## Backup

Run before launch and before every major CMS import:

```powershell
$env:SUPABASE_DB_URL="postgresql://..."
powershell -ExecutionPolicy Bypass -File scripts/supabase-backup.ps1
```

Store the generated `.dump` outside the repository and test restoration in a staging database.

## Load Test

Start the production build locally, then run:

```powershell
npm.cmd run build
npm.cmd run start
powershell -ExecutionPolicy Bypass -File scripts/load-test.ps1 -BaseUrl http://127.0.0.1:3000 -RequestCount 200 -Concurrency 10
```

RC pass target:

- 0 failed requests.
- P95 page/API latency under 1200 ms on the test machine.
- No new Sentry issues during the test window.

## Launch Gate

- `npm.cmd run typecheck`
- `npm.cmd test`
- `npm.cmd run build`
- `/api/health` returns `ok: true`.
- Supabase Storage upload and video TUS upload verified in CMS.
- Sentry release and source maps visible for the latest deployment.
- Latest database backup file recorded with timestamp.
