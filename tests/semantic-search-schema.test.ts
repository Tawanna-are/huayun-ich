import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("semantic search seed content", () => {
  it("includes the current tie-dye heritage seed for semantic recall", () => {
    const schema = readFileSync("supabase/schema.sql", "utf8");

    expect(schema).toContain("08d7f672-4220-42df-9bd5-7e5bc7aa62d9");
    expect(schema).toContain("tie-dye");
    expect(schema).not.toContain("suzhou-embroidery");
    expect(schema).not.toContain("hunan-embroidery");
    expect(schema).not.toContain("shu-embroidery");
    expect(schema).not.toContain("yue-embroidery");
  });
});
