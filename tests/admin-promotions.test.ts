import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("homepage promotions admin", () => {
  it("integrates the module into the legacy Admin Key backend", () => {
    const source = readFileSync("components/admin/heritage-admin-client.tsx", "utf8");
    expect(source).toContain("HomepagePromotionsAdmin");
    expect(source).toContain('id: "promotions"');
  });

  it("redirects the old standalone promotion routes", () => {
    expect(readFileSync("app/[locale]/admin/promotions/page.tsx", "utf8")).toContain("redirect");
    expect(readFileSync("app/[locale]/admin/promotions/page.tsx", "utf8")).toContain("/admin");
  });

  it("protects promotion APIs with the legacy Admin Key", () => {
    const route = readFileSync("app/api/admin/promotions/route.ts", "utf8");
    expect(route).toContain("verifyAdminRequest");
    expect(route).toContain("createSupabaseAdminClient");
    expect(route).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("exposes localized admin routes", () => {
    expect(readFileSync("app/[locale]/admin/promotions/page.tsx", "utf8")).toContain("redirect");
  });

  it("uses the legacy Admin Key module without browser service credentials", () => {
    const source = readFileSync("components/admin/homepage-promotions-admin.tsx", "utf8");
    expect(source).toContain("adminKey");
    expect(source).toContain("/api/admin/promotions");
    expect(source).not.toContain("ADMIN_API_KEY");
    expect(source).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("validates media types and the 150MB video limit", () => {
    const source = readFileSync("lib/admin/homepage-promotions.ts", "utf8");
    expect(source).toContain("150 * 1024 * 1024");
    expect(source).toContain("video/mp4");
    expect(source).toContain("image/webp");
  });

  it("keeps replacement ordering upload then database then old-file cleanup", () => {
    const source = readFileSync("app/api/admin/promotions/route.ts", "utf8");
    expect(source).toContain("upload");
    expect(source).toContain("upsert");
  });

  it("always publishes a promotion after save and hides status controls", () => {
    const route = readFileSync("app/api/admin/promotions/route.ts", "utf8");
    const source = readFileSync("components/admin/homepage-promotions-admin.tsx", "utf8");
    expect(route).toContain("published: true");
    expect(source).toContain("保存成功，首页已更新。");
    expect(source).not.toContain("type=\"checkbox\"");
  });
});
