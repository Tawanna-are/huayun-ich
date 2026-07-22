import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("admin bulk import page", () => {
  it("adds a localized import page and client UI", () => {
    const pagePath = "app/[locale]/admin/import/page.tsx";
    const clientPath = "components/admin/import-admin-client.tsx";

    expect(existsSync(pagePath)).toBe(true);
    expect(existsSync(clientPath)).toBe(true);

    const pageSource = readFileSync(pagePath, "utf8");
    const clientSource = readFileSync(clientPath, "utf8");

    expect(pageSource).toContain("ImportAdminClient");
    expect(clientSource).toContain("Excel");
    expect(clientSource).toContain("CSV");
    expect(clientSource).toContain("批量图片");
    expect(clientSource).toContain("批量视频");
    expect(clientSource).toContain("/api/admin/import/heritage/preview");
    expect(clientSource).toContain("/api/admin/import/heritage/commit");
    expect(clientSource).toContain("/api/admin/import/media");
  });

  it("links the import center from the existing admin dashboard", () => {
    const source = readFileSync("components/admin/heritage-admin-client.tsx", "utf8");

    expect(source).toContain("/admin/import");
    expect(source).toContain("批量导入");
  });
});
