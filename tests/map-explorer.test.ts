import { describe, expect, it } from "vitest";
import {
  buildProvinceExplorerData,
  getProvinceExplorerSelection,
  provinceMapPoints
} from "@/lib/content/china-map";
import type { HeritageItem } from "@/lib/types/heritage";

function makeItem(slug: string, province: string, city = "北京"): HeritageItem {
  return {
    id: slug,
    slug,
    name: slug,
    englishName: slug,
    categorySlug: "traditional-craft",
    categoryName: "传统工艺",
    summary: "summary",
    region: `${province}${city}`,
    province,
    city,
    inscriptionYear: 2006,
    featured: false,
    image: "/assets/hero-museum.png",
    heroImage: "/assets/hero-museum.png",
    videoPoster: "/assets/hero-museum.png",
    videoUrl: "",
    history: [],
    gallery: [],
    timeline: [],
    inheritor: {
      name: "传承人",
      title: "代表性传承人",
      bio: "bio",
      image: "/assets/inheritor-craft.png"
    },
    location: {
      lat: 39,
      lng: 116,
      mapX: 50,
      mapY: 50
    },
    tags: [],
    relatedSlugs: []
  };
}

describe("china map explorer data", () => {
  it("keeps province point metadata in normal Chinese", () => {
    expect(provinceMapPoints.find((point) => point.province === "北京市")?.label).toBe("北京");
    expect(provinceMapPoints.find((point) => point.province === "江苏省")?.x).toBeGreaterThan(0);
  });

  it("builds province counts and selects the province with most heritage items", () => {
    const data = buildProvinceExplorerData([
      makeItem("jingju", "北京市"),
      makeItem("kunqu", "江苏省", "苏州"),
      makeItem("suxiu", "江苏省", "苏州")
    ]);

    expect(data.totalCount).toBe(3);
    expect(data.groups.map((group) => [group.province, group.count])).toEqual([
      ["江苏省", 2],
      ["北京市", 1]
    ]);
    expect(data.defaultProvince).toBe("江苏省");
  });

  it("returns selected province items and falls back to default province", () => {
    const data = buildProvinceExplorerData([
      makeItem("jingju", "北京市"),
      makeItem("kunqu", "江苏省", "苏州")
    ]);

    expect(getProvinceExplorerSelection(data, "北京市").items.map((item) => item.slug)).toEqual(["jingju"]);
    expect(getProvinceExplorerSelection(data, "不存在").province).toBe(data.defaultProvince);
  });
});
