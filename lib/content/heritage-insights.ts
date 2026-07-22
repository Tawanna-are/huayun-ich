import { provinceMapPoints } from "@/lib/content/china-map";
import type { HeritageCategorySlug, HeritageItem } from "@/lib/types/heritage";

export type InsightHeatMapProvince = {
  province: string;
  label: string;
  count: number;
  intensity: number;
  x: number;
  y: number;
  items: HeritageItem[];
};

export type InsightHeatMap = {
  provinces: InsightHeatMapProvince[];
  totalCount: number;
  maxCount: number;
};

export type InsightPeriodId =
  | "pre-qin"
  | "han-tang"
  | "song-yuan"
  | "ming-qing"
  | "modern"
  | "contemporary";

export type InsightTimelinePeriod = {
  id: InsightPeriodId;
  label: string;
  englishLabel: string;
  range: string;
  count: number;
  items: HeritageItem[];
};

export type InsightTimeline = {
  periods: InsightTimelinePeriod[];
  totalCount: number;
};

export type InsightCategoryStat = {
  slug: HeritageCategorySlug;
  label: string;
  englishLabel: string;
  count: number;
  percentage: number;
  items: HeritageItem[];
};

export type InsightGraphNodeType = "heritage" | "inheritor" | "category" | "province";

export type InsightGraphNode = {
  id: string;
  type: InsightGraphNodeType;
  label: string;
  x: number;
  y: number;
  weight: number;
};

export type InsightGraphLink = {
  source: string;
  target: string;
  relation: "transmitted_by" | "located_in" | "categorized_as";
};

export type InsightGraph = {
  nodes: InsightGraphNode[];
  links: InsightGraphLink[];
};

export type HeritageInsights = {
  heatMap: InsightHeatMap;
  timeline: InsightTimeline;
  categories: InsightCategoryStat[];
  graph: InsightGraph;
};

const categoryEnglishLabels: Record<HeritageCategorySlug, string> = {
  "traditional-opera": "Traditional Opera",
  "traditional-craft": "Traditional Craft",
  "traditional-technique": "Traditional Techniques",
  "folk-activity": "Folk Activities",
  "folk-literature": "Folk Literature"
};

const categoryOrder: HeritageCategorySlug[] = [
  "traditional-opera",
  "traditional-craft",
  "traditional-technique",
  "folk-activity",
  "folk-literature"
];

const periodTemplates: Array<Omit<InsightTimelinePeriod, "count" | "items">> = [
  { id: "pre-qin", label: "先秦", englishLabel: "Pre-Qin", range: "before 221 BCE" },
  { id: "han-tang", label: "汉唐", englishLabel: "Han-Tang", range: "206 BCE - 907" },
  { id: "song-yuan", label: "宋元", englishLabel: "Song-Yuan", range: "960 - 1368" },
  { id: "ming-qing", label: "明清", englishLabel: "Ming-Qing", range: "1368 - 1912" },
  { id: "modern", label: "近现代", englishLabel: "Modern", range: "1912 - 2000" },
  { id: "contemporary", label: "当代", englishLabel: "Contemporary", range: "2001 -" }
];

function normalizeText(item: HeritageItem) {
  return [
    item.name,
    item.englishName,
    item.summary,
    item.region,
    item.province,
    item.city,
    ...item.history,
    ...item.timeline.flatMap((event) => [event.year, event.title, event.description]),
    ...item.tags
  ].join(" ");
}

function resolvePeriodId(item: HeritageItem): InsightPeriodId {
  const text = normalizeText(item);

  if (/先秦|春秋|战国|商代|周代|西周|东周/.test(text)) {
    return "pre-qin";
  }

  if (/汉代|两汉|魏晋|南北朝|隋代|唐代|汉唐/.test(text)) {
    return "han-tang";
  }

  if (/宋代|元代|宋元|南宋|北宋/.test(text)) {
    return "song-yuan";
  }

  if (/明代|清代|明清|徽班|宫廷/.test(text)) {
    return "ming-qing";
  }

  if (/民国|近代|现代|20世纪|二十世纪/.test(text)) {
    return "modern";
  }

  return item.inscriptionYear >= 2001 ? "contemporary" : "modern";
}

function buildHeatMap(items: HeritageItem[]): InsightHeatMap {
  const groups = new Map<string, HeritageItem[]>();

  for (const item of items) {
    const key = item.province || item.region;

    if (!key) {
      continue;
    }

    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  const maxCount = Math.max(0, ...Array.from(groups.values()).map((group) => group.length));
  const provinces = Array.from(groups.entries())
    .map(([province, provinceItems]) => {
      const point = provinceMapPoints.find((candidate) => candidate.province === province);

      return {
        province,
        label: point?.label ?? province.replace(/省|市|自治区|特别行政区/g, ""),
        count: provinceItems.length,
        intensity: maxCount ? Number((provinceItems.length / maxCount).toFixed(2)) : 0,
        x: point?.x ?? provinceItems[0]?.location.mapX ?? 50,
        y: point?.y ?? provinceItems[0]?.location.mapY ?? 50,
        items: provinceItems
      };
    })
    .sort((a, b) => b.count - a.count || a.province.localeCompare(b.province, "zh-CN"));

  return {
    provinces,
    totalCount: items.length,
    maxCount
  };
}

function buildTimeline(items: HeritageItem[]): InsightTimeline {
  const byPeriod = new Map<InsightPeriodId, HeritageItem[]>();

  for (const item of items) {
    const periodId = resolvePeriodId(item);
    byPeriod.set(periodId, [...(byPeriod.get(periodId) ?? []), item]);
  }

  return {
    periods: periodTemplates.map((period) => {
      const periodItems = byPeriod.get(period.id) ?? [];

      return {
        ...period,
        count: periodItems.length,
        items: periodItems
      };
    }),
    totalCount: items.length
  };
}

function buildCategoryStats(items: HeritageItem[]): InsightCategoryStat[] {
  const groups = new Map<HeritageCategorySlug, HeritageItem[]>();

  for (const item of items) {
    groups.set(item.categorySlug, [...(groups.get(item.categorySlug) ?? []), item]);
  }

  return Array.from(groups.entries())
    .map(([slug, categoryItems]) => ({
      slug,
      label: categoryItems[0]?.categoryName ?? slug,
      englishLabel: categoryEnglishLabels[slug],
      count: categoryItems.length,
      percentage: items.length ? Math.round((categoryItems.length / items.length) * 100) : 0,
      items: categoryItems
    }))
    .sort((a, b) => categoryOrder.indexOf(a.slug) - categoryOrder.indexOf(b.slug));
}

function addNode(nodes: Map<string, InsightGraphNode>, node: InsightGraphNode) {
  const existing = nodes.get(node.id);

  if (existing) {
    existing.weight += node.weight;
    return;
  }

  nodes.set(node.id, node);
}

function buildGraph(items: HeritageItem[]): InsightGraph {
  const nodes = new Map<string, InsightGraphNode>();
  const links: InsightGraphLink[] = [];
  const limitedItems = items.slice(0, 16);

  limitedItems.forEach((item, index) => {
    const row = Math.floor(index / 4);
    const column = index % 4;
    const heritageId = `heritage:${item.slug}`;
    const inheritorId = `inheritor:${item.inheritor.name}`;
    const provinceId = `province:${item.province}`;
    const categoryId = `category:${item.categorySlug}`;

    addNode(nodes, {
      id: heritageId,
      type: "heritage",
      label: item.name,
      x: 22 + column * 18,
      y: 24 + row * 16,
      weight: 2
    });
    addNode(nodes, {
      id: inheritorId,
      type: "inheritor",
      label: item.inheritor.name,
      x: 16 + column * 18,
      y: 58 + row * 8,
      weight: 1
    });
    addNode(nodes, {
      id: provinceId,
      type: "province",
      label: item.province || item.region,
      x: 78,
      y: 22 + row * 16,
      weight: 1
    });
    addNode(nodes, {
      id: categoryId,
      type: "category",
      label: item.categoryName,
      x: 76,
      y: 58 + row * 8,
      weight: 1
    });

    links.push(
      { source: heritageId, target: inheritorId, relation: "transmitted_by" },
      { source: heritageId, target: provinceId, relation: "located_in" },
      { source: heritageId, target: categoryId, relation: "categorized_as" }
    );
  });

  return {
    nodes: Array.from(nodes.values()),
    links
  };
}

export function createHeritageInsights(items: HeritageItem[]): HeritageInsights {
  return {
    heatMap: buildHeatMap(items),
    timeline: buildTimeline(items),
    categories: buildCategoryStats(items),
    graph: buildGraph(items)
  };
}
