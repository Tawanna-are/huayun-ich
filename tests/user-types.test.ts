import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("user database types", () => {
  it("declares user-owned table row types", () => {
    const source = readFileSync("lib/types/database.ts", "utf8");

    expect(source).toContain("UserFavoriteRow");
    expect(source).toContain("UserBrowsingHistoryRow");
    expect(source).toContain("UserPreferenceRow");
    expect(source).toContain("interest_tags: string[]");
    expect(source).toContain("UserFavoriteTargetType");
    expect(source).toContain('"heritage" | "inheritor" | "museum_topic"');
    expect(source).toContain("target_type: UserFavoriteTargetType");
    expect(source).toContain("target_id: string");
  });
});
