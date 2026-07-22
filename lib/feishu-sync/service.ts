import { captureAppException } from "@/lib/monitoring/sentry";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { createSupabaseAdminClient as createAdminClientType } from "@/lib/supabase/admin";
import type {
  FeishuRecordMappingRow,
  FeishuSyncLogRow,
  FeishuSyncSourceRow,
  HeritageMediaType
} from "@/lib/types/database";
import { getFeishuSyncConfig } from "@/lib/feishu-sync/config";
import { FeishuClient } from "@/lib/feishu-sync/client";
import {
  buildFeishuHeritagePayload,
  classifyFeishuAttachment,
  createPayloadHash,
  getAttachmentToken,
  getFeishuAttachments,
  type FeishuAttachment,
  type FeishuRecord
} from "@/lib/feishu-sync/mapper";
import { normalizeUploadFileName } from "@/lib/admin/image-upload";
import { getStorageCacheControlForMimeType } from "@/lib/admin/media-performance";

type AdminSupabaseClient = Awaited<ReturnType<typeof createAdminClientType>>;

export type FeishuSyncSource = "manual" | "cron";

export type FeishuSyncResult = {
  insertedCount: number;
  updatedCount: number;
  deletedCount: number;
  skippedCount: number;
  failedCount: number;
  logId: string;
  message: string;
};

type SyncCounters = {
  insertedCount: number;
  updatedCount: number;
  deletedCount: number;
  skippedCount: number;
  failedCount: number;
};

function snakeCounters(counters: SyncCounters) {
  return {
    inserted_count: counters.insertedCount,
    updated_count: counters.updatedCount,
    deleted_count: counters.deletedCount,
    skipped_count: counters.skippedCount,
    failed_count: counters.failedCount
  };
}

async function ensureSyncSource(supabase: AdminSupabaseClient) {
  const config = getFeishuSyncConfig();
  const { data: existing, error: selectError } = await supabase
    .from("feishu_sync_sources")
    .select("*")
    .eq("app_token", config.appToken)
    .eq("table_id", config.tableId)
    .limit(1);

  if (selectError) {
    throw new Error(selectError.message);
  }

  const source = (existing?.[0] ?? null) as FeishuSyncSourceRow | null;

  if (source) {
    const { data, error } = await supabase
      .from("feishu_sync_sources")
      .update({
        view_id: config.viewId,
        active: true
      })
      .eq("id", source.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as FeishuSyncSourceRow;
  }

  const { data, error } = await supabase
    .from("feishu_sync_sources")
    .insert({
      name: "飞书非遗内容表",
      app_token: config.appToken,
      table_id: config.tableId,
      view_id: config.viewId,
      active: true
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as FeishuSyncSourceRow;
}

async function createSyncLog(supabase: AdminSupabaseClient, source: FeishuSyncSourceRow, trigger: FeishuSyncSource) {
  const { data, error } = await supabase
    .from("feishu_sync_logs")
    .insert({
      source_id: source.id,
      source: trigger,
      status: "processing",
      message: "Feishu sync started."
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as FeishuSyncLogRow;
}

async function finishSyncLog(
  supabase: AdminSupabaseClient,
  logId: string,
  status: FeishuSyncLogRow["status"],
  counters: SyncCounters,
  message: string,
  errors: Record<string, unknown>[] = []
) {
  const { error } = await supabase
    .from("feishu_sync_logs")
    .update({
      status,
      finished_at: new Date().toISOString(),
      ...snakeCounters(counters),
      message,
      errors
    })
    .eq("id", logId);

  if (error) {
    throw new Error(error.message);
  }
}

async function getCategoryId(supabase: AdminSupabaseClient, categorySlug: string) {
  const { data, error } = await supabase.from("categories").select("id").eq("slug", categorySlug).limit(1);

  if (error) {
    throw new Error(error.message);
  }

  const fallback = data?.[0] as { id: string } | undefined;

  if (fallback) {
    return fallback.id;
  }

  const { data: defaultData, error: defaultError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "traditional-craft")
    .single();

  if (defaultError || !defaultData) {
    throw new Error("Category not found for Feishu record.");
  }

  return (defaultData as { id: string }).id;
}

function mapPayloadToHeritageRow(payload: ReturnType<typeof buildFeishuHeritagePayload>, categoryId: string) {
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
    published: payload.published,
    featured: payload.featured,
    updated_at: new Date().toISOString()
  };
}

async function findExistingHeritageId(
  supabase: AdminSupabaseClient,
  sourceId: string,
  recordId: string,
  slug: string
) {
  const { data: mappings, error: mappingError } = await supabase
    .from("feishu_record_mappings")
    .select("*")
    .eq("source_id", sourceId)
    .eq("feishu_record_id", recordId)
    .limit(1);

  if (mappingError) {
    throw new Error(mappingError.message);
  }

  const mapping = (mappings?.[0] ?? null) as FeishuRecordMappingRow | null;

  if (mapping?.heritage_id) {
    return { heritageId: mapping.heritage_id, mapping };
  }

  const { data: heritage, error: heritageError } = await supabase.from("heritage_items").select("id").eq("slug", slug).limit(1);

  if (heritageError) {
    throw new Error(heritageError.message);
  }

  const row = heritage?.[0] as { id: string } | undefined;
  return { heritageId: row?.id ?? null, mapping };
}

async function upsertHeritageRecord(
  supabase: AdminSupabaseClient,
  source: FeishuSyncSourceRow,
  record: FeishuRecord
) {
  const payload = buildFeishuHeritagePayload(record);

  if (!payload.name || !payload.summary || !payload.province) {
    throw new Error(`Feishu record ${record.record_id} is missing required heritage fields.`);
  }

  const payloadHash = createPayloadHash({
    fields: record.fields,
    payload
  });
  const categoryId = await getCategoryId(supabase, payload.categorySlug);
  const existing = await findExistingHeritageId(supabase, source.id, record.record_id, payload.slug);
  const lastModifiedTime = record.last_modified_time ?? record.created_time ?? null;

  if (
    existing.mapping?.heritage_id &&
    existing.mapping.last_payload_hash === payloadHash &&
    existing.mapping.last_feishu_modified_time === lastModifiedTime &&
    !existing.mapping.deleted_at
  ) {
    return {
      action: "skipped" as const,
      heritageId: existing.mapping.heritage_id,
      payloadHash,
      lastModifiedTime
    };
  }

  let heritageId = existing.heritageId;
  let action: "inserted" | "updated" = "updated";

  if (heritageId) {
    const { error } = await supabase.from("heritage_items").update(mapPayloadToHeritageRow(payload, categoryId)).eq("id", heritageId);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { data, error } = await supabase
      .from("heritage_items")
      .insert(mapPayloadToHeritageRow(payload, categoryId))
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    heritageId = (data as { id: string }).id;
    action = "inserted";
  }

  const { error: mappingError } = await supabase.from("feishu_record_mappings").upsert(
    {
      source_id: source.id,
      feishu_record_id: record.record_id,
      heritage_id: heritageId,
      slug: payload.slug,
      last_feishu_modified_time: lastModifiedTime,
      last_payload_hash: payloadHash,
      deleted_at: null,
      synced_at: new Date().toISOString()
    },
    {
      onConflict: "source_id,feishu_record_id"
    }
  );

  if (mappingError) {
    throw new Error(mappingError.message);
  }

  return {
    action,
    heritageId,
    payloadHash,
    lastModifiedTime
  };
}

function sanitizeFileName(fileName: string) {
  return normalizeUploadFileName(fileName || "feishu-media").replace(/[^a-zA-Z0-9._-]/g, "-");
}

function getAttachmentMimeType(attachment: FeishuAttachment, fileType: HeritageMediaType) {
  return attachment.type ?? attachment.mime_type ?? (fileType === "image" ? "image/jpeg" : "video/mp4");
}

async function removeFeishuMediaForRecord(supabase: AdminSupabaseClient, heritageId: string, recordId: string) {
  const prefix = `${heritageId}/feishu/${recordId}/%`;
  const { data: assets, error: assetSelectError } = await supabase
    .from("media_assets")
    .select("storage_path, thumbnail_storage_path")
    .eq("heritage_id", heritageId)
    .like("storage_path", prefix);

  if (assetSelectError) {
    throw new Error(assetSelectError.message);
  }

  const storagePaths = (assets ?? [])
    .flatMap((asset) => [asset.storage_path, asset.thumbnail_storage_path])
    .filter((value): value is string => Boolean(value));

  if (storagePaths.length > 0) {
    await supabase.storage.from("heritage-media").remove(storagePaths);
  }

  const { error: deleteAssetsError } = await supabase
    .from("media_assets")
    .delete()
    .eq("heritage_id", heritageId)
    .like("storage_path", prefix);

  if (deleteAssetsError) {
    throw new Error(deleteAssetsError.message);
  }

  const { error: deleteMediaError } = await supabase
    .from("heritage_media")
    .delete()
    .eq("heritage_item_id", heritageId)
    .like("storage_path", prefix);

  if (deleteMediaError) {
    throw new Error(deleteMediaError.message);
  }
}

async function uploadFeishuAttachment(
  supabase: AdminSupabaseClient,
  client: FeishuClient,
  heritageId: string,
  recordId: string,
  attachment: FeishuAttachment,
  fileType: HeritageMediaType,
  index: number
) {
  const blob = await client.downloadAttachment(attachment);
  const mimeType = getAttachmentMimeType(attachment, fileType);
  const fileName = sanitizeFileName(attachment.name ?? `${getAttachmentToken(attachment)}.${fileType === "image" ? "jpg" : "mp4"}`);
  const storagePath = `${heritageId}/feishu/${recordId}/${Date.now()}-${index}-${fileName}`;
  const { error: uploadError } = await supabase.storage.from("heritage-media").upload(storagePath, blob, {
    cacheControl: getStorageCacheControlForMimeType(mimeType),
    contentType: mimeType,
    upsert: true
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrl } = supabase.storage.from("heritage-media").getPublicUrl(storagePath);
  const role = fileType === "video" ? "video" : index === 0 ? "cover" : "gallery";
  const title = attachment.name ?? `${fileType}-${index + 1}`;
  const fileSize = attachment.size ?? blob.size ?? null;

  const { error: mediaError } = await supabase.from("heritage_media").insert({
    heritage_item_id: heritageId,
    media_type: fileType,
    role,
    url: publicUrl.publicUrl,
    alt: title,
    caption: title,
    file_name: fileName,
    file_size: fileSize,
    mime_type: mimeType,
    storage_path: storagePath,
    thumbnail_url: null,
    thumbnail_storage_path: null,
    original_file_name: attachment.name ?? fileName,
    sort_order: index
  });

  if (mediaError) {
    throw new Error(mediaError.message);
  }

  const { error: assetError } = await supabase.from("media_assets").insert({
    title,
    file_type: fileType,
    file_url: publicUrl.publicUrl,
    thumbnail_url: null,
    file_size: fileSize,
    duration: null,
    heritage_id: heritageId,
    asset_role: fileType === "video" && index === 0 ? "main_video" : role,
    alt: title,
    caption: title,
    mime_type: mimeType,
    storage_path: storagePath,
    thumbnail_storage_path: null,
    sort_order: index
  });

  if (assetError) {
    throw new Error(assetError.message);
  }
}

async function syncRecordMedia(
  supabase: AdminSupabaseClient,
  client: FeishuClient,
  heritageId: string,
  record: FeishuRecord
) {
  const imageAttachments = getFeishuAttachments(record.fields["图片附件"]);
  const videoAttachments = getFeishuAttachments(record.fields["视频附件"]);
  const attachments = [...imageAttachments, ...videoAttachments];

  if (attachments.length === 0) {
    return;
  }

  await removeFeishuMediaForRecord(supabase, heritageId, record.record_id);

  let index = 0;

  for (const attachment of attachments) {
    const fileType = classifyFeishuAttachment(attachment);

    if (!fileType) {
      continue;
    }

    await uploadFeishuAttachment(supabase, client, heritageId, record.record_id, attachment, fileType, index);
    index += 1;
  }
}

async function markDeletedRecords(
  supabase: AdminSupabaseClient,
  source: FeishuSyncSourceRow,
  liveRecordIds: Set<string>,
  nowIso: string
) {
  const { data, error } = await supabase
    .from("feishu_record_mappings")
    .select("*")
    .eq("source_id", source.id)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  let deletedCount = 0;

  for (const mapping of (data ?? []) as FeishuRecordMappingRow[]) {
    if (liveRecordIds.has(mapping.feishu_record_id)) {
      continue;
    }

    const { error: mappingError } = await supabase
      .from("feishu_record_mappings")
      .update({
        deleted_at: nowIso,
        synced_at: nowIso
      })
      .eq("id", mapping.id);

    if (mappingError) {
      throw new Error(mappingError.message);
    }

    if (mapping.heritage_id) {
      const { error: heritageError } = await supabase
        .from("heritage_items")
        .update({
          published: false,
          updated_at: nowIso
        })
        .eq("id", mapping.heritage_id);

      if (heritageError) {
        throw new Error(heritageError.message);
      }
    }

    deletedCount += 1;
  }

  return deletedCount;
}

export async function getFeishuSyncLogs(limit = 8) {
  const supabase = await createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("feishu_sync_logs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as FeishuSyncLogRow[];
}

export async function syncFeishuContent({ source: trigger }: { source: FeishuSyncSource }): Promise<FeishuSyncResult> {
  const supabase = await createSupabaseAdminClient();
  const syncSource = await ensureSyncSource(supabase);
  const log = await createSyncLog(supabase, syncSource, trigger);
  const counters: SyncCounters = {
    insertedCount: 0,
    updatedCount: 0,
    deletedCount: 0,
    skippedCount: 0,
    failedCount: 0
  };
  const syncErrors: Record<string, unknown>[] = [];

  try {
    const config = getFeishuSyncConfig();
    const client = new FeishuClient(config);
    const records = await client.listAllRecords();
    const liveRecordIds = new Set(records.map((record) => record.record_id));

    for (const record of records) {
      try {
        const result = await upsertHeritageRecord(supabase, syncSource, record);

        if (result.action === "inserted") {
          counters.insertedCount += 1;
        } else if (result.action === "updated") {
          counters.updatedCount += 1;
        } else {
          counters.skippedCount += 1;
        }

        if (result.action !== "skipped") {
          await syncRecordMedia(supabase, client, result.heritageId, record);
        }
      } catch (error) {
        counters.failedCount += 1;
        syncErrors.push({
          recordId: record.record_id,
          message: error instanceof Error ? error.message : "Unknown Feishu record sync error."
        });
      }
    }

    counters.deletedCount = await markDeletedRecords(supabase, syncSource, liveRecordIds, new Date().toISOString());

    const { error: sourceError } = await supabase
      .from("feishu_sync_sources")
      .update({
        last_sync_at: new Date().toISOString()
      })
      .eq("id", syncSource.id);

    if (sourceError) {
      throw new Error(sourceError.message);
    }

    const status = counters.failedCount > 0 ? "failed" : "completed";
    const message =
      counters.failedCount > 0
        ? "Feishu sync completed with record-level failures."
        : "Feishu sync completed successfully.";

    await finishSyncLog(supabase, log.id, status, counters, message, syncErrors);

    return {
      ...counters,
      logId: log.id,
      message
    };
  } catch (error) {
    counters.failedCount += 1;
    const message = error instanceof Error ? error.message : "Failed to sync Feishu content.";
    captureAppException(error, {
      module: "admin",
      operation: "feishu_sync",
      extra: {
        source: trigger
      }
    });
    await finishSyncLog(supabase, log.id, "failed", counters, message, syncErrors);
    throw error;
  }
}
