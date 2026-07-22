# Museum Topics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build four localized museum topic pages that organize heritage items into editorial exhibition lines.

**Architecture:** Add a focused topic definition module that resolves representative Supabase-backed `HeritageItem` records at runtime. Reuse the existing museum page, metadata helpers, i18n routing, `HeritageCard`, `Reveal`, and JSON-LD infrastructure.

**Tech Stack:** Next.js 15 App Router, TypeScript, next-intl, Tailwind CSS, existing motion CSS, Vitest.

---

### Task 1: Topic Content Model

**Files:**
- Modify: `lib/types/museum.ts`
- Create: `lib/content/museum-topics.ts`
- Test: `tests/museum-topics.test.ts`

- [ ] **Step 1: Write failing tests** for the four topic slugs, representative item matching, fallback recommendations, and localized display text.
- [ ] **Step 2: Run `npm test -- tests/museum-topics.test.ts`** and confirm the missing module failure.
- [ ] **Step 3: Implement topic types and curation helpers** with no Supabase writes and no visual changes.
- [ ] **Step 4: Re-run the topic tests** and confirm they pass.

### Task 2: Museum Page Integration

**Files:**
- Modify: `lib/content/museum-curation.ts`
- Modify: `components/museum/featured-topics.tsx`
- Test: `tests/museum-curation.test.ts`

- [ ] **Step 1: Add failing assertions** that `createMuseumCuration` returns the four curated topic cards with `/museum/topics/*` hrefs.
- [ ] **Step 2: Run the museum curation test** and confirm it fails before implementation.
- [ ] **Step 3: Replace category-only featured topics with curated museum topics** while preserving card rendering and favorites.
- [ ] **Step 4: Re-run the museum curation test** and confirm it passes.

### Task 3: Topic Detail Route

**Files:**
- Create: `app/[locale]/museum/topics/[slug]/page.tsx`
- Create: `components/museum/topic-detail.tsx`
- Test: `tests/museum-topic-page.test.ts`

- [ ] **Step 1: Add failing route structure tests** for server rendering, `generateStaticParams`, `generateMetadata`, breadcrumbs, and JSON-LD.
- [ ] **Step 2: Run the route test** and confirm the page file is missing.
- [ ] **Step 3: Implement the localized topic detail page** with immersive hero, curatorial intro, representative items, context notes, recommended viewing, and empty-state copy.
- [ ] **Step 4: Re-run the route test** and confirm it passes.

### Task 4: SEO Sitemap

**Files:**
- Modify: `app/sitemap.ts`
- Modify: `tests/seo.test.ts`

- [ ] **Step 1: Add failing sitemap assertions** for `/zh/museum/topics/four-embroideries` and its English hreflang alternate.
- [ ] **Step 2: Run the SEO test** and confirm the topic URL is absent.
- [ ] **Step 3: Add topic sitemap entries** using existing language alternate helpers.
- [ ] **Step 4: Re-run SEO tests** and confirm they pass.

### Task 5: Full Verification

**Files:**
- No new files.

- [ ] **Step 1: Run `npm run typecheck`.**
- [ ] **Step 2: Run `npm test`.**
- [ ] **Step 3: Run `npm run build`.**
- [ ] **Step 4: Report modified files, test evidence, and next recommendations.**
