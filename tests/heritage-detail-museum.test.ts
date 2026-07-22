import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("heritage digital museum detail page", () => {
  const pagePath = "app/[locale]/heritage/[slug]/page.tsx";
  const heroPath = "components/heritage/detail-hero.tsx";
  const galleryPath = "components/heritage/craft-media-gallery.tsx";
  const videoPath = "components/heritage/heritage-video-archive.tsx";
  const timelinePath = "components/heritage/timeline.tsx";

  it("keeps the existing CMS repository, SEO and user features", () => {
    const page = readFileSync(pagePath, "utf8");

    expect(page).toContain("getHeritageBySlug");
    expect(page).not.toContain("getRelatedHeritage");
    expect(page).toContain("BrowsingHistoryTracker");
    expect(page).toContain("FavoriteButton");
    expect(page).toContain("createCreativeWorkJsonLd");
  });

  it("uses a CMS cover-first immersive Hero with breadcrumbs and museum metadata", () => {
    expect(existsSync(heroPath)).toBe(true);
    if (!existsSync(heroPath)) return;

    const hero = readFileSync(heroPath, "utf8");

    expect(hero).toContain("item.heroImage || item.image");
    expect(hero).toContain("breadcrumbHome");
    expect(hero).toContain("breadcrumbArchive");
    expect(hero).toContain("currentLabel");
    expect(hero).toContain("priority");
    expect(hero).toContain("[overflow-wrap:anywhere]");
    expect(hero).toContain("item.categoryName");
    expect(hero).toContain("item.region");
    expect(hero).toContain("item.summary");
    expect(hero).not.toContain('data-pattern="auspicious-cloud"');
    expect(hero).not.toContain("duration-[1400ms]");
  });

  it("composes a minimal CMS-driven collection view", () => {
    const page = readFileSync(pagePath, "utf8");

    expect(page).toContain("CraftMediaGallery");
    expect(page).toContain("HeritageVideoArchive");
    expect(page).toContain('data-section="project-information"');
    expect(page).not.toContain('id="history"');
    expect(page).not.toContain('id="inheritance-value"');
    expect(page).not.toContain("item.history");
    expect(page).not.toContain("<InheritorProfile");
    expect(page).not.toContain("<MakingProcess");
    expect(page).not.toContain("<FutureWorksPreview");
    expect(page).not.toContain("relatedItems.map");
  });

  it("renders process imagery from the CMS gallery collection", () => {
    expect(existsSync(galleryPath)).toBe(true);
    if (!existsSync(galleryPath)) return;

    const gallery = readFileSync(galleryPath, "utf8");

    expect(gallery).toContain("HeritageGalleryImage");
    expect(gallery).toContain("const [primaryImage, ...detailImages] = images");
    expect(gallery).toContain("detailImages.map");
    expect(gallery).toContain("image.caption");
    expect(gallery).toContain("loading=\"lazy\"");
    expect(gallery).toContain("showModal");
    expect(gallery).toContain("lastTriggerRef");
    expect(gallery).toContain("closeButtonRef");
    expect(gallery).toContain('data-gallery-role="primary"');
    expect(gallery).toContain("md:grid-cols-2");
    expect(gallery).toContain("tabIndex={-1}");
    expect(gallery).toContain("previousOverflow");
    expect(gallery).toContain("group-focus-within");
    expect(gallery).toContain("motion-reduce:transition-none");
    expect(gallery).toContain("keepDialogFocus");
  });

  it("presents CMS history events as a museum timeline card rail", () => {
    const timeline = readFileSync(timelinePath, "utf8");

    expect(timeline).toContain("events.map");
    expect(timeline).toContain("event.year");
    expect(timeline).toContain("event.description");
    expect(timeline).toContain("snap-x");
    expect(timeline).toContain("grid-flow-col");
    expect(timeline).toContain("shadow-[0_18px_44px");
    expect(timeline).toContain("max-w-[calc(100vw-2rem)]");
    expect(timeline).not.toContain("useReducedMotion");
    expect(timeline).toContain("motion-reduce:transform-none");
    expect(timeline).toContain("pb-16");
  });

  it("renders uploaded CMS videos in an independent tracked archive", () => {
    expect(existsSync(videoPath)).toBe(true);
    if (!existsSync(videoPath)) return;

    const video = readFileSync(videoPath, "utf8");

    expect(video).toContain("item.videos");
    expect(video).toContain("item.videoUrl");
    expect(video).toContain("controls");
    expect(video).toContain('preload="metadata"');
    expect(video).toContain("/api/media/playback");
    expect(video).toContain('data-video-stage="immersive"');
    expect(video).toContain("shadow-[0_36px_90px");
    expect(video).toContain("aria-label=");
  });
});
