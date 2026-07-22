# Heritage Collection List Design

## Goal

Transform `/{locale}/heritage` from an archive-style catalogue into a restrained, image-led "华韵收藏 / Collection" page while preserving the existing CMS data flow, semantic search, API contracts, database schema, and route structure.

## Scope

This phase changes only the public heritage list page and its presentation components. It does not change CMS fields, Supabase tables, API routes, upload behavior, Feishu synchronization, or heritage detail pages.

## Page Composition

### Collection Header

- Replace the current descriptive archive hero with a quiet collection heading.
- Display `华韵收藏` as the primary title and `Collection` as the English collection label.
- Keep only a small collection count; remove the long introductory paragraph and decorative gradient treatment.
- Use generous vertical whitespace and the existing warm museum palette.

### Search And Filters

- Keep the existing semantic search request and local fallback behavior unchanged.
- Present search as the primary control.
- Move category and province controls into one lightweight collapsible filter panel.
- Keep filters closed by default to reduce visual weight.
- Show active conditions as restrained text labels and retain the current result count and search-state feedback.
- Preserve query, category, and province URL initialization behavior.

### Collection Grid

- Use a three-column grid on desktop, two columns on tablet, and two columns on mobile.
- Use portrait-oriented image frames so the work remains the dominant visual signal.
- Place metadata below the image instead of over a dark image gradient.
- Each card displays only the main image, Chinese name, English name, region, and category.
- Do not render summary, history, inheritance value, or other explanatory copy.
- Keep hover motion subtle and retain accessible focus treatment.

## Data And Component Boundaries

- `app/[locale]/heritage/page.tsx` remains a server component and continues fetching `getHeritageItems()` and `getCategories()` in parallel.
- `HeritageListClient` remains the client boundary because search and filtering are interactive.
- `HeritageCard` continues using `next/image` and existing localized name selection.
- No new API call, CMS field, database migration, or client-side data store is introduced.

## Responsive Behavior

- Desktop at 1440px: three evenly spaced cards with generous gutters.
- Tablet: two columns.
- Mobile at 390px: two fixed columns with compact gaps, stable image ratios, and typography sized to prevent overlap.
- Filter controls may wrap or scroll inside their expanded panel without changing the grid width.

## Performance And Accessibility

- Keep `next/image` responsive `sizes` aligned with the three/two-column grid.
- Avoid adding client components or large animation dependencies.
- Preserve semantic headings, labels, keyboard focus, empty state, and loading/search state text.
- Use content visibility for the long collection grid if compatible with the existing component structure.

## Verification

- Add or update focused structural tests for the collection heading, reduced filter surface, required card fields, omitted long copy, and mobile two-column layout.
- Run the focused tests, full test suite, type check, and production build.
- Capture and inspect full-page screenshots at 1440px desktop and 390px mobile.
- Check image rendering, column count, text wrapping, horizontal overflow, and control overlap.

## Explicit Non-Goals

- No CMS, API, database, Supabase, upload, or Feishu synchronization changes.
- No heritage detail-page redesign in this phase.
- No removal or renaming of existing CMS fields.
- No new explanatory marketing copy.
