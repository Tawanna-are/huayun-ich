import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  filterHeritageItems,
  groupHeritageByProvince,
  localizeHeritageDetailItem,
  mapCategoryRow,
  mapHeritageItemRow,
  missingHomeFeaturedColumn
} from "@/lib/content/heritage-repository";
import type { CategoryRow, HeritageItemSelectRow, HeritageMediaRow, MediaAssetRow } from "@/lib/types/database";

const categoryRow: CategoryRow = {
  id: "cat-opera",
  slug: "traditional-opera",
  name: "Traditional Opera",
  english_name: "Opera",
  summary: "Stage traditions",
  color: "#B22222",
  sort_order: 10,
  created_at: "2026-01-01T00:00:00Z"
};

const baseRow: HeritageItemSelectRow = {
  id: "heritage-jingju",
  category_id: "cat-opera",
  slug: "jingju",
  name: "Jingju",
  english_name: "Peking Opera",
  summary: "A highly stylized stage tradition.",
  region: "Beijing",
  province: "Beijing",
  city: "Beijing",
  inscription_year: 2010,
  history: ["Formed in the Qing dynasty."],
  timeline: [{ year: "1790", title: "Troupes arrived", description: "The stage language began to merge." }],
  tags: ["opera", "stage"],
  related_slugs: ["kunqu"],
  latitude: 39.9042,
  longitude: 116.4074,
  map_x: 68,
  map_y: 31,
  sort_order: 10,
  published: true,
  featured: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  category: categoryRow,
  heritage_media: [
    {
      id: "media-cover",
      heritage_item_id: "heritage-jingju",
      media_type: "image",
      role: "cover",
      url: "/assets/jingju.png",
      alt: "Jingju cover",
      caption: "Cover image",
      file_name: null,
      file_size: null,
      mime_type: null,
      storage_path: null,
      thumbnail_url: null,
      thumbnail_storage_path: null,
      original_file_name: null,
      width: null,
      height: null,
      sort_order: 0,
      created_at: "2026-01-01T00:00:00Z"
    },
    {
      id: "media-hero",
      heritage_item_id: "heritage-jingju",
      media_type: "image",
      role: "hero",
      url: "/assets/jingju-hero.png",
      alt: "Jingju hero",
      caption: "Hero image",
      file_name: null,
      file_size: null,
      mime_type: null,
      storage_path: null,
      thumbnail_url: null,
      thumbnail_storage_path: null,
      original_file_name: null,
      width: null,
      height: null,
      sort_order: 1,
      created_at: "2026-01-01T00:00:00Z"
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      heritage_item_id: "heritage-jingju",
      media_type: "image",
      role: "gallery",
      url: "/assets/jingju-detail.png",
      alt: "Jingju detail",
      caption: "Detail image",
      file_name: null,
      file_size: null,
      mime_type: null,
      storage_path: null,
      thumbnail_url: null,
      thumbnail_storage_path: null,
      original_file_name: null,
      width: null,
      height: null,
      sort_order: 2,
      created_at: "2026-01-01T00:00:00Z"
    },
    {
      id: "media-video",
      heritage_item_id: "heritage-jingju",
      media_type: "video",
      role: "video",
      url: "/video.mp4",
      alt: "Jingju video",
      caption: "Video archive",
      file_name: null,
      file_size: null,
      mime_type: null,
      storage_path: null,
      thumbnail_url: null,
      thumbnail_storage_path: null,
      original_file_name: null,
      width: null,
      height: null,
      sort_order: 3,
      created_at: "2026-01-01T00:00:00Z"
    }
  ],
  media_assets: null,
  inheritors: [
    {
      id: "inheritor-1",
      heritage_item_id: "heritage-jingju",
      name: "Mei school group",
      title: "Representative inheritor group",
      bio: "Keeps the repertoire alive.",
      image_url: "/assets/inheritor-opera.png",
      sort_order: 0,
      created_at: "2026-01-01T00:00:00Z"
    }
  ]
};

describe("Supabase heritage repository mapping", () => {
  it("uses the legacy select only when the new homepage flag column is absent", () => {
    expect(missingHomeFeaturedColumn({ message: "column media_assets_1.featured_on_home does not exist" })).toBe(true);
    expect(missingHomeFeaturedColumn({ message: "permission denied" })).toBe(false);
  });
  it("hides Yue embroidery and Kunqu from every public repository entry point", () => {
    const repository = readFileSync("lib/content/heritage-repository.ts", "utf8");

    expect(repository).toContain('new Set(["yue-embroidery", "kunqu"])');
    expect(repository).toContain("isPublicHeritageSlug(item.slug)");
    expect(repository).toContain("isPublicHeritageSlug(item.slug as string)");
    expect(repository).toContain("if (!isPublicHeritageSlug(slug))");
  });
  it("maps category rows into UI category objects", () => {
    expect(mapCategoryRow(categoryRow)).toEqual({
      slug: "traditional-opera",
      name: "Traditional Opera",
      englishName: "Opera",
      summary: "Stage traditions",
      color: "#B22222"
    });
  });

  it("maps plural-table Supabase rows into the existing UI heritage shape", () => {
    const item = mapHeritageItemRow(baseRow);

    expect(item.slug).toBe("jingju");
    expect(item.featured).toBe(true);
    expect(item.categoryName).toBe("Traditional Opera");
    expect(item.categoryEnglishName).toBe("Opera");
    expect(item.image).toBe("/assets/jingju.png");
    expect(item.heroImage).toBe("/assets/jingju-hero.png");
    expect(item.videoUrl).toBe("/video.mp4");
    expect(item.gallery).toHaveLength(1);
    expect(item.gallery[0]).toMatchObject({
      id: "22222222-2222-4222-8222-222222222222",
      src: "/assets/jingju-detail.png"
    });
    expect(item.timeline[0]?.year).toBe("1790");
    expect(item.inheritor.name).toBe("Mei school group");
    expect(item.relatedSlugs).toEqual(["kunqu"]);

    const source = {
      ...mapHeritageItemRow(baseRow),
      slug: "tie-dye",
      name: "扎染",
      englishName: "Tie-dye Craft",
      categoryName: "传统技艺",
      categoryEnglishName: "Technique",
      summary: "中文扎染简介",
      region: "云南大理",
      gallery: Array.from({ length: 12 }, (_, index) => ({
        id: `image-${index + 1}`,
        src: `/tie-dye/${index + 1}.webp`,
        alt: "扎染",
        caption: "中文说明"
      }))
    };
    const english = localizeHeritageDetailItem(source, "en");

    expect(english.name).toBe("Tie-dye Craft");
    expect(english.categoryName).toBe("Technique");
    expect(english.region).toBe("Dali, Yunnan");
    expect(english.summary).toContain("Tie-dye, historically known as jiaoxie");
    expect(english.gallery.map((image) => image.alt)).toEqual(Array(12).fill("Tie-dye"));
    expect(english.gallery.map((image) => image.caption)).toEqual([
      "Tie-dye Bag",
      "Tie-dye Bag",
      "Tie-dye Bag",
      "Tie-dye Bag",
      "Tie-dye Bag",
      "Tie-dye Bag",
      "Tie-dye Accessories",
      "Tie-dye Accessories",
      "Tie-dye Doll",
      "Tie-dye Doll",
      "Tie-dye Doll",
      "Tie-dye Bag"
    ]);
    expect(localizeHeritageDetailItem(source, "zh")).toBe(source);
    expect(source.summary).toBe("中文扎染简介");

    const otherItem = { ...source, slug: "future-item", summary: "Original summary", region: "Original region" };
    const localizedOtherItem = localizeHeritageDetailItem(otherItem, "en");
    expect(localizedOtherItem.summary).toBe("Original summary");
    expect(localizedOtherItem.region).toBe("Original region");
    expect(localizedOtherItem.gallery).toBe(otherItem.gallery);
  });

  it("uses Cover, then Hero, then the placeholder for collection cards", () => {
    const coverAndHero = mapHeritageItemRow(baseRow);
    const heroOnly = mapHeritageItemRow({
      ...baseRow,
      heritage_media: [heritageImage("hero-only", "hero", "/assets/hero-only.webp", 0)]
    });
    const galleryOnly = mapHeritageItemRow({
      ...baseRow,
      heritage_media: [heritageImage("gallery-only", "gallery", "/assets/gallery-only.webp", 0)]
    });

    expect(coverAndHero.image).toBe("/assets/jingju.png");
    expect(heroOnly.image).toBe("/assets/hero-only.webp");
    expect(galleryOnly.image).toBe("/assets/hero-museum.png");
  });

  it("uses Hero, then Cover, then the placeholder for the detail hero", () => {
    const coverOnly = mapHeritageItemRow({
      ...baseRow,
      heritage_media: [heritageImage("cover-only", "cover", "/assets/cover-only.webp", 0)]
    });

    expect(coverOnly.heroImage).toBe("/assets/cover-only.webp");
  });

  it("selects only explicitly featured gallery assets without changing detail gallery or cover", () => {
    const row = {
      ...baseRow,
      media_assets: [
        mediaAssetRow({ id: "cover", title: "Cover", file_type: "image", file_url: "/cover.webp", asset_role: "cover" }),
        mediaAssetRow({ id: "unselected", title: "One", file_type: "image", file_url: "/one.webp" }),
        mediaAssetRow({ id: "selected", title: "Two", file_type: "image", file_url: "/two.webp", featured_on_home: true }),
        mediaAssetRow({ id: "poster", title: "Poster", file_type: "image", file_url: "/poster.webp", asset_role: "poster", featured_on_home: true })
      ]
    };
    const item = mapHeritageItemRow(row);

    expect(item.image).toBe("/cover.webp");
    expect(item.gallery.map((image) => image.src)).toEqual(["/one.webp", "/two.webp"]);
    expect(item.homeGallery?.map((image) => image.src)).toEqual(["/two.webp"]);
  });

  it("prioritizes media_assets so newly uploaded project images and videos auto-render on detail pages", () => {
    const mediaAssets: MediaAssetRow[] = [
      mediaAssetRow({
        id: "asset-finished",
        title: "Finished work",
        file_type: "image",
        asset_role: "cover",
        file_url: "https://cdn.example.com/suxiu/finished.webp",
        thumbnail_url: "https://cdn.example.com/suxiu/finished-thumb.webp",
        sort_order: 0
      }),
      mediaAssetRow({
        id: "asset-process",
        title: "Making process",
        file_type: "image",
        asset_role: "gallery",
        file_url: "https://cdn.example.com/suxiu/process.webp",
        thumbnail_url: "https://cdn.example.com/suxiu/process-thumb.webp",
        sort_order: 10
      }),
      mediaAssetRow({
        id: "asset-detail",
        title: "Close detail",
        file_type: "image",
        asset_role: "gallery",
        file_url: "https://cdn.example.com/suxiu/detail.webp",
        thumbnail_url: "https://cdn.example.com/suxiu/detail-thumb.webp",
        sort_order: 20
      }),
      mediaAssetRow({
        id: "asset-documentary",
        title: "Documentary",
        file_type: "video",
        asset_role: "main_video",
        file_url: "https://cdn.example.com/suxiu/documentary.mp4",
        thumbnail_url: "https://cdn.example.com/suxiu/documentary-poster.webp",
        sort_order: 30
      }),
      mediaAssetRow({
        id: "asset-interview",
        title: "Inheritor interview",
        file_type: "video",
        asset_role: "video",
        file_url: "https://cdn.example.com/suxiu/interview.mp4",
        thumbnail_url: "https://cdn.example.com/suxiu/interview-poster.webp",
        sort_order: 40
      })
    ];
    const item = mapHeritageItemRow({
      ...baseRow,
      id: "heritage-suxiu",
      slug: "suzhou-embroidery",
      name: "Suzhou Embroidery",
      english_name: "Suzhou Embroidery",
      media_assets: mediaAssets
    });

    expect(item.image).toBe("https://cdn.example.com/suxiu/finished.webp");
    expect(item.heroImage).toBe("https://cdn.example.com/suxiu/finished.webp");
    expect(item.videoPoster).toBe("https://cdn.example.com/suxiu/documentary-poster.webp");
    expect(item.videoUrl).toBe("https://cdn.example.com/suxiu/documentary.mp4");
    expect(item.gallery).toEqual([
      {
        id: "asset-process",
        src: "https://cdn.example.com/suxiu/process.webp",
        alt: "Making process",
        caption: "Making process"
      },
      {
        id: "asset-detail",
        src: "https://cdn.example.com/suxiu/detail.webp",
        alt: "Close detail",
        caption: "Close detail"
      }
    ]);
    expect(item.videos).toEqual([
      {
        title: "Documentary",
        url: "https://cdn.example.com/suxiu/documentary.mp4",
        poster: "https://cdn.example.com/suxiu/documentary-poster.webp"
      },
      {
        title: "Inheritor interview",
        url: "https://cdn.example.com/suxiu/interview.mp4",
        poster: "https://cdn.example.com/suxiu/interview-poster.webp"
      }
    ]);
  });

  it("filters and groups mapped database content by category, province, and query", () => {
    const items = [
      mapHeritageItemRow(baseRow),
      mapHeritageItemRow({
        ...baseRow,
        id: "heritage-suxiu",
        slug: "suzhou-embroidery",
        name: "Suzhou Embroidery",
        english_name: "Suzhou Embroidery",
        region: "Suzhou",
        province: "Jiangsu",
        city: "Suzhou",
        category: {
          ...categoryRow,
          id: "cat-craft",
          slug: "traditional-craft",
          name: "Traditional Craft",
          english_name: "Craft"
        }
      })
    ];

    expect(filterHeritageItems(items, { query: "embroidery", category: "traditional-craft" })).toHaveLength(1);
    expect(filterHeritageItems(items, { province: "Beijing" })[0]?.slug).toBe("jingju");
    expect(groupHeritageByProvince(items).map((group) => group.province)).toEqual(["Beijing", "Jiangsu"]);
  });
});

function mediaAssetRow(patch: Partial<MediaAssetRow> & Pick<MediaAssetRow, "id" | "title" | "file_type" | "file_url">): MediaAssetRow {
  return {
    thumbnail_url: null,
    file_size: null,
    duration: null,
    heritage_id: "heritage-suxiu",
    asset_role: "gallery",
    featured_on_home: false,
    alt: null,
    caption: null,
    mime_type: null,
    storage_path: null,
    thumbnail_storage_path: null,
    sort_order: 0,
    created_at: "2026-06-07T00:00:00.000Z",
    ...patch
  };
}

function heritageImage(id: string, role: HeritageMediaRow["role"], url: string, sortOrder: number): HeritageMediaRow {
  return {
    id,
    heritage_item_id: baseRow.id,
    media_type: "image",
    role,
    url,
    alt: id,
    caption: id,
    file_name: null,
    file_size: null,
    mime_type: "image/webp",
    storage_path: null,
    thumbnail_url: null,
    thumbnail_storage_path: null,
    original_file_name: null,
    width: null,
    height: null,
    sort_order: sortOrder,
    created_at: "2026-01-01T00:00:00Z"
  };
}
