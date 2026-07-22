import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("heritage insights page route", () => {
  it("is a localized server-rendered museum insights page with SEO data", () => {
    const pagePath = "app/[locale]/museum/insights/page.tsx";

    expect(existsSync(pagePath)).toBe(true);

    const source = readFileSync(pagePath, "utf8");

    expect(source).not.toContain('"use client"');
    expect(source).toContain("generateMetadata");
    expect(source).toContain("createHeritageInsights");
    expect(source).toContain("createBreadcrumbJsonLd");
    expect(source).toContain("Dataset");
    expect(source).toContain("HeritageHeatMap");
    expect(source).toContain("DynastyTimelineChart");
    expect(source).toContain("CategoryStatChart");
    expect(source).toContain("InheritanceGraph");
  });
});
