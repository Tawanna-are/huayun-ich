import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("homepage promotions", () => {
  it("renders the three promotion placements around the existing homepage content", () => {
    const source = readFileSync("components/home/home-cms-content.tsx", "utf8");

    const hero = source.indexOf("<HeritageExplorerHero");
    const top = source.indexOf('<HomePromotions placement="top"');
    const video = source.indexOf('<HomePromotions placement="video"');
    const contact = source.indexOf("<HomeContactEntry");
    const bottom = source.indexOf('<HomePromotions placement="bottom"');

    expect(hero).toBeGreaterThan(-1);
    expect(top).toBeGreaterThan(hero);
    expect(video).toBeGreaterThan(top);
    expect(bottom).toBeGreaterThan(video);
    expect(contact).toBeGreaterThan(bottom);
  });

  it("uses published database rows with localized fields", () => {
    const source = readFileSync("components/home/home-promotions.tsx", "utf8");

    expect(source).toContain('eq("published",true)');
    expect(source).toContain("title_zh");
    expect(source).toContain("title_en");
    expect(source).toContain("media_alt_zh");
    expect(source).toContain("media_alt_en");
  });

  it("keeps banner and video media responsive without cropping", () => {
    const source = readFileSync("components/home/home-promotions.tsx", "utf8");

    expect(source).toContain("aspect-[9/16]");
    expect(source).toContain("max-w-[420px]");
    expect(source).toContain("object-contain");
    expect(source).toContain("controls playsInline preload=\"metadata\"");
    expect(source).not.toContain("autoPlay");
    expect(source).not.toContain("loop");
  });

  it("maps the supported slots and localizes content by locale", () => {
    const source = readFileSync("components/home/home-promotions.tsx", "utf8");

    expect(source).toContain('"top_banner"');
    expect(source).toContain('"video"');
    expect(source).toContain('"bottom_banner"');
    expect(source).toContain('locale === "zh" ? row.title_zh : row.title_en');
    expect(source).toContain('locale === "zh" ? row.description_zh : row.description_en');
    expect(source).toContain('locale === "zh" ? row.cta_zh : row.cta_en');
  });

  it("allows image or video media in all three homepage placements", () => {
    const source = readFileSync("components/home/home-promotions.tsx", "utf8");

    expect(source).toContain('row.media_type === "image" || row.media_type === "video"');
    expect(source).not.toContain('placement === "video" ? row.media_type === "video"');
  });

  it("provides an image fallback without touching heritage item data", () => {
    const source = readFileSync("components/home/home-promotions.tsx", "utf8");

    expect(source).toContain("catch { return []; }");
    expect(source).toContain("if(!rows.length)return null");
    expect(source).not.toContain("HeritageItem");
  });

  it("ships a public read policy limited to published promotions", () => {
    const migration = readFileSync(
      "supabase/migrations/20260908_homepage_promotions_public_read.sql",
      "utf8"
    );

    expect(migration).toContain("to anon, authenticated");
    expect(migration).toContain("using (published = true)");
    expect(migration).not.toContain("for insert");
    expect(migration).not.toContain("for update");
    expect(migration).not.toContain("for delete");
  });
});
