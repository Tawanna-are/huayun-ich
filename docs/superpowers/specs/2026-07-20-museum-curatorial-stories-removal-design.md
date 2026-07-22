# Museum Curatorial Stories Removal Design

**Date:** 2026-07-20

## Objective

Remove the public Curatorial Stories section from `/[locale]/museum` so the digital museum page ends after its remaining curated collection modules.

## Scope

- Stop importing and rendering `CuratorialStories` in `app/[locale]/museum/page.tsx`.
- Keep `components/museum/curatorial-stories.tsx` unchanged.
- Keep `createMuseumCuration()`, `curatorialStories`, museum types, and underlying heritage data unchanged.
- Keep Data Gallery, Featured Topics, and Annual Recommendations unchanged.

## Preserved Behavior

- CMS, Supabase data, database schema, APIs, media, and Feishu synchronization remain unchanged.
- Metadata, canonical URL, Open Graph, CollectionPage JSON-LD, ItemList JSON-LD, and breadcrumb JSON-LD remain unchanged.
- Chinese and English routes remain compatible.

## Verification

- Add a regression assertion that the museum page no longer imports or renders `CuratorialStories`.
- Assert Data Gallery, Featured Topics, Annual Recommendations, metadata, and JSON-LD remain present.
- Run the focused museum test, typecheck, production build, and desktop/mobile browser screenshots.
