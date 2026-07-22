import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("performance boundaries", () => {
  it("keeps the animated map behind a lazy client boundary", () => {
    const mapExplorerSource = readFileSync("components/home/map-explorer.tsx", "utf8");

    expect(mapExplorerSource).toContain("lazy-china-map-explorer-client");
    expect(mapExplorerSource).not.toContain(
      'import { ChinaMapExplorerClient } from "@/components/home/china-map-explorer-client"'
    );
  });
});
