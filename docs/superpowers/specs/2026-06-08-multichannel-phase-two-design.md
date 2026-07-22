# Multichannel Phase Two Design Spec

## Goal

Extend the phase-one multichannel foundation with campaign operations, share posters and favorite offline caching while keeping the WeChat mini program out of scope.

## Scope

1. Campaign operations foundation
   - Add a `campaign_configs` database design for future CMS-backed H5 campaigns.
   - Add admin read/write API routes protected by the existing Admin Key.
   - Add an admin tab so operators can see and save campaign configuration drafts.
   - Keep built-in campaign definitions as runtime fallback.

2. Share poster endpoint
   - Add a campaign poster endpoint returning SVG.
   - Use the existing campaign detail data and site URL.
   - Avoid extra image-generation dependencies in this phase.

3. PWA favorite offline cache
   - Add a profile dashboard action that sends favorite heritage routes and images to the service worker.
   - Add a service worker message handler that caches favorite assets on demand.
   - Keep behavior optional and safe when service worker is unavailable.

## Acceptance Criteria

- Admin campaign API files exist and enforce `verifyAdminRequest`.
- A migration script defines `campaign_configs` with RLS.
- Admin UI exposes a campaign configuration tab.
- Campaign detail pages link to the poster endpoint.
- Service worker can receive `CACHE_FAVORITES` messages.
- Profile dashboard exposes a “cache favorites offline” action.
- Tests, typecheck and production build pass.
