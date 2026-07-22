# Heritage Insights Design Spec

## Goal

Add a museum-grade data visualization room that makes Huayun feel like a digital cultural research platform, not only an archive. The room is available at `/museum/insights` under both `/zh` and `/en`.

## Visualizations

1. Heritage distribution heat map
   - Uses existing province metadata and published heritage items.
   - Shows province counts, intensity, and top regions.
   - Links users back into province-filtered archive exploration.

2. Dynasty timeline
   - Uses each item's timeline/history text and inscription year.
   - Groups records into broad historical periods: Pre-Qin, Han-Tang, Song-Yuan, Ming-Qing, Modern, Contemporary.
   - Shows representative items per period.

3. Category statistics
   - Groups records by `categorySlug`.
   - Shows counts, percentages, and a compact visual bar/ring treatment.

4. Inheritance relationship graph
   - Builds a light SVG network from heritage item, inheritor, category, and province nodes.
   - Avoids heavy force-directed libraries for performance.

## Architecture

Create a server-side aggregation module in `lib/content/heritage-insights.ts`. The page fetches `getHeritageItems()` once, builds insight data, and passes plain objects to server-rendered SVG components in `components/insights`.

## Route

- `/zh/museum/insights`
- `/en/museum/insights`

The route includes localized metadata, Open Graph, hreflang through `createMetadata`, Breadcrumb JSON-LD, and a `Dataset` JSON-LD object.

## Performance

The first version must not introduce chart libraries. All charts are SVG/CSS rendered on the server, with no client state required. This keeps the page fast and stable for Lighthouse.

## Acceptance Criteria

- Four visual sections render from Supabase-backed heritage content.
- The page still works with an empty dataset.
- Sitemap includes localized `/museum/insights`.
- Tests cover aggregation behavior, route structure, and sitemap entry.
- `npm run typecheck`, `npm test`, and `npm run build` pass.
