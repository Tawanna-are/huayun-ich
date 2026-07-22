# Museum Hero Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the full-screen digital museum Hero so `/[locale]/museum` begins directly with the existing Data Gallery entry.

**Architecture:** Keep the museum route server-rendered and retain all current data, curation, SEO, and structured-data flows. Remove only the Hero import, Hero render, and Hero-only statistics, then add fixed-header-safe spacing to the existing first section.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, next-intl, Vitest, Playwright.

---

### Task 1: Lock the Hero Removal Contract

**Files:**
- Modify: `tests/museum-page.test.ts`
- Test: `tests/museum-page.test.ts`

- [ ] **Step 1: Add the failing regression test**

Add a second test:

```ts
it("starts with the data gallery and does not render the full-screen museum hero", () => {
  const source = readFileSync("app/[locale]/museum/page.tsx", "utf8");

  expect(source).not.toContain('import { MuseumHero }');
  expect(source).not.toContain("<MuseumHero");
  expect(source).not.toContain("const provinceCount");
  expect(source).not.toContain("const stats =");
  expect(source).toContain('data-section="museum-data-gallery"');
  expect(source).toContain("FeaturedTopics");
  expect(source).toContain("AnnualRecommendations");
  expect(source).toContain("CuratorialStories");
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- tests/museum-page.test.ts`

Expected: FAIL because `MuseumHero`, `provinceCount`, and `stats` are still present and the Data Gallery section has no stable marker.

### Task 2: Remove the Hero Without Replacing It

**Files:**
- Modify: `app/[locale]/museum/page.tsx`
- Test: `tests/museum-page.test.ts`

- [ ] **Step 1: Remove Hero-only code**

Delete:

```ts
import { MuseumHero } from "@/components/museum/museum-hero";
```

Delete `provinceCount`, the `stats` array, and the complete `<MuseumHero ... />` render block. Keep `pageTitle` and `pageDescription` because CollectionPage JSON-LD uses both.

- [ ] **Step 2: Make Data Gallery the fixed-header-safe first section**

Change the opening section to:

```tsx
<section
  data-section="museum-data-gallery"
  className="border-b border-museumGold/14 bg-ink pb-8 pt-28 text-rice md:pb-10 md:pt-32"
>
```

Keep all section content, links, icons, translations, and following modules unchanged.

- [ ] **Step 3: Verify GREEN**

Run: `npm test -- tests/museum-page.test.ts`

Expected: both museum page tests PASS.

### Task 3: Verify the Production Surface

**Files:** no additional production files.

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`

Expected: exit code `0`.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: build succeeds and generates both `/zh/museum` and `/en/museum`.

- [ ] **Step 3: Run Playwright acceptance**

At `1440x1000` and `390x844`, open `/zh/museum` and assert:

```text
MuseumHero heading and Hero statistics are absent.
[data-section="museum-data-gallery"] is the first visible page section below the fixed header.
Featured Topics remains visible after the Data Gallery strip.
document.documentElement.scrollWidth === window.innerWidth.
```

Repeat route-presence checks for `/en/museum`. Capture desktop and mobile screenshots under `screenshots/2026-07-20-museum-no-hero-*.png`.

## Completion Constraints

- Do not delete `components/museum/museum-hero.tsx`.
- Do not change CMS, Supabase, database schema, API, media records, or Feishu synchronization.
- Do not change metadata, canonical, Open Graph, or JSON-LD.
- The project has no `.git` directory, so commit steps are intentionally omitted.
