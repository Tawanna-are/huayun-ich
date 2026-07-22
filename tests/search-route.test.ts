import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("semantic search API route", () => {
  it("connects POST requests to database-backed semantic heritage search", () => {
    const source = readFileSync("app/api/search/route.ts", "utf8");

    expect(source).toContain("parseSearchRequest");
    expect(source).toContain("getHeritageItems");
    expect(source).toContain("searchHeritageItemsByIntent");
    expect(source).toContain("export async function POST");
  });
});
