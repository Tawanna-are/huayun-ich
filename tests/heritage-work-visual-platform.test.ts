import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("heritage work visual platform", () => {
  const pagePath = "app/[locale]/heritage/[slug]/page.tsx";
  const adminPath = "components/admin/heritage-admin-client.tsx";

  it("uses the approved work-image-first detail order", () => {
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

  it("removes archive and speculative public modules", () => {
    const page = readFileSync(pagePath, "utf8");

    expect(page).not.toContain("<MakingProcess");
    expect(page).not.toContain("<FutureWorksPreview");
    expect(page).not.toContain("<InheritorProfile");
    expect(page).not.toContain("<Timeline");
    expect(page).not.toContain("item.history");
  });

  it("renders video conditionally and uses the online supporter form", () => {
    const page = readFileSync(pagePath, "utf8");

    expect(page).toContain("const hasVideo = Boolean(item.videoUrl || item.videos?.length)");
    expect(page).toContain("{hasVideo ? <HeritageVideoArchive");
    expect(page).toContain("<ContactApplicationForm");
    expect(page).toContain('defaultKind="supporter"');
    expect(page).toContain("heritageItemId={item.id}");
  });

  it("keeps repository, SEO, locale, and user boundaries", () => {
    const page = readFileSync(pagePath, "utf8");

    expect(page).toContain("getHeritageBySlug(slug)");
    expect(page).toContain("generateStaticParams");
    expect(page).toContain("createMetadata");
    expect(page).toContain("createCreativeWorkJsonLd");
    expect(page).toContain("BrowsingHistoryTracker");
    expect(page).toContain("FavoriteButton");
  });

  it("shows only routine basic and media CMS destinations", () => {
    const admin = readFileSync(adminPath, "utf8");
    const zhMessages = readFileSync("messages/zh.json", "utf8");
    const enMessages = readFileSync("messages/en.json", "utf8");

    expect(admin).toContain('{ id: "heritage", label: "非遗项目"');
    expect(admin).toContain('{ id: "media", label: "图片/视频"');
    expect(admin).not.toContain('{ id: "editor"');
    expect(admin).not.toContain('data-section="advanced-archive-fields"');
    expect(zhMessages).not.toContain("管理非遗项目、分类、传承人、图像与视频素材");
    expect(enMessages).not.toContain("Manage heritage items, categories, inheritors");
  });

  it("keeps hidden advanced values in full form state and save payload", () => {
    const admin = readFileSync(adminPath, "utf8");

    for (const field of [
      "history",
      "timeline",
      "inscriptionYear",
      "latitude",
      "longitude",
      "mapX",
      "mapY",
      "inheritorName",
      "inheritorTitle",
      "inheritorBio",
      "inheritorImageUrl",
      "tags",
      "relatedSlugs",
      "videoUrl"
    ]) {
      expect(admin).toContain(`${field}:`);
    }
    expect(admin).toContain("function rowToHeritageForm");
    expect(admin).toContain("JSON.stringify(heritageForm)");
  });
});
