import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("museum topic detail route", () => {
  it("is a localized server-rendered topic page with metadata and JSON-LD", () => {
    const pagePath = "app/[locale]/museum/topics/[slug]/page.tsx";

    expect(existsSync(pagePath)).toBe(true);

    const source = readFileSync(pagePath, "utf8");

    expect(source).not.toContain('"use client"');
    expect(source).toContain("generateStaticParams");
    expect(source).toContain("generateMetadata");
    expect(source).toContain("resolveMuseumTopicDetail");
    expect(source).toContain("createBreadcrumbJsonLd");
    expect(source).toContain("ItemList");
    expect(source).toContain("CollectionPage");
  });
});
