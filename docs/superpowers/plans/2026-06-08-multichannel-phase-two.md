# Multichannel Phase Two Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add campaign configuration operations, share posters and PWA favorite offline caching.

**Architecture:** Preserve built-in campaign definitions for runtime stability while introducing a `campaign_configs` table and admin API as the operations foundation. Poster generation is a dependency-free SVG route. Favorite offline caching is client-triggered through a service worker message.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, Supabase SQL, Vitest, static service worker.

---

### Task 1: Campaign Config Schema and API

**Files:**
- Create: `supabase/migrations/20260608_campaign_configs.sql`
- Create: `lib/admin/campaign-configs.ts`
- Create: `app/api/admin/campaigns/route.ts`
- Create: `app/api/admin/campaigns/[slug]/route.ts`
- Test: `tests/admin-campaigns.test.ts`

- [ ] Write failing tests for schema fields, admin API authorization and helper exports.
- [ ] Implement schema and admin helper functions.
- [ ] Implement GET/PUT handlers with `verifyAdminRequest`.
- [ ] Re-run targeted tests.

### Task 2: Admin UI Campaign Tab

**Files:**
- Modify: `components/admin/heritage-admin-client.tsx`
- Test: `tests/admin-campaigns.test.ts`

- [ ] Extend `AdminTab` with `campaigns`.
- [ ] Add a tab button with a presentation icon.
- [ ] Add a compact campaign configuration panel.
- [ ] Re-run targeted tests.

### Task 3: Campaign Poster

**Files:**
- Create: `app/api/content/campaigns/[slug]/poster/route.ts`
- Modify: `components/campaigns/campaign-detail.tsx`
- Test: `tests/campaign-poster.test.ts`

- [ ] Write failing tests for SVG poster endpoint and detail link.
- [ ] Implement SVG poster response.
- [ ] Add a share poster link to campaign detail.
- [ ] Re-run targeted tests.

### Task 4: PWA Favorite Offline Cache

**Files:**
- Create: `components/pwa/favorite-offline-cache.tsx`
- Modify: `components/user/profile-dashboard.tsx`
- Modify: `public/sw.js`
- Test: `tests/pwa-favorites.test.ts`

- [ ] Write failing tests for cache component, profile integration and service worker message.
- [ ] Implement client component that posts favorite routes/assets to the service worker.
- [ ] Add service worker `CACHE_FAVORITES` handler.
- [ ] Add the action to profile dashboard.
- [ ] Re-run targeted tests.

### Task 5: Verification

**Files:**
- No new feature files.

- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
