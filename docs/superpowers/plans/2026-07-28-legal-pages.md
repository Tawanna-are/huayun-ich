# Bilingual Legal Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four localized, indexable legal pages and expose them through the footer and sitemap without changing existing business features.

**Architecture:** Store typed Chinese and English legal copy in one server-safe content module and render it through one shared presentational component. Thin route files select a document by locale and generate metadata with the existing SEO helper; the existing footer and sitemap receive only the new links and static paths.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, next-intl localized routing, Tailwind CSS, Vitest.

---

### Task 1: Define legal content contract and bilingual copy

**Files:**
- Create: `tests/legal-content.test.ts`
- Create: `lib/legal/legal-content.ts`

- [ ] **Step 1: Write the failing content tests**

Create source-level and imported-data assertions that require four document keys for both locales, localized titles and descriptions, the operator name, a `/#contact` contact target, the approved Chinese copyright notice and English equivalent, and explicit privacy references to Cookie, website analytics, and Google Analytics.

- [ ] **Step 2: Verify the test fails for the missing module**

Run: `npm test -- tests/legal-content.test.ts`

Expected: FAIL because `lib/legal/legal-content.ts` does not exist.

- [ ] **Step 3: Implement the typed legal content module**

Export `LegalDocumentKey`, `LegalSection`, `LegalDocument`, `legalDocumentKeys`, and `getLegalDocument(key, locale)`. Define complete `zh` and `en` content for `disclaimer`, `privacy`, `copyright`, and `terms`. Each document includes `title`, `description`, `updatedAt`, `intro`, and `sections`; link-bearing paragraphs use a typed segment representation so the contact link is rendered safely rather than embedded as HTML.

- [ ] **Step 4: Verify content tests pass**

Run: `npm test -- tests/legal-content.test.ts`

Expected: PASS.

### Task 2: Add shared presentation and four localized routes

**Files:**
- Create: `tests/legal-pages.test.ts`
- Create: `components/legal/legal-page.tsx`
- Create: `app/[locale]/disclaimer/page.tsx`
- Create: `app/[locale]/privacy/page.tsx`
- Create: `app/[locale]/copyright/page.tsx`
- Create: `app/[locale]/terms/page.tsx`

- [ ] **Step 1: Write failing route and metadata tests**

Assert that all four route files exist, call `createMetadata` with their exact path, resolve `zh`/`en` through `isAppLocale`, and render the shared `LegalPage`. Assert the shared component uses the existing `museum-container`, paper/rice palette classes, semantic `article`, headings, last-updated label, and localized `Link` for contact segments.

- [ ] **Step 2: Verify route tests fail**

Run: `npm test -- tests/legal-pages.test.ts`

Expected: FAIL because the shared component and route files do not exist.

- [ ] **Step 3: Implement the shared legal page**

Render a responsive light page with a compact header band, readable content column, semantic sections, localized update label, and link segments using `Link href="/#contact"`. Keep it server-rendered and free of client state.

- [ ] **Step 4: Implement four thin route files**

Each route defines `generateMetadata`, resolves the locale with the existing routing helpers, reads its legal document, passes localized title/description/path to `createMetadata`, calls `setRequestLocale`, and renders `<LegalPage document={document} locale={currentLocale} />`.

- [ ] **Step 5: Verify route tests pass**

Run: `npm test -- tests/legal-pages.test.ts tests/legal-content.test.ts`

Expected: PASS.

### Task 3: Add localized footer legal navigation

**Files:**
- Modify: `tests/site-footer.test.ts`
- Modify: `components/layout/site-footer.tsx`

- [ ] **Step 1: Add failing footer assertions**

Require localized labels for `/disclaimer`, `/privacy`, `/copyright`, and `/terms`, while retaining the tests that prohibit vendor and removed exploration links.

- [ ] **Step 2: Verify the footer test fails**

Run: `npm test -- tests/site-footer.test.ts`

Expected: FAIL because the four legal links are absent.

- [ ] **Step 3: Add the compact legal link row**

Import the localized `Link`, define a locale-keyed label map, and render four wrapping text links above the copyright line. Preserve the existing footer structure, colors, brand block, hidden-home behavior, and excluded links.

- [ ] **Step 4: Verify footer tests pass**

Run: `npm test -- tests/site-footer.test.ts`

Expected: PASS.

### Task 4: Add legal pages to the localized sitemap

**Files:**
- Create: `tests/legal-sitemap.test.ts`
- Modify: `app/sitemap.ts`

- [ ] **Step 1: Write the failing sitemap test**

Assert that the sitemap passes all four paths through `createEntries`: `/disclaimer`, `/privacy`, `/copyright`, and `/terms`, using a low change frequency and moderate priority.

- [ ] **Step 2: Verify the sitemap test fails**

Run: `npm test -- tests/legal-sitemap.test.ts`

Expected: FAIL because the paths are not present.

- [ ] **Step 3: Add the static legal entries**

Append `createEntries(path, "yearly", 0.45)` for each legal route. This automatically generates `zh` and `en` URLs and the existing language alternates.

- [ ] **Step 4: Verify sitemap tests pass**

Run: `npm test -- tests/legal-sitemap.test.ts`

Expected: PASS.

### Task 5: Full verification

**Files:**
- Verify only; no production edits expected.

- [ ] **Step 1: Run all targeted tests**

Run: `npm test -- tests/legal-content.test.ts tests/legal-pages.test.ts tests/site-footer.test.ts tests/legal-sitemap.test.ts`

Expected: all tests PASS.

- [ ] **Step 2: Run type checking**

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: exit code 0 with localized legal routes included in generated output.

- [ ] **Step 4: Inspect the final diff**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; only planned legal-page, footer, sitemap, test, and documentation files are modified.

- [ ] **Step 5: Commit implementation**

Run: `git add app components lib tests docs/superpowers/plans/2026-07-28-legal-pages.md && git commit -m "feat: add bilingual legal pages"`.

Expected: one focused implementation commit after all verification succeeds.
