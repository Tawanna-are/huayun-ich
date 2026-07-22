# Heritage Work Visual Platform Design

**Date:** 2026-07-19

**Status:** Approved direction, ready for implementation planning

## 1. Positioning

The platform is positioned as an intangible cultural heritage work visual display platform. A project detail page exists primarily to let visitors browse high-quality work images associated with that project. Text and archive data support identification and contact, but they do not define the browsing experience.

This phase changes public composition and CMS presentation only. It does not change the Supabase schema, `heritage_items` fields, CMS payload shape, API contracts, Feishu synchronization, or existing media and advanced-field records.

## 2. Goals

- Make Hero and Gallery media the dominant project experience.
- Establish one simple detail flow: Hero, Gallery, optional Video, Project Information, Consultation.
- Remove repeated or archive-oriented public modules.
- Make routine CMS work focus on basic identity and media management.
- Preserve every hidden advanced value when an editor saves basic fields.
- Retain deterministic Cover, Hero, and placeholder behavior for public cards.

## 3. Non-goals

- No database table, field, migration, index, RLS, or storage-model changes.
- No API route, request, response, or validation-contract changes.
- No Feishu field mapping or synchronization changes.
- No deletion or migration of existing history, timeline, inheritor, location, or media data.
- No dedicated process-image, product, price, inventory, Product, or Offer model.
- No complete bilingual body-content model.

## 4. Public Detail Page

The exact public order is:

```text
Hero -> Gallery -> Video (when available) -> Project Information -> Consultation
```

### 4.1 Hero

The first viewport contains:

- Hero image
- Chinese project name
- English project name
- Short summary
- Region
- Category

The Hero image resolves in this order: Hero, Cover, default placeholder. Long archive content, inscription year, coordinates, history, timeline, inheritor data, and cultural-value prose are not rendered.

The existing favorite action may remain in the Hero or Project Information area because it is a user feature rather than archive content. It must not compete visually with the media.

### 4.2 Gallery

Gallery follows Hero immediately and is the main page body.

- The first ordered Gallery image is the wide primary work image.
- Remaining images use the existing spacious collection layout.
- CMS media `sort_order` determines the order on every viewport.
- Full-screen image preview remains available.
- Captions remain short and optional.
- No Gallery image is duplicated into a separate making-process module.
- If Gallery is empty, the entire section is omitted.

### 4.3 Optional Video

Video follows Gallery only when the item has a primary video URL or uploaded video records.

- The main video remains first.
- Additional videos retain CMS order.
- Existing poster and image fallbacks remain.
- If no video exists, no heading, wrapper, or vertical gap is rendered.

### 4.4 Project Information

The lightweight information band follows Video, or Gallery when Video is absent. It contains only:

- Region
- Category

The Chinese heading changes from “馆藏信息” to “项目信息”. The English heading changes from “Collection Details” to “Project Details”. Inscription year, coordinates, map values, timeline, history, materials, cultural value, and archive identifiers are absent.

### 4.5 Consultation

A dedicated consultation section closes the page. It reuses the existing `ConsultationProvider`, `ConsultationTrigger`, and public contact configuration.

Available channels remain:

- Service WeChat QR code
- Enterprise cooperation QR code
- Email
- Telephone

No submission API or new backend workflow is introduced. If no public channel is configured, the section is omitted without leaving an empty heading or gap.

## 5. Public Modules Removed

The detail composition no longer renders:

- Making Process
- Future Works
- Inheritor Profile
- History narrative
- Timeline
- Cultural-value prose
- Archive-heavy information

`MakingProcess`, `FutureWorksPreview`, `InheritorProfile`, timeline components, and their stored data are not deleted. They simply cease to be composed by the public project detail page.

“Making Process”, “Future Works”, and “Collection Information” are current frontend presentation modules or labels, not `heritage_items` fields. Removing them requires no schema or API change.

## 6. CMS Presentation

### 6.1 Default Basic Information

The primary project editor visibly emphasizes:

- Project name
- English name
- Slug
- Category
- Region
- Province
- City
- Short summary
- Published status
- Homepage featured status

Province and City remain visible because current validation, filtering, and compatibility depend on them.

### 6.2 Default Media Management

Media management remains a primary CMS destination and retains:

- Cover upload and selection
- Hero upload and role assignment
- Gallery upload and role assignment
- Optional video upload
- Video poster generation and display
- Main-video selection
- Image and video move-up/move-down ordering
- Media deletion

### 6.3 Hidden Advanced Fields

The following are removed from normal CMS navigation and default project editing:

- Inheritor name, title, bio, and image URL
- History
- Timeline
- Inscription year
- Latitude and longitude
- Map X and Map Y
- Other archive-oriented controls currently grouped in the advanced editor

Tags, related Slugs, and legacy media URL fields may remain hidden with the same advanced group because they are not part of routine work-image entry.

Hiding means presentation-only removal. It does not remove form state keys, payload keys, database values, API handling, or Feishu mappings.

### 6.4 Hidden-data Preservation

The CMS must keep using one complete `heritageForm` initialized from the full selected database row. Saving basic fields must continue to serialize the complete form object. Hidden fields must not be reset when:

- Selecting an existing project
- Switching CMS tabs
- Editing a basic field
- Uploading or reordering media
- Saving an existing project

New projects retain the existing empty defaults for hidden fields. Existing projects retain their loaded values verbatim unless an existing external integration changes them.

## 7. Card and Media Resolution

Homepage featured cards and heritage list cards keep this strict rule:

1. Cover
2. Hero
3. Existing default placeholder

Gallery and Poster media never become implicit card-image fallbacks.

Detail Hero keeps the inverse role priority appropriate to the detail page:

1. Hero
2. Cover
3. Existing default placeholder

Gallery and video arrays continue to use normalized CMS `sort_order`. No client-side sorting or role mutation is added.

## 8. Data Flow

```text
Supabase heritage_items + media tables
        |
        v
existing heritage repository mapper
        |
        +--> homepage/list: Cover -> Hero -> placeholder
        |
        +--> detail: Hero -> Gallery -> optional Video -> information -> consultation
        |
        +--> CMS: full row -> full heritageForm -> unchanged API payload
```

The repository remains the single public project data source. No new data adapter, endpoint, or table is introduced.

## 9. Internationalization and SEO

- Chinese and English project routes remain supported.
- English routes continue to prefer `english_name` for the title.
- Existing short summary remains the metadata description.
- Canonical, Open Graph, JSON-LD, Sitemap, and static route generation remain unchanged.
- “项目信息” and “Project Details” are localized presentation copy only.
- Existing model limitations remain: there is no separate English project summary or English region field.

## 10. Accessibility and Responsive Behavior

- Hero and Gallery images retain meaningful alt fallbacks.
- Gallery preview remains keyboard accessible and returns focus to its trigger.
- Mobile retains the same media order as desktop.
- Long Chinese and English names must not overlap the summary or surrounding content.
- Conditional Gallery, Video, and Consultation sections leave no empty headings or spacing.
- The page must have no horizontal overflow at 390px mobile width.

## 11. Acceptance Criteria

- Public detail order is Hero, Gallery, optional Video, Project Information, Consultation.
- Making Process, Future Works, Inheritor, History, and Timeline are absent from public details.
- A no-video record renders no video module.
- Project Information contains only Region and Category.
- Consultation is the final section when public channels exist.
- CMS defaults expose basic identity and media management only.
- Hidden advanced data remains present in form state and the unchanged save payload.
- Cover, Hero, Gallery, video roles and media ordering remain operational.
- Homepage/list card image resolution remains Cover, Hero, placeholder.
- `npm test`, `npm run typecheck`, and `npm run build` pass.
- Playwright validates Chinese and English detail pages on desktop and mobile.

## 12. Risks

- Removing the advanced CMS navigation removes direct manual editing of those fields. Existing API and Feishu flows still preserve or update them.
- Consultation visibility depends on public contact configuration. An unconfigured environment correctly omits the final section.
- Existing projects without Gallery media will have a short page consisting of Hero, optional Video, information, and consultation.
- Source tests from earlier visual phases may still require removed modules and must be updated to the newly approved composition rather than weakened broadly.

