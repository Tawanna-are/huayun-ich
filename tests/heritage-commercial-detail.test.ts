import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("heritage commercial detail", () => {
  const pagePath = "app/[locale]/heritage/[slug]/page.tsx";

  it("keeps the existing repository and SEO boundaries", () => {
    const page = readFileSync(pagePath, "utf8");

    expect(page).toContain("getHeritageBySlug(slug)");
    expect(page).toContain("generateStaticParams");
    expect(page).toContain("createMetadata");
    expect(page).toContain("createCreativeWorkJsonLd");
    expect(page).toContain("createBreadcrumbJsonLd");
    expect(page).not.toContain("Product");
    expect(page).not.toContain("Offer");
  });

  it("composes commercial sections from the existing heritage item", () => {
    const page = readFileSync(pagePath, "utf8");

    for (const component of ["DetailHero", "CraftMediaGallery", "HeritageVideoArchive", "ContactApplicationForm"]) {
      expect(page).toContain(component);
    }
    expect(page).toContain("item.gallery");
    expect(page).toContain("item.heroImage");
    expect(page).toContain("item.image");
    expect(page).not.toContain("<InheritorProfile");
    expect(page).not.toContain("<MakingProcess");
    expect(page).not.toContain("<FutureWorksPreview");
    expect(page).not.toContain("<Timeline");
    expect(page).not.toContain("<StoryNarrative");
  });

  it("keeps an image-first public section order", () => {
    const page = readFileSync(pagePath, "utf8");
    const order = [
      page.indexOf("<DetailHero"),
      page.indexOf("<CraftMediaGallery"),
      page.indexOf("<HeritageVideoArchive"),
      page.indexOf('data-section="project-information"'),
      page.indexOf('data-section="consultation-cooperation"')
    ];

    expect(order.every((position) => position >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((left, right) => left - right));
  });

  it("adds focused components without backend changes", () => {
    for (const path of [
      "components/heritage/making-process.tsx",
      "components/heritage/inheritor-profile.tsx",
      "components/heritage/future-works-preview.tsx",
      "components/heritage/consultation-panel.tsx",
      "lib/config/commercial-contact.ts"
    ]) {
      expect(existsSync(path)).toBe(true);
    }
  });

  it("derives process imagery without inventing history steps", () => {
    const source = readFileSync("components/heritage/making-process.tsx", "utf8");

    expect(source).toContain("images.length < 2");
    expect(source).toContain("images.map");
    expect(source).toContain("image.caption");
    expect(source).toContain('String(index + 1).padStart(2, "0")');
    expect(source).toContain("next/image");
    expect(source).not.toContain("item.history");
  });

  it("suppresses repository fallback inheritor content", () => {
    const source = readFileSync("components/heritage/inheritor-profile.tsx", "utf8");

    for (const fallback of ["待补充", "传承人信息待补充", "该项目的传承人资料将在内容后台补充。"] ) {
      expect(source).toContain(fallback);
    }
    for (const field of ["inheritor.name", "inheritor.title", "inheritor.bio", "inheritor.image"]) {
      expect(source).toContain(field);
    }
    expect(source).toContain("next/image");
    expect(source).toContain("consultationAction");
  });

  it("reserves future works without product claims", () => {
    const source = readFileSync("components/heritage/future-works-preview.tsx", "utf8");

    expect(source).toContain("new Set");
    expect(source).toContain("slice(0, 3)");
    expect(source).toContain("comingSoonLabel");
    expect(source).toContain("consultationAction");
    expect(source).not.toContain("content-visibility:auto");
    for (const forbidden of ["price", "inventory", "checkout", "Product", "Offer"]) {
      expect(source).not.toContain(forbidden);
    }
  });

  it("uses one accessible consultation owner with public links only", () => {
    const source = readFileSync("components/heritage/consultation-panel.tsx", "utf8");

    expect(source).toContain('"use client"');
    expect(source).toContain("HTMLDialogElement");
    expect(source).toContain("showModal");
    expect(source).toContain("lastTriggerRef");
    expect(source).toContain("previousOverflow");
    expect(source).toContain("mailto:");
    expect(source).toContain("tel:");
    expect(source).toContain("safe-area-inset-bottom");
    expect(source).toContain("contact.hasChannels");
    expect(source).toContain("createContext");
    expect(source).toContain("ConsultationProvider");
    expect(source).toContain("ConsultationTrigger");
    expect(source).not.toContain("fetch(");
  });
});
