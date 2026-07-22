# Collection Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the public heritage pages into a minimal, image-first cultural collection experience while preserving all existing CMS and data contracts.

**Architecture:** Keep the existing server-side repository calls and client-side search behavior. Recompose only public React pages and presentation components, derive homepage category entries from already-fetched heritage items, and retain client JavaScript only for filtering, search, favorites, history tracking, video playback, and Gallery preview.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, next-intl, next/image, Vitest.

---

## File Map

- Create `components/home/collection-categories.tsx`: image-led category entry strip derived from existing items.
- Create `tests/collection-visual-redesign.test.ts`: phase-one structure and exclusion contract.
- Modify `components/home/home-cms-content.tsx`: compose Hero, Collection, and category entries only.
- Modify `components/home/hero-section.tsx`: reduce copy and maximize image presence.
- Modify `components/home/featured-grid.tsx`: remove excerpts and video/status decoration from Collection tiles.
- Modify `components/heritage/heritage-list-client.tsx`: compress filters and make the list image-first.
- Modify `components/heritage/heritage-card.tsx`: show only image, names, region, and category.
- Modify `components/heritage/detail-hero.tsx`: use the landscape Hero media first and simplify overlay metadata.
- Modify `components/heritage/craft-media-gallery.tsx`: implement A1 main-image plus two-column detail layout.
- Modify `app/[locale]/heritage/[slug]/page.tsx`: remove article sections and retain Hero, Gallery, minimal facts, favorite, and optional video.
- Modify `tests/home-cinematic-gallery.test.ts`: update homepage expectations to the approved minimal Collection.
- Modify `tests/heritage-detail-museum.test.ts`: replace article-section expectations with the approved Gallery contract.

### Task 1: Lock The Phase-One Contract In Tests

**Files:**
- Create: `tests/collection-visual-redesign.test.ts`
- Modify: `tests/home-cinematic-gallery.test.ts`
- Modify: `tests/heritage-detail-museum.test.ts`

- [ ] **Step 1: Add failing homepage assertions**

Assert that `HomeCmsContent` renders `CollectionCategories`, `FeaturedGrid` does not render `item.summary`, and excluded homepage module names remain absent.

- [ ] **Step 2: Add failing index assertions**

Assert that `HeritageCard` renders `item.image`, `item.categoryName`, `item.region`, localized names, and does not render `item.summary`.

- [ ] **Step 3: Add failing detail assertions**

Assert that the detail page renders `DetailHero`, `CraftMediaGallery`, a `collection-facts` block, and optional `HeritageVideoArchive`; assert that it does not render `Timeline`, history, inheritor, related item cards, or article chapter navigation.

- [ ] **Step 4: Add failing A1 Gallery assertions**

Assert that the Gallery separates `const [primaryImage, ...detailImages] = images`, renders one primary figure, and maps remaining images in a two-column grid.

- [ ] **Step 5: Run tests and confirm RED**

Run: `npm test -- tests/collection-visual-redesign.test.ts tests/home-cinematic-gallery.test.ts tests/heritage-detail-museum.test.ts`

Expected: failures for missing `CollectionCategories`, old summary copy, old article sections, and missing A1 Gallery structure.

### Task 2: Implement Homepage Collection Composition

**Files:**
- Create: `components/home/collection-categories.tsx`
- Modify: `components/home/home-cms-content.tsx`
- Modify: `components/home/hero-section.tsx`
- Modify: `components/home/featured-grid.tsx`

- [ ] **Step 1: Build category entries from existing items**

Create a server component that groups items by `categorySlug`, selects the first available `image || heroImage`, and links each entry to `/heritage?category=<slug>`. Render a wide image, category name, and item count only.

- [ ] **Step 2: Compose the homepage**

Render `<HeroSection>`, `<FeaturedGrid>`, and `<CollectionCategories>` from the already-resolved `items`. Do not add a new fetch or client boundary.

- [ ] **Step 3: Simplify Hero copy**

Keep the prioritized CMS image, responsive `sizes`, the collection label, one title, and one short line. Remove decorative explanatory labels and secondary prose while preserving the current header.

- [ ] **Step 4: Simplify Collection tiles**

Keep the large `aspect-[3/4]` image, category, sequence number, project name, and region. Remove summary, playable-media badge, and bottom description row.

- [ ] **Step 5: Run homepage tests and confirm GREEN**

Run: `npm test -- tests/collection-visual-redesign.test.ts tests/home-cinematic-gallery.test.ts tests/home-featured-content.test.ts`

Expected: all homepage tests pass.

### Task 3: Implement The Image-Led Heritage Index

**Files:**
- Modify: `components/heritage/heritage-list-client.tsx`
- Modify: `components/heritage/heritage-card.tsx`

- [ ] **Step 1: Compress the filter interface**

Keep query, category, province, semantic search, and result count logic unchanged. Restyle them as an unframed compact toolbar with horizontal overflow on small screens.

- [ ] **Step 2: Increase image priority in the grid**

Use a responsive two-column desktop collection grid with generous spacing and stable image ratios. Preserve `next/image` responsive `sizes`.

- [ ] **Step 3: Remove card excerpts**

Render only image, category, localized project name, English/Chinese secondary name, and region. Remove `item.summary` entirely.

- [ ] **Step 4: Run index and search tests**

Run: `npm test -- tests/collection-visual-redesign.test.ts tests/semantic-search-ui.test.ts`

Expected: visual contract and semantic search behavior pass.

### Task 4: Implement Minimal Detail And A1 Gallery

**Files:**
- Modify: `app/[locale]/heritage/[slug]/page.tsx`
- Modify: `components/heritage/detail-hero.tsx`
- Modify: `components/heritage/craft-media-gallery.tsx`

- [ ] **Step 1: Simplify the detail composition**

Keep JSON-LD, breadcrumbs in the Hero, browsing history, favorite action, and CMS repository calls. Remove history, timeline, inheritor, tags, related projects, article navigation, and their imports. Render only Hero, Gallery, minimal region/category facts, and optional video.

- [ ] **Step 2: Simplify the Hero**

Use `item.heroImage || item.image` for the oversized landscape image. Render title and one-sentence summary as the primary overlay; reduce category and region to quiet metadata.

- [ ] **Step 3: Implement A1 Gallery**

Split the image array into `primaryImage` and `detailImages`. Render the primary image at a wide stable ratio, then render remaining images in `md:grid-cols-2`. Keep lazy loading, captions, dialog preview, focus restoration, and body-scroll locking.

- [ ] **Step 4: Render minimal facts**

Add `data-section="collection-facts"` with region and category only. Do not render materials, techniques, tags, or placeholder values.

- [ ] **Step 5: Run detail tests**

Run: `npm test -- tests/collection-visual-redesign.test.ts tests/heritage-detail-museum.test.ts tests/heritage-media-experience.test.ts`

Expected: detail structure, A1 Gallery, preview, and video behavior pass.

### Task 5: Verify Scope And Production Build

**Files:**
- Verify only; no intended source edits.

- [ ] **Step 1: Run the focused test suite**

Run: `npm test -- tests/collection-visual-redesign.test.ts tests/home-cinematic-gallery.test.ts tests/home-featured-content.test.ts tests/heritage-detail-museum.test.ts tests/heritage-media-experience.test.ts tests/semantic-search-ui.test.ts`

Expected: all selected tests pass with zero failures.

- [ ] **Step 2: Run type checking**

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: exit code 0 and all public routes compile.

- [ ] **Step 4: Audit forbidden paths**

Compare modified-file timestamps and confirm no changes under `supabase/`, `app/api/`, `components/admin/`, `lib/feishu-sync/`, or database type files.

- [ ] **Step 5: Inspect rendered pages**

Check `/zh`, `/zh/heritage`, and one `/zh/heritage/[slug]` page at desktop and mobile widths. Confirm stable image ratios, no overlap, no summary on index cards, A1 Gallery layout, and no hidden article sections.

## Repository Note

The current project directory is not a Git worktree. Commit steps are intentionally omitted; no repository initialization or unrelated version-control mutation is authorized.
