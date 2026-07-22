import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("H5 campaign pages", () => {
  it("adds a localized server-rendered campaign index", () => {
    const pagePath = "app/[locale]/campaigns/page.tsx";

    expect(existsSync(pagePath)).toBe(true);

    const source = readFileSync(pagePath, "utf8");

    expect(source).not.toContain('"use client"');
    expect(source).toContain("generateMetadata");
    expect(source).toContain("createCampaignCollection");
    expect(source).toContain("CampaignIndex");
    expect(source).toContain("createBreadcrumbJsonLd");
    expect(source).toContain("ItemList");
  });

  it("adds localized campaign detail pages with static params and structured data", () => {
    const pagePath = "app/[locale]/campaigns/[slug]/page.tsx";

    expect(existsSync(pagePath)).toBe(true);

    const source = readFileSync(pagePath, "utf8");

    expect(source).not.toContain('"use client"');
    expect(source).toContain("generateStaticParams");
    expect(source).toContain("generateMetadata");
    expect(source).toContain("resolveCampaignDetail");
    expect(source).toContain("CampaignDetail");
    expect(source).toContain("CollectionPage");
    expect(source).toContain("createBreadcrumbJsonLd");
  });
});
