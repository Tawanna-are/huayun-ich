import { describe, expect, it } from "vitest";
import { parseSearchRequest } from "@/lib/search/search-request";

describe("semantic search request parser", () => {
  it("normalizes a valid semantic search request", () => {
    const parsed = parseSearchRequest({
      query: "  刺绣  ",
      locale: "zh",
      category: "traditional-craft",
      province: "江苏省",
      limit: 50
    });

    expect(parsed).toEqual({
      ok: true,
      query: "刺绣",
      locale: "zh",
      category: "traditional-craft",
      province: "江苏省",
      limit: 24
    });
  });

  it("rejects empty or invalid search bodies", () => {
    expect(parseSearchRequest(null)).toEqual({
      ok: false,
      status: 400,
      error: "Invalid request body."
    });

    expect(parseSearchRequest({ query: " " })).toEqual({
      ok: false,
      status: 400,
      error: "Missing search query."
    });
  });
});
