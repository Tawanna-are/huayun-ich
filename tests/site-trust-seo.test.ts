import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("site trust SEO", () => {
  it("lists About and Contact pages in the localized sitemap", () => {
    const source = readFileSync("app/sitemap.ts", "utf8");
    expect(source).toContain('createEntries("/about", "monthly", 0.6)');
    expect(source).toContain('createEntries("/contact", "monthly", 0.6)');
  });

  it("keeps public pages crawlable while protecting private routes", () => {
    const source = readFileSync("app/robots.ts", "utf8");
    expect(source).toContain('userAgent: "*"');
    expect(source).toContain('allow: "/"');
    expect(source).toContain('disallow: ["/admin", "/zh/admin", "/en/admin", "/api/", "/monitoring"]');
  });

  it("adds localized About and Contact links to the footer", () => {
    const source = readFileSync("components/layout/site-footer.tsx", "utf8");
    expect(source).toContain('href: "/about"');
    expect(source).toContain('href: "/contact"');
    expect(source).toContain("关于我们");
    expect(source).toContain("联系我们");
    expect(source).toContain("About Huayun");
    expect(source).toContain("Contact Us");
  });
});
