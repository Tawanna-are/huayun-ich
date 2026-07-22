import type { HeritageTimelineEvent } from "@/lib/types/heritage";

export type ValidationResult<T> =
  | {
      ok: true;
      data: T;
      errors: Record<string, never>;
    }
  | {
      ok: false;
      errors: Record<string, string>;
    };

export type HeritageAdminPayload = {
  slug: string;
  name: string;
  englishName: string;
  categorySlug: string;
  summary: string;
  region: string;
  province: string;
  city: string;
  inscriptionYear: number | null;
  history: string[];
  timeline: HeritageTimelineEvent[];
  tags: string[];
  relatedSlugs: string[];
  latitude: number | null;
  longitude: number | null;
  mapX: number | null;
  mapY: number | null;
  imageUrl: string;
  heroImageUrl: string;
  videoUrl: string;
  inheritorName: string;
  inheritorTitle: string;
  inheritorBio: string;
  inheritorImageUrl: string;
  published: boolean;
  featured: boolean;
};

export type CategoryAdminPayload = {
  slug: string;
  name: string;
  englishName: string;
  summary: string;
  color: string;
  sortOrder: number;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hexColorPattern = /^#[0-9a-fA-F]{6}$/;

function readString(body: Record<string, unknown>, key: string) {
  return String(body[key] ?? "").trim();
}

function readNullableNumber(body: Record<string, unknown>, key: string) {
  const value = body[key];

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function readBoolean(body: Record<string, unknown>, key: string, fallback = true) {
  const value = body[key];

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }
  }

  return fallback;
}

export function parseLineList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseCommaList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseTimelineText(value: unknown): HeritageTimelineEvent[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is HeritageTimelineEvent => {
      return (
        typeof item === "object" &&
        item !== null &&
        "year" in item &&
        "title" in item &&
        "description" in item &&
        typeof item.year === "string" &&
        typeof item.title === "string" &&
        typeof item.description === "string"
      );
    });
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s*[|｜]\s*/))
    .filter((parts) => parts.length >= 3)
    .map(([year, title, ...descriptionParts]) => ({
      year: year.trim(),
      title: title.trim(),
      description: descriptionParts.join(" | ").trim()
    }))
    .filter((event) => event.year && event.title && event.description);
}

export function formatTimelineText(events: HeritageTimelineEvent[]) {
  return events.map((event) => `${event.year} | ${event.title} | ${event.description}`).join("\n");
}

export function validateHeritagePayload(body: Record<string, unknown>): ValidationResult<HeritageAdminPayload> {
  const slug = readString(body, "slug");
  const name = readString(body, "name");
  const englishName = readString(body, "englishName");
  const categorySlug = readString(body, "categorySlug");
  const summary = readString(body, "summary");
  const region = readString(body, "region");
  const province = readString(body, "province");
  const city = readString(body, "city");
  const inscriptionYear = readNullableNumber(body, "inscriptionYear");
  const latitude = readNullableNumber(body, "latitude");
  const longitude = readNullableNumber(body, "longitude");
  const mapX = readNullableNumber(body, "mapX");
  const mapY = readNullableNumber(body, "mapY");
  const errors: Record<string, string> = {};

  if (!slugPattern.test(slug)) {
    errors.slug = "Slug 只能包含小写字母、数字和连字符。";
  }

  if (!name) {
    errors.name = "请输入非遗项目名称。";
  }

  if (!englishName) {
    errors.englishName = "请输入英文名称。";
  }

  if (!categorySlug) {
    errors.categorySlug = "请选择分类。";
  }

  if (!summary) {
    errors.summary = "请输入项目简介。";
  }

  if (!region) {
    errors.region = "请输入所属地区。";
  }

  if (!province) {
    errors.province = "请输入省份。";
  }

  if (!city) {
    errors.city = "请输入城市。";
  }

  if (body.inscriptionYear && inscriptionYear === null) {
    errors.inscriptionYear = "入选年份必须是数字。";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    errors: {},
    data: {
      slug,
      name,
      englishName,
      categorySlug,
      summary,
      region,
      province,
      city,
      inscriptionYear,
      history: parseLineList(body.history),
      timeline: parseTimelineText(body.timeline),
      tags: parseCommaList(body.tags),
      relatedSlugs: parseCommaList(body.relatedSlugs),
      latitude,
      longitude,
      mapX,
      mapY,
      imageUrl: readString(body, "imageUrl"),
      heroImageUrl: readString(body, "heroImageUrl"),
      videoUrl: readString(body, "videoUrl"),
      inheritorName: readString(body, "inheritorName"),
      inheritorTitle: readString(body, "inheritorTitle"),
      inheritorBio: readString(body, "inheritorBio"),
      inheritorImageUrl: readString(body, "inheritorImageUrl"),
      published: readBoolean(body, "published", true),
      featured: readBoolean(body, "featured", false)
    }
  };
}

export function validateCategoryPayload(body: Record<string, unknown>): ValidationResult<CategoryAdminPayload> {
  const slug = readString(body, "slug");
  const name = readString(body, "name");
  const englishName = readString(body, "englishName");
  const summary = readString(body, "summary");
  const color = readString(body, "color") || "#C8A96A";
  const sortOrder = readNullableNumber(body, "sortOrder") ?? 0;
  const errors: Record<string, string> = {};

  if (!slugPattern.test(slug)) {
    errors.slug = "Slug 只能包含小写字母、数字和连字符。";
  }

  if (!name) {
    errors.name = "请输入分类名称。";
  }

  if (!englishName) {
    errors.englishName = "请输入英文名称。";
  }

  if (!summary || summary.length < 6) {
    errors.summary = "分类简介至少需要 6 个字符。";
  }

  if (!hexColorPattern.test(color)) {
    errors.color = "颜色必须是 #RRGGBB 格式的 HEX 色值。";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    errors: {},
    data: {
      slug,
      name,
      englishName,
      summary,
      color,
      sortOrder
    }
  };
}
