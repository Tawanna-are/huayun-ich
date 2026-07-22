import type { HeritageItem } from "@/lib/types/heritage";

export type ProvinceMapPoint = {
  province: string;
  label: string;
  x: number;
  y: number;
};

export type ProvinceExplorerGroup = {
  province: string;
  label: string;
  count: number;
  items: HeritageItem[];
  point: ProvinceMapPoint;
  intensity: number;
};

export type ProvinceExplorerData = {
  groups: ProvinceExplorerGroup[];
  totalCount: number;
  maxCount: number;
  defaultProvince: string;
};

export const provinceMapPoints: ProvinceMapPoint[] = [
  { province: "北京市", label: "北京", x: 68, y: 31 },
  { province: "天津市", label: "天津", x: 70, y: 34 },
  { province: "河北省", label: "河北", x: 65, y: 36 },
  { province: "山西省", label: "山西", x: 58, y: 39 },
  { province: "内蒙古自治区", label: "内蒙古", x: 53, y: 26 },
  { province: "辽宁省", label: "辽宁", x: 78, y: 28 },
  { province: "吉林省", label: "吉林", x: 82, y: 21 },
  { province: "黑龙江省", label: "黑龙江", x: 82, y: 13 },
  { province: "上海市", label: "上海", x: 78, y: 50 },
  { province: "江苏省", label: "江苏", x: 73, y: 48 },
  { province: "浙江省", label: "浙江", x: 72, y: 55 },
  { province: "安徽省", label: "安徽", x: 67, y: 50 },
  { province: "福建省", label: "福建", x: 70, y: 63 },
  { province: "江西省", label: "江西", x: 67, y: 57 },
  { province: "山东省", label: "山东", x: 70, y: 41 },
  { province: "河南省", label: "河南", x: 61, y: 45 },
  { province: "湖北省", label: "湖北", x: 61, y: 53 },
  { province: "湖南省", label: "湖南", x: 59, y: 61 },
  { province: "广东省", label: "广东", x: 62, y: 72 },
  { province: "广西壮族自治区", label: "广西", x: 53, y: 72 },
  { province: "海南省", label: "海南", x: 57, y: 84 },
  { province: "重庆市", label: "重庆", x: 50, y: 56 },
  { province: "四川省", label: "四川", x: 43, y: 55 },
  { province: "贵州省", label: "贵州", x: 50, y: 66 },
  { province: "云南省", label: "云南", x: 42, y: 72 },
  { province: "西藏自治区", label: "西藏", x: 25, y: 56 },
  { province: "陕西省", label: "陕西", x: 53, y: 45 },
  { province: "甘肃省", label: "甘肃", x: 43, y: 41 },
  { province: "青海省", label: "青海", x: 35, y: 45 },
  { province: "宁夏回族自治区", label: "宁夏", x: 49, y: 39 },
  { province: "新疆维吾尔自治区", label: "新疆", x: 20, y: 31 },
  { province: "香港特别行政区", label: "香港", x: 65, y: 75 },
  { province: "澳门特别行政区", label: "澳门", x: 62, y: 76 },
  { province: "台湾省", label: "台湾", x: 76, y: 67 }
];

export function getProvincePoint(province: string) {
  return provinceMapPoints.find((point) => point.province === province);
}

function createFallbackPoint(province: string, items: HeritageItem[]): ProvinceMapPoint {
  return {
    province,
    label: province.replace(/特别行政区|自治区|省|市|壮族|回族|维吾尔/g, ""),
    x: items[0]?.location.mapX ?? 50,
    y: items[0]?.location.mapY ?? 50
  };
}

export function buildProvinceExplorerData(items: HeritageItem[]): ProvinceExplorerData {
  const groups = new Map<string, HeritageItem[]>();

  for (const item of items) {
    const existing = groups.get(item.province) ?? [];
    existing.push(item);
    groups.set(item.province, existing);
  }

  const sortedGroups = Array.from(groups.entries())
    .map(([province, provinceItems]) => ({
      province,
      items: provinceItems
    }))
    .sort((a, b) => {
      const byCount = b.items.length - a.items.length;
      return byCount === 0 ? a.province.localeCompare(b.province, "zh-CN") : byCount;
    });

  const maxCount = sortedGroups[0]?.items.length ?? 0;
  const explorerGroups = sortedGroups.map(({ province, items: provinceItems }) => {
    const point = getProvincePoint(province) ?? createFallbackPoint(province, provinceItems);

    return {
      province,
      label: point.label,
      count: provinceItems.length,
      items: provinceItems,
      point,
      intensity: maxCount > 0 ? provinceItems.length / maxCount : 0
    };
  });

  return {
    groups: explorerGroups,
    totalCount: items.length,
    maxCount,
    defaultProvince: explorerGroups[0]?.province ?? ""
  };
}

export function getProvinceExplorerSelection(data: ProvinceExplorerData, province?: string) {
  return data.groups.find((group) => group.province === province) ?? data.groups[0] ?? null;
}
