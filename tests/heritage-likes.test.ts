import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("heritage likes", () => {
  it("requires a verified user and never accepts a client user id", () => {
    const route = readFileSync("app/api/engagement/likes/route.ts", "utf8");

    expect(route).toContain("auth.getUser");
    expect(route).toContain("heritage_likes");
    expect(route).not.toMatch(/payload\.userId|body\.userId/);
  });

  it("mounts the like button without removing favorite or history", () => {
    const page = readFileSync("app/[locale]/heritage/[slug]/page.tsx", "utf8");

    expect(page).toContain("HeritageLikeButton");
    expect(page).toContain("FavoriteButton");
    expect(page).toContain("BrowsingHistoryTracker");
  });

  it("provides localized pressed state and a login redirect", () => {
    const button = readFileSync("components/heritage/heritage-like-button.tsx", "utf8");

    expect(button).toContain("aria-pressed");
    expect(button).toContain('router.push("/login")');
    expect(button).toContain('zh:');
    expect(button).toContain('en:');
  });
});
