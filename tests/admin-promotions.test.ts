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
    const uploadRoute = readFileSync("app/api/admin/promotions/upload-url/route.ts", "utf8");
    expect(route).toContain("verifyAdminRequest");
    expect(route).toContain("createSupabaseAdminClient");
    expect(route).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(uploadRoute).toContain("verifyAdminRequest");
    expect(uploadRoute).toContain("createSupabaseAdminClient");
    expect(uploadRoute).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
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
    const admin = readFileSync("components/admin/homepage-promotions-admin.tsx", "utf8");
    expect(source).toContain("150 * 1024 * 1024");
    expect(source).toContain("video/mp4");
    expect(source).toContain("image/webp");
    expect(admin).toContain('<option value="image">');
    expect(admin).toContain('<option value="video">');
    expect(admin).toContain('accept={row.media_type === "video" ? "video/mp4"');
  });

  it("keeps replacement ordering upload then database then old-file cleanup", () => {
    const source = readFileSync("app/api/admin/promotions/route.ts", "utf8");
    expect(source).toContain("upsert");
    expect(source).toContain("existing.media_type !== fields.media_type");
    expect(source).toContain("isNewVideoUpload");
    expect(source).toContain("cleanupUploadedVideo");
    expect(source.indexOf("upsert")).toBeLessThan(source.lastIndexOf("existing.storage_path"));
  });

  it("creates one-time signed upload permission for valid MP4 videos", () => {
    const source = readFileSync("app/api/admin/promotions/upload-url/route.ts", "utf8");
    expect(source).toContain("createSignedUploadUrl");
    expect(source).toContain("promotionStoragePath");
    expect(source).toContain("video/mp4");
    expect(source).toContain("MAX_PROMOTION_VIDEO_BYTES");
    expect(source).toContain("Admin Key 无效。");
    expect(source).toContain("token");
  });

  it("uploads videos directly to Storage and posts metadata without the File", () => {
    const source = readFileSync("components/admin/homepage-promotions-admin.tsx", "utf8");
    expect(source).toContain("/api/admin/promotions/upload-url");
    expect(source).toContain("uploadToSignedUrl");
    expect(source).toContain("正在准备上传…");
    expect(source).toContain("正在上传视频…");
    expect(source).toContain("正在保存广告信息…");
    expect(source).toContain("JSON.stringify");
    expect(source).toContain("storage_path");
  });

  it("accepts video metadata as JSON and rejects unsafe Storage paths", () => {
    const source = readFileSync("app/api/admin/promotions/route.ts", "utf8");
    expect(source).toContain('content-type');
    expect(source).toContain('application/json');
    expect(source).toContain('homepage-promotions/video/');
    expect(source).toContain('.endsWith(".mp4")');
    expect(source).toContain("published: true");
  });

  it("always publishes a promotion after save and hides status controls", () => {
    const route = readFileSync("app/api/admin/promotions/route.ts", "utf8");
    const source = readFileSync("components/admin/homepage-promotions-admin.tsx", "utf8");
    expect(route).toContain("published: true");
    expect(source).toContain("保存成功，首页已更新。");
    expect(source).not.toContain("type=\"checkbox\"");
  });
});
