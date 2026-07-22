# Heritage Commercial Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the localized heritage detail page into a premium cultural showcase with existing-data process and inheritor sections, a clearly labeled future-works preview, and a unified consultation panel.

**Architecture:** Keep `app/[locale]/heritage/[slug]/page.tsx` as the server-rendered data and SEO boundary using the existing `getHeritageBySlug(slug)` call. Add focused display-only server components for process, inheritor, and future works, plus one client consultation component that reads a serialized global contact configuration and owns dialog/sticky-bar interaction.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, next-intl, Tailwind CSS, next/image, native `<dialog>`, Lucide React, Vitest, Playwright.

---

## File Map

### Files To Modify

- `app/[locale]/heritage/[slug]/page.tsx`: compose the commercial detail sequence while preserving repository loading, metadata, canonical URLs, Open Graph, CreativeWork JSON-LD, breadcrumb JSON-LD, favorites, and browsing history.
- `components/heritage/detail-hero.tsx`: add a restrained consultation trigger slot and commercial-availability label without changing hero image sourcing.
- `messages/zh.json`: add Chinese section, status, consultation, contact, and accessibility labels.
- `messages/en.json`: add matching English labels.
- `.env.example`: document optional public global contact variables only; do not write real contact values or secrets.
- `tests/heritage-detail-museum.test.ts`: replace assertions that intentionally excluded inheritor presentation and extend the expected composition.

### Files To Add

- `lib/config/commercial-contact.ts`: normalize global public contact configuration and expose whether any usable channel exists.
- `components/heritage/making-process.tsx`: render an existing-gallery-based numbered visual process sequence.
- `components/heritage/inheritor-profile.tsx`: render a real mapped inheritor and suppress repository fallback content.
- `components/heritage/future-works-preview.tsx`: render existing-media preview tiles with a fixed Coming Soon state.
- `components/heritage/consultation-panel.tsx`: client-owned `ConsultationProvider`, context-backed triggers, native dialog, QR/email/telephone channels, focus return, body-scroll lock, and mobile sticky action.
- `tests/heritage-commercial-detail.test.ts`: structural regression coverage for data boundaries, component composition, field mappings, commercial restrictions, localization, and SEO preservation.
- `tests/commercial-contact-config.test.ts`: unit coverage for contact normalization and channel availability.
- `public/assets/contact/wechat-service-qr.webp`: user-supplied real WeChat customer-service QR asset.
- `public/assets/contact/enterprise-cooperation-qr.webp`: user-supplied real enterprise cooperation QR asset.

### Verification Artifacts Outside Source

- `C:/tmp/heritage-commercial-detail-desktop.png`
- `C:/tmp/heritage-commercial-detail-mobile.png`
- `C:/tmp/heritage-commercial-consultation-mobile.png`

### Files Explicitly Not Modified

- `lib/content/heritage-repository.ts`
- `lib/types/heritage.ts`
- `lib/types/database.ts`
- `app/api/**`
- `components/admin/**`
- `supabase/**`
- `lib/feishu-sync/**`

## Data Reading And Existing Field Mapping

The route keeps its current read path:

```ts
const item = await getHeritageBySlug(slug);
if (!item) notFound();
```

No second CMS query or client data request is introduced.

| UI section | Existing field | Implementation rule |
|---|---|---|
| Hero title | `item.name`, `item.englishName` | Use the existing locale-dependent title/subtitle logic |
| Hero summary | `item.summary` | Render one concise paragraph; hide when empty |
| Hero image | `item.heroImage || item.image` | Preserve current `priority`, `sizes`, and fallback behavior |
| Collection gallery | `item.gallery` | Keep current `CraftMediaGallery` and lightbox |
| Making process | ordered `item.gallery` | Number existing images; show caption only when present; never invent steps |
| Process film | `item.videoUrl`, `item.videos` | Keep `HeritageVideoArchive`; hide when no video exists |
| Inheritor | `item.inheritor.name/title/bio/image` | Hide the whole section for known repository fallback values |
| Future works | `item.image`, `item.heroImage`, `item.gallery` | Deduplicate URLs, use at most three, label every tile Coming Soon |
| Facts | `item.region`, `item.categoryName` | Keep current collection facts and favorite action |
| Consultation context | `item.id`, `item.slug`, localized display name | Pass as serializable props to the consultation client component |

## Global Consultation Configuration

Use optional public environment variables because the information is global, non-secret, and not heritage content:

```dotenv
NEXT_PUBLIC_WECHAT_SERVICE_QR=/assets/contact/wechat-service-qr.webp
NEXT_PUBLIC_ENTERPRISE_COOPERATION_QR=/assets/contact/enterprise-cooperation-qr.webp
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_CONTACT_PHONE=
```

The implementation must never add these values to `heritage_items`, Supabase, an API route, or Feishu. Empty channels are hidden. If all four channels are absent, every consultation trigger is hidden.

---

### Task 1: Establish Commercial Detail Regression Tests

**Files:**
- Create: `tests/heritage-commercial-detail.test.ts`
- Modify: `tests/heritage-detail-museum.test.ts`

- [ ] **Step 1: Write failing route and component-boundary tests**

Create tests that assert:

```ts
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("heritage commercial detail", () => {
  const pagePath = "app/[locale]/heritage/[slug]/page.tsx";

  it("keeps the existing repository and SEO boundaries", () => {
    const page = readFileSync(pagePath, "utf8");
    expect(page).toContain("getHeritageBySlug(slug)");
    expect(page).toContain("generateStaticParams");
    expect(page).toContain("createMetadata");
    expect(page).toContain("createCreativeWorkJsonLd");
    expect(page).toContain("createBreadcrumbJsonLd");
    expect(page).not.toContain("Product");
    expect(page).not.toContain("Offer");
  });

  it("composes process, inheritor, future works and consultation from existing data", () => {
    const page = readFileSync(pagePath, "utf8");
    for (const component of ["MakingProcess", "InheritorProfile", "FutureWorksPreview", "ConsultationPanel"]) {
      expect(page).toContain(component);
    }
    expect(page).toContain("item.gallery");
    expect(page).toContain("item.inheritor");
    expect(page).toContain("item.heroImage");
    expect(page).toContain("item.image");
  });

  it("adds focused components without backend changes", () => {
    for (const path of [
      "components/heritage/making-process.tsx",
      "components/heritage/inheritor-profile.tsx",
      "components/heritage/future-works-preview.tsx",
      "components/heritage/consultation-panel.tsx",
      "lib/config/commercial-contact.ts"
    ]) expect(existsSync(path)).toBe(true);
  });
});
```

- [ ] **Step 2: Update the old minimal-detail expectation before production edits**

Replace the old `expect(page).not.toContain("item.inheritor.bio")` assertion with positive composition assertions for the new `InheritorProfile` component while retaining exclusions for history, inheritance value, timeline, and related-item article sections.

- [ ] **Step 3: Run RED verification**

Run: `npm.cmd test -- tests/heritage-commercial-detail.test.ts tests/heritage-detail-museum.test.ts`

Expected: the new test fails because the four new components and global config do not exist; existing repository and SEO assertions pass.

---

### Task 2: Add Safe Global Contact Configuration

**Files:**
- Create: `lib/config/commercial-contact.ts`
- Create: `tests/commercial-contact-config.test.ts`
- Modify: `.env.example`

- [ ] **Step 1: Write failing config behavior tests**

Test a pure normalizer rather than mutating process environment across tests:

```ts
import { describe, expect, it } from "vitest";
import { normalizeCommercialContact } from "@/lib/config/commercial-contact";

describe("commercial contact config", () => {
  it("normalizes optional global channels", () => {
    expect(normalizeCommercialContact({
      wechatQrImage: " /assets/contact/wechat.webp ",
      businessQrImage: "",
      email: " hello@example.com ",
      phone: " +86 400 000 0000 "
    })).toEqual({
      wechatQrImage: "/assets/contact/wechat.webp",
      businessQrImage: null,
      email: "hello@example.com",
      phone: "+86 400 000 0000",
      hasChannels: true
    });
  });

  it("reports no consultation channels when every value is empty", () => {
    expect(normalizeCommercialContact({})).toMatchObject({ hasChannels: false });
  });
});
```

- [ ] **Step 2: Verify config tests fail**

Run: `npm.cmd test -- tests/commercial-contact-config.test.ts`

Expected: FAIL because `commercial-contact.ts` does not exist.

- [ ] **Step 3: Implement the pure normalizer and environment-backed config**

Define a serializable type with nullable channel values and `hasChannels`. Trim strings, convert empty values to `null`, and export:

```ts
export const commercialContact = normalizeCommercialContact({
  wechatQrImage: process.env.NEXT_PUBLIC_WECHAT_SERVICE_QR,
  businessQrImage: process.env.NEXT_PUBLIC_ENTERPRISE_COOPERATION_QR,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE
});
```

Do not include fallback email, phone, or fake QR values.

- [ ] **Step 4: Document variables in `.env.example`**

Append the four public variables with empty email/phone values and the two agreed static asset paths. Do not modify `.env.local` during implementation unless the user supplies verified real values.

- [ ] **Step 5: Run config tests**

Run: `npm.cmd test -- tests/commercial-contact-config.test.ts`

Expected: both tests pass.

---

### Task 3: Add The Making Process Section

**Files:**
- Create: `components/heritage/making-process.tsx`
- Test: `tests/heritage-commercial-detail.test.ts`

- [ ] **Step 1: Add failing structural assertions**

Assert that the component:

```ts
expect(source).toContain("images.length < 2");
expect(source).toContain("images.map");
expect(source).toContain("image.caption");
expect(source).toContain("String(index + 1).padStart(2, \"0\")");
expect(source).toContain("next/image");
expect(source).not.toContain("item.history");
```

- [ ] **Step 2: Verify RED**

Run: `npm.cmd test -- tests/heritage-commercial-detail.test.ts`

Expected: FAIL because the process component does not exist.

- [ ] **Step 3: Implement a server display component**

Props:

```ts
type MakingProcessProps = {
  images: HeritageGalleryImage[];
  itemName: string;
  eyebrow: string;
  title: string;
};
```

Return `null` when `images.length < 2`. Render ordered image figures with stable portrait or 4:3 ratios, sequence numbers, and captions only when present. Use `next/image`, lazy loading, responsive `sizes`, and `content-visibility:auto`. Do not reuse the gallery dialog or add client state.

- [ ] **Step 4: Run the focused test**

Run: `npm.cmd test -- tests/heritage-commercial-detail.test.ts`

Expected: process assertions pass; remaining components stay red.

---

### Task 4: Add A Validated Inheritor Profile

**Files:**
- Create: `components/heritage/inheritor-profile.tsx`
- Test: `tests/heritage-commercial-detail.test.ts`

- [ ] **Step 1: Add failing assertions for fallback suppression**

Assert the source contains checks for all repository fallback values:

```ts
const fallbackNames = ["待补充", "传承人信息待补充", "该项目的传承人资料将在内容后台补充。"];
```

Also assert it reads `inheritor.name`, `title`, `bio`, and `image`, uses `next/image`, and supports an optional consultation trigger.

- [ ] **Step 2: Verify RED**

Run: `npm.cmd test -- tests/heritage-commercial-detail.test.ts`

Expected: FAIL because the inheritor component does not exist.

- [ ] **Step 3: Implement the profile as a server component**

Props:

```ts
type InheritorProfileProps = {
  inheritor: HeritageItem["inheritor"];
  eyebrow: string;
  title: string;
  consultationAction?: ReactNode;
};
```

Return `null` when the name/title/bio matches known fallback copy. Use a desktop `40/60` image/content grid and a single mobile column. Render the consultation action only when supplied.

- [ ] **Step 4: Run the focused test**

Run: `npm.cmd test -- tests/heritage-commercial-detail.test.ts tests/heritage-detail-museum.test.ts`

Expected: inheritor composition and fallback assertions pass.

---

### Task 5: Add Future Works Preview Without Product Claims

**Files:**
- Create: `components/heritage/future-works-preview.tsx`
- Test: `tests/heritage-commercial-detail.test.ts`

- [ ] **Step 1: Add failing preview-boundary tests**

Assert the component:

```ts
expect(source).toContain("new Set");
expect(source).toContain("slice(0, 3)");
expect(source).toContain("comingSoonLabel");
expect(source).toContain("consultationAction");
for (const forbidden of ["price", "inventory", "checkout", "Product", "Offer"]) {
  expect(source).not.toContain(forbidden);
}
```

- [ ] **Step 2: Verify RED**

Run: `npm.cmd test -- tests/heritage-commercial-detail.test.ts`

Expected: FAIL because the future-works component does not exist.

- [ ] **Step 3: Implement deduplicated media previews**

Props:

```ts
type FutureWorksPreviewProps = {
  itemName: string;
  images: HeritageGalleryImage[];
  coverImage: string;
  heroImage: string;
  labels: readonly string[];
  comingSoonLabel: string;
  eyebrow: string;
  title: string;
  consultationAction?: ReactNode;
};
```

Build a deduplicated list from cover, hero, and gallery URLs, then `slice(0, 3)`. Desktop uses three columns. Mobile uses two columns with the final item spanning two columns when odd. Every tile carries the same Coming Soon status. If only one usable image exists, render one full-width reservation band.

- [ ] **Step 4: Run the focused test**

Run: `npm.cmd test -- tests/heritage-commercial-detail.test.ts`

Expected: future-work tests pass with no commercial fact fields.

---

### Task 6: Implement The Unified Consultation Experience

**Files:**
- Create: `components/heritage/consultation-panel.tsx`
- Test: `tests/heritage-commercial-detail.test.ts`
- Test: `tests/commercial-contact-config.test.ts`

- [ ] **Step 1: Add failing interaction-boundary assertions**

Assert that the source includes:

```ts
expect(source).toContain('"use client"');
expect(source).toContain("HTMLDialogElement");
expect(source).toContain("showModal");
expect(source).toContain("lastTriggerRef");
expect(source).toContain("previousOverflow");
expect(source).toContain("mailto:");
expect(source).toContain("tel:");
expect(source).toContain("safe-area-inset-bottom");
expect(source).toContain("contact.hasChannels");
expect(source).toContain("createContext");
expect(source).toContain("ConsultationProvider");
expect(source).toContain("ConsultationTrigger");
```

- [ ] **Step 2: Verify RED**

Run: `npm.cmd test -- tests/heritage-commercial-detail.test.ts`

Expected: FAIL because the consultation component does not exist.

- [ ] **Step 3: Implement one client component with reusable entry points**

Expose a component that receives:

```ts
type ConsultationPanelProps = {
  contact: CommercialContact;
  itemId: string;
  slug: string;
  itemName: string;
  labels: ConsultationLabels;
};
```

The component renders:

- one `ConsultationProvider` that owns open state, active entry point, last trigger, and the single dialog;
- one exported `ConsultationTrigger` that reads the provider context and opens that dialog;
- one mobile sticky bottom action rendered by the provider;
- one native dialog shared by all triggers;
- square `next/image` QR blocks for configured QR paths;
- `mailto:` and `tel:` links for configured text channels;
- close button, backdrop close, Escape handling, focus return, and body-scroll lock.

Return `null` when `contact.hasChannels` is false. Use stable channel dimensions and do not call `fetch`, server actions, Supabase, or Feishu.

- [ ] **Step 4: Provide a concrete context-backed trigger interface**

Export both components from the same client module:

```ts
type ConsultationTriggerProps = {
  entryPoint: "hero" | "inheritor" | "future-works";
  children: ReactNode;
  className?: string;
};

export function ConsultationProvider(props: ConsultationPanelProps & { children: ReactNode }): ReactNode;
export function ConsultationTrigger(props: ConsultationTriggerProps): ReactNode;
```

`ConsultationProvider` wraps the detail article and renders exactly one dialog plus one mobile sticky action. `ConsultationTrigger` uses context to call `openConsultation(entryPoint, event.currentTarget)`. `DetailHero`, `InheritorProfile`, and `FutureWorksPreview` remain server/display components and receive `<ConsultationTrigger>` as a `ReactNode` action prop. Throw a development-time error if a trigger renders outside the provider.

- [ ] **Step 5: Run focused tests**

Run: `npm.cmd test -- tests/heritage-commercial-detail.test.ts tests/commercial-contact-config.test.ts`

Expected: consultation configuration and interaction-boundary assertions pass.

---

### Task 7: Compose The Commercial Detail Page And Preserve SEO

**Files:**
- Modify: `app/[locale]/heritage/[slug]/page.tsx`
- Modify: `components/heritage/detail-hero.tsx`
- Modify: `messages/zh.json`
- Modify: `messages/en.json`
- Test: `tests/heritage-commercial-detail.test.ts`
- Test: `tests/heritage-detail-museum.test.ts`
- Test: `tests/seo.test.ts`

- [ ] **Step 1: Add all bilingual labels under `HeritageDetail`**

Add matching keys for:

```text
consultationAvailable
consultationAction
consultationTitle
consultationForItem
wechatService
enterpriseCooperation
email
phone
closeConsultation
makingEyebrow
makingTitle
inheritorEyebrow
inheritorTitle
futureWorksEyebrow
futureWorksTitle
comingSoon
futureWorkLabels.collection
futureWorkLabels.custom
futureWorkLabels.cultural
```

Chinese uses `咨询合作`, `制作过程`, `传承人`, `未来作品`, and `即将开放`; English uses concise equivalents.

- [ ] **Step 2: Keep all existing route and SEO code intact**

Do not change:

```ts
generateStaticParams()
getHeritageBySlug(slug)
createMetadata({ title, description, path, image, type: "article", locale })
createCreativeWorkJsonLd(item, currentLocale)
createBreadcrumbJsonLd(...)
```

Do not import or emit Product or Offer JSON-LD.

- [ ] **Step 3: Compose the confirmed section order**

The route renders:

```text
DetailHero
CraftMediaGallery
MakingProcess
collection facts + FavoriteButton
InheritorProfile
FutureWorksPreview
HeritageVideoArchive (when available)
ConsultationPanel
```

Pass only existing `HeritageItem` values and translated labels. Add bottom padding to the article on mobile so the sticky consultation action never covers content or the footer.

- [ ] **Step 4: Wire one consultation owner to every entry point**

Wrap the detail article in one `ConsultationProvider`. Pass `<ConsultationTrigger entryPoint="hero">`, `<ConsultationTrigger entryPoint="inheritor">`, and `<ConsultationTrigger entryPoint="future-works">` into the corresponding action slots. The current item name appears in the one provider-owned dialog heading; no query route or persistent inquiry object is created.

- [ ] **Step 5: Run detail and SEO tests**

Run:

```powershell
npm.cmd test -- tests/heritage-commercial-detail.test.ts tests/commercial-contact-config.test.ts tests/heritage-detail-museum.test.ts tests/seo.test.ts
```

Expected: all focused tests pass; canonical, Open Graph, CreativeWork JSON-LD, and breadcrumbs remain covered.

---

### Task 8: Add Real Contact Assets And Verify Configuration

**Files:**
- Create: `public/assets/contact/wechat-service-qr.webp`
- Create: `public/assets/contact/enterprise-cooperation-qr.webp`
- Optional local-only update: `.env.local`

- [ ] **Step 1: Obtain real user-approved contact data**

Before enabling the consultation UI, require:

- verified WeChat customer-service QR image;
- verified enterprise cooperation QR image;
- verified public email;
- verified public phone number.

Do not generate QR codes from unverified identifiers and do not invent contact values.

- [ ] **Step 2: Optimize supplied QR assets without changing encoded content**

Convert or compress to lossless/high-quality WebP, preserve a square aspect ratio, and verify the QR remains scannable at its rendered size.

- [ ] **Step 3: Configure local/production public environment values**

Set values only after verification. These are public values by design; no secret or service-role value is exposed.

- [ ] **Step 4: Verify missing-channel behavior**

Temporarily omit each optional channel one at a time and confirm only that channel disappears. With all channels empty, confirm every consultation action is absent.

---

### Task 9: Full Automated And Visual Verification

**Files:**
- Verification screenshots under `C:/tmp`

- [ ] **Step 1: Run full automated checks**

Run:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

Expected: zero test failures, TypeScript exit code 0, and a successful Next.js production build retaining localized detail routes, sitemap, robots, and metadata routes.

- [ ] **Step 2: Start the production preview**

Run: `npm.cmd run start -- -H 127.0.0.1 -p 3000`

Expected: representative `/zh/heritage/{slug}` and `/en/heritage/{slug}` routes return HTTP 200.

- [ ] **Step 3: Run Playwright desktop and mobile checks**

Validate at 1440x1000 and 390x844:

- hero image, title, summary, and consultation action do not overlap;
- gallery images are nonblank and lightbox interaction still works;
- making process numbering follows image order;
- fallback inheritor content never renders;
- future works show Coming Soon and no price/purchase UI;
- mobile sticky action respects safe-area and does not cover the footer;
- consultation dialog opens from every entry point, contains only configured channels, closes with Escape/backdrop/button, and returns focus;
- QR images are visible and retain square dimensions;
- email and telephone links have correct schemes;
- Chinese and English labels render without overflow;
- no framework overlay, console error, or horizontal scrollbar appears.

- [ ] **Step 4: Capture evidence**

Save full-page desktop and mobile screenshots plus an open mobile consultation-panel screenshot under `C:/tmp` and inspect them visually.

- [ ] **Step 5: Audit forbidden paths**

Confirm zero implementation changes under:

```text
supabase/
app/api/
components/admin/
lib/feishu-sync/
lib/types/database.ts
lib/types/heritage.ts
lib/content/heritage-repository.ts
```

## Mobile Adaptation Summary

- Hero retains one-column reading order and moves consultation emphasis to the sticky bottom bar.
- Gallery and process use one column; images retain stable aspect ratios.
- Inheritor portrait precedes text.
- Future works use two columns with an odd final item spanning both columns, or one full-width reservation band when only one image is available.
- Consultation dialog becomes a bottom sheet, stacks QR blocks vertically, and exposes large email/telephone tap targets.
- Sticky controls use `env(safe-area-inset-bottom)` and corresponding article bottom padding.
- All fixed elements must disappear when no contact channel is configured.

## Test Coverage Summary

1. **Repository/SEO structural tests:** one existing read, static params, metadata helper, canonical, Open Graph, CreativeWork JSON-LD, breadcrumbs.
2. **Contact config unit tests:** trimming, null normalization, `hasChannels`, no fake fallbacks.
3. **Process tests:** image ordering, numbering, caption-only semantics, weak-data omission.
4. **Inheritor tests:** field use and exact repository fallback suppression.
5. **Future works tests:** deduplication, three-item limit, Coming Soon status, forbidden commercial facts.
6. **Consultation tests:** configured channel rendering, no-channel omission, dialog accessibility, focus return, safe-area mobile action.
7. **Regression suite:** favorites, browsing history, gallery lightbox, video playback tracking, localized routes.
8. **Playwright:** desktop/mobile visual layout, interaction, QR rendering, console health, no overflow.

## Risks And Controls

1. **Real contact data is not yet supplied.** The UI must remain hidden until verified assets and values are configured; implementation cannot claim live consultation before that preflight completes.
2. **Gallery media has no process-role field.** Use only order and captions, and hide weak sequences rather than inventing craft steps.
3. **Repository supplies inheritor fallback text.** Detect exact fallback values in the presentation component without changing the repository or type.
4. **Repeated existing images may look like products.** Deduplicate URLs and label the entire section Coming Soon; never attach price or availability claims.
5. **Multiple consultation entry points can create duplicated dialog state.** Keep one client owner and reuse triggers.
6. **QR assets may become unscannable after compression.** Verify each real asset with a physical-device scan after optimization.
7. **Public environment values are bundled client-side.** Store only intentionally public contact details; never reuse secret variables.
8. **Mobile sticky UI can obscure content.** Reserve safe-area-aware bottom space and verify short/tall mobile viewports.
9. **Commercial wording can cause invalid Product SEO.** Preserve CreativeWork only and explicitly test the absence of Product/Offer schema.

## Execution Blocker To Resolve Before Task 8

Implementation Tasks 1-7 can be completed with consultation channels disabled. Enabling and validating the real A path requires the user to provide the two approved QR assets, public email, and public phone number. No placeholder or invented contact value is acceptable.
