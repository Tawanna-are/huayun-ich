import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("bulk import schema", () => {
  it("creates import job tables with row-level logs and RLS", () => {
    const source = readFileSync("supabase/migrations/20260608_import_jobs.sql", "utf8");

    expect(source).toContain("create table if not exists public.import_jobs");
    expect(source).toContain("create table if not exists public.import_job_rows");
    expect(source).toContain("job_type text not null");
    expect(source).toContain("source_file_name text");
    expect(source).toContain("total_rows integer not null default 0");
    expect(source).toContain("success_rows integer not null default 0");
    expect(source).toContain("error_rows integer not null default 0");
    expect(source).toContain("import_job_rows_job_idx");
    expect(source).toContain("alter table public.import_jobs enable row level security");
    expect(source).toContain("alter table public.import_job_rows enable row level security");
  });

  it("adds strict TypeScript types for import jobs", () => {
    const source = readFileSync("lib/types/database.ts", "utf8");

    expect(source).toContain("export type ImportJobRow");
    expect(source).toContain("export type ImportJobRowDetail");
    expect(source).toContain('"heritage" | "media"');
    expect(source).toContain('"pending" | "processing" | "completed" | "failed"');
  });
});
