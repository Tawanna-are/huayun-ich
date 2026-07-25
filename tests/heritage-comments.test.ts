import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateComment } from "@/lib/engagement/validation";

describe("moderated heritage comments", () => {
  it("normalizes plain text and enforces length", () => {
    expect(validateComment("  useful observation  ")).toEqual({ ok: true, value: "useful observation" });
    expect(validateComment("x")).toEqual({ ok: false, error: "invalid_comment" });
    expect(validateComment("a".repeat(801))).toEqual({ ok: false, error: "invalid_comment" });
  });

  it("forces pending writes and returns only safe public fields", () => {
    const route = readFileSync("app/api/engagement/comments/route.ts", "utf8");

    expect(route).toContain('status: "pending"');
    expect(route).toContain('select("id, body, status, created_at")');
    expect(route).not.toContain('select("*")');
  });

  it("mounts comments without removing existing detail content", () => {
    const page = readFileSync("app/[locale]/heritage/[slug]/page.tsx", "utf8");

    expect(page).toContain("HeritageComments");
    expect(page).toContain("CraftMediaGallery");
    expect(page).toContain("HeritageVideoArchive");
    expect(page).toContain("HeritageLikeButton");
  });
});
