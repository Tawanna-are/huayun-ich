# Heritage Commercial Detail Design

## Goal

Upgrade `/{locale}/heritage/{slug}` from a minimal collection record into a premium cultural showcase that can support future commercial conversion through consultation and product previews. The first phase uses the confirmed A+C model: a real, unified consultation channel plus clearly labeled future-work placeholders.

## Scope And Constraints

This phase changes only the public heritage detail-page presentation and global frontend contact configuration.

- Keep the current CMS, Supabase schema, API routes, upload flow, and Feishu synchronization unchanged.
- Keep the `heritage_items` table and all current fields unchanged.
- Continue reading detail content through `getHeritageBySlug(slug)` and the existing `HeritageItem` mapping.
- Do not create product, price, inventory, order, inquiry, or contact tables.
- Do not present checkout, purchase, price, stock, or delivery behavior.
- Keep Chinese and English routes compatible.

## Commercial Positioning

The page is a curated cultural collection and cooperation entry, not an ecommerce product page. Its conversion path is:

```text
Visual recognition -> craft understanding -> inheritor trust -> future-work interest -> consultation
```

The consultation action supports customized works, exhibition cooperation, brand collaboration, institutional procurement, cultural programming, and media enquiries. The visual language remains quiet and editorial; cinnabar is the only strong action color.

## Existing Data Mapping

| Experience | Existing source | Fallback behavior |
|---|---|---|
| Title | `item.name` / `item.englishName` | Use the available localized name |
| One-line introduction | `item.summary` | Hide the line if empty |
| Hero image | `item.heroImage` then `item.image` | Existing repository fallback image |
| Collection gallery | `item.gallery` | Hide the gallery when empty |
| Process imagery | Ordered `item.gallery` entries and captions | Use only available images; do not invent steps |
| Process film | `item.videoUrl` / `item.videos` | Hide the film section when empty |
| Region and category | `item.region` / `item.categoryName` | Display existing mapped values |
| Inheritor profile | `item.inheritor` | Hide when the mapped profile is a fallback or lacks a real name/image |
| Future work preview | `item.image`, `item.heroImage`, and available gallery images | Show a reduced placeholder set with “Coming Soon” status |
| Consultation subject | `item.id`, `item.slug`, localized display name | Included only in client-side link parameters where appropriate |

## Page Structure

### 1. Collection Hero

The first viewport remains image-led and establishes cultural value before presenting conversion controls.

- Full-width hero image inside the existing museum container.
- Breadcrumb, category, and region remain secondary.
- Large Chinese or localized title, English counterpart, and one concise summary.
- A small `Consultation available` label introduces commercial availability without using sales language.
- Desktop: consultation action sits at the lower-right edge of the hero content.
- Mobile: hero copy remains unobstructed; the primary action moves to the sticky bottom consultation bar.

The action label is `咨询合作` in Chinese and `Consultation` in English. It opens the consultation panel described below rather than navigating directly to one channel.

### 2. Collection Gallery

Use the current gallery as the primary work and craft-detail presentation.

- First image spans the full content width.
- Remaining images use a two-column editorial wall on desktop and a single column on mobile.
- Captions remain visible beneath images when present.
- Existing full-screen image preview, keyboard focus management, and lazy loading remain.
- Images are not categorized as product shots, process shots, or scenes unless the current caption explicitly provides that meaning.

### 3. Making Process

Present craft evidence as an ordered visual sequence without introducing new CMS fields.

- Section title: `制作过程 / Making Process`.
- Derive the sequence from the current gallery order.
- Each available entry receives a display number such as `01`, `02`, `03`.
- Use the existing image caption as the step title or description.
- If a caption is absent, show only the sequence number and image; do not generate process claims.
- When video exists, place the primary process film after the image sequence as `Moving Process`.
- When fewer than two useful gallery images and no video exist, omit the entire process section.

This is a presentation rule only. It does not add a process array, media role, or workflow field.

### 4. Inheritor Profile

Use the existing first mapped inheritor as human and institutional trust evidence.

- Desktop: portrait occupies approximately 40 percent, profile content 60 percent.
- Mobile: portrait first, then name, title, and a concise bio.
- Display `item.inheritor.name`, `title`, `bio`, and `image` only when they represent real CMS content.
- Do not display repository fallback copy such as “待补充”.
- Keep this section informational; do not imply the inheritor personally receives every enquiry.
- Place a secondary `咨询相关合作` action at the end, opening the same consultation panel with the current item context.

### 5. Future Works Preview

Reserve a commercial showcase without pretending that products are already available.

- Section title: `未来作品 / Future Works`.
- Display up to three visual preview tiles using current main and gallery images.
- Each tile carries one consistent status: `即将开放 / Coming Soon`.
- Supporting labels may describe future categories generically, such as `典藏作品`, `定制合作`, and `文化衍生`, with English equivalents.
- Do not display product names unless supplied by existing captions.
- Do not display prices, specifications, inventory, purchase buttons, discounts, delivery claims, or Product/Offer structured data.
- A single section-level `咨询合作` action opens the consultation panel.
- If no suitable media exists beyond the hero fallback, show one restrained text-and-image reservation band instead of empty repeated cards.

This section is deliberately replaceable by a future product component when a separate product domain and CMS model are approved.

### 6. Consultation Panel

The consultation system is global and independent from heritage content records.

#### Entry Points

- Hero consultation action.
- Inheritor section secondary action.
- Future works section action.
- Mobile sticky bottom bar.

Every entry opens the same accessible panel and preserves the current heritage item context in the visible heading, for example `咨询苏绣相关合作`.

#### Panel Content

- WeChat customer-service QR code.
- Enterprise cooperation QR code.
- Email address with a `mailto:` link.
- Telephone number with a `tel:` link.
- Short channel labels and operating-purpose labels only; no long instructions.

#### Configuration

Contact details are stored in one frontend-owned global configuration module, not in `heritage_items`:

```text
wechatQrImage
businessQrImage
email
phone
```

QR images are static optimized assets under `public/assets/contact/`. Email and phone values are shared site contact values. No form submission, database write, API request, or Feishu write occurs in this phase.

#### Interaction And Accessibility

- Desktop: right-side drawer or centered restrained dialog, no nested card layout.
- Mobile: bottom sheet above the sticky consultation bar.
- Focus moves into the panel when opened and returns to the triggering control when closed.
- Support Escape, close button, backdrop close, focus containment, and body-scroll lock.
- QR images include meaningful alternative text and stable square dimensions.
- Email and telephone remain usable when QR images fail.

## UI Direction

### Visual Language

- Continue the warm white, deep green, muted cinnabar, and charcoal palette established by the collection list.
- Alternate light image sections with one deep-green process-film or consultation band.
- Use thin rules, large image surfaces, and generous section spacing instead of floating cards.
- Keep corners at 6px or less.
- Avoid ecommerce patterns: price hierarchy, buy buttons, promotional badges, star ratings, countdowns, stock labels, and dense specification tables.

### Desktop Layout

- Maximum content width follows the existing museum container.
- Hero and primary gallery image span the visual field.
- Process uses an editorial numbered sequence.
- Inheritor uses an asymmetric 40/60 split.
- Future works use three equal visual columns.
- Consultation action remains visible at key decision points but never competes with the hero title.

### Mobile Layout

- Single-column content flow for hero, gallery, process, and inheritor sections.
- Future works may use a two-column image grid when text remains short; otherwise use horizontal snap scrolling with stable tile widths.
- Sticky bottom bar includes one clear `咨询合作` action and respects safe-area insets.
- The consultation panel stacks the two QR codes vertically and keeps email and phone as large tap targets.
- No fixed element may obscure captions, gallery controls, or the footer.

## Component Boundaries For A Future Implementation

The design can be implemented through focused frontend components while keeping the route as the server data boundary:

```text
HeritageDetailPage (server)
  DetailHero
  CraftMediaGallery
  MakingProcess
  InheritorProfile
  FutureWorksPreview
  HeritageVideoArchive
  ConsultationEntry / ConsultationPanel (client interaction boundary)
```

- `HeritageDetailPage` continues loading one `HeritageItem` and producing SEO data.
- Display-only sections remain server components where interaction is not required.
- Only image preview, media playback, and consultation dialog behavior require client components.
- The consultation panel receives display name, slug, and global contact configuration as serializable props.

## SEO Preservation

### Existing Behavior To Keep

- `generateStaticParams()` continues using `getHeritageSlugs()` for both locales.
- `generateMetadata()` continues using localized title, summary description, canonical detail path, hero image, Open Graph article type, and locale alternates through the existing metadata helper.
- Keep `CreativeWork` JSON-LD generated by `createCreativeWorkJsonLd(item, locale)`.
- Keep breadcrumb JSON-LD for home, collection list, and current item.
- Keep semantic `h1`, section `h2` headings, image alt text, and indexable server-rendered content.
- Keep sitemap generation through the existing public repository.

### Commercial SEO Boundaries

- Do not add `Product`, `Offer`, `AggregateOffer`, price, availability, rating, or review schema in the A+C phase.
- `Coming Soon` tiles are presentation previews, not indexable product entities.
- Consultation links do not change canonical URLs or create query-indexed variants.
- QR codes use descriptive alt text but are not primary Open Graph media.
- Future product SEO requires a separately approved product model with real product identifiers and availability data.

## Empty And Error States

- Missing gallery: omit gallery and process imagery; retain hero, facts, inheritor when valid, future-work reservation band, and consultation.
- Missing video: omit the film stage without showing an empty player.
- Missing real inheritor: omit the profile section entirely.
- Missing QR asset: show the channel label as unavailable while keeping email and phone active.
- Missing email or phone: hide only that channel, never show placeholder contact data.
- All consultation channels unavailable: hide commercial entry buttons rather than opening an empty panel.

## Performance

- Keep hero image `priority` and responsive `sizes`.
- Keep gallery and future-work images lazy loaded through `next/image`.
- Reuse image URLs rather than downloading duplicate transformed assets at multiple sizes.
- Do not preload QR images until the consultation panel is likely to open; reserve stable dimensions to prevent layout shift.
- Keep process and future-work sections server rendered and avoid introducing new animation libraries.
- The sticky mobile action must not add global scroll listeners.

## Analytics Readiness Without API Changes

The first phase may expose stable front-end event names for an existing analytics layer if one is already configured:

```text
consultation_open
consultation_channel_click
future_works_view
```

Suggested properties are `heritageId`, `slug`, `locale`, `entryPoint`, and `channel`. This design does not add an analytics API or database table; event wiring is optional and must reuse an existing provider.

## Verification For A Future Implementation

- Structural tests confirm existing data loading, metadata, CreativeWork JSON-LD, and breadcrumbs remain.
- Component tests verify conditional rendering for missing gallery, video, inheritor, and contact channels.
- Interaction tests cover every consultation entry point, focus return, Escape close, and email/telephone links.
- Playwright desktop and mobile screenshots verify hero composition, process sequence, inheritor layout, future-work status, sticky action, and consultation panel.
- Validate both `/zh/heritage/{slug}` and `/en/heritage/{slug}`.
- Run full tests, type checking, and production build.
- Audit `supabase/`, `app/api/`, `lib/feishu-sync/`, admin components, and database types for zero changes.

## Risks

1. **Existing media lacks process semantics.** Gallery order and captions can support a visual sequence but cannot reliably identify materials or exact steps. The design avoids invented claims and hides weak sequences.
2. **Fallback inheritor data could look authoritative.** The implementation must detect repository fallback content and omit the section.
3. **Future works could be mistaken for purchasable products.** Every preview uses one explicit `Coming Soon` status and excludes commercial facts that do not exist.
4. **Global contact data may become stale.** Keep it in one configuration module and require channel verification before deployment.
5. **QR-heavy panels can feel promotional.** Use restrained typography, two clearly separated purposes, and email/phone alternatives.
6. **Sticky mobile controls can cover content.** Reserve bottom padding, respect safe-area insets, and test short and tall mobile viewports.
7. **False product SEO could create compliance issues.** Retain CreativeWork schema only until real product data exists.

## Explicit Non-Goals

- Ecommerce checkout, cart, payment, order, price, inventory, and fulfillment.
- New product or inquiry CMS fields.
- New Supabase tables, migrations, RLS policies, storage buckets, or Edge Functions.
- New API routes or changes to current API contracts.
- Form submission or enquiry persistence.
- Feishu consultation synchronization.
- Multiple contact configurations per heritage item.
