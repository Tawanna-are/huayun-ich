# Homepage Collection Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the repeated image category section, establish `华韵收藏` as the Hero identity, and add a text-only six-category index beneath the featured Collection.

**Architecture:** Keep the existing server-rendered `HomeCmsContent` data flow and featured CMS filtering. Replace the image-driven category component with a static server component whose links use the existing `/heritage?query=` behavior, introducing no new fetch, state, or persistence.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, next/image, Vitest.

---

### Task 1: Lock The Homepage Refinement Contract

**Files:**
- Modify: `tests/collection-visual-redesign.test.ts`
- Modify: `tests/home-cinematic-gallery.test.ts`

- [ ] **Step 1: Write the failing category-index assertions**

Require `components/home/collection-category-index.tsx`, `CollectionCategoryIndex` in `HomeCmsContent`, all six Chinese labels, links using `query`, and absence of `CollectionCategories`.

- [ ] **Step 2: Write the failing Hero assertion**

Require `华韵收藏` in `hero-section.tsx` and reject the old `中国非遗文化` title.

- [ ] **Step 3: Run the tests to verify RED**

Run: `npm test -- tests/collection-visual-redesign.test.ts tests/home-cinematic-gallery.test.ts`

Expected: fail because the new component and title do not exist and the old category component remains.

### Task 2: Implement The Hero And Six-Cell Index

**Files:**
- Create: `components/home/collection-category-index.tsx`
- Delete: `components/home/collection-categories.tsx`
- Modify: `components/home/home-cms-content.tsx`
- Modify: `components/home/hero-section.tsx`

- [ ] **Step 1: Create the static index data**

Define six entries with labels and queries: 戏曲, 刺绣, 陶瓷, 染织, 竹编, 剪纸. Render links as `href={{ pathname: "/heritage", query: { query: item.query } }}`.

- [ ] **Step 2: Render the six-cell layout**

Use `grid-cols-2 md:grid-cols-3`, border separators, category names, small sequence numbers, and an arrow icon. Do not render images, item counts, or descriptions.

- [ ] **Step 3: Replace homepage composition**

Remove the `CollectionCategories` import and render. Import and render `CollectionCategoryIndex` without passing CMS items or adding a fetch.

- [ ] **Step 4: Rename the Hero**

Replace the visible H1 with `华韵收藏`; keep the existing CMS image, English collection line, one short sentence, `priority`, `quality={70}`, and responsive `sizes`.

- [ ] **Step 5: Run focused tests to verify GREEN**

Run: `npm test -- tests/collection-visual-redesign.test.ts tests/home-cinematic-gallery.test.ts tests/home-featured-content.test.ts`

Expected: all homepage tests pass.

### Task 3: Verify Rendering And Scope

**Files:**
- Verify only.

- [ ] **Step 1: Run type checking**

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 2: Run production build with no dev server writing `.next`**

Run: `npm run build`

Expected: exit code 0.

- [ ] **Step 3: Inspect desktop and mobile screenshots**

Verify the Hero says `华韵收藏`, the featured Collection remains image-first, the old image category module is absent, and the six-cell index renders as three columns desktop and two columns mobile without overlap.

- [ ] **Step 4: Audit forbidden paths**

Confirm no changes under `supabase/`, `app/api/`, `components/admin/`, `lib/feishu-sync/`, or database type files.

## Repository Note

The project is not a Git worktree. Commit steps are omitted, and no repository initialization is authorized.
