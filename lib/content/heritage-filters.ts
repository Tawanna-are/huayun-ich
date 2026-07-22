import type { HeritageItem } from "@/lib/types/heritage";

export type HeritageFilters = {
  query?: string;
  category?: string;
  province?: string;
};

export type ProvinceHeritageGroup = {
  province: string;
  count: number;
  items: HeritageItem[];
};

export function filterHeritageItems(items: HeritageItem[], filters: HeritageFilters = {}) {
  const normalizedQuery = filters.query?.trim().toLowerCase() ?? "";
  const normalizedCategory = filters.category && filters.category !== "all" ? filters.category : "";
  const normalizedProvince = filters.province && filters.province !== "all" ? filters.province : "";

  return items.filter((item) => {
    const matchesCategory = !normalizedCategory || item.categorySlug === normalizedCategory;
    const matchesProvince = !normalizedProvince || item.province === normalizedProvince;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [
        item.name,
        item.englishName,
        item.summary,
        item.region,
        item.province,
        item.city,
        item.categoryName,
        ...item.tags
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    return matchesCategory && matchesProvince && matchesQuery;
  });
}

export function groupHeritageByProvince(items: HeritageItem[]): ProvinceHeritageGroup[] {
  const groups = new Map<string, HeritageItem[]>();

  for (const item of items) {
    const existing = groups.get(item.province) ?? [];
    existing.push(item);
    groups.set(item.province, existing);
  }

  return Array.from(groups.entries())
    .map(([province, groupItems]) => ({
      province,
      count: groupItems.length,
      items: groupItems
    }))
    .sort((a, b) => a.province.localeCompare(b.province, "zh-CN"));
}

export function getAvailableProvinces(items: HeritageItem[]) {
  return groupHeritageByProvince(items).map((group) => group.province);
}
