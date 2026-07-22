import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("bulk heritage import APIs", () => {
  it("adds admin-only preview and commit routes", () => {
    const previewPath = "app/api/admin/import/heritage/preview/route.ts";
    const commitPath = "app/api/admin/import/heritage/commit/route.ts";

    expect(existsSync(previewPath)).toBe(true);
    expect(existsSync(commitPath)).toBe(true);

    const previewSource = readFileSync(previewPath, "utf8");
    const commitSource = readFileSync(commitPath, "utf8");

    expect(previewSource).toContain("verifyAdminRequest");
    expect(previewSource).toContain("previewHeritageImport");
    expect(previewSource).toContain("parseSpreadsheetFile");
    expect(commitSource).toContain("verifyAdminRequest");
    expect(commitSource).toContain("commitHeritageImport");
    expect(commitSource).toContain("batchSize: 100");
  });

  it("adds import service behavior for preview, dedupe, logs and batched upserts", () => {
    const source = readFileSync("lib/admin/import-service.ts", "utf8");

    expect(source).toContain("previewHeritageImport");
    expect(source).toContain("commitHeritageImport");
    expect(source).toContain("createImportJob");
    expect(source).toContain('from("import_jobs")');
    expect(source).toContain('from("import_job_rows")');
    expect(source).toContain(".upsert");
    expect(source).toContain("slice(index, index + batchSize)");
  });
});
