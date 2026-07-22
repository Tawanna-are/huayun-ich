# Bulk Import System Design Spec

## Goal

Build an admin-only bulk import center that can ingest 1000 heritage records from CSV or Excel, upload batches of media files, automatically link media to imported heritage items, and keep auditable import logs.

## Scope

1. Heritage data import
   - Add `/admin/import` as a localized CMS page.
   - Support `.csv` and `.xlsx` uploads through admin API routes.
   - Provide a preview step that parses, validates, deduplicates, and summarizes rows without writing content.
   - Provide a commit step that upserts valid rows in batches of 100.
   - Deduplicate by `slug` first, then by `name + province`.

2. Media batch import
   - Support image and video files through the same import center.
   - Use the existing Supabase Storage bucket `heritage-media`.
   - Automatically link media to `heritage_items` by filename convention:
     - `heritage-slug__gallery__filename.webp`
     - `heritage-slug__cover__filename.jpg`
     - `heritage-slug__hero__filename.png`
     - `heritage-slug__video__filename.mp4`
     - `heritage-slug__poster__filename.webp`
   - Register uploaded media in `media_assets`, keeping existing frontend auto-render behavior.

3. Import logs
   - Add `import_jobs` for each import batch.
   - Add `import_job_rows` for row-level status, source row number, entity key, action, and error details.
   - Admin UI shows the latest jobs and result counters.

## Data Contract

Required spreadsheet columns:

- `slug`
- `name`
- `category_slug`
- `summary`
- `province`

Optional spreadsheet columns:

- `english_name`
- `region`
- `city`
- `inscription_year`
- `history`
- `timeline`
- `tags`
- `related_slugs`
- `latitude`
- `longitude`
- `map_x`
- `map_y`
- `inheritor_name`
- `inheritor_title`
- `inheritor_bio`
- `inheritor_image_url`
- `published`
- `sort_order`

List fields accept comma-separated or newline-separated values. Timeline accepts either JSON or newline rows in the format `year|title|description`.

## Architecture

- `lib/admin/import-parser.ts` parses CSV and minimal Excel worksheet data into raw records.
- `lib/admin/import-validation.ts` maps raw records into typed heritage import rows and validation results.
- `lib/admin/import-service.ts` performs preview, commit, import job logging, and media registration.
- `app/api/admin/import/heritage/preview/route.ts` returns preview results.
- `app/api/admin/import/heritage/commit/route.ts` creates an import job and upserts rows.
- `app/api/admin/import/media/route.ts` uploads media and links it by filename convention.
- `components/admin/import-admin-client.tsx` gives admins a focused import interface.

## Error Handling

- Unauthorized requests return 401 through `verifyAdminRequest`.
- Bad file types return 400.
- Invalid rows return preview errors and are skipped on commit.
- Duplicate rows are marked as `duplicate` in preview.
- Database failures are written to `import_job_rows` when an import job exists.

## Acceptance Criteria

- Admin can upload CSV or Excel and see total, valid, invalid, duplicate, create, and update counts.
- Admin can commit valid rows in 100-row batches.
- Admin can upload batches of images/videos and auto-link them through filename convention.
- Import logs persist in Supabase.
- Existing frontend pages keep reading `heritage_items` and `media_assets` without UI changes.
- Typecheck, tests, and production build pass.
