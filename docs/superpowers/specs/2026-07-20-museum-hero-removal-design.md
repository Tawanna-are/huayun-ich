# Museum Hero Removal Design

**Date:** 2026-07-20

## Objective

Remove the full-screen `MuseumHero` block from `/[locale]/museum` so the page begins with the existing Data Gallery entry and moves directly into curated content.

## Scope

- Stop importing and rendering `MuseumHero` in `app/[locale]/museum/page.tsx`.
- Remove page-local Hero-only calculations: province count and the three-item `stats` array.
- Keep `components/museum/museum-hero.tsx` in the codebase; do not delete or refactor the reusable component.
- Keep the Data Gallery strip, Featured Topics, Annual Recommendations, and Curatorial Stories unchanged.

## Preserved Behavior

- Existing CMS and Supabase reads remain unchanged.
- Metadata, canonical URL, Open Graph image, CollectionPage JSON-LD, ItemList JSON-LD, and breadcrumb JSON-LD remain unchanged.
- Chinese and English museum routes remain supported.
- No API, database, CMS, media, or Feishu synchronization change.

## Layout

The existing fixed site header remains. The Data Gallery strip becomes the first visible museum-page section and receives fixed-header-safe top padding so its heading is never obscured. No replacement Hero, banner, statistics block, or explanatory copy is introduced.

## Verification

- Add a regression assertion that the museum page no longer imports or renders `MuseumHero`.
- Assert the existing Data Gallery, Featured Topics, Annual Recommendations, JSON-LD, and metadata code remain present.
- Run the focused museum page test, typecheck, and production build.
- Verify `/zh/museum` and `/en/museum` at desktop and mobile widths with no fixed-header overlap or horizontal overflow.
