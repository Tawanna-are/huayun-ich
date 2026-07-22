import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("CMS-driven homepage featured content", () => {
  it("adds a featured flag and an index through a database migration", () => {
    const migration = readFileSync("supabase/migrations/20260712_featured_heritage.sql", "utf8");

    expect(migration).toContain("add column if not exists featured boolean not null default false");
    expect(migration).toContain("heritage_items_featured_idx");
    expect(migration).toContain("where published = true and featured = true");
  });

  it("selects featured CMS records instead of a hard-coded slug list", () => {
    const page = readFileSync("app/[locale]/page.tsx", "utf8");
    const contentPath = "components/home/home-cms-content.tsx";

    expect(page).toContain("const itemsPromise = getHeritageItems()");
    expect(existsSync(contentPath)).toBe(true);
    if (!existsSync(contentPath)) return;
    const content = readFileSync(contentPath, "utf8");
    expect(content).toContain("items.filter((item) => item.featured)");
    expect(page).not.toContain("featuredSlugs");
  });

  it("passes featured CMS images into the new homepage explorer", () => {
    const content = readFileSync("components/home/home-cms-content.tsx", "utf8");

    expect(content).toContain("items.filter((item) => item.featured)");
    expect(content).toContain("<HeritageExplorerHero");
    expect(content).not.toContain("featuredSlugs");
  });

  it("persists featured through the admin API and exposes an editor switch", () => {
    const createRoute = readFileSync("app/api/admin/heritage/route.ts", "utf8");
    const updateRoute = readFileSync("app/api/admin/heritage/[id]/route.ts", "utf8");
    const admin = readFileSync("components/admin/heritage-admin-client.tsx", "utf8");

    expect(createRoute).toContain("featured: payload.featured");
    expect(updateRoute).toContain("featured: payload.featured");
    expect(admin).toContain('updateHeritageField("featured"');
    expect(admin).toContain("首页精选");
  });

  it("renders the homepage dynamically so CMS changes appear immediately", () => {
    const page = readFileSync("app/[locale]/page.tsx", "utf8");

    expect(page).toContain('export const dynamic = "force-dynamic"');
    expect(page).toContain("noStore()");
  });
});
