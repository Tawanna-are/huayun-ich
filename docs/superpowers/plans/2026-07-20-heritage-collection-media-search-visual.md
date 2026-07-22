# Heritage Collection Media, Search, and Visual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace three obsolete collection covers with selected Gallery photography, make `戏曲` search precise, and implement the approved curatorial collection wall.

**Architecture:** Preserve the existing Supabase schema and public repository mapper. Perform a guarded content-only media binding update first, then use test-driven changes in the existing semantic search and collection presentation components. Keep `/api/search`, CMS forms, Feishu synchronization, locale routing, and SEO contracts unchanged.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, next-intl, Supabase/PostgREST, Vitest, Playwright.

---

## File Map

- Modify: `tests/semantic-search.test.ts` - regression coverage for precise opera intent.
- Modify: `lib/search/semantic-search.ts` - remove broad opera expansion terms and add `川剧`.
- Modify: `tests/heritage-collection-list.test.ts` - contract coverage for curatorial spans, variants, responsive grid, and preserved metadata.
- Modify: `app/[locale]/heritage/page.tsx` - reduce the collection introduction band.
- Modify: `components/heritage/heritage-list-client.tsx` - assign deterministic editorial placements while retaining search/filter state.
- Modify: `components/heritage/heritage-card.tsx` - support feature, wide, and standard image presentations.
- Content-only update: existing `media_assets` rows for `chuanju`, `jingdezhen-porcelain`, and `datiehua`.
- No new production component, API route, migration, table, CMS field, or Feishu file.

### Task 1: Set Real Cover and Hero Bindings

**Data:** Supabase `media_assets` content rows only.

- [ ] **Step 1: Read and validate all source and destination rows**

Load `.env.local` into an in-memory dictionary, then request the exact source and destination IDs through Supabase REST using `SUPABASE_SERVICE_ROLE_KEY`. Fail before mutation unless all six selected source rows are images with HTTPS URLs and the source roles are `gallery`.

```powershell
$selection = @(
  @{ slug='chuanju'; coverSource='f8709f74-91a6-4c6d-8ee0-71b863812d75'; heroSource='ad658086-60aa-462e-8008-22c047ffe331'; coverTarget=$null; heroTarget=$null },
  @{ slug='jingdezhen-porcelain'; coverSource='505be095-9a28-42b6-88de-e8615a89537c'; heroSource='670c93e9-4e7a-4df8-b71c-fe086c9a11d5'; coverTarget='6cc40fbe-c439-40f6-8fae-b95a1c3c3e1a'; heroTarget='08a42fef-59eb-4f6f-9473-5b380d4604ff' },
  @{ slug='datiehua'; coverSource='5b354412-cd78-4111-aba3-045b3515d538'; heroSource='87237199-0966-4a13-b70a-83f3ad0ffb9b'; coverTarget='7485e5ce-455e-4f66-bc10-4ea62a28a3cb'; heroTarget='8110a8d7-71b9-4ac8-8eab-6471c05d0c2e' }
)
```

Expected: all six source rows exist; 川剧 has no current Cover/Hero; the other four destination rows exist.

- [ ] **Step 2: Apply the six bindings with in-command rollback**

For 景德镇陶瓷 and 打铁花, PATCH the existing Cover/Hero row with the selected source's `title`, `file_type`, `file_url`, `thumbnail_url`, `file_size`, `heritage_id`, `alt`, `caption`, `mime_type`, `storage_path`, and `thumbnail_storage_path`; retain destination `asset_role` and use sort orders `0` for Cover and `1` for Hero.

For 川剧, POST two cloned binding rows using the first source as `cover`/order `0` and the second as `hero`/order `1`. Keep both original Gallery rows unchanged. Use `Prefer: return=representation` and record inserted IDs in memory. If any PATCH, POST, or verification request fails, restore the four captured destination records and delete only the newly inserted IDs before throwing.

Expected: no storage object is changed or deleted; all Gallery source rows still have role `gallery`.

- [ ] **Step 3: Read back the public mapping**

POST `戏曲` to `http://localhost:3000/api/search`, and separately request the public detail/list data for the three slugs. Assert:

```text
chuanju image == ...1784250084525...webp
chuanju heroImage == ...1784250087675...webp
jingdezhen-porcelain image == ...1784268839173...webp
jingdezhen-porcelain heroImage == ...1784268842235...webp
datiehua image == ...1784268978983-2.webp
datiehua heroImage == ...1784268975714-1.webp
```

Also assert Gallery counts remain `4`, `29`, and `8` respectively.

### Task 2: Add the Opera Search Regression

**Files:**
- Modify: `tests/semantic-search.test.ts`
- Test: `tests/semantic-search.test.ts`

- [ ] **Step 1: Write the failing test**

Add a test with 川剧 plus two unrelated records whose summaries contain only `世界舞台` or `走上舞台`:

```ts
it("keeps opera intent precise instead of matching every stage reference", () => {
  const items = [
    makeHeritageItem({
      id: "chuanju",
      slug: "chuanju",
      name: "川剧",
      englishName: "Sichuan Opera",
      categorySlug: "traditional-opera",
      categoryName: "传统戏曲",
      summary: "川剧以唱腔、脸谱和变脸形成鲜明的巴蜀戏曲风格。",
      tags: ["川剧", "变脸", "戏曲"]
    }),
    makeHeritageItem({
      id: "jingdezhen-porcelain",
      slug: "jingdezhen-porcelain",
      name: "景德镇陶瓷",
      categoryName: "传统技艺",
      summary: "中国陶瓷在世界舞台上延续新的传奇。",
      tags: ["陶瓷", "青花"]
    }),
    makeHeritageItem({
      id: "datiehua",
      slug: "datiehua",
      name: "打铁花",
      categoryName: "民俗活动",
      summary: "这一节庆展演从乡土庙会走上舞台。",
      tags: ["火花", "节庆"]
    })
  ];

  expect(rankHeritageItemsByIntent("戏曲", items, { locale: "zh", limit: 10 }).map((item) => item.slug))
    .toEqual(["chuanju"]);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/semantic-search.test.ts`

Expected: FAIL because `jingdezhen-porcelain` and `datiehua` receive points from the expanded term `舞台`.

### Task 3: Make Opera Intent Precise

**Files:**
- Modify: `lib/search/semantic-search.ts`
- Test: `tests/semantic-search.test.ts`

- [ ] **Step 1: Implement the minimal term correction**

Replace the opera group with:

```ts
{
  triggers: ["戏曲", "opera", "stage"],
  terms: ["戏曲", "川剧", "京剧", "唱念做打", "水磨腔", "脸谱", "opera"]
}
```

Do not alter tokenization, scoring, filters, vector retrieval, endpoint input, or endpoint output.

- [ ] **Step 2: Verify GREEN and protect adjacent intent behavior**

Run: `npm test -- tests/semantic-search.test.ts`

Expected: all semantic search tests PASS, including embroidery and child-friendly intent.

### Task 4: Add Curatorial Layout Contracts

**Files:**
- Modify: `tests/heritage-collection-list.test.ts`
- Test: `tests/heritage-collection-list.test.ts`

- [ ] **Step 1: Replace the uniform-grid expectation with a failing curatorial-grid expectation**

Assert the list contains `grid-cols-2`, `lg:grid-cols-12`, `data-collection-grid`, `collectionPlacements`, `lg:col-span-7`, and `<HeritageCard item={item} variant={placement.variant}`. Assert it no longer contains `lg:grid-cols-3`.

- [ ] **Step 2: Add a failing card-variant expectation**

Assert `heritage-card.tsx` defines:

```ts
type HeritageCardVariant = "feature" | "wide" | "standard";
```

Assert it contains `variant = "standard"`, mobile `aspect-[3/4]`, feature desktop `lg:aspect-[16/11]`, and variant-aware `sizes`. Retain all existing metadata and no-summary assertions.

- [ ] **Step 3: Run the focused test and verify RED**

Run: `npm test -- tests/heritage-collection-list.test.ts`

Expected: FAIL because the page still uses a uniform three-column grid and the card has no variant.

### Task 5: Implement the Approved Curatorial Wall

**Files:**
- Modify: `app/[locale]/heritage/page.tsx`
- Modify: `components/heritage/heritage-list-client.tsx`
- Modify: `components/heritage/heritage-card.tsx`
- Test: `tests/heritage-collection-list.test.ts`

- [ ] **Step 1: Add a bounded presentation variant to HeritageCard**

Add the exported variant type and a `variant` prop. Use a small lookup for image class and sizes:

```ts
export type HeritageCardVariant = "feature" | "wide" | "standard";

const imagePresentation = {
  feature: {
    className: "aspect-[3/4] lg:aspect-[16/11]",
    sizes: "(min-width: 1280px) 56vw, (min-width: 1024px) 54vw, 50vw"
  },
  wide: {
    className: "aspect-[3/4] lg:aspect-[4/3]",
    sizes: "(min-width: 1280px) 42vw, (min-width: 1024px) 40vw, 50vw"
  },
  standard: {
    className: "aspect-[3/4]",
    sizes: "(min-width: 1280px) 32vw, (min-width: 1024px) 34vw, 50vw"
  }
} satisfies Record<HeritageCardVariant, { className: string; sizes: string }>;
```

Compose the lookup class with `cn()`. Preserve `next/image`, object cover, hover restraint, focus styles, bilingual title order, region, and category. Remove no required metadata.

- [ ] **Step 2: Add deterministic placement data to the list client**

Define six repeating placements outside the component:

```ts
const collectionPlacements = [
  { className: "lg:col-span-7", variant: "feature" },
  { className: "lg:col-span-4 lg:col-start-9 lg:mt-24", variant: "standard" },
  { className: "lg:col-span-4 lg:mt-8", variant: "standard" },
  { className: "lg:col-span-7 lg:col-start-6", variant: "feature" },
  { className: "lg:col-span-5", variant: "wide" },
  { className: "lg:col-span-5 lg:col-start-8 lg:mt-20", variant: "wide" }
] satisfies Array<{ className: string; variant: HeritageCardVariant }>;
```

Map filtered items with `const placement = collectionPlacements[index % collectionPlacements.length]`. Keep the mobile wrapper unspanned, and apply placement classes only at `lg`. Change the grid to `grid-cols-2 lg:grid-cols-12`, retain `content-visibility:auto`, and use restrained horizontal/vertical gaps.

- [ ] **Step 3: Reduce the introduction band without changing SEO**

In `app/[locale]/heritage/page.tsx`, retain both JSON-LD blocks and all translation keys. Reduce the section from `pt-28 md:pt-36` plus large inner padding to a compact fixed-header-safe introduction, approximately `pt-24 md:pt-28` with `pb-9 pt-8 md:pb-12 md:pt-10`. Keep the title responsive and collection count visible.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- tests/heritage-collection-list.test.ts`

Expected: all collection list tests PASS.

### Task 6: Run Full Static Verification

**Files:** all modified files above.

- [ ] **Step 1: Run all tests**

Run: `npm test`

Expected: all tests PASS with no unhandled errors.

- [ ] **Step 2: Run TypeScript validation**

Run: `npm run typecheck`

Expected: exit code `0` with no TypeScript errors.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: production build succeeds and `/[locale]/heritage` plus detail routes generate without errors.

### Task 7: Playwright Desktop and Mobile Acceptance

**Files:** no production edits unless an acceptance defect is found; any defect follows a new RED/GREEN cycle.

- [ ] **Step 1: Verify desktop at 1440px**

Open `http://localhost:3000/zh/heritage` at `1440x1000`. Assert the first visible item spans more width than the second, every visible card image has `naturalWidth > 0`, no card uses `/assets/hero-museum.png`, and `document.documentElement.scrollWidth === window.innerWidth`.

- [ ] **Step 2: Verify search behavior in the UI**

Enter `戏曲`, wait for the debounced request, and assert `川剧` is visible while `景德镇陶瓷` and `打铁花` are absent.

- [ ] **Step 3: Verify mobile at 390px**

Open the same page at `390x844`. Assert the first two cards share a row, all visible card images load, text stays within its card width, the filter disclosure remains operable, and no horizontal overflow occurs.

- [ ] **Step 4: Capture acceptance screenshots**

Save desktop and mobile screenshots under `screenshots/` with `2026-07-20-heritage-collection-` prefixes. Inspect both images for overlap, accidental card backgrounds, weak crop choices, and inconsistent vertical rhythm.

## Completion Report

Report:

- the six final Cover/Hero URLs and unchanged Gallery counts;
- modified files;
- focused RED/GREEN test results;
- full `npm test`, `npm run typecheck`, and `npm run build` results;
- Playwright desktop/mobile findings and screenshot paths;
- explicit confirmation that Supabase schema, CMS structure, API contracts, and Feishu synchronization files were not modified.

Because `C:/Users/hy/.expo/huayun-ich` has no `.git` directory, commit steps are intentionally omitted; do not initialize a repository as part of this work.
