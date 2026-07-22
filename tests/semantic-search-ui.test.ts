import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("heritage list semantic search UI", () => {
  it("keeps the archive UI while routing query input through semantic search", () => {
    const source = readFileSync("components/heritage/heritage-list-client.tsx", "utf8");

    expect(source).toContain("/api/search");
    expect(source).toContain("useLocale");
    expect(source).toContain("semanticItems");
    expect(source).toContain("filterHeritageItems");
  });
});
