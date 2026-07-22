# Multichannel Phase One Design Spec

## Goal

Build the first phase of Huayun's multichannel publishing system without starting the WeChat mini program yet. The phase creates a shared content API, H5 campaign pages, and a PWA offline foundation on top of the existing Next.js and Supabase platform.

## Scope

1. Shared content API
   - Add public read-only endpoints for multichannel clients.
   - Return heritage items, categories, inheritors, museum topics, campaigns and lightweight offline payloads.
   - Keep Supabase as the single content source.

2. H5 campaign pages
   - Add localized campaign index and detail routes under `/campaigns`.
   - Use a museum-grade mobile-first template for shareable cultural campaigns.
   - Launch with four campaigns: four embroideries, traditional opera, tea culture and traditional festivals.

3. PWA offline foundation
   - Add web app manifest metadata.
   - Add a static service worker that caches shell routes, images and a small offline content payload.
   - Add a localized offline page and a client registration component.

## Architecture

The existing Next.js app remains the main web application. New multichannel data preparation lives in `lib/content/multichannel-content.ts`; API routes call that module and expose sanitized payloads. H5 campaign pages render on the server and reuse campaign payloads. PWA support uses framework-native metadata plus a lightweight custom service worker in `public/sw.js`, avoiding extra dependencies.

## Routes

- `/zh/campaigns`
- `/en/campaigns`
- `/zh/campaigns/[slug]`
- `/en/campaigns/[slug]`
- `/zh/offline`
- `/en/offline`
- `/api/content`
- `/api/content/offline`
- `/api/content/campaigns`

## Acceptance Criteria

- H5 campaign routes are localized, server-rendered and SEO-ready.
- Content API returns read-only multichannel payloads from existing content repositories.
- PWA manifest and service worker are present and registered from the app layout.
- Offline page exists for both locales.
- Sitemap includes campaign and offline routes.
- `npm run typecheck`, `npm test`, and `npm run build` pass.
