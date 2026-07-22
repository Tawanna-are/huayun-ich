import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("assistant page route", () => {
  it("exposes a localized chat page connected to the assistant API", () => {
    const pagePath = "app/[locale]/assistant/page.tsx";
    const chatPath = "components/assistant/assistant-chat.tsx";

    expect(existsSync(pagePath)).toBe(true);
    expect(existsSync(chatPath)).toBe(true);

    const pageSource = readFileSync(pagePath, "utf8");
    const chatSource = readFileSync(chatPath, "utf8");

    expect(pageSource).toContain("generateMetadata");
    expect(pageSource).toContain("AssistantChat");
    expect(pageSource).toContain("createBreadcrumbJsonLd");
    expect(chatSource).toContain('"use client"');
    expect(chatSource).toContain("/api/assistant");
  });
});
