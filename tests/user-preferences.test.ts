import { describe, expect, it } from "vitest";
import { normalizeInterestTags, normalizePreferredLocale } from "@/lib/user/preferences";

describe("user preferences", () => {
  it("normalizes stored language preferences", () => {
    expect(normalizePreferredLocale("en")).toBe("en");
    expect(normalizePreferredLocale("zh")).toBe("zh");
    expect(normalizePreferredLocale("fr")).toBe("zh");
    expect(normalizePreferredLocale(null)).toBe("zh");
  });

  it("normalizes interest tags for recommendation signals", () => {
    expect(normalizeInterestTags([" 刺绣 ", "", "刺绣", "陶瓷"])).toEqual(["刺绣", "陶瓷"]);
    expect(normalizeInterestTags(null)).toEqual([]);
  });
});
