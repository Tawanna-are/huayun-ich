import { describe, expect, it } from "vitest";
import { mergeRankedHeritageItems, rankHeritageItemsByIntent } from "@/lib/search/semantic-search";
import type { HeritageItem } from "@/lib/types/heritage";

function makeHeritageItem(overrides: Partial<HeritageItem> = {}): HeritageItem {
  return {
    id: "jingju",
    slug: "jingju",
    name: "京剧",
    englishName: "Peking Opera",
    categorySlug: "traditional-opera",
    categoryName: "传统戏曲",
    summary: "以唱念做打、脸谱和故事化表演进入传统戏曲。",
    region: "北京",
    province: "北京市",
    city: "北京",
    inscriptionYear: 2010,
    featured: false,
    image: "/assets/jingju.png",
    heroImage: "/assets/jingju-hero.png",
    videoPoster: "/assets/jingju-hero.png",
    videoUrl: "",
    history: ["京剧形成于清代中后期。"],
    gallery: [],
    timeline: [],
    inheritor: {
      name: "传承群体",
      title: "代表性传承人",
      bio: "面向公众进行展演和教学。",
      image: "/assets/inheritor-opera.png"
    },
    location: {
      lat: 39.9042,
      lng: 116.4074,
      mapX: 68,
      mapY: 31
    },
    tags: ["戏曲", "脸谱", "故事", "入门"],
    relatedSlugs: [],
    ...overrides
  };
}

describe("semantic heritage search", () => {
  it("expands embroidery intent into related embroidery heritage items", () => {
    const items = [
      makeHeritageItem({
        id: "suzhou-embroidery",
        slug: "suzhou-embroidery",
        name: "苏绣",
        englishName: "Suzhou Embroidery",
        categorySlug: "traditional-craft",
        categoryName: "传统工艺",
        summary: "苏绣是以丝线、针法和双面绣著称的江南刺绣。",
        province: "江苏省",
        region: "江苏苏州",
        city: "苏州",
        tags: ["刺绣", "丝线", "针法", "亲子体验"]
      }),
      makeHeritageItem({
        id: "hunan-embroidery",
        slug: "hunan-embroidery",
        name: "湘绣",
        englishName: "Hunan Embroidery",
        categorySlug: "traditional-craft",
        categoryName: "传统工艺",
        summary: "湘绣以写实造型、动物题材和丰富针法形成湖湘刺绣传统。",
        province: "湖南省",
        region: "湖南长沙",
        city: "长沙",
        tags: ["刺绣", "丝绸", "针法"]
      }),
      makeHeritageItem({
        id: "shu-embroidery",
        slug: "shu-embroidery",
        name: "蜀绣",
        englishName: "Shu Embroidery",
        categorySlug: "traditional-craft",
        categoryName: "传统工艺",
        summary: "蜀绣以川西丝织传统和细密针脚呈现巴蜀刺绣美学。",
        province: "四川省",
        region: "四川成都",
        city: "成都",
        tags: ["刺绣", "丝绸", "手工"]
      }),
      makeHeritageItem({
        id: "yue-embroidery",
        slug: "yue-embroidery",
        name: "粤绣",
        englishName: "Yue Embroidery",
        categorySlug: "traditional-craft",
        categoryName: "传统工艺",
        summary: "粤绣以构图饱满、色彩明快和装饰性见长，是岭南刺绣代表。",
        province: "广东省",
        region: "广东广州",
        city: "广州",
        tags: ["刺绣", "广绣", "潮绣"]
      }),
      makeHeritageItem({
        id: "datiehua",
        slug: "datiehua",
        name: "打铁花",
        englishName: "Datiehua Iron Flower",
        categorySlug: "folk-activity",
        categoryName: "民俗活动",
        summary: "打铁花是夜色中的火花展演。",
        province: "河南省",
        region: "河南开封",
        city: "开封",
        tags: ["节庆", "展演"]
      })
    ];

    const results = rankHeritageItemsByIntent("刺绣", items, { locale: "zh", limit: 4 });

    expect(results.map((item) => item.slug)).toEqual([
      "suzhou-embroidery",
      "hunan-embroidery",
      "shu-embroidery",
      "yue-embroidery"
    ]);
  });

  it("understands child-friendly learning intent", () => {
    const items = [
      makeHeritageItem(),
      makeHeritageItem({
        id: "datiehua",
        slug: "datiehua",
        name: "打铁花",
        englishName: "Datiehua Iron Flower",
        categorySlug: "folk-activity",
        categoryName: "民俗活动",
        summary: "视觉震撼的节庆展演，适合儿童从光影和节日习俗了解非遗。",
        province: "河南省",
        region: "河南开封",
        city: "开封",
        tags: ["儿童", "节庆", "展演", "入门"]
      }),
      makeHeritageItem({
        id: "suzhou-embroidery",
        slug: "suzhou-embroidery",
        name: "苏绣",
        englishName: "Suzhou Embroidery",
        categorySlug: "traditional-craft",
        categoryName: "传统工艺",
        summary: "可通过观察丝线、颜色和针脚进行亲子手作体验。",
        province: "江苏省",
        region: "江苏苏州",
        city: "苏州",
        tags: ["亲子", "手作", "体验", "入门"]
      }),
      makeHeritageItem({
        id: "longquan-celadon",
        slug: "longquan-celadon",
        name: "龙泉青瓷",
        englishName: "Longquan Celadon",
        categorySlug: "traditional-craft",
        categoryName: "传统工艺",
        summary: "青釉、窑火和器形比例构成含蓄的器物美学。",
        province: "浙江省",
        region: "浙江丽水",
        city: "丽水",
        tags: ["青釉", "窑火", "器物"]
      })
    ];

    const results = rankHeritageItemsByIntent("适合儿童了解的非遗", items, { locale: "zh", limit: 3 });
    const slugs = results.map((item) => item.slug);

    expect(slugs).toContain("datiehua");
    expect(slugs).toContain("suzhou-embroidery");
    expect(slugs).toContain("jingju");
    expect(slugs).not.toContain("longquan-celadon");
  });

  it("keeps opera intent precise instead of matching every stage reference", () => {
    const items = [
      makeHeritageItem({
        id: "chuanju",
        slug: "chuanju",
        name: "川剧",
        englishName: "Sichuan Opera",
        categorySlug: "traditional-opera",
        categoryName: "传统戏曲",
        summary: "川剧以唱腔、脸谱和变脸形成鲜明的巴蜀戏曲风格。",
        tags: ["川剧", "变脸", "戏曲"]
      }),
      makeHeritageItem({
        id: "jingdezhen-porcelain",
        slug: "jingdezhen-porcelain",
        name: "景德镇陶瓷",
        englishName: "Jingdezhen Porcelain",
        categoryName: "传统技艺",
        summary: "中国陶瓷在世界舞台上延续新的传奇。",
        history: [],
        tags: ["陶瓷", "青花"]
      }),
      makeHeritageItem({
        id: "datiehua",
        slug: "datiehua",
        name: "打铁花",
        englishName: "Datiehua Iron Flower",
        categoryName: "民俗活动",
        summary: "这一节庆展演从乡土庙会走上舞台。",
        history: [],
        tags: ["火花", "节庆"]
      })
    ];

    expect(rankHeritageItemsByIntent("戏曲", items, { locale: "zh", limit: 10 }).map((item) => item.slug)).toEqual([
      "chuanju"
    ]);
  });

  it("merges vector matches with local semantic results without duplicates", () => {
    const suzhou = makeHeritageItem({ slug: "suzhou-embroidery", name: "苏绣" });
    const hunan = makeHeritageItem({ slug: "hunan-embroidery", name: "湘绣" });
    const shu = makeHeritageItem({ slug: "shu-embroidery", name: "蜀绣" });

    const results = mergeRankedHeritageItems([suzhou], [suzhou, hunan, shu], 3);

    expect(results.map((item) => item.slug)).toEqual(["suzhou-embroidery", "hunan-embroidery", "shu-embroidery"]);
  });
});
