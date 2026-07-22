import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("campaign share poster", () => {
  it("adds an SVG poster endpoint for H5 campaigns", () => {
    const routePath = "app/api/content/campaigns/[slug]/poster/route.ts";

    expect(existsSync(routePath)).toBe(true);

    const source = readFileSync(routePath, "utf8");

    expect(source).toContain("image/svg+xml");
    expect(source).toContain("resolveCampaignDetail");
    expect(source).toContain("getHeritageItems");
    expect(source).toContain("export async function GET");
  });

  it("links campaign detail pages to the share poster", () => {
    const source = readFileSync("components/campaigns/campaign-detail.tsx", "utf8");

    expect(source).toContain("Share poster");
    expect(source).toContain("/api/content/campaigns/");
    expect(source).toContain("/poster");
  });
});
