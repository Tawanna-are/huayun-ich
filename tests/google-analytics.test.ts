import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

describe("Google Analytics 4 integration", () => {
  it("mounts analytics once in the localized root layout", () => {
    const layout = readSource("app/[locale]/layout.tsx");

    expect(layout).toContain('import { GoogleAnalytics } from "@/components/analytics/google-analytics"');
    expect(layout).toContain("<GoogleAnalytics />");
  });

  it("loads gtag only in production when a public measurement id exists", () => {
    const analytics = readSource("components/analytics/google-analytics.tsx");

    expect(analytics).toContain("NEXT_PUBLIC_GA_MEASUREMENT_ID");
    expect(analytics).toContain('process.env.NODE_ENV !== "production"');
    expect(analytics).toContain("https://www.googletagmanager.com/gtag/js?id=");
  });

  it("tracks client-side route changes without sending a duplicate initial page view", () => {
    const analytics = readSource("components/analytics/google-analytics.tsx");

    expect(analytics).toContain("usePathname");
    expect(analytics).toContain("useSearchParams");
    expect(analytics).toContain("send_page_view: false");
    expect(analytics).toContain('window.gtag("event", "page_view"');
  });

  it("documents the Vercel environment variable", () => {
    expect(readSource(".env.example")).toContain("NEXT_PUBLIC_GA_MEASUREMENT_ID=");
    expect(readSource("docs/deployment.md")).toContain("NEXT_PUBLIC_GA_MEASUREMENT_ID=G-");
  });

  it("allows GA4 scripts and collection requests through the content security policy", () => {
    const middleware = readSource("middleware.ts");

    expect(middleware).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com");
    expect(middleware).toContain("https://www.google-analytics.com");
    expect(middleware).toContain("https://*.google-analytics.com");
  });
});
