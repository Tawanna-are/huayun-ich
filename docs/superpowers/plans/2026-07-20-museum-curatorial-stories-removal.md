# Museum Curatorial Stories Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Curatorial Stories section from the localized digital museum page while preserving its reusable component and data model.

**Architecture:** Change only the museum page composition and its source-level regression test. Keep `createMuseumCuration()` unchanged because Featured Topics and Annual Recommendations still use the same curation result and the Curatorial Stories data may remain reusable elsewhere.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, next-intl, Vitest, Chrome browser acceptance.

---

### Task 1: Lock the Public Composition Contract

**Files:**
- Modify: `tests/museum-page.test.ts`
- Test: `tests/museum-page.test.ts`

- [ ] **Step 1: Change the existing composition assertion**

In `starts with the data gallery and does not render the full-screen museum hero`, replace:

```ts
expect(source).toContain("CuratorialStories");
```

with:

```ts
expect(source).not.toContain('import { CuratorialStories }');
expect(source).not.toContain("<CuratorialStories");
```

Keep the assertions for Data Gallery, Featured Topics, and Annual Recommendations.

- [ ] **Step 2: Verify RED**

Run: `npm test -- tests/museum-page.test.ts`

Expected: FAIL because the page still imports and renders `CuratorialStories`.

### Task 2: Remove the Section From the Museum Page

**Files:**
- Modify: `app/[locale]/museum/page.tsx`
- Test: `tests/museum-page.test.ts`

- [ ] **Step 1: Remove the import**

Delete:

```ts
import { CuratorialStories } from "@/components/museum/curatorial-stories";
```

- [ ] **Step 2: Remove the render block**

Delete the complete `<CuratorialStories ... />` block after `AnnualRecommendations`. Do not change `createMuseumCuration(items)`, the `curation` variable, `components/museum/curatorial-stories.tsx`, museum types, or curation data logic.

- [ ] **Step 3: Verify GREEN**

Run: `npm test -- tests/museum-page.test.ts`

Expected: both museum page tests PASS.

### Task 3: Verify the Remaining Page

**Files:** no additional production files.

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`

Expected: exit code `0`.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: build succeeds and generates `/zh/museum` and `/en/museum`.

- [ ] **Step 3: Run desktop and mobile browser acceptance**

Open `/zh/museum` at `1440x1000` and `390x844`. Verify the page contains Data Gallery, Featured Topics, and Annual Recommendations but no Curatorial Stories heading or cards. Verify `/en/museum` returns 200 and also omits Curatorial Stories. Capture screenshots as:

```text
screenshots/2026-07-20-museum-no-curatorial-stories-desktop.png
screenshots/2026-07-20-museum-no-curatorial-stories-mobile.png
```

## Constraints

- Do not delete `components/museum/curatorial-stories.tsx`.
- Do not modify `lib/content/museum-curation.ts` or `lib/types/museum.ts`.
- Do not modify CMS, Supabase, database schema, APIs, media, SEO, or Feishu synchronization.
- The project has no `.git` directory, so commit steps are omitted.
