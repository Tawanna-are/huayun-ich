# Bulk Import System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin-only bulk import system for 1000 heritage records, batch media uploads, automatic media linking, validation, deduplication, and import logs.

**Architecture:** Add focused admin import utilities for parsing, validation, preview, commit, and media registration. Keep import UI isolated in `/admin/import` and reuse existing Supabase admin auth, Storage bucket, `heritage_items`, and `media_assets`.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Supabase admin client, Tailwind/Shadcn UI, Vitest, browser File APIs.

---

### Task 1: Import Schema and Types

**Files:**
- Create: `supabase/migrations/20260608_import_jobs.sql`
- Modify: `lib/types/database.ts`
- Test: `tests/admin-bulk-import-schema.test.ts`

- [ ] Add failing tests for `import_jobs`, `import_job_rows`, RLS, and TypeScript row types.
- [ ] Create the migration with indexes and RLS enabled.
- [ ] Add `ImportJobRow` and `ImportJobRowDetail` types.
- [ ] Run `npm.cmd test -- tests/admin-bulk-import-schema.test.ts`.

### Task 2: CSV/Excel Parsing and Validation

**Files:**
- Create: `lib/admin/import-parser.ts`
- Create: `lib/admin/import-validation.ts`
- Test: `tests/admin-bulk-import-parser.test.ts`

- [ ] Add failing tests for CSV parsing, Excel route support markers, required field validation, timeline parsing, list fields, and dedupe keys.
- [ ] Implement CSV parser without external dependencies.
- [ ] Implement a minimal XLSX parser interface and return actionable errors for unsupported workbook structures.
- [ ] Implement heritage row validation and normalization.
- [ ] Run `npm.cmd test -- tests/admin-bulk-import-parser.test.ts`.

### Task 3: Preview and Commit APIs

**Files:**
- Create: `lib/admin/import-service.ts`
- Create: `app/api/admin/import/heritage/preview/route.ts`
- Create: `app/api/admin/import/heritage/commit/route.ts`
- Test: `tests/admin-bulk-import-api.test.ts`

- [ ] Add failing tests for admin authorization, preview API, commit API, batch size 100, dedupe by slug and name/province, and import log writes.
- [ ] Implement preview service.
- [ ] Implement commit service with batched upserts.
- [ ] Implement API routes with `verifyAdminRequest`.
- [ ] Run `npm.cmd test -- tests/admin-bulk-import-api.test.ts`.

### Task 4: Batch Media Import

**Files:**
- Modify: `lib/admin/import-service.ts`
- Create: `app/api/admin/import/media/route.ts`
- Test: `tests/admin-bulk-media-import.test.ts`

- [ ] Add failing tests for filename convention parsing, supported image/video MIME types, `media_assets` insertion, and skipped unmatched files.
- [ ] Implement filename convention parser.
- [ ] Upload supported media to `heritage-media`.
- [ ] Insert linked `media_assets` rows.
- [ ] Run `npm.cmd test -- tests/admin-bulk-media-import.test.ts`.

### Task 5: Admin Import UI

**Files:**
- Create: `app/[locale]/admin/import/page.tsx`
- Create: `components/admin/import-admin-client.tsx`
- Modify: `components/admin/heritage-admin-client.tsx`
- Test: `tests/admin-bulk-import-page.test.ts`

- [ ] Add failing tests for `/admin/import`, Excel/CSV copy, batch media upload copy, and links from the main admin client.
- [ ] Implement the import page.
- [ ] Implement the import client UI.
- [ ] Add a navigation entry from the existing admin dashboard.
- [ ] Run `npm.cmd test -- tests/admin-bulk-import-page.test.ts`.

### Task 6: Verification

**Files:**
- No feature files.

- [ ] Run `npm.cmd run typecheck`.
- [ ] Run `npm.cmd test`.
- [ ] Run `npm.cmd run build`.
