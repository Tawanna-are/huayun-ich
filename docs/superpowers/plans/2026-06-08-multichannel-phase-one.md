# Multichannel Phase One Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first multichannel publishing phase: shared content API, H5 campaign pages, and PWA offline foundation.

**Architecture:** Keep the current Next.js app as the web shell and Supabase as the content source. Add a small multichannel content module that prepares sanitized payloads for API routes, campaigns and offline cache. Use native Next metadata plus a static service worker to avoid new runtime dependencies.

**Tech Stack:** Next.js 15 App Router, TypeScript, next-intl, Tailwind CSS, Supabase repository layer, Vitest.

---

### Task 1: Multichannel Content Module

**Files:**
- Create: `lib/content/multichannel-content.ts`
- Test: `tests/multichannel-content.test.ts`

- [ ] Write tests for campaign payload creation, API feed shape and offline payload limits.
- [ ] Run `npm test -- tests/multichannel-content.test.ts` and verify it fails because the module is missing.
- [ ] Implement campaign definitions, `createMultichannelContent`, `createCampaignCollection`, `resolveCampaignDetail` and `createOfflineContentPayload`.
- [ ] Re-run the test and confirm it passes.

### Task 2: Public Content API

**Files:**
- Create: `app/api/content/route.ts`
- Create: `app/api/content/campaigns/route.ts`
- Create: `app/api/content/offline/route.ts`
- Test: `tests/content-api.test.ts`

- [ ] Write route structure tests that confirm read-only GET handlers use repository content and multichannel helpers.
- [ ] Run the test and verify it fails because the routes do not exist.
- [ ] Implement GET handlers with `NextResponse.json`.
- [ ] Re-run the test and confirm it passes.

### Task 3: H5 Campaign Routes

**Files:**
- Create: `app/[locale]/campaigns/page.tsx`
- Create: `app/[locale]/campaigns/[slug]/page.tsx`
- Create: `components/campaigns/campaign-index.tsx`
- Create: `components/campaigns/campaign-detail.tsx`
- Test: `tests/campaign-pages.test.ts`

- [ ] Write route structure tests for localized server-rendered pages, metadata, JSON-LD and campaign resolver usage.
- [ ] Run the test and verify it fails because the routes do not exist.
- [ ] Implement mobile-first H5 campaign index and detail components.
- [ ] Implement route metadata, static params and JSON-LD.
- [ ] Re-run the test and confirm it passes.

### Task 4: PWA Offline Foundation

**Files:**
- Create: `app/manifest.ts`
- Create: `app/[locale]/offline/page.tsx`
- Create: `components/pwa/service-worker-register.tsx`
- Create: `public/sw.js`
- Modify: `app/[locale]/layout.tsx`
- Test: `tests/pwa.test.ts`

- [ ] Write tests for manifest, offline route, service worker file and layout registration.
- [ ] Run the test and verify it fails because PWA files are missing.
- [ ] Implement manifest metadata and offline page.
- [ ] Implement safe client-side service worker registration.
- [ ] Implement service worker cache install/fetch behavior.
- [ ] Re-run the test and confirm it passes.

### Task 5: Sitemap and Verification

**Files:**
- Modify: `app/sitemap.ts`
- Modify: `tests/seo.test.ts`

- [ ] Add sitemap assertions for campaigns and offline routes.
- [ ] Update sitemap entries.
- [ ] Run targeted tests.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
