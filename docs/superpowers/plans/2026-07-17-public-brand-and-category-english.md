# Public Brand And Category English Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify public headers under `华韵收藏` and add restrained English labels to the six homepage categories.

**Architecture:** Change text presentation only in the two public header components and the static category-index data. Preserve all navigation, mobile behavior, routes, CMS data flow, and admin branding.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Vitest.

---

### Task 1: Establish Failing Presentation Tests

**Files:**
- Modify: `tests/home-cinematic-gallery.test.ts`
- Modify: `tests/collection-visual-redesign.test.ts`

- [ ] Require `华韵收藏` in both `components/home/home-header.tsx` and `components/layout/site-header.tsx`.
- [ ] Reject the old visible public brand name in both public headers.
- [ ] Require `Traditional Opera`, `Embroidery`, `Ceramics`, `Dyeing & Weaving`, `Bamboo Weaving`, and `Paper Cutting` in `collection-category-index.tsx`.
- [ ] Run `npm test -- tests/home-cinematic-gallery.test.ts tests/collection-visual-redesign.test.ts` and confirm failures match missing text.

### Task 2: Implement Public Brand And English Labels

**Files:**
- Modify: `components/home/home-header.tsx`
- Modify: `components/layout/site-header.tsx`
- Modify: `components/home/collection-category-index.tsx`

- [ ] Replace only the visible public header brand text with `华韵收藏`; preserve logo, links, mobile menu, and admin files.
- [ ] Add an `englishName` value to every static category entry.
- [ ] Render English below Chinese with small uppercase, low-contrast text and stable wrapping.
- [ ] Run focused tests and confirm they pass.

### Task 3: Verify

**Files:**
- Verify only.

- [ ] Run `npm run typecheck`.
- [ ] Stop the production server before `npm run build`, then rebuild and restart.
- [ ] Inspect desktop and mobile homepage screenshots for text fit and layout stability.
- [ ] Confirm `supabase/`, `app/api/`, `components/admin/`, `lib/feishu-sync/`, and database types remain unchanged.

## Repository Note

The project is not a Git worktree. No commit, merge, or PR operations are available.
