import { parseListValue, parseTimelineValue, type ImportRawRecord } from "@/lib/admin/import-parser";
import type { HeritageAdminPayload } from "@/lib/admin/validation";

export type HeritageImportStatus = "valid" | "invalid" | "duplicate";

export type HeritageImportRow = {
  rowNumber: number;
  status: HeritageImportStatus;
  action: "create" | "update" | "duplicate" | "error";
  dedupeKey: string;
  errors: Record<string, string>;
  raw: ImportRawRecord;
  payload: HeritageAdminPayload | null;
};

export type HeritageImportNormalizeResult = {
  rows: HeritageImportRow[];
};

export type HeritageImportSummary = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  createRows: number;
  updateRows: number;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function read(row: ImportRawRecord, key: string) {
  return String(row[key] ?? "").trim();
}

function readNullableNumber(row: ImportRawRecord, key: string) {
  const value = read(row, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readBoolean(row: ImportRawRecord, key: string, fallback = true) {
  const value = read(row, key).toLowerCase();

  if (["true", "1", "yes", "y", "是", "已发布"].includes(value)) {
    return true;
  }

  if (["false", "0", "no", "n", "否", "未发布"].includes(value)) {
    return false;
  }

  return fallback;
}

function normalizePayload(row: ImportRawRecord): HeritageAdminPayload {
  const name = read(row, "name");
  const province = read(row, "province");

  return {
    slug: read(row, "slug"),
    name,
    englishName: read(row, "english_name") || name,
    categorySlug: read(row, "category_slug"),
    summary: read(row, "summary"),
    region: read(row, "region") || province,
    province,
    city: read(row, "city") || province,
    inscriptionYear: readNullableNumber(row, "inscription_year"),
    history: parseListValue(row.history),
    timeline: parseTimelineValue(row.timeline),
    tags: parseListValue(row.tags),
    relatedSlugs: parseListValue(row.related_slugs),
    latitude: readNullableNumber(row, "latitude"),
    longitude: readNullableNumber(row, "longitude"),
    mapX: readNullableNumber(row, "map_x"),
    mapY: readNullableNumber(row, "map_y"),
    imageUrl: read(row, "image_url"),
    heroImageUrl: read(row, "hero_image_url"),
    videoUrl: read(row, "video_url"),
    inheritorName: read(row, "inheritor_name"),
    inheritorTitle: read(row, "inheritor_title"),
    inheritorBio: read(row, "inheritor_bio"),
    inheritorImageUrl: read(row, "inheritor_image_url"),
    published: readBoolean(row, "published", true),
    featured: readBoolean(row, "featured", false)
  };
}

function validatePayload(payload: HeritageAdminPayload, categorySlugs: Set<string>) {
  const errors: Record<string, string> = {};

  if (!slugPattern.test(payload.slug)) {
    errors.slug = "Slug must use lowercase letters, numbers and hyphens.";
  }

  if (!payload.name) {
    errors.name = "Name is required.";
  }

  if (!payload.categorySlug) {
    errors.categorySlug = "Category is required.";
  } else if (categorySlugs.size > 0 && !categorySlugs.has(payload.categorySlug)) {
    errors.categorySlug = "Category does not exist.";
  }

  if (!payload.summary) {
    errors.summary = "Summary is required.";
  }

  if (!payload.province) {
    errors.province = "Province is required.";
  }

  return errors;
}

export function normalizeHeritageImportRows(
  records: ImportRawRecord[],
  categorySlugs: Set<string>,
  existingItems: Array<{ slug: string; name: string; province: string }> = []
): HeritageImportNormalizeResult {
  const seenSlugs = new Set<string>();
  const seenNameProvince = new Set<string>();
  const existingSlugs = new Set(existingItems.map((item) => item.slug));
  const rows = records.map((record, index): HeritageImportRow => {
    const payload = normalizePayload(record);
    const errors = validatePayload(payload, categorySlugs);
    const nameProvinceKey = `${payload.name}::${payload.province}`.toLowerCase();
    const duplicate = seenSlugs.has(payload.slug) || seenNameProvince.has(nameProvinceKey);

    seenSlugs.add(payload.slug);
    seenNameProvince.add(nameProvinceKey);

    if (Object.keys(errors).length > 0) {
      return {
        rowNumber: index + 2,
        status: "invalid",
        action: "error",
        dedupeKey: payload.slug || nameProvinceKey,
        errors,
        raw: record,
        payload: null
      };
    }

    if (duplicate) {
      return {
        rowNumber: index + 2,
        status: "duplicate",
        action: "duplicate",
        dedupeKey: payload.slug,
        errors: { duplicate: "Duplicate slug or name/province in uploaded file." },
        raw: record,
        payload
      };
    }

    return {
      rowNumber: index + 2,
      status: "valid",
      action: existingSlugs.has(payload.slug) ? "update" : "create",
      dedupeKey: payload.slug,
      errors: {},
      raw: record,
      payload
    };
  });

  return { rows };
}

export function summarizeImportPreview(rows: HeritageImportRow[]): HeritageImportSummary {
  return {
    totalRows: rows.length,
    validRows: rows.filter((row) => row.status === "valid").length,
    invalidRows: rows.filter((row) => row.status === "invalid").length,
    duplicateRows: rows.filter((row) => row.status === "duplicate").length,
    createRows: rows.filter((row) => row.action === "create").length,
    updateRows: rows.filter((row) => row.action === "update").length
  };
}
