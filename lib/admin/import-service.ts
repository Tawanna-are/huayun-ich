import { parseSpreadsheetFile, type ImportRawRecord } from "@/lib/admin/import-parser";
import {
  normalizeHeritageImportRows,
  summarizeImportPreview,
  type HeritageImportRow
} from "@/lib/admin/import-validation";
import { isSupportedImageUpload, normalizeUploadFileName } from "@/lib/admin/image-upload";
import { getStorageCacheControlForMimeType } from "@/lib/admin/media-performance";
import { isSupportedVideoUpload } from "@/lib/admin/video-upload";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CategoryRow, HeritageMediaRole, HeritageMediaType, HeritageItemRow } from "@/lib/types/database";

type AdminSupabaseClient = Awaited<ReturnType<typeof createSupabaseAdminClient>>;

type ImportJobCounters = {
  totalRows: number;
  successRows: number;
  errorRows: number;
  duplicateRows: number;
  skippedRows: number;
};

function mapHeritagePayload(payload: NonNullable<HeritageImportRow["payload"]>, categoryId: string) {
  return {
    category_id: categoryId,
    slug: payload.slug,
    name: payload.name,
    english_name: payload.englishName,
    summary: payload.summary,
    region: payload.region,
    province: payload.province,
    city: payload.city,
    inscription_year: payload.inscriptionYear,
    history: payload.history,
    timeline: payload.timeline,
    tags: payload.tags,
    related_slugs: payload.relatedSlugs,
    latitude: payload.latitude,
    longitude: payload.longitude,
    map_x: payload.mapX,
    map_y: payload.mapY,
    sort_order: 0,
    published: payload.published,
    featured: payload.featured
  };
}

async function getCategoryMap(supabase: AdminSupabaseClient) {
  const { data, error } = await supabase.from("categories").select("id, slug, name, english_name, summary, color, sort_order, created_at");

  if (error) {
    throw new Error(error.message);
  }

  return new Map(((data ?? []) as CategoryRow[]).map((category) => [category.slug, category]));
}

async function getExistingHeritage(supabase: AdminSupabaseClient) {
  const { data, error } = await supabase.from("heritage_items").select("id, slug, name, province");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Array<Pick<HeritageItemRow, "id" | "slug" | "name" | "province">>;
}

export async function createImportJob({
  supabase,
  jobType,
  sourceFileName,
  sourceFileType,
  counters
}: {
  supabase: AdminSupabaseClient;
  jobType: "heritage" | "media";
  sourceFileName: string;
  sourceFileType: string;
  counters: ImportJobCounters;
}) {
  const { data, error } = await supabase
    .from("import_jobs")
    .insert({
      job_type: jobType,
      status: "processing",
      source_file_name: sourceFileName,
      source_file_type: sourceFileType,
      total_rows: counters.totalRows,
      success_rows: counters.successRows,
      error_rows: counters.errorRows,
      duplicate_rows: counters.duplicateRows,
      skipped_rows: counters.skippedRows
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create import job.");
  }

  return data.id as string;
}

async function writeImportJobRows(supabase: AdminSupabaseClient, jobId: string, rows: HeritageImportRow[]) {
  if (!rows.length) {
    return;
  }

  const { error } = await supabase.from("import_job_rows").insert(
    rows.map((row) => ({
      job_id: jobId,
      row_number: row.rowNumber,
      entity_key: row.dedupeKey,
      entity_type: "heritage",
      action: row.action === "error" ? "error" : row.action,
      status:
        row.status === "valid"
          ? "success"
          : row.status === "duplicate"
            ? "duplicate"
            : "failed",
      errors: row.errors,
      payload: row.payload ?? row.raw
    }))
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function finishImportJob(supabase: AdminSupabaseClient, jobId: string, status: "completed" | "failed") {
  const { error } = await supabase.from("import_jobs").update({ status }).eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function previewHeritageImport(records: ImportRawRecord[]) {
  const supabase = await createSupabaseAdminClient();
  const [categoryMap, existingItems] = await Promise.all([getCategoryMap(supabase), getExistingHeritage(supabase)]);
  const normalized = normalizeHeritageImportRows(records, new Set(categoryMap.keys()), existingItems);

  return {
    summary: summarizeImportPreview(normalized.rows),
    rows: normalized.rows
  };
}

export async function commitHeritageImport(records: ImportRawRecord[], { batchSize = 100 }: { batchSize?: number } = {}) {
  const supabase = await createSupabaseAdminClient();
  const [categoryMap, existingItems] = await Promise.all([getCategoryMap(supabase), getExistingHeritage(supabase)]);
  const normalized = normalizeHeritageImportRows(records, new Set(categoryMap.keys()), existingItems);
  const validRows = normalized.rows.filter((row) => row.status === "valid" && row.payload);
  const counters: ImportJobCounters = {
    totalRows: normalized.rows.length,
    successRows: validRows.length,
    errorRows: normalized.rows.filter((row) => row.status === "invalid").length,
    duplicateRows: normalized.rows.filter((row) => row.status === "duplicate").length,
    skippedRows: normalized.rows.filter((row) => row.status !== "valid").length
  };
  const jobId = await createImportJob({
    supabase,
    jobType: "heritage",
    sourceFileName: "heritage-import",
    sourceFileType: "spreadsheet",
    counters
  });

  try {
    for (let index = 0; index < validRows.length; index += batchSize) {
      const batch = validRows.slice(index, index + batchSize);
      const rowsToUpsert = batch.map((row) => {
        const payload = row.payload!;
        const category = categoryMap.get(payload.categorySlug);

        if (!category) {
          throw new Error(`Category not found for ${payload.slug}.`);
        }

        return mapHeritagePayload(payload, category.id);
      });

      const { error } = await supabase.from("heritage_items").upsert(rowsToUpsert, {
        onConflict: "slug"
      });

      if (error) {
        throw new Error(error.message);
      }
    }

    await writeImportJobRows(supabase, jobId, normalized.rows);
    await finishImportJob(supabase, jobId, "completed");
  } catch (error) {
    await finishImportJob(supabase, jobId, "failed");
    throw error;
  }

  return {
    jobId,
    summary: summarizeImportPreview(normalized.rows)
  };
}

export async function parseImportRequestFile(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("Missing import file.");
  }

  return parseSpreadsheetFile(file);
}

export function parseImportMediaFileName(fileName: string) {
  const match = /^([a-z0-9]+(?:-[a-z0-9]+)*)__([a-z_]+)__(.+)$/i.exec(fileName);

  if (!match) {
    return null;
  }

  const role = match[2] === "main_video" ? "video" : match[2];

  if (!["cover", "hero", "gallery", "video", "poster"].includes(role)) {
    return null;
  }

  return {
    heritageSlug: match[1],
    role: role as HeritageMediaRole,
    fileName: match[3]
  };
}

function mediaTypeForFile(file: File): HeritageMediaType | null {
  if (isSupportedImageUpload(file)) {
    return "image";
  }

  if (isSupportedVideoUpload(file)) {
    return "video";
  }

  return null;
}

export async function importMediaBatch(files: File[]) {
  const supabase = await createSupabaseAdminClient();
  const existingItems = await getExistingHeritage(supabase);
  const itemBySlug = new Map(existingItems.map((item) => [item.slug, item]));
  const results = [];

  for (const file of files) {
    const parsed = parseImportMediaFileName(file.name);
    const mediaType = mediaTypeForFile(file);

    if (!parsed || !mediaType) {
      results.push({ fileName: file.name, status: "skipped", error: "Unsupported file or filename convention." });
      continue;
    }

    const item = itemBySlug.get(parsed.heritageSlug);

    if (!item) {
      results.push({ fileName: file.name, status: "skipped", error: "Heritage item not found." });
      continue;
    }

    const safeName = normalizeUploadFileName(parsed.fileName);
    const storagePath = `${item.id}/bulk/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("heritage-media").upload(storagePath, file, {
      cacheControl: getStorageCacheControlForMimeType(file.type),
      contentType: file.type,
      upsert: false
    });

    if (uploadError) {
      results.push({ fileName: file.name, status: "error", error: uploadError.message });
      continue;
    }

    const { data: publicUrl } = supabase.storage.from("heritage-media").getPublicUrl(storagePath);
    const { error: assetError } = await supabase.from("media_assets").insert({
      heritage_id: item.id,
      title: parsed.fileName,
      file_type: mediaType,
      file_url: publicUrl.publicUrl,
      thumbnail_url: null,
      file_size: file.size,
      duration: null,
      asset_role: parsed.role,
      mime_type: file.type,
      storage_path: storagePath,
      thumbnail_storage_path: null,
      alt: item.name,
      caption: parsed.fileName,
      sort_order: 0
    });

    if (assetError) {
      results.push({ fileName: file.name, status: "error", error: assetError.message });
      continue;
    }

    results.push({ fileName: file.name, status: "success", heritageSlug: parsed.heritageSlug, role: parsed.role });
  }

  const counters: ImportJobCounters = {
    totalRows: files.length,
    successRows: results.filter((result) => result.status === "success").length,
    errorRows: results.filter((result) => result.status === "error").length,
    duplicateRows: 0,
    skippedRows: results.filter((result) => result.status === "skipped").length
  };
  const jobId = await createImportJob({
    supabase,
    jobType: "media",
    sourceFileName: "bulk-media",
    sourceFileType: "mixed-media",
    counters
  });
  await finishImportJob(supabase, jobId, counters.errorRows > 0 ? "failed" : "completed");

  return { jobId, results, summary: counters };
}
