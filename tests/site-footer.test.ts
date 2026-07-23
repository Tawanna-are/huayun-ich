import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("site footer", () => {
  it("does not expose implementation vendor links to visitors", () => {
    const source = readFileSync("components/layout/site-footer.tsx", "utf8");

    expect(source).not.toContain(">Build<");
    expect(source).not.toContain("https://supabase.com");
    expect(source).not.toContain("ArrowUpRight");
  });

  it("does not render the footer exploration menu", () => {
    const source = readFileSync("components/layout/site-footer.tsx", "utf8");

    expect(source).not.toContain(">Explore<");
    expect(source).not.toContain('href="/museum"');
    expect(source).not.toContain('href="/assistant"');
    expect(source).not.toContain('href="/inheritors"');
  });
});
