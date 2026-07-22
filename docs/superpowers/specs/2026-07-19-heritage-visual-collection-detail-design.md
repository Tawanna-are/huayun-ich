# Heritage Visual Collection Detail Design

**Date:** 2026-07-19

**Status:** Approved direction, ready for implementation planning

## 1. Positioning

The platform is positioned as a "Chinese intangible cultural heritage visual collection and exhibition platform." The heritage detail experience must lead with images, objects, craft details, and making scenes. It must not read like an encyclopedia, government archive, or long-form article.

This phase changes frontend presentation and CMS form hierarchy only. It does not change the Supabase schema, CMS data structure, API contracts, Feishu synchronization, or existing records.

## 2. Goals

- Make the hero image and collection imagery the first impression.
- Place the gallery immediately after the hero.
- Present making-process content primarily through ordered images.
- Retain lightweight identity information: names, region, and category.
- Retain the future works preview and public consultation entry points.
- Simplify routine CMS entry without removing legacy fields or data.
- Preserve compatibility with all existing `heritage_items` records.

## 3. Non-goals

- No database tables, columns, migrations, or RLS changes.
- No CMS payload or storage model changes.
- No API request or response changes.
- No Feishu mapping or synchronization changes.
- No product, price, inventory, Product, or Offer data.
- No full bilingual content model in this phase.

## 4. Public Detail Page Structure

### 4.1 Hero

The first viewport uses the existing hero media and contains only:

- Hero image
- Chinese project name
- English project name
- Short summary
- Region
- Category
- Favorite action
- Consultation action

The hero image resolves in this order: Hero, Cover, then the existing default placeholder. Long archive metadata, inscription year, coordinates, history, timeline, and cultural-value prose are not rendered.

### 4.2 Collection Gallery

The gallery follows the hero directly. The first Gallery image is the primary wide image. Remaining Gallery images use the existing spacious two-column collection layout, with a single-column adaptation where required on narrow screens. Full-screen viewing remains available.

The gallery respects CMS media ordering. Short captions support identification but must not become long article copy. If no Gallery media exists, the section is omitted.

### 4.3 Making Process

The making-process section continues to use ordered Gallery images because no dedicated process-image field exists. Images remain the dominant content, with step numbers and optional short captions. The same CMS ordering controls the sequence. If fewer than two Gallery images exist, the section is omitted.

### 4.4 Collection Facts

The facts band contains only region and category. It does not display inscription year, coordinates, timeline, archive identifiers, materials, technique prose, or cultural-value copy.

### 4.5 Future Works

The existing future works preview remains. It uses available Cover, Hero, and Gallery imagery, retains the "coming soon" state, and includes a consultation action. It does not introduce commerce data or backend workflows.

### 4.6 Moving Image

The video archive remains conditional. It renders uploaded videos in their CMS order and uses the selected poster or existing image fallbacks. If no video exists, the entire section is omitted.

### 4.7 Consultation

Consultation remains available from the Hero and future works sections. It continues to use the existing public contact configuration for service WeChat, enterprise cooperation QR code, email, and telephone. No form submission API is added.

### 4.8 Hidden Public Modules

The inheritor section is removed from the public detail composition. History, timeline, cultural-value prose, and complex archive information remain unrendered. Their components and stored data are retained for compatibility and possible future archive experiences.

## 5. Media Roles and Ordering

Media management retains all existing role and ordering controls.

- **Cover:** Primary image for homepage featured cards and heritage list cards.
- **Hero:** Full-width detail hero image and the second card-image fallback.
- **Gallery:** Ordered collection images. Their stored order controls both gallery display and making-process display.
- **Poster:** Video poster fallback.
- **Main video:** Primary moving-image item; other videos retain their stored order.

Editors can continue to upload images, assign roles, set an image as Cover, set a main video, move media up or down, and delete media. The CMS must not silently change media roles or reorder existing media.

### Homepage Featured Card Image Rule

Every featured card uses one deterministic image rule:

1. Cover
2. Hero
3. Existing default placeholder

Gallery and Poster images must not become implicit featured-card fallbacks. The item must also remain published, marked featured, and eligible for public display.

## 6. CMS Entry Experience

The CMS data structure and submission payload remain unchanged. Only field prominence and grouping change.

### 6.1 Primary Entry Area

The default project editor emphasizes:

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

Province and city stay visible because current validation, filtering, and compatibility depend on them.

### 6.2 Media Area

Media management remains a dedicated primary workflow for:

- Cover selection
- Hero upload and assignment
- Gallery upload and ordering
- Video and poster upload
- Main-video selection
- Media ordering and deletion

### 6.3 Compatibility Fields

The following existing fields move into a collapsed "Advanced archive data" section and are not required for routine content entry:

- Inheritor data
- History
- Timeline
- Inscription year
- Latitude and longitude
- Map X and Map Y
- Tags
- Related project Slugs
- Legacy image URLs
- Legacy video URL

Collapsing these controls must not clear, overwrite, or omit their existing values when an editor saves unrelated basic fields.

## 7. Existing Data and Fallback Behavior

- Missing Hero uses Cover, then the existing placeholder.
- Missing Cover uses Hero for public cards, then the existing placeholder.
- Missing Gallery hides both the Gallery and making-process sections.
- One Gallery image displays the Gallery but hides making process.
- Missing inheritor data has no visible effect because the module is no longer composed.
- Missing video hides the moving-image section.
- Existing history, timeline, inheritor, location, tags, and related Slugs remain stored and editable in the compatibility area.

## 8. Internationalization and SEO

- Chinese and English routes remain supported.
- English routes continue to prefer `english_name` for the title.
- Existing Canonical, Open Graph, JSON-LD, Sitemap, and localized route generation remain unchanged.
- The short summary remains the metadata description.
- This phase does not claim complete English-body support because the existing model has no separate English summary or archive fields.

## 9. Accessibility and Responsive Behavior

- Hero and gallery images retain meaningful alt text fallbacks.
- Full-screen gallery controls remain keyboard accessible.
- Media ordering remains identical across desktop and mobile.
- Mobile keeps image-first composition without hiding project identity, region, category, or consultation actions.
- Conditional sections leave no empty headings, gaps, or placeholder cards.

## 10. Validation

Implementation acceptance requires:

- Regression tests for detail section order and inheritor removal.
- Regression tests for Gallery and making-process conditional behavior.
- Regression tests for Cover-to-Hero-to-placeholder card resolution.
- Regression tests confirming CMS advanced fields remain in the payload and editor.
- `npm test`, `npm run typecheck`, and `npm run build` pass.
- Playwright review of Chinese and English detail pages on desktop and mobile.
- Manual CMS review confirming Cover, Hero, Gallery, and video ordering controls still work.

## 11. Risks

- Existing Gallery captions may not describe making steps; content editors must order and caption images deliberately.
- Moving fields into a collapsed area can accidentally drop values if form state is reconstructed. The implementation must preserve the current full form state and payload.
- Card fallback behavior may currently be implemented indirectly in the repository mapper. Tests must lock the exact Cover, Hero, placeholder sequence before refactoring.
- Existing records without media remain valid but will present the default placeholder and fewer visual sections.

