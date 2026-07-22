import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deleteMediaAssetsByStorageIdentity } from "@/lib/admin/media-assets";
import type { HeritageMediaRole, HeritageMediaType } from "@/lib/types/database";

export type AdminMediaHeritageItem = {
  id: string;
  name: string;
  slug: string;
  region: string;
  province: string;
  city: string;
};

export type AdminMediaSelectRow = {
  id: string;
  heritage_item_id: string;
  media_type: HeritageMediaType;
  role: HeritageMediaRole;
  url: string;
  alt: string | null;
  caption: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  storage_path: string | null;
  thumbnail_url: string | null;
  thumbnail_storage_path: string | null;
  original_file_name: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
  created_at: string;
  heritage_item: AdminMediaHeritageItem | AdminMediaHeritageItem[] | null;
};

export type AdminMediaAsset = {
  id: string;
  heritageItemId: string;
  mediaType: HeritageMediaType;
  role: HeritageMediaRole;
  url: string;
  alt: string | null;
  caption: string | null;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  storagePath: string | null;
  thumbnailUrl: string | null;
  thumbnailStoragePath: string | null;
  originalFileName: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  createdAt: string;
  heritageItem: AdminMediaHeritageItem | null;
};

export type AdminMediaLibraryFilters = {
  query?: string;
  mediaType?: HeritageMediaType;
  heritageId?: string;
};

export type AdminMediaLibraryResponse = {
  assets: AdminMediaAsset[];
  total: number;
  imageCount: number;
  videoCount: number;
};

type BulkDeleteValidationResult =
  | {
      ok: true;
      ids: string[];
    }
  | {
      ok: false;
      error: string;
    };

function firstValue<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function getFileNameFromUrl(url: string) {
  const cleanUrl = url.split("?")[0] ?? url;
  const lastSegment = cleanUrl.split("/").filter(Boolean).pop();

  return lastSegment ? decodeURIComponent(lastSegment) : "untitled-media";
}

export function getStoragePathFromPublicUrl(url: string) {
  const marker = "/storage/v1/object/public/heritage-media/";
  const markerIndex = url.indexOf(marker);

  if (markerIndex < 0) {
    return null;
  }

  const path = url.slice(markerIndex + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

export function normalizeAdminMediaRow(row: AdminMediaSelectRow): AdminMediaAsset {
  return {
    id: row.id,
    heritageItemId: row.heritage_item_id,
    mediaType: row.media_type,
    role: row.role,
    url: row.url,
    alt: row.alt,
    caption: row.caption,
    fileName: row.file_name || getFileNameFromUrl(row.url),
    fileSize: row.file_size ?? null,
    mimeType: row.mime_type ?? null,
    storagePath: row.storage_path || getStoragePathFromPublicUrl(row.url),
    thumbnailUrl: row.thumbnail_url ?? null,
    thumbnailStoragePath: row.thumbnail_storage_path ?? null,
    originalFileName: row.original_file_name ?? null,
    width: row.width ?? null,
    height: row.height ?? null,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    heritageItem: firstValue(row.heritage_item)
  };
}

export function buildMediaLibraryFilters(searchParams: URLSearchParams): AdminMediaLibraryFilters {
  const query = searchParams.get("q")?.trim();
  const rawMediaType = searchParams.get("type");
  const heritageId = searchParams.get("heritageId")?.trim();

  return {
    ...(query ? { query } : {}),
    ...(rawMediaType === "image" || rawMediaType === "video" ? { mediaType: rawMediaType } : {}),
    ...(heritageId ? { heritageId } : {})
  };
}

export function validateBulkDeleteMediaPayload(body: unknown): BulkDeleteValidationResult {
  const ids = Array.isArray((body as { ids?: unknown }).ids)
    ? (body as { ids: unknown[] }).ids
        .map((id) => (typeof id === "string" ? id.trim() : ""))
        .filter(Boolean)
    : [];
  const uniqueIds = Array.from(new Set(ids));

  if (uniqueIds.length === 0) {
    return { ok: false, error: "Select at least one media asset." };
  }

  if (uniqueIds.length > 50) {
    return { ok: false, error: "Delete at most 50 media assets at a time." };
  }

  return { ok: true, ids: uniqueIds };
}

export function formatMediaFileSize(size: number | null | undefined) {
  if (size == null) {
    return "-";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = size / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

function assetMatchesQuery(asset: AdminMediaAsset, query: string) {
  const normalizedQuery = query.toLowerCase();
  return [
    asset.fileName,
    asset.alt,
    asset.caption,
    asset.mimeType,
    asset.role,
    asset.heritageItem?.name,
    asset.heritageItem?.slug,
    asset.heritageItem?.region,
    asset.heritageItem?.province,
    asset.heritageItem?.city
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

export async function getAdminMediaLibrary(
  filters: AdminMediaLibraryFilters = {}
): Promise<AdminMediaLibraryResponse> {
  const supabase = await createSupabaseAdminClient();
  let query = supabase
    .from("heritage_media")
    .select(
      `
        id,
        heritage_item_id,
        media_type,
        role,
        url,
        alt,
        caption,
        file_name,
        file_size,
        mime_type,
        storage_path,
        thumbnail_url,
        thumbnail_storage_path,
        original_file_name,
        width,
        height,
        sort_order,
        created_at,
        heritage_item:heritage_items (
          id,
          name,
          slug,
          region,
          province,
          city
        )
      `
    )
    .order("created_at", { ascending: false });

  if (filters.mediaType) {
    query = query.eq("media_type", filters.mediaType);
  }

  if (filters.heritageId) {
    query = query.eq("heritage_item_id", filters.heritageId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  let assets = ((data ?? []) as unknown as AdminMediaSelectRow[]).map(normalizeAdminMediaRow);

  if (filters.query) {
    assets = assets.filter((asset) => assetMatchesQuery(asset, filters.query ?? ""));
  }

  return {
    assets,
    total: assets.length,
    imageCount: assets.filter((asset) => asset.mediaType === "image").length,
    videoCount: assets.filter((asset) => asset.mediaType === "video").length
  };
}

export async function deleteAdminMediaAssets(ids: string[]) {
  const supabase = await createSupabaseAdminClient();
  const { data, error: selectError } = await supabase
    .from("heritage_media")
    .select("id, storage_path, thumbnail_storage_path, url")
    .in("id", ids);

  if (selectError) {
    throw new Error(selectError.message);
  }

  const rows = (data ?? []) as Array<{
    id: string;
    storage_path: string | null;
    thumbnail_storage_path: string | null;
    url: string;
  }>;
  const storagePaths = rows
    .flatMap((row) => [row.storage_path || getStoragePathFromPublicUrl(row.url), row.thumbnail_storage_path])
    .filter((path): path is string => Boolean(path));
  const uniqueStoragePaths = Array.from(new Set(storagePaths));

  if (uniqueStoragePaths.length > 0) {
    const { error: storageError } = await supabase.storage.from("heritage-media").remove(uniqueStoragePaths);

    if (storageError) {
      throw new Error(storageError.message);
    }
  }

  await deleteMediaAssetsByStorageIdentity(
    supabase,
    rows.map((row) => ({
      url: row.url,
      storagePath: row.storage_path || getStoragePathFromPublicUrl(row.url)
    }))
  );

  const { error: deleteError } = await supabase.from("heritage_media").delete().in("id", ids);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return {
    deleted: ids.length,
    storageDeleted: uniqueStoragePaths.length
  };
}
