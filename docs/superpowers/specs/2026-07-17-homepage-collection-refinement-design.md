# Homepage Collection Refinement

## Scope

Change only the public homepage presentation. Do not modify the database, CMS, admin UI, APIs, upload flows, Supabase schema, or Feishu synchronization.

## Hero

- Replace the promotional title with the collection-platform name `华韵收藏`.
- Keep `Chinese Intangible Heritage Collection` as the restrained English identity line.
- Keep one short supporting sentence only.
- Preserve the existing CMS-selected Hero image, `next/image`, `priority`, quality, and responsive `sizes` behavior.

## Primary Collection

- Keep `精选非遗` as the main homepage content after the Hero.
- Preserve the image-first horizontal Collection and existing CMS `featured` filtering.
- Do not add excerpts, history, statistics, or long supporting copy.

## Category Index

- Delete the current image-based `分类馆藏` section that repeats project imagery.
- Replace it with a text-only six-cell index.
- Desktop layout: three columns and two rows.
- Mobile layout: two columns and three rows.
- Categories: 戏曲、刺绣、陶瓷、染织、竹编、剪纸.
- Each cell links to `/heritage?query=<category>` using the existing list query behavior.
- Do not infer or create CMS categories and do not display project thumbnails or counts.

## Components

- Remove `CollectionCategories` from homepage composition.
- Replace it with a focused `CollectionCategoryIndex` server component containing only static category labels and links.
- Keep `HomeCmsContent` server-first and introduce no new data request or client boundary.

## Verification

- Add a failing source-contract test for the new title and category index.
- Update existing homepage tests to reject the old image category section.
- Run focused tests, full type checking, and production build.
- Inspect desktop and mobile screenshots for stable six-cell layout, text fit, and no duplicate category imagery.
- Confirm no forbidden backend or synchronization files changed.
