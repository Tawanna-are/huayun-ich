import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("user system integration", () => {
  it("connects profile navigation and detail-page collection actions", () => {
    const header = readFileSync("components/layout/site-header.tsx", "utf8");
    const detailPage = readFileSync("app/[locale]/heritage/[slug]/page.tsx", "utf8");
    const favoriteButton = readFileSync("components/user/favorite-button.tsx", "utf8");
    const inheritorCard = readFileSync("components/inheritors/inheritor-card.tsx", "utf8");
    const inheritorDetail = readFileSync("app/[locale]/inheritors/[id]/page.tsx", "utf8");
    const museumTopics = readFileSync("components/museum/featured-topics.tsx", "utf8");
    const profileDashboard = readFileSync("components/user/profile-dashboard.tsx", "utf8");

    expect(header).toContain("/profile");
    expect(detailPage).toContain("FavoriteButton");
    expect(detailPage).toContain("BrowsingHistoryTracker");
    expect(favoriteButton).toContain("target_type");
    expect(favoriteButton).toContain("target_id");
    expect(inheritorCard).toContain("FavoriteButton");
    expect(inheritorCard).toContain('"inheritor"');
    expect(inheritorDetail).toContain("FavoriteButton");
    expect(museumTopics).toContain("FavoriteButton");
    expect(museumTopics).toContain('"museum_topic"');
    expect(profileDashboard).toContain("museum_topic");
    expect(profileDashboard).toContain("inheritor");
    expect(profileDashboard).toContain("createHeritageRecommendations");
    expect(profileDashboard).toContain("interest_tags");
  });
});
