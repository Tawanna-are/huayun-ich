import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("legal sitemap entries", () => {
  it("includes every legal route through the localized sitemap helper", () => {
    const source = readFileSync("app/sitemap.ts", "utf8");

    for (const path of ["/disclaimer", "/privacy", "/copyright", "/terms"]) {
      expect(source).toContain(`createEntries("${path}", "yearly", 0.45)`);
    }
  });
});
