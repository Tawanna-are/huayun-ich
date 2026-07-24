import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("contact application UI", () => {
  it("uses the shared form on home and heritage pages", () => {
    const home = readFileSync("components/home/home-contact-entry.tsx", "utf8");
    const detail = readFileSync("app/[locale]/heritage/[slug]/page.tsx", "utf8");

    expect(home).toContain("ContactApplicationForm");
    expect(detail).toContain("ContactApplicationForm");
    expect(home).not.toContain('href="/heritage"');
  });

  it("offers all agreed contact types without publishing email or phone", () => {
    const form = readFileSync("components/contact/contact-application-form.tsx", "utf8");

    for (const kind of ["general", "supporter", "cooperation", "licensing"]) {
      expect(form).toContain(kind);
    }
    expect(form).toContain("consent");
    expect(form).toContain("website");
    expect(form).not.toContain("mailto:");
    expect(form).not.toContain("tel:");
  });
});
