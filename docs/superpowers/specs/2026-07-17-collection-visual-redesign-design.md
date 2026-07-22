# Collection Visual Redesign: Phase One

## Scope

Phase one changes only the public frontend presentation. It does not change the database schema, CMS fields, admin APIs, upload flows, Supabase relationships, or Feishu synchronization.

## Visual Direction

Use a minimal, image-first cultural collection style. Photography carries the hierarchy. Text is limited to identity and navigation. Avoid traditional article layouts, dashboard styling, ecommerce cues, decorative cards, and long explanatory copy.

## Homepage

- Keep the server-rendered CMS request and live `featured` filtering.
- Present one large Hero image with a compact collection label, title, and short supporting line.
- Present featured heritage items as a visual Collection with large image surfaces and minimal metadata.
- Add a restrained category entry section using existing category data and project imagery.
- Do not render story, map, statistics, or long introduction modules.
- Keep the Hero image prioritized and preserve responsive `sizes` behavior.

## Heritage Index

- Retain search, category filtering, province filtering, and semantic search behavior.
- Reduce the filter controls to a quiet, compact collection toolbar.
- Use image-led cards with stable large image ratios.
- Show only project name, English name, region, and category.
- Do not show summaries, history, or descriptive excerpts.

## Heritage Detail

- The first viewport uses an oversized primary image, project name, and one-sentence summary.
- Remove the article chapter navigation.
- Hide historical background, timeline, transmission value, inheritor profile, tags, and related editorial prose in phase one.
- Show only region and category as basic information.
- Do not infer materials or techniques from generic tags.
- Use the A1 Gallery layout: one prominent first gallery image followed by a two-column grid of the remaining images.
- Keep full-screen image preview behavior.
- Keep the existing video archive only when uploaded video exists, presented as a visual media block rather than an article chapter.

## Data Flow

Continue consuming the existing `HeritageItem` model and current repository functions. Use `image`, `heroImage`, `gallery`, `categoryName`, `region`, `name`, `englishName`, and `summary`. No new fetches, persistence, mutations, or field mappings are introduced.

## Component Boundaries

- Homepage composition remains server-first through `HomeCmsContent`.
- The heritage index keeps client state only where filtering and semantic search require it.
- The Gallery keeps client state only for image preview.
- Existing `next/image` behavior remains the media rendering foundation.

## Empty And Fallback States

- When no featured items exist, show a minimal collection-empty state.
- When no gallery images exist, omit the Gallery section.
- Existing repository image fallbacks remain active.
- Missing English names fall back to the Chinese name through existing display logic.

## Verification

- Run focused frontend tests and type checking.
- Run `npm run build`.
- Inspect desktop and mobile layouts for stable image ratios, text overflow, overlap, and responsive hierarchy.
- Confirm no files under Supabase migrations, CMS APIs, admin components, database types, or Feishu synchronization are modified.

## Delivery Order

1. Homepage visual redesign.
2. Image-led heritage index.
3. Detail Hero and A1 Gallery presentation.
4. Verification and user review before further optimization.
