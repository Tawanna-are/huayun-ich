import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("localized canonical routing", () => {
  it("permanently redirects the bare domain homepage to the Chinese homepage", () => {
    const source = readFileSync("middleware.ts", "utf8");

    expect(source).toContain("NextResponse.redirect(new URL(\"/zh\", request.url), 308)");
  });

  it("makes homepage metadata use the locale-aware root path explicitly", () => {
    const source = readFileSync("app/[locale]/page.tsx", "utf8");

    expect(source).toContain('path: "/"');
  });
});
