import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("semantic search seed content", () => {
  it("includes representative embroidery items for semantic recall examples", () => {
    const schema = readFileSync("supabase/schema.sql", "utf8");

    expect(schema).toContain("suzhou-embroidery");
    expect(schema).toContain("hunan-embroidery");
    expect(schema).toContain("shu-embroidery");
    expect(schema).toContain("yue-embroidery");
  });
});
