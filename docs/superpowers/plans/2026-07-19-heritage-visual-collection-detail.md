# Heritage Visual Collection Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reframe heritage detail pages and routine CMS entry around visual collection media while preserving all existing data structures, APIs, synchronization, SEO, and stored records.

**Architecture:** Keep `heritage_items` and the current repository as the only public detail data source. Change composition at the detail page, make card-image fallback explicit in the repository mapper, and reorganize the existing admin form without changing its form state or serialized payload. Lock behavior with source-level and mapper regression tests before each production edit.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, next-intl, Supabase, Vitest, Playwright

---

## File Map

**Modify:**

- `app/[locale]/heritage/[slug]/page.tsx` - remove inheritor composition and preserve image-first section order.
- `lib/content/heritage-repository.ts` - enforce role-specific Cover and Hero fallback behavior.
- `components/admin/heritage-admin-client.tsx` - present legacy archive fields as a collapsed advanced area while preserving the full form state and payload.
- `tests/heritage-commercial-detail.test.ts` - verify public detail composition and section order.
- `tests/content-repository.test.ts` - verify Cover, Hero, and placeholder resolution.
- `tests/admin-project-media.test.ts` - preserve role assignment and media ordering controls.
- `tests/admin-validation.test.ts` - preserve legacy fields in validation and serialization.

**Create:** None.

**Explicitly untouched:**

- `supabase/**`
- `app/api/**`
- `lib/feishu-sync/**`
- `lib/types/database.ts`
- CMS payload field names and `heritage_items` schema

### Task 1: Lock Homepage Card Image Resolution

**Files:**

- Modify: `tests/content-repository.test.ts`
- Modify: `lib/content/heritage-repository.ts`

- [ ] **Step 1: Add failing mapper tests for strict media fallback**

Add fixtures that call `mapHeritageItemRow` with role-specific media. Assert these exact outcomes:

```ts
it("uses Cover, then Hero, then the placeholder for collection cards", () => {
  const coverAndHero = mapHeritageItemRow(createHeritageRow([
    createImageMedia("cover", "https://cdn.example/cover.webp", 1),
    createImageMedia("hero", "https://cdn.example/hero.webp", 2)
  ]));
  const heroOnly = mapHeritageItemRow(createHeritageRow([
    createImageMedia("hero", "https://cdn.example/hero-only.webp", 1)
  ]));
  const galleryOnly = mapHeritageItemRow(createHeritageRow([
    createImageMedia("gallery", "https://cdn.example/gallery.webp", 1)
  ]));

  expect(coverAndHero.image).toBe("https://cdn.example/cover.webp");
  expect(heroOnly.image).toBe("https://cdn.example/hero-only.webp");
  expect(galleryOnly.image).toBe("/assets/hero-museum.png");
});

it("uses Hero, then Cover, then the placeholder for the detail hero", () => {
  const coverOnly = mapHeritageItemRow(createHeritageRow([
    createImageMedia("cover", "https://cdn.example/cover-only.webp", 1)
  ]));

  expect(coverOnly.heroImage).toBe("https://cdn.example/cover-only.webp");
});
```

The existing test helpers may be extended rather than duplicated, but their returned rows must satisfy `HeritageItemSelectRow`.

- [ ] **Step 2: Run the focused test and verify the Gallery-only case fails**

Run:

```bash
npm test -- tests/content-repository.test.ts
```

Expected: FAIL because the current mapper can promote the first arbitrary image, including Gallery, to `image`.

- [ ] **Step 3: Implement strict role resolution in the repository mapper**

In `mapHeritageItemRow`, replace arbitrary first-image fallback with role-specific selection:

```ts
const defaultImage = "/assets/hero-museum.png";
const coverImage = findMedia(sortedMedia, "cover", "image");
const heroImage = findMedia(sortedMedia, "hero", "image");

// HeritageItem.image is the public collection-card image.
image: coverImage?.url ?? heroImage?.url ?? defaultImage,
heroImage: heroImage?.url ?? coverImage?.url ?? defaultImage,
```

Keep Gallery extraction role-specific and keep Poster/video resolution unchanged. Do not change queries, database rows, or API shapes.

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
npm test -- tests/content-repository.test.ts
```

Expected: PASS, including Gallery-only fallback to the placeholder.

- [ ] **Step 5: Review homepage data flow**

Confirm `components/home/home-cms-content.tsx` still selects only `item.featured` records and `components/home/featured-grid.tsx` still renders `item.image`. No homepage component change is expected.

### Task 2: Make the Detail Page Image-first

**Files:**

- Modify: `tests/heritage-commercial-detail.test.ts`
- Modify: `app/[locale]/heritage/[slug]/page.tsx`

- [ ] **Step 1: Add failing composition assertions**

Update the source-based regression test to require the retained modules and forbid inheritor composition:

```ts
expect(source).toContain("<DetailHero");
expect(source).toContain("<CraftMediaGallery");
expect(source).toContain("<MakingProcess");
expect(source).toContain('data-section="collection-facts"');
expect(source).toContain("<FutureWorksPreview");
expect(source).toContain("<HeritageVideoArchive");
expect(source).not.toContain("<InheritorProfile");
expect(source).not.toContain("<Timeline");
expect(source).not.toContain("<StoryNarrative");
```

Add an order assertion:

```ts
const order = [
  source.indexOf("<DetailHero"),
  source.indexOf("<CraftMediaGallery"),
  source.indexOf("<MakingProcess"),
  source.indexOf('data-section="collection-facts"'),
  source.indexOf("<FutureWorksPreview"),
  source.indexOf("<HeritageVideoArchive")
];

expect(order.every((position) => position >= 0)).toBe(true);
expect(order).toEqual([...order].sort((left, right) => left - right));
```

- [ ] **Step 2: Run the focused test and verify it fails on the inheritor module/order**

Run:

```bash
npm test -- tests/heritage-commercial-detail.test.ts
```

Expected: FAIL because `InheritorProfile` is currently imported and rendered between facts and future works.

- [ ] **Step 3: Remove inheritor composition only**

In `app/[locale]/heritage/[slug]/page.tsx`:

- Remove the `InheritorProfile` import.
- Remove the `<InheritorProfile ... />` block.
- Leave repository fields, CMS fields, API payloads, and the component file intact.
- Keep `DetailHero`, `CraftMediaGallery`, `MakingProcess`, facts, `FutureWorksPreview`, conditional video, favorites, consultation, metadata, JSON-LD, and browsing history.

The resulting public order must be:

```text
Hero -> Gallery -> Making Process -> Region/Category Facts -> Future Works -> Video (when present)
```

- [ ] **Step 4: Run detail regression tests**

Run:

```bash
npm test -- tests/heritage-commercial-detail.test.ts tests/heritage-detail-museum.test.ts
```

Expected: PASS. If the older museum test requires the inheritor module, update only that obsolete presentation assertion; do not weaken SEO, Gallery, or conditional-video assertions.

### Task 3: Preserve Gallery and Media Ordering Controls

**Files:**

- Modify: `tests/admin-project-media.test.ts`
- Verify only: `components/admin/project-media-manager.tsx`

- [ ] **Step 1: Extend the media-management regression test**

Assert that the project media manager retains all required controls and role values:

```ts
expect(source).toContain('<option value="gallery">');
expect(source).toContain('<option value="hero">');
expect(source).toContain('action: "set-cover"');
expect(source).toContain('action: "set-main-video"');
expect(source).toContain('action: "move"');
expect(source).toContain('direction?: "up" | "down"');
```

Also assert Gallery rendering consumes repository order without a client-side re-sort. The test should reject a newly introduced `.sort(` call applied to the `images` collection in `ProjectMediaManager`.

- [ ] **Step 2: Run the focused test**

Run:

```bash
npm test -- tests/admin-project-media.test.ts
```

Expected: PASS against the current media manager. This is a characterization gate: if it fails, stop and reconcile the exact current control strings before production changes.

- [ ] **Step 3: Confirm no production media change is required**

Review `components/admin/project-media-manager.tsx` and confirm:

- Upload role includes Hero and Gallery.
- Any uploaded image can be promoted to Cover.
- Media cards can move up and down.
- A video can be set as main video.
- Existing sort order is used by `mapHeritageItemRow` for Gallery and video arrays.

Do not modify media APIs or storage behavior unless this review disproves one of those statements; any discrepancy requires a revised plan before implementation.

### Task 4: Simplify Routine CMS Entry Without Data Loss

**Files:**

- Modify: `tests/admin-validation.test.ts`
- Modify: `components/admin/heritage-admin-client.tsx`

- [ ] **Step 1: Add preservation and presentation tests**

Keep a validation test proving advanced values survive validation:

```ts
const result = validateHeritagePayload({
  ...validHeritagePayload,
  history: "第一段\n第二段",
  timeline: "2000 | 事件 | 描述",
  inscriptionYear: "2006",
  latitude: "31.2304",
  longitude: "121.4737",
  inheritorName: "示例传承人",
  inheritorTitle: "代表性传承人",
  inheritorBio: "现有资料",
  tags: "工艺, 收藏",
  relatedSlugs: "suzhou-embroidery"
});

expect(result.ok).toBe(true);
if (result.ok) {
  expect(result.data.history).toEqual(["第一段", "第二段"]);
  expect(result.data.timeline).toEqual([{ year: "2000", title: "事件", description: "描述" }]);
  expect(result.data.inheritorName).toBe("示例传承人");
}
```

Add a source-level test for the admin client:

```ts
expect(adminSource).toContain('data-section="advanced-archive-fields"');
expect(adminSource).toContain("heritageForm.history");
expect(adminSource).toContain("heritageForm.timeline");
expect(adminSource).toContain("heritageForm.inheritorName");
expect(adminSource).toContain("JSON.stringify(heritageForm)");
```

- [ ] **Step 2: Run the focused tests and verify the presentation marker fails**

Run:

```bash
npm test -- tests/admin-validation.test.ts
```

Expected: FAIL on the missing `advanced-archive-fields` presentation marker while payload-preservation assertions pass.

- [ ] **Step 3: Reorganize the existing editor UI**

In `components/admin/heritage-admin-client.tsx`:

- Keep the primary `heritage` tab focused on name, Slug, English name, category, region, province, city, summary, published, and featured.
- Rename the user-facing editor tab/heading to “高级资料” / “Advanced archive data” using the component's current locale pattern.
- Move the existing inscription year, latitude, longitude, Map X, and Map Y controls out of the primary project form and into the advanced area without changing their bindings.
- Wrap those moved controls together with history, timeline, tags, related Slugs, legacy video URL, and inheritor controls in a closed-by-default native details element:

```tsx
<details data-section="advanced-archive-fields" className="group">
  <summary className="cursor-pointer list-none">高级资料</summary>
  <div className="mt-6">
    {/* Existing controls, unchanged bindings */}
  </div>
</details>
```

- Keep all controls bound to the existing `heritageForm` object.
- Keep `saveHeritage()` serializing `JSON.stringify(heritageForm)`.
- Do not change `HeritageFormState`, validation rules, endpoint paths, or payload keys.
- Do not clear hidden fields when changing tabs or saving basic fields.

- [ ] **Step 4: Run focused CMS tests**

Run:

```bash
npm test -- tests/admin-validation.test.ts tests/admin-project-media.test.ts
```

Expected: PASS with legacy data preservation and media controls intact.

### Task 5: Full Automated Verification

**Files:** No production edits expected.

- [ ] **Step 1: Run the complete test suite**

Run:

```bash
npm test
```

Expected: all Vitest files and tests pass with zero failures.

- [ ] **Step 2: Run TypeScript validation**

Run:

```bash
npm run typecheck
```

Expected: exit code 0 and no TypeScript errors.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: Next.js production build completes, localized detail routes generate, and no metadata or JSON-LD compilation errors occur.

- [ ] **Step 4: Audit forbidden paths**

Use the workspace's available change-tracking mechanism to confirm no changed files exist under:

```text
supabase/
app/api/
lib/feishu-sync/
lib/types/database.ts
```

Expected: no changes in forbidden paths.

### Task 6: Desktop, Mobile, and CMS Acceptance

**Files:** No production edits expected unless an acceptance failure is first reproduced in a regression test.

- [ ] **Step 1: Start the production server**

Run:

```bash
npm run start -- -p 3004
```

Expected: server listens on `http://127.0.0.1:3004`.

- [ ] **Step 2: Validate Chinese and English detail pages with Playwright**

Use an existing published item with Hero, Cover, at least two Gallery images, and video where available. Check desktop at 1440x1000 and mobile at 390x844.

Acceptance assertions:

```text
- Hero is the first content section and is not blank.
- Chinese and English names fit without overlap.
- Gallery immediately follows Hero.
- Gallery image order matches CMS order.
- Making-process image order matches Gallery order.
- Only region and category appear in the facts band.
- No inheritor, history, timeline, or cultural-value section is visible.
- Future works and consultation actions remain visible.
- Video appears only when media exists.
- No horizontal overflow or incoherent text/image overlap occurs.
```

Capture one desktop and one mobile screenshot for review.

- [ ] **Step 3: Validate fallback records**

Check one item with Hero but no Cover and one item with neither role if fixtures or existing records are available:

```text
- Featured/list card uses Hero when Cover is absent.
- Card uses the default placeholder when both Cover and Hero are absent.
- A Gallery image is never promoted to featured-card Cover.
- Missing Gallery, making-process, inheritor, or video data leaves no empty section.
```

- [ ] **Step 4: Validate the CMS workflow manually**

Without changing the schema or APIs, confirm:

```text
- Primary entry fields are immediately visible.
- Advanced archive data is closed by default.
- Opening it reveals existing history, timeline, location, tags, related items, legacy URL, and inheritor values.
- Saving a basic-field change preserves every advanced value.
- Cover and main-video actions remain available.
- Hero and Gallery roles remain assignable.
- Images and videos can still move up and down.
```

- [ ] **Step 5: Stop the verification server and report results**

Stop only the process started for port 3004. Report modified files, tests, typecheck, build, desktop/mobile results, CMS ordering results, and any remaining content-quality gaps.

## Plan Self-review

- Every approved public module is mapped to Task 2 or Task 6.
- Media ordering and Cover-to-Hero-to-placeholder rules are mapped to Tasks 1 and 3.
- CMS simplification and advanced-data preservation are mapped to Task 4.
- SEO, localized routes, schema/API/Feishu constraints are covered by Tasks 5 and 6.
- No new field, table, API, Product, Offer, or synchronization change is planned.
- No `TBD`, `TODO`, or deferred implementation placeholder remains.
