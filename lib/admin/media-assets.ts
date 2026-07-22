import type { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { HeritageMediaRole, HeritageMediaType, MediaAssetRole } from "@/lib/types/database";

type AdminSupabaseClient = Awaited<ReturnType<typeof createSupabaseAdminClient>>;

export type MediaAssetInsertInput = {
  heritageId: string;
  title: string;
  mediaType: HeritageMediaType;
  role: HeritageMediaRole;
  url: string;
  thumbnailUrl: string | null;
  fileSize: number | null;
  mimeType: string | null;
  storagePath: string | null;
  thumbnailStoragePath: string | null;
  alt: string | null;
  caption: string | null;
  sortOrder?: number;
  assetRole?: MediaAssetRole;
};

export function mapMediaRoleToAssetRole(role: HeritageMediaRole, mediaType: HeritageMediaType): MediaAssetRole {
  if (mediaType === "video" && role === "video") {
    return "video";
  }

  return role;
}

export async function insertMediaAsset(supabase: AdminSupabaseClient, input: MediaAssetInsertInput) {
  const { error } = await supabase.from("media_assets").insert({
    title: input.title,
    file_type: input.mediaType,
    file_url: input.url,
    thumbnail_url: input.thumbnailUrl,
    file_size: input.fileSize,
    duration: null,
    heritage_id: input.heritageId,
    asset_role: input.assetRole ?? mapMediaRoleToAssetRole(input.role, input.mediaType),
    alt: input.alt,
    caption: input.caption,
    mime_type: input.mimeType,
    storage_path: input.storagePath,
    thumbnail_storage_path: input.thumbnailStoragePath,
    sort_order: input.sortOrder ?? 0
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteMediaAssetsByStorageIdentity(
  supabase: AdminSupabaseClient,
  identities: Array<{
    url: string;
    storagePath: string | null;
  }>
) {
  for (const identity of identities) {
    if (identity.storagePath) {
      const { error: storagePathError } = await supabase.from("media_assets").delete().eq("storage_path", identity.storagePath);

      if (storagePathError) {
        throw new Error(storagePathError.message);
      }
    }

    const { error } = await supabase.from("media_assets").delete().eq("file_url", identity.url);

    if (error) {
      throw new Error(error.message);
    }
  }
}

export async function updateMediaAssetByStorageIdentity(
  supabase: AdminSupabaseClient,
  identity: {
    url: string;
    storagePath: string | null;
  },
  patch: {
    role: HeritageMediaRole;
    mediaType: HeritageMediaType;
    sortOrder: number;
  }
) {
  const values = {
    asset_role: patch.mediaType === "video" && patch.sortOrder === 0
      ? "main_video"
      : mapMediaRoleToAssetRole(patch.role, patch.mediaType),
    sort_order: patch.sortOrder
  };

  if (identity.storagePath) {
    const { error: storagePathError } = await supabase.from("media_assets").update(values).eq("storage_path", identity.storagePath);

    if (storagePathError) {
      throw new Error(storagePathError.message);
    }
  }

  const { error } = await supabase.from("media_assets").update(values).eq("file_url", identity.url);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateMediaAssetMetadataByStorageIdentity(
  supabase: AdminSupabaseClient,
  identity: {
    url: string;
    storagePath: string | null;
  },
  patch: {
    caption: string;
    alt: string | null;
  }
) {
  const values = {
    title: patch.caption,
    caption: patch.caption,
    alt: patch.alt
  };

  if (identity.storagePath) {
    const { error: storagePathError } = await supabase
      .from("media_assets")
      .update(values)
      .eq("storage_path", identity.storagePath);

    if (storagePathError) {
      throw new Error(storagePathError.message);
    }
  }

  const { error } = await supabase.from("media_assets").update(values).eq("file_url", identity.url);

  if (error) {
    throw new Error(error.message);
  }
}
