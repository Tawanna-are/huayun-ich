import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("user engagement entry points", () => {
  it("keeps favorites and history and exposes authenticated profile navigation", () => {
    const profile = readFileSync("components/user/profile-dashboard.tsx", "utf8");
    const header = readFileSync("components/home/home-header.tsx", "utf8");

    expect(profile).toContain("user_favorites");
    expect(profile).toContain("user_browsing_history");
    expect(header).toContain('href: "/profile"');
    expect(header).toContain("onAuthStateChange");
  });
});
