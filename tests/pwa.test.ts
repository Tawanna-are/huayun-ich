import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("PWA offline foundation", () => {
  it("defines app manifest metadata", () => {
    const source = readFileSync("app/manifest.ts", "utf8");

    expect(source).toContain("MetadataRoute.Manifest");
    expect(source).toContain("华韵");
    expect(source).toContain("display");
    expect(source).toContain("start_url");
    expect(source).toContain("/zh");
  });

  it("adds a localized offline page", () => {
    const pagePath = "app/[locale]/offline/page.tsx";

    expect(existsSync(pagePath)).toBe(true);

    const source = readFileSync(pagePath, "utf8");

    expect(source).not.toContain('"use client"');
    expect(source).toContain("generateMetadata");
    expect(source).toContain("Offline");
    expect(source).toContain("getLocalizedPath");
  });

  it("registers a static service worker from the locale layout", () => {
    const registerSource = readFileSync("components/pwa/service-worker-register.tsx", "utf8");
    const layoutSource = readFileSync("app/[locale]/layout.tsx", "utf8");
    const serviceWorkerSource = readFileSync("public/sw.js", "utf8");

    expect(registerSource).toContain('"use client"');
    expect(registerSource).toContain("navigator.serviceWorker.register");
    expect(layoutSource).toContain("ServiceWorkerRegister");
    expect(serviceWorkerSource).toContain("huayun-shell");
    expect(serviceWorkerSource).toContain("/api/content/offline");
    expect(serviceWorkerSource).toContain("/zh/offline");
  });
});
