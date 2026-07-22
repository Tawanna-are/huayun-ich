# Heritage Collection Media, Search, and Visual Design

**Date:** 2026-07-20

## Objective

Replace obsolete concept-art covers with selected project photography, make category-intent search precise, and upgrade the public heritage list into an image-first curatorial collection wall.

## Scope

- Update public media role bindings for `chuanju`, `jingdezhen-porcelain`, and `datiehua`.
- Correct the local semantic expansion that makes a search for `戏曲` match unrelated projects.
- Restyle `/[locale]/heritage` using approved visual direction A.
- Preserve existing CMS behavior, Supabase schema, API contracts, Feishu synchronization, bilingual routing, and SEO output.

## Media Role Update

For each target item, use the currently rendered Gallery order:

| Project | Cover | Hero |
| --- | --- | --- |
| 川剧 | Gallery image 1 | Gallery image 2 |
| 景德镇陶瓷 | Gallery image 1 | Gallery image 2 |
| 打铁花 | Gallery image 1 | Gallery image 2 |

The selected Gallery records remain Gallery records so public detail galleries retain every image and their current ordering. Existing `cover` and `hero` bindings are updated to point at the selected media; missing bindings are inserted. No storage object or media row is deleted, and no schema migration is introduced.

Before mutation, capture the selected media IDs, URLs, storage paths, metadata, and existing Cover/Hero values. Apply only the six intended role bindings and read them back after mutation. The public mapper remains unchanged and continues to enforce `Cover -> Hero -> default placeholder`; Gallery never becomes an automatic fallback.

## Search Behavior

The search endpoint and request contract remain unchanged. The local intent expansion for `戏曲` will:

- keep direct category and form terms such as `戏曲`, `川剧`, `京剧`, `唱念做打`, `水磨腔`, `脸谱`, and `opera`;
- stop expanding a `戏曲` query into broad terms such as `舞台` and `stage`;
- continue using the user's literal tokens for searches that explicitly contain `舞台` or `stage`.

This removes false positives caused only by phrases such as `世界舞台` while retaining literal keyword search. A regression test will prove that `戏曲` includes 川剧 and excludes 景德镇陶瓷 and打铁花.

## Collection Page Layout

The approved direction is an editorial curatorial wall:

- reduce the oversized introductory band's vertical space;
- keep the page title, collection count, search, and collapsible filters;
- remove panel-like card styling and present images directly on the page surface;
- give the first visible work a dominant desktop position, then alternate image spans to create a measured exhibition rhythm;
- keep metadata quiet and limited to Chinese name, English name, region, and category;
- preserve a two-column image layout at 390px;
- preserve full keyboard navigation, visible focus treatment, image alt text, and reduced-motion behavior;
- provide accurate `next/image` `sizes` values for dominant and standard placements.

The layout varies presentation only. Item order, URLs, locale behavior, and CMS data remain unchanged. Search results reuse the same layout without introducing new client state or a new API.

## Component Boundaries

- `app/[locale]/heritage/page.tsx`: collection introduction spacing and semantic page structure.
- `components/heritage/heritage-list-client.tsx`: result-grid placement variants and search/filter presentation.
- `components/heritage/heritage-card.tsx`: image aspect, metadata hierarchy, and responsive image sizing by variant.
- `lib/search/semantic-search.ts`: precise term expansion only.
- Existing repository mapping and CMS media components remain unchanged.

## Data Flow

`getHeritageItems()` continues reading `heritage_items`, categories, and media relations from Supabase. `mapHeritageItemRow()` continues choosing `cover`, then `hero`, then the default placeholder. The list client filters the server-provided items locally and calls the existing `/api/search` endpoint for intent search. No new fetch path or persistence layer is added.

## Error Handling

- Abort the media update if a target project has fewer than two Gallery images.
- Abort if a selected Gallery URL or source record cannot be read.
- Verify the six role bindings immediately after the update and report any partial failure.
- Preserve the existing client fallback to local filtering when semantic search fails.

## Verification

- Unit regression: `戏曲` returns 川剧 but not景德镇陶瓷 or 打铁花.
- Repository regression: public image fallback remains Cover, then Hero, then default; Gallery is never used automatically.
- Data readback: all three projects expose real HTTPS Cover and Hero URLs and retain their Gallery counts.
- Full checks: `npm test`, `npm run typecheck`, and `npm run build`.
- Playwright at 1440px and 390px: real images render, desktop curatorial hierarchy is visible, mobile remains two columns, search is accurate, filters work, and no overlap or horizontal overflow occurs.

## Risks and Controls

- Media rows currently contain duplicate `sort_order` values. Selection therefore uses the Gallery order already emitted by the public repository, not an assumed database order.
- Updating media bindings changes content data but not schema. The exact previous bindings are captured before mutation so the change can be audited.
- Uneven editorial spans can produce gaps with small result sets. Placement variants repeat predictably and collapse to a strict two-column mobile grid.
- Search precision must not break literal `舞台` searches. Only semantic expansion changes; literal tokenization remains intact.
