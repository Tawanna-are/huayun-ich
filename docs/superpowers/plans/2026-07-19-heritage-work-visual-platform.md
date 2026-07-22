# Heritage Work Visual Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the public project detail and routine CMS experience to a work-image-first flow while preserving every existing schema, payload, synchronization, media, and hidden advanced-field value.

**Architecture:** Keep `heritage_items` and the existing repository mapper unchanged as the data boundary. Recompose the server-rendered detail page into Hero, Gallery, conditional Video, Project Information, and conditional Consultation; hide the CMS advanced editor at the presentation layer while continuing to load and serialize the full `heritageForm`. Preserve existing card fallback and media-order behavior through regression tests.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, next-intl, Supabase, Vitest, Playwright

---

## File Map

**Create:**

- `tests/heritage-work-visual-platform.test.ts` - focused source-level contract for the new public composition and CMS visibility.

**Modify:**

- `app/[locale]/heritage/[slug]/page.tsx` - implement the exact five-stage public flow.
- `components/heritage/consultation-panel.tsx` - add a semantic detail-footer trigger entry point without changing contact behavior.
- `components/admin/heritage-admin-client.tsx` - remove advanced archive controls from normal CMS presentation while preserving full form state and serialization.
- `tests/heritage-commercial-detail.test.ts` - replace superseded Making Process and Future Works expectations.
- `tests/heritage-detail-museum.test.ts` - align the minimal detail composition assertion.
- `tests/collection-visual-redesign.test.ts` - align the older phase-one detail assertion.
- `tests/admin-validation.test.ts` - assert hidden-data preservation instead of visible folded controls.

**Verify without production changes:**

- `lib/content/heritage-repository.ts` - Cover, Hero, placeholder mapping.
- `components/admin/project-media-manager.tsx` - Cover, Hero, Gallery, video roles and ordering.
- `tests/content-repository.test.ts`
- `tests/admin-project-media.test.ts`

**Explicitly untouched:**

- `supabase/**`
- `app/api/**`
- `lib/feishu-sync/**`
- `lib/types/database.ts`
- `heritage_items` fields and existing media records

The workspace is not a Git repository, so branch, worktree, commit, and PR steps are unavailable. Implementation must rely on exact file-scope review and command verification.

### Task 1: Lock the New Public Detail Contract

**Files:**

- Create: `tests/heritage-work-visual-platform.test.ts`
- Test: `app/[locale]/heritage/[slug]/page.tsx`

- [ ] **Step 1: Write the failing public-composition test**

Create the test with these assertions:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("heritage work visual platform", () => {
  const pagePath = "app/[locale]/heritage/[slug]/page.tsx";

  it("uses the approved work-image-first detail order", () => {
    const page = readFileSync(pagePath, "utf8");
    const order = [
      page.indexOf("<DetailHero"),
      page.indexOf("<CraftMediaGallery"),
      page.indexOf("<HeritageVideoArchive"),
      page.indexOf('data-section="project-information"'),
      page.indexOf('data-section="consultation-cooperation"')
    ];

    expect(order.every((position) => position >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((left, right) => left - right));
  });

  it("removes archive and speculative public modules", () => {
    const page = readFileSync(pagePath, "utf8");

    expect(page).not.toContain("<MakingProcess");
    expect(page).not.toContain("<FutureWorksPreview");
    expect(page).not.toContain("<InheritorProfile");
    expect(page).not.toContain("<Timeline");
    expect(page).not.toContain("item.history");
  });

  it("renders video and consultation only when data is available", () => {
    const page = readFileSync(pagePath, "utf8");

    expect(page).toContain("const hasVideo = Boolean(item.videoUrl || item.videos?.length)");
    expect(page).toContain("{hasVideo ? <HeritageVideoArchive");
    expect(page).toContain("commercialContact.hasChannels ? (");
    expect(page).toContain('<ConsultationTrigger entryPoint="detail-footer"');
  });

  it("keeps repository, SEO, locale, and user boundaries", () => {
    const page = readFileSync(pagePath, "utf8");

    expect(page).toContain("getHeritageBySlug(slug)");
    expect(page).toContain("generateStaticParams");
    expect(page).toContain("createMetadata");
    expect(page).toContain("createCreativeWorkJsonLd");
    expect(page).toContain("BrowsingHistoryTracker");
    expect(page).toContain("FavoriteButton");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- tests/heritage-work-visual-platform.test.ts
```

Expected: FAIL because Making Process and Future Works are still composed, Video is after information, and the new section markers do not exist.

### Task 2: Implement Hero, Gallery, Optional Video, Information, Consultation

**Files:**

- Modify: `app/[locale]/heritage/[slug]/page.tsx`
- Modify: `components/heritage/consultation-panel.tsx`
- Test: `tests/heritage-work-visual-platform.test.ts`

- [ ] **Step 1: Extend the consultation entry-point type**

Change only the local client-component union:

```ts
type EntryPoint = "hero" | "inheritor" | "future-works" | "detail-footer";
```

Do not change the dialog, public contact configuration, API behavior, or contact channel logic.

- [ ] **Step 2: Remove superseded detail imports and Hero consultation props**

In `page.tsx`:

- Remove `FutureWorksPreview` and `MakingProcess` imports.
- Keep their component files unchanged.
- Remove `consultationAvailable` and `consultationAction` from the `<DetailHero>` call so the primary page flow ends with the dedicated consultation section.
- Keep `ConsultationProvider` around the article so the bottom trigger and existing mobile behavior own one accessible dialog.

- [ ] **Step 3: Update localized presentation copy**

Change the local copy object to:

```ts
zh: {
  galleryEyebrow: "Work Images",
  galleryTitle: "作品影像",
  galleryDescription: "作品、细节与现场。",
  factsEyebrow: "Project Information",
  factsTitle: "项目信息",
  categoryLabel: "分类",
  regionLabel: "地区",
  videoEyebrow: "Moving Image",
  videoTitle: "项目影像",
  videoDescription: "现场动作与声音记录。",
  consultationEyebrow: "Consultation",
  consultationTitle: "咨询合作",
  closePreview: "关闭图片预览"
},
en: {
  galleryEyebrow: "Work Images",
  galleryTitle: "Work Gallery",
  galleryDescription: "Work, detail and place.",
  factsEyebrow: "Project Information",
  factsTitle: "Project Details",
  categoryLabel: "Category",
  regionLabel: "Region",
  videoEyebrow: "Moving Image",
  videoTitle: "Project Film",
  videoDescription: "Gesture and sound recorded in place.",
  consultationEyebrow: "Consultation",
  consultationTitle: "Consultation & Cooperation",
  closePreview: "Close image preview"
}
```

- [ ] **Step 4: Recompose the article in the exact order**

After `<CraftMediaGallery>`, use this composition:

```tsx
{hasVideo ? (
  <HeritageVideoArchive
    item={item}
    eyebrow={copy.videoEyebrow}
    title={copy.videoTitle}
    description={copy.videoDescription}
  />
) : null}

<section data-section="project-information" className="border-y border-[#31594c]/10 bg-[#fffefa] py-14 md:py-20">
  {/* Keep the existing two-value Region and Category dl and FavoriteButton. */}
</section>

{commercialContact.hasChannels ? (
  <section data-section="consultation-cooperation" className="bg-[#102c28] py-16 text-[#f8f4e9] md:py-24">
    <div className="museum-container flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
      <Reveal>
        <p className="text-[11px] uppercase text-[#d3bea0]">{copy.consultationEyebrow}</p>
        <h2 className="serif-title mt-2 text-3xl font-normal md:text-5xl">{copy.consultationTitle}</h2>
      </Reveal>
      <Reveal delay={0.06}>
        <ConsultationTrigger entryPoint="detail-footer" />
      </Reveal>
    </div>
  </section>
) : null}
```

Delete the existing `<MakingProcess>`, `<FutureWorksPreview>`, and bottom Video rendering blocks. Do not add empty-state UI.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
npm test -- tests/heritage-work-visual-platform.test.ts
```

Expected: all four tests pass.

### Task 3: Align Earlier Detail Regression Tests

**Files:**

- Modify: `tests/heritage-commercial-detail.test.ts`
- Modify: `tests/heritage-detail-museum.test.ts`
- Modify: `tests/collection-visual-redesign.test.ts`

- [ ] **Step 1: Replace obsolete component expectations**

In all three test files:

- Require `DetailHero`, `CraftMediaGallery`, conditional `HeritageVideoArchive`, `project-information`, `consultation-cooperation`, and `ConsultationProvider` where applicable.
- Assert absence of `<MakingProcess`, `<FutureWorksPreview`, `<InheritorProfile`, `<Timeline`, and `item.history`.
- Keep SEO, JSON-LD, repository, favorite, browsing-history, Gallery accessibility, and video tracking assertions.
- Component-existence tests may continue proving the removed component files still exist; do not require their public composition.

Use this order contract in the commercial-detail test:

```ts
const order = [
  page.indexOf("<DetailHero"),
  page.indexOf("<CraftMediaGallery"),
  page.indexOf("<HeritageVideoArchive"),
  page.indexOf('data-section="project-information"'),
  page.indexOf('data-section="consultation-cooperation"')
];

expect(order.every((position) => position >= 0)).toBe(true);
expect(order).toEqual([...order].sort((left, right) => left - right));
```

- [ ] **Step 2: Run all detail tests**

Run:

```bash
npm test -- tests/heritage-work-visual-platform.test.ts tests/heritage-commercial-detail.test.ts tests/heritage-detail-museum.test.ts tests/collection-visual-redesign.test.ts
```

Expected: all detail regression files pass.

### Task 4: Hide Advanced CMS Presentation While Preserving Data

**Files:**

- Modify: `tests/admin-validation.test.ts`
- Modify: `tests/heritage-work-visual-platform.test.ts`
- Modify: `components/admin/heritage-admin-client.tsx`

- [ ] **Step 1: Write failing CMS visibility and preservation assertions**

Add to `heritage-work-visual-platform.test.ts`:

```ts
it("shows only routine basic and media CMS destinations", () => {
  const admin = readFileSync("components/admin/heritage-admin-client.tsx", "utf8");

  expect(admin).toContain('{ id: "heritage", label: "非遗项目"');
  expect(admin).toContain('{ id: "media", label: "图片/视频"');
  expect(admin).not.toContain('{ id: "editor"');
  expect(admin).not.toContain('data-section="advanced-archive-fields"');
});

it("keeps hidden advanced values in full form state and save payload", () => {
  const admin = readFileSync("components/admin/heritage-admin-client.tsx", "utf8");

  for (const field of [
    "history", "timeline", "inscriptionYear", "latitude", "longitude",
    "mapX", "mapY", "inheritorName", "inheritorTitle", "inheritorBio",
    "inheritorImageUrl", "tags", "relatedSlugs", "videoUrl"
  ]) {
    expect(admin).toContain(`${field}:`);
  }
  expect(admin).toContain("function rowToHeritageForm");
  expect(admin).toContain("JSON.stringify(heritageForm)");
});
```

Update the existing `admin-validation.test.ts` source test to assert hidden presentation:

```ts
expect(source).not.toContain('data-section="advanced-archive-fields"');
expect(source).not.toContain('{ id: "editor"');
expect(source).toContain("JSON.stringify(heritageForm)");
```

Retain the real `validateHeritagePayload` test proving advanced values parse and survive.

- [ ] **Step 2: Run focused CMS tests and verify RED**

Run:

```bash
npm test -- tests/heritage-work-visual-platform.test.ts tests/admin-validation.test.ts
```

Expected: FAIL because the Advanced Data tab and folded controls are still rendered.

- [ ] **Step 3: Remove only the advanced CMS presentation**

In `heritage-admin-client.tsx`:

- Remove `"editor"` from `AdminTab`.
- Remove the Advanced Data entry from the `tabs` array.
- Remove the complete `{tab === "editor" ? (...) : null}` JSX block.
- Remove `CheckCircle2` only if it becomes unused.
- Keep every advanced key in `HeritageFormState`.
- Keep every advanced default in `emptyHeritageForm`.
- Keep every advanced mapping in `rowToHeritageForm`.
- Keep `saveHeritage()` using `JSON.stringify(heritageForm)`.
- Do not change `validateHeritagePayload`, endpoint paths, request methods, or API files.

- [ ] **Step 4: Run focused CMS tests and verify GREEN**

Run:

```bash
npm test -- tests/heritage-work-visual-platform.test.ts tests/admin-validation.test.ts
```

Expected: tests pass, proving advanced UI is hidden while full values remain in state and serialization.

### Task 5: Protect Media Roles, Ordering, and Card Fallback

**Files:**

- Verify: `tests/admin-project-media.test.ts`
- Verify: `tests/content-repository.test.ts`
- Verify: `components/admin/project-media-manager.tsx`
- Verify: `lib/content/heritage-repository.ts`

- [ ] **Step 1: Run media and mapper regression tests**

Run:

```bash
npm test -- tests/admin-project-media.test.ts tests/content-repository.test.ts
```

Expected: PASS with assertions for:

```text
- Cover selection
- Hero and Gallery upload roles
- Main-video selection
- Move up/down ordering
- No client-side image re-sort
- Card image: Cover -> Hero -> placeholder
- Detail image: Hero -> Cover -> placeholder
- Gallery-only media never becomes a card cover
```

- [ ] **Step 2: Confirm no media production change is necessary**

If the focused tests pass, do not edit the media manager, repository mapper, storage code, media API, or database. If a test fails, stop and revise the plan before changing those protected systems.

### Task 6: Complete Automated Verification

**Files:** No production changes expected.

- [ ] **Step 1: Run all tests**

Run:

```bash
npm test
```

Expected: all Vitest files pass with zero failures.

- [ ] **Step 2: Run TypeScript checking**

Run:

```bash
npm run typecheck
```

Expected: exit code 0 with no TypeScript errors.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: Next.js compiles and generates all localized static routes without metadata or JSON-LD errors.

- [ ] **Step 4: Audit protected paths**

Confirm implementation did not edit:

```text
supabase/
app/api/
lib/feishu-sync/
lib/types/database.ts
```

Also confirm no migration, field, API, or Feishu file was created.

### Task 7: Playwright Desktop, Mobile, and Conditional-state QA

**Files:** Temporary scripts and screenshots must remain outside the repository.

- [ ] **Step 1: Start the production server on a free port**

Run:

```bash
npm run start -- -p 3004
```

Expected: `http://127.0.0.1:3004` listens successfully.

- [ ] **Step 2: Test the primary detail flow**

Use a published project with Hero, multiple Gallery images, and video. Validate at 1440x1000 and 390x844:

```text
- Hero image loads and title/summary do not overlap.
- Gallery follows Hero and all images load in CMS order.
- Gallery preview opens and closes with focus restoration.
- Video follows Gallery.
- Project Information follows Video and contains only Region and Category.
- Consultation is last when channels are configured.
- Making Process, Future Works, Inheritor, History, and Timeline are absent.
- No framework overlay, console error, broken image, or horizontal overflow exists.
```

- [ ] **Step 3: Test a no-video detail**

Use an existing published item without `videoUrl` and without uploaded videos. Assert:

```text
- No video heading or wrapper exists.
- Project Information follows Gallery directly.
- No empty vertical gap remains.
```

If no such production record exists, test this condition through the `hasVideo` regression contract and report the missing runtime fixture explicitly.

- [ ] **Step 4: Test CMS visible navigation**

After authenticating with the existing admin key:

```text
- Non-heritage identity and media tabs that already exist remain functional.
- The project editor exposes basic identity, summary, published, and featured fields.
- Media management exposes Cover, Hero, Gallery, optional video, main-video, and ordering controls.
- Advanced Data is absent from visible navigation.
- No existing content or media is modified during inspection.
```

- [ ] **Step 5: Stop only the temporary QA server and report**

Report modified files, new files, test/typecheck/build results, desktop/mobile evidence, conditional-video coverage, consultation configuration status, and confirmation that protected systems remain unchanged.

## Plan Self-review

- The exact public order is implemented and tested in Tasks 1-3 and 7.
- All five removed public modules are explicitly excluded.
- CMS simplification and hidden-value preservation are both covered in Task 4.
- Existing media behavior and strict card fallback are protected without planned production edits.
- No Supabase, `heritage_items`, API, Feishu, or existing-data mutation is planned.
- No placeholder, deferred implementation instruction, or undefined type remains.

