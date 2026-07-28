import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routes = ["disclaimer", "privacy", "copyright", "terms"] as const;

describe("legal pages", () => {
  it.each(routes)("provides a localized %s route with SEO metadata", (route) => {
    const path = `app/[locale]/${route}/page.tsx`;
    expect(existsSync(path)).toBe(true);

    const source = readFileSync(path, "utf8");
    expect(source).toContain("createMetadata");
    expect(source).toContain(`path: "/${route}"`);
    expect(source).toContain(`getLegalDocument("${route}"`);
    expect(source).toContain("isAppLocale");
    expect(source).toContain("setRequestLocale");
    expect(source).toContain("<LegalPage");
  });

  it("renders semantic legal content in the existing visual language", () => {
    const source = readFileSync("components/legal/legal-page.tsx", "utf8");

    expect(source).toContain("<article");
    expect(source).toContain("museum-container");
    expect(source).toContain("bg-[#f4f1ea]");
    expect(source).toContain("serif-title");
    expect(source).toContain("Last updated");
    expect(source).toContain("最后更新");
    expect(source).toContain("<Link");
    expect(source).toContain("segment.href");
  });
});
