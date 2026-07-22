import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("multichannel content API routes", () => {
  it("exposes a read-only shared content feed", () => {
    const routePath = "app/api/content/route.ts";

    expect(existsSync(routePath)).toBe(true);

    const source = readFileSync(routePath, "utf8");

    expect(source).toContain("export async function GET");
    expect(source).toContain("createMultichannelContent");
    expect(source).toContain("getHeritageItems");
    expect(source).toContain("getCategories");
    expect(source).toContain("getInheritorProfiles");
    expect(source).not.toContain("export async function POST");
  });

  it("exposes H5 campaign and offline payload endpoints", () => {
    const campaignsPath = "app/api/content/campaigns/route.ts";
    const offlinePath = "app/api/content/offline/route.ts";

    expect(existsSync(campaignsPath)).toBe(true);
    expect(existsSync(offlinePath)).toBe(true);

    const campaignsSource = readFileSync(campaignsPath, "utf8");
    const offlineSource = readFileSync(offlinePath, "utf8");

    expect(campaignsSource).toContain("export async function GET");
    expect(campaignsSource).toContain("createCampaignCollection");
    expect(offlineSource).toContain("export async function GET");
    expect(offlineSource).toContain("createOfflineContentPayload");
  });
});
