import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("user system pages", () => {
  it("adds localized login, auth callback and profile pages", () => {
    expect(readFileSync("app/[locale]/login/page.tsx", "utf8")).toContain("LoginForm");
    expect(readFileSync("app/[locale]/auth/callback/page.tsx", "utf8")).toContain("AuthCallbackClient");
    expect(readFileSync("app/[locale]/profile/page.tsx", "utf8")).toContain("ProfileDashboard");
  });

  it("adds client components for email auth, Google auth, favorites and history", () => {
    const login = readFileSync("components/user/login-form.tsx", "utf8");
    const profile = readFileSync("components/user/profile-dashboard.tsx", "utf8");
    const favorite = readFileSync("components/user/favorite-button.tsx", "utf8");
    const tracker = readFileSync("components/user/browsing-history-tracker.tsx", "utf8");

    expect(login).toContain("signInWithPassword");
    expect(login).toContain("signUp");
    expect(login).toContain("signInWithOAuth");
    expect(profile).toContain("user_favorites");
    expect(profile).toContain("user_browsing_history");
    expect(profile).toContain("user_preferences");
    expect(favorite).toContain("user_favorites");
    expect(tracker).toContain("user_browsing_history");
  });
});
