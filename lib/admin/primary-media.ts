import type { HeritageAdminPayload } from "@/lib/admin/validation";

export type PrimaryMediaInsert = {
  heritage_item_id: string;
  media_type: "image" | "video";
  role: "cover" | "hero" | "video";
  url: string;
  alt: string;
  caption: string;
  sort_order: number;
};

export type PrimaryMediaAssetInsert = {
  title: string;
  file_type: "image" | "video";
  file_url: string;
  thumbnail_url: string | null;
  file_size: null;
  duration: null;
  heritage_id: string;
  asset_role: "cover" | "hero" | "main_video";
  alt: string;
  caption: string;
  mime_type: null;
  storage_path: null;
  thumbnail_storage_path: null;
  sort_order: number;
};

export function buildPrimaryMediaRows(payload: HeritageAdminPayload, heritageItemId: string): PrimaryMediaInsert[] {
  const imageUrl = payload.imageUrl.trim();
  const heroImageUrl = (payload.heroImageUrl || imageUrl).trim();
  const videoUrl = payload.videoUrl.trim();
  const rows: PrimaryMediaInsert[] = [];

  if (imageUrl) {
    rows.push({
      heritage_item_id: heritageItemId,
      media_type: "image",
      role: "cover",
      url: imageUrl,
      alt: payload.name,
      caption: "Cover image",
      sort_order: 0
    });
  }

  if (heroImageUrl && heroImageUrl !== imageUrl) {
    rows.push({
      heritage_item_id: heritageItemId,
      media_type: "image",
      role: "hero",
      url: heroImageUrl,
      alt: payload.name,
      caption: "Hero image",
      sort_order: 1
    });
  }

  if (videoUrl) {
    rows.push({
      heritage_item_id: heritageItemId,
      media_type: "video",
      role: "video",
      url: videoUrl,
      alt: payload.name,
      caption: "Video archive",
      sort_order: 100
    });
  }

  return rows;
}

export function buildPrimaryMediaAssetRows(payload: HeritageAdminPayload, heritageItemId: string): PrimaryMediaAssetInsert[] {
  const imageUrl = payload.imageUrl.trim();
  const heroImageUrl = (payload.heroImageUrl || imageUrl).trim();
  const videoUrl = payload.videoUrl.trim();
  const rows: PrimaryMediaAssetInsert[] = [];

  if (imageUrl) {
    rows.push({
      title: `${payload.name} cover`,
      file_type: "image",
      file_url: imageUrl,
      thumbnail_url: null,
      file_size: null,
      duration: null,
      heritage_id: heritageItemId,
      asset_role: "cover",
      alt: payload.name,
      caption: "Cover image",
      mime_type: null,
      storage_path: null,
      thumbnail_storage_path: null,
      sort_order: 0
    });
  }

  if (heroImageUrl && heroImageUrl !== imageUrl) {
    rows.push({
      title: `${payload.name} hero`,
      file_type: "image",
      file_url: heroImageUrl,
      thumbnail_url: null,
      file_size: null,
      duration: null,
      heritage_id: heritageItemId,
      asset_role: "hero",
      alt: payload.name,
      caption: "Hero image",
      mime_type: null,
      storage_path: null,
      thumbnail_storage_path: null,
      sort_order: 1
    });
  }

  if (videoUrl) {
    rows.push({
      title: `${payload.name} video`,
      file_type: "video",
      file_url: videoUrl,
      thumbnail_url: heroImageUrl || imageUrl || null,
      file_size: null,
      duration: null,
      heritage_id: heritageItemId,
      asset_role: "main_video",
      alt: payload.name,
      caption: "Video archive",
      mime_type: null,
      storage_path: null,
      thumbnail_storage_path: null,
      sort_order: 100
    });
  }

  return rows;
}
