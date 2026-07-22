# Heritage Collection List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework `/{locale}/heritage` into an image-led "华韵收藏 / Collection" page with restrained search and filters, a desktop three-column grid, and a mobile two-column grid.

**Architecture:** Keep `app/[locale]/heritage/page.tsx` as the server-rendered data boundary and retain the existing parallel calls to `getHeritageItems()` and `getCategories()`. Keep `HeritageListClient` as the only interactive client boundary for semantic search and filters, and refine `HeritageCard` as a presentational component using the existing `HeritageItem` shape and `next/image`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, next-intl, Tailwind CSS, next/image, Lucide React, Vitest, Playwright.

---

## File Map

### Files To Modify

- `app/[locale]/heritage/page.tsx`: replace the archive hero with the minimal collection header while preserving metadata, JSON-LD, server data fetching, URL search parameters, and `HeritageListClient` props.
- `components/heritage/heritage-list-client.tsx`: keep semantic search behavior, reduce filter prominence, add a collapsible filter surface, and change the result grid to three desktop columns and two mobile columns.
- `components/heritage/heritage-card.tsx`: use a portrait image with metadata below the image and mobile-safe typography.
- `messages/zh.json`: add or revise collection-page and filter labels in Chinese.
- `messages/en.json`: add or revise the same labels in English.

### Files To Add

- `tests/heritage-collection-list.test.ts`: structural regression coverage for the page header, data boundary, search behavior, card fields, excluded copy, and responsive grid.
- `artifacts/heritage-collection-desktop.png`: generated 1440px verification screenshot.
- `artifacts/heritage-collection-mobile.png`: generated 390px verification screenshot.

### Files Explicitly Not Modified

- `lib/content/heritage-repository.ts`
- `app/api/**`
- `components/admin/**`
- `supabase/**`
- `lib/feishu-sync/**`
- `lib/types/database.ts`

## Data Reading

The page continues to execute:

```ts
const [items, categories] = await Promise.all([
  getHeritageItems(),
  getCategories()
]);
const provinces = getAvailableProvinces(items);
```

`items`, `categories`, `provinces`, and URL-derived initial filters continue to be passed into `HeritageListClient`. Local filtering remains `filterHeritageItems(items, { query, category, province })`; semantic search continues to POST to `/api/search` with the current locale and filters. No data transformation or CMS field is added.

---

### Task 1: Add Collection List Regression Coverage

**Files:**
- Create: `tests/heritage-collection-list.test.ts`

- [ ] **Step 1: Write the failing structural tests**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("heritage collection list", () => {
  it("keeps the existing server data and SEO boundaries", () => {
    const page = readFileSync("app/[locale]/heritage/page.tsx", "utf8");

    expect(page).toContain("Promise.all([getHeritageItems(), getCategories()])");
    expect(page).toContain("createItemListJsonLd");
    expect(page).toContain("createBreadcrumbJsonLd");
    expect(page).toContain("<HeritageListClient");
  });

  it("uses a restrained collection header without archive description copy", () => {
    const page = readFileSync("app/[locale]/heritage/page.tsx", "utf8");

    expect(page).toContain('data-page="heritage-collection"');
    expect(page).toContain('t("collectionTitle")');
    expect(page).toContain('t("collectionLabel")');
    expect(page).not.toContain('t("description")');
    expect(page).not.toContain("radial-gradient");
  });

  it("keeps semantic search and moves filters behind one disclosure", () => {
    const list = readFileSync("components/heritage/heritage-list-client.tsx", "utf8");

    expect(list).toContain('fetch("/api/search"');
    expect(list).toContain("filterHeritageItems");
    expect(list).toContain("filtersOpen");
    expect(list).toContain('aria-expanded={filtersOpen}');
    expect(list).toContain('t("filters")');
  });

  it("renders a three-column desktop and two-column mobile collection grid", () => {
    const list = readFileSync("components/heritage/heritage-list-client.tsx", "utf8");

    expect(list).toContain("grid-cols-2");
    expect(list).toContain("lg:grid-cols-3");
    expect(list).not.toContain("md:grid-cols-2");
  });

  it("renders only collection metadata below a portrait image", () => {
    const card = readFileSync("components/heritage/heritage-card.tsx", "utf8");

    for (const field of ["item.image", "item.name", "item.englishName", "item.region", "item.categoryName"]) {
      expect(card).toContain(field);
    }
    expect(card).toContain("aspect-[3/4]");
    expect(card).not.toContain("item.summary");
    expect(card).not.toContain("item.history");
    expect(card).not.toContain("inheritance");
    expect(card).not.toContain("from-black");
  });
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run: `npm test -- tests/heritage-collection-list.test.ts`

Expected: failures for the collection page marker, minimal header, filter disclosure, responsive grid, and portrait metadata card.

---

### Task 2: Replace The Archive Hero With A Collection Header

**Files:**
- Modify: `app/[locale]/heritage/page.tsx`
- Modify: `messages/zh.json`
- Modify: `messages/en.json`
- Test: `tests/heritage-collection-list.test.ts`

- [ ] **Step 1: Add bilingual collection labels**

Add these keys under `HeritageListPage`:

```json
// messages/zh.json
"collectionLabel": "Collection",
"collectionTitle": "华韵收藏",
"collectionCount": "馆藏 {count} 项"
```

```json
// messages/en.json
"collectionLabel": "Huayun Collection",
"collectionTitle": "Collection",
"collectionCount": "{count} works"
```

Keep the existing `meta`, breadcrumb, and legacy translation keys so no other route contract changes.

- [ ] **Step 2: Implement the restrained server-rendered header**

Replace only the current decorative header section with this composition:

```tsx
<section data-page="heritage-collection" className="border-b border-[#31594c]/10 bg-[#f4f1ea] pt-28 text-[#18231e] md:pt-36">
  <div className="museum-container flex items-end justify-between gap-8 pb-12 pt-10 md:pb-16 md:pt-16">
    <div>
      <p className="text-[11px] uppercase text-[#9b3b32]">{t("collectionLabel")}</p>
      <h1 className="serif-title mt-3 text-5xl font-normal leading-none sm:text-6xl md:text-7xl">
        {t("collectionTitle")}
      </h1>
    </div>
    <p className="shrink-0 pb-1 text-xs text-[#6f7973] md:text-sm">
      {t("collectionCount", { count: items.length })}
    </p>
  </div>
</section>
```

Do not move the existing `JsonLd`, metadata generation, `Promise.all`, `getAvailableProvinces`, or `HeritageListClient` props.

- [ ] **Step 3: Run the focused test**

Run: `npm test -- tests/heritage-collection-list.test.ts`

Expected: header and server-boundary assertions pass; filter and card assertions remain red.

---

### Task 3: Reduce Search And Filter Prominence

**Files:**
- Modify: `components/heritage/heritage-list-client.tsx`
- Modify: `messages/zh.json`
- Modify: `messages/en.json`
- Test: `tests/heritage-collection-list.test.ts`
- Test: `tests/semantic-search-ui.test.ts`

- [ ] **Step 1: Add bilingual interaction labels**

Add under `HeritageList`:

```json
// messages/zh.json
"filters": "筛选",
"hideFilters": "收起筛选",
"category": "分类",
"region": "地区",
"searching": "检索中",
"semanticSearch": "智能搜索",
"collectionView": "馆藏浏览"
```

```json
// messages/en.json
"filters": "Filters",
"hideFilters": "Hide filters",
"category": "Category",
"region": "Region",
"searching": "Searching",
"semanticSearch": "Semantic search",
"collectionView": "Collection view"
```

- [ ] **Step 2: Add the filter disclosure state without changing search state**

```tsx
const [filtersOpen, setFiltersOpen] = useState(false);

const searchStateLabel = isSemanticSearching
  ? t("searching")
  : semanticItems
    ? t("semanticSearch")
    : t("collectionView");
```

Keep the existing `query`, `category`, `province`, `semanticItems`, debounce, `AbortController`, request body, and local fallback logic unchanged.

- [ ] **Step 3: Replace the two always-visible filter rows with one quiet toolbar**

Use a border-only search field and a text/icon filter button:

```tsx
<div className="grid gap-3 border-b border-[#31594c]/12 pb-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
  <label className="relative block">
    <Search className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#66716b]" />
    <Input className="h-12 rounded-none border-0 border-b border-[#31594c]/20 bg-transparent px-0 pl-7 shadow-none focus-visible:ring-0" ... />
  </label>
  <Button
    type="button"
    variant="ghost"
    aria-expanded={filtersOpen}
    aria-controls="heritage-filters"
    onClick={() => setFiltersOpen((open) => !open)}
  >
    <SlidersHorizontal className="size-4" />
    {filtersOpen ? t("hideFilters") : t("filters")}
  </Button>
</div>
```

- [ ] **Step 4: Render category and province controls only inside the disclosure**

```tsx
{filtersOpen ? (
  <div id="heritage-filters" className="grid gap-6 border-b border-[#31594c]/10 py-6 md:grid-cols-2">
    <div>
      <p className="mb-3 text-[11px] uppercase text-[#7a847e]">{t("category")}</p>
      <div className="flex flex-wrap gap-x-1 gap-y-2">...</div>
    </div>
    <div>
      <p className="mb-3 text-[11px] uppercase text-[#7a847e]">{t("region")}</p>
      <div className="flex flex-wrap gap-x-1 gap-y-2">...</div>
    </div>
  </div>
) : null}
```

Retain the existing category/province button handlers and selected variants. Keep the result count and translated search state in a small row below the toolbar.

- [ ] **Step 5: Run search and collection UI tests**

Run: `npm test -- tests/heritage-collection-list.test.ts tests/semantic-search-ui.test.ts`

Expected: semantic search assertions pass and the filter disclosure assertions pass; card assertions remain red until Task 4.

---

### Task 4: Convert Cards To An Editorial Collection Grid

**Files:**
- Modify: `components/heritage/heritage-list-client.tsx`
- Modify: `components/heritage/heritage-card.tsx`
- Test: `tests/heritage-collection-list.test.ts`
- Test: `tests/collection-visual-redesign.test.ts`

- [ ] **Step 1: Set the responsive collection grid**

Replace the current result grid classes with:

```tsx
<div
  data-collection-grid
  className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 [content-visibility:auto] sm:gap-x-5 sm:gap-y-14 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-20"
>
```

This keeps two columns from 320px through tablet widths and changes to three only at `lg`.

- [ ] **Step 2: Render the image and metadata as separate layers**

Keep localized `title` and `subtitle`, but replace the overlay composition with:

```tsx
<article className="h-full min-w-0">
  <Link href={`/heritage/${item.slug}`} className="group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9b3b32]/60">
    <div className="relative aspect-[3/4] overflow-hidden rounded-[4px] bg-[#e8e4dc]">
      <Image
        src={item.image}
        alt={item.name}
        fill
        sizes="(min-width: 1024px) 33vw, 50vw"
        className="object-cover saturate-[0.92] transition duration-700 ease-out group-hover:scale-[1.025] group-hover:saturate-100 motion-reduce:transform-none"
      />
      <ArrowUpRight className="absolute right-3 top-3 size-4 text-white opacity-0 drop-shadow-sm transition group-hover:opacity-80 sm:right-4 sm:top-4" />
    </div>
    <div className="pt-3 sm:pt-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="serif-title min-w-0 text-lg font-normal leading-tight text-[#18231e] sm:text-2xl">{title}</h2>
        <span className="shrink-0 pt-1 text-[9px] text-[#7a847e] sm:text-[11px]">{item.categoryName}</span>
      </div>
      {subtitle ? <p className="mt-1 truncate text-[9px] uppercase text-[#7a847e] sm:text-[11px]">{subtitle}</p> : null}
      <p className="mt-2 text-[10px] text-[#59645e] sm:text-xs">{item.region}</p>
    </div>
  </Link>
</article>
```

Do not render `summary`, `history`, `inheritor`, inheritance value, or a dark gradient overlay.

- [ ] **Step 3: Run all focused visual structure tests**

Run: `npm test -- tests/heritage-collection-list.test.ts tests/collection-visual-redesign.test.ts tests/semantic-search-ui.test.ts`

Expected: all focused test files pass with zero failures.

---

### Task 5: Verify Build, Behavior, And Responsive Screenshots

**Files:**
- Create: `artifacts/heritage-collection-desktop.png`
- Create: `artifacts/heritage-collection-mobile.png`

- [ ] **Step 1: Run the complete automated verification**

Run:

```powershell
npm test
npm run typecheck
npm run build
```

Expected: all Vitest files pass, TypeScript exits with code 0, and Next.js production build completes while retaining `/[locale]/heritage`, sitemap, robots, and metadata routes.

- [ ] **Step 2: Start the production preview**

Run: `npm run start -- -H 127.0.0.1 -p 3000`

Expected: `http://127.0.0.1:3000/zh/heritage` and `/en/heritage` return HTTP 200.

- [ ] **Step 3: Capture desktop and mobile screenshots with Playwright**

Use Chromium headless with these viewports:

```py
page.set_viewport_size({"width": 1440, "height": 1000})
page.goto("http://127.0.0.1:3000/zh/heritage")
page.wait_for_load_state("networkidle")
page.screenshot(path="artifacts/heritage-collection-desktop.png", full_page=True)

page.set_viewport_size({"width": 390, "height": 844})
page.goto("http://127.0.0.1:3000/zh/heritage")
page.wait_for_load_state("networkidle")
page.screenshot(path="artifacts/heritage-collection-mobile.png", full_page=True)
```

- [ ] **Step 4: Inspect screenshots and rendered layout**

Verify:

- desktop collection grid renders exactly three columns;
- mobile collection grid renders exactly two columns;
- no horizontal scrollbar is present at 390px;
- image pixels are nonblank and use stable portrait frames;
- Chinese names, English names, category, and region do not overlap;
- the filter panel is closed initially, opens by click, and preserves search behavior;
- the long archive description, history, and inheritance copy do not appear;
- both Chinese and English routes render translated controls.

- [ ] **Step 5: Audit forbidden paths**

Confirm the implementation touched none of:

```text
supabase/
app/api/
components/admin/
lib/feishu-sync/
lib/types/database.ts
```

## Risk Points And Controls

1. **Mobile two-column text overflow:** long Chinese or English names may exceed narrow cards. Control with `min-w-0`, compact responsive font sizes, `truncate` only for the English subtitle, and screenshot inspection at 390px and 320px.
2. **Image bandwidth:** two-column mobile grids may request oversized images. Control with `next/image`, `fill`, a stable `aspect-[3/4]`, and `sizes="(min-width: 1024px) 33vw, 50vw"`.
3. **Search regression:** restructuring controls could accidentally alter debounce, request parameters, or local fallback. Control by leaving the effect body unchanged and retaining `semantic-search-ui.test.ts`.
4. **Filter discoverability:** hiding filters reduces prominence. Control with a visible icon-and-text `Filters/筛选` button, `aria-expanded`, and active result count/state.
5. **Hydration or layout shift:** avoid viewport-dependent JavaScript; use Tailwind breakpoints only and stable image aspect ratios.
6. **Bilingual layout:** English labels are longer than Chinese. Control with responsive gaps, flexible toolbar tracks, translated state labels, and screenshots or DOM checks on both locales.
7. **SEO regression:** retain metadata generation and both JSON-LD blocks unchanged; assert their presence in the new regression test and verify the production route table.
8. **Scope leakage:** no repository, API, schema, admin, or Feishu file is required. Audit forbidden paths before completion.

