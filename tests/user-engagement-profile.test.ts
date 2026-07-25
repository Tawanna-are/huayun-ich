import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("profile engagement status", () => {
  it("maps saved gallery images into a dedicated profile group", () => {
    const source = readFileSync("components/user/profile-dashboard.tsx", "utf8");

    expect(source).toContain('target_type === "heritage_image"');
    expect(source).toContain("imageById");
    expect(source).toContain("imageFavorites");
    expect(source).toContain("imageFavoritesLabel");
    expect(source).toContain("image.id");
    expect(source).toContain('targetType="heritage_image"');
    expect(source).toContain("favoriteCount = favoriteItems.length + imageFavorites.length");
    expect(source).toMatch(/<FavoriteOfflineCache\s+items=\{favoriteItems\}/);
  });

  it("shows comments and applications without removing favorites or history", () => {
    const source = readFileSync("components/user/profile-dashboard.tsx", "utf8");

    expect(source).toContain("heritage_comments");
    expect(source).toContain("contact_submissions");
    expect(source).toContain("user_favorites");
    expect(source).toContain("user_browsing_history");
    expect(source).toContain("HeritageCommentStatus");
    expect(source).toContain("ContactSubmissionStatus");
  });
});
