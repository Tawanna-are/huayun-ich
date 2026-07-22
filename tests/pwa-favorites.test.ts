import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("PWA favorite offline cache", () => {
  it("adds a client component that sends favorite assets to the service worker", () => {
    const componentPath = "components/pwa/favorite-offline-cache.tsx";

    expect(existsSync(componentPath)).toBe(true);

    const source = readFileSync(componentPath, "utf8");

    expect(source).toContain('"use client"');
    expect(source).toContain("CACHE_FAVORITES");
    expect(source).toContain("navigator.serviceWorker.ready");
    expect(source).toContain("postMessage");
  });

  it("adds the offline cache action to the profile dashboard", () => {
    const source = readFileSync("components/user/profile-dashboard.tsx", "utf8");

    expect(source).toContain("FavoriteOfflineCache");
    expect(source).toContain("favoriteItems");
    expect(source).toContain("cacheFavoritesOffline");
  });

  it("teaches the service worker to cache favorite routes and assets", () => {
    const source = readFileSync("public/sw.js", "utf8");

    expect(source).toContain("CACHE_FAVORITES");
    expect(source).toContain("event.data.urls");
    expect(source).toContain("cache.addAll");
  });
});
