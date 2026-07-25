export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  english_name: string;
  summary: string;
  color: string;
  sort_order: number;
  created_at: string;
};

export type HeritageMediaType = "image" | "video";

export type HeritageMediaRole = "cover" | "hero" | "gallery" | "video" | "poster";
export type MediaAssetRole = HeritageMediaRole | "main_video";

export type HeritageMediaRow = {
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
};

export type MediaAssetFileType = "image" | "video";

export type MediaAssetRow = {
  id: string;
  title: string;
  file_type: MediaAssetFileType;
  file_url: string;
  thumbnail_url: string | null;
  file_size: number | null;
  duration: number | null;
  heritage_id: string | null;
  asset_role: MediaAssetRole;
  alt: string | null;
  caption: string | null;
  mime_type: string | null;
  storage_path: string | null;
  thumbnail_storage_path: string | null;
  sort_order: number;
  created_at: string;
};

export type InheritorRow = {
  id: string;
  heritage_item_id: string;
  name: string;
  title: string;
  bio: string;
  image_url: string;
  sort_order: number;
  created_at: string;
};

export type HeritageItemRow = {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  english_name: string;
  summary: string;
  region: string;
  province: string;
  city: string;
  inscription_year: number | null;
  history: string[] | null;
  timeline: unknown;
  tags: string[] | null;
  related_slugs: string[] | null;
  latitude: number | null;
  longitude: number | null;
  map_x: number | null;
  map_y: number | null;
  sort_order: number;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type HeritageItemSelectRow = HeritageItemRow & {
  category: CategoryRow | CategoryRow[] | null;
  heritage_media: HeritageMediaRow[] | null;
  media_assets: MediaAssetRow[] | null;
  inheritors: InheritorRow[] | null;
};

export type AssistantDocumentRow = {
  id: string;
  source_type: "heritage" | "inheritor" | "category" | "region";
  source_id: string;
  locale: "zh" | "en";
  title: string;
  summary: string;
  content: string;
  href: string;
  metadata: Record<string, unknown>;
  embedding: number[] | null;
  checksum: string;
  updated_at: string;
};

export type AssistantDocumentMatchRow = Omit<AssistantDocumentRow, "embedding" | "checksum" | "updated_at"> & {
  similarity: number;
};

export type UserPreferenceRow = {
  user_id: string;
  preferred_locale: "zh" | "en";
  interest_tags: string[];
  created_at: string;
  updated_at: string;
};

export type UserFavoriteTargetType = "heritage" | "inheritor" | "museum_topic" | "heritage_image";

export type UserFavoriteRow = {
  id: string;
  user_id: string;
  heritage_item_id: string | null;
  target_type: UserFavoriteTargetType;
  target_id: string;
  created_at: string;
};

export type UserBrowsingHistoryRow = {
  id: string;
  user_id: string;
  heritage_item_id: string;
  viewed_at: string;
};

export type HeritageLikeRow = {
  id: string;
  user_id: string;
  heritage_item_id: string;
  created_at: string;
};

export type HeritageImageLikeRow = {
  id: string;
  user_id: string;
  heritage_item_id: string;
  image_id: string;
  created_at: string;
};

export type HeritageCommentStatus = "pending" | "approved" | "rejected";

export type HeritageCommentRow = {
  id: string;
  heritage_item_id: string;
  user_id: string;
  body: string;
  status: HeritageCommentStatus;
  created_at: string;
  updated_at: string;
  moderated_at: string | null;
};

export type ContactSubmissionKind = "general" | "supporter" | "cooperation" | "licensing";
export type ContactSubmissionStatus = "new" | "in_progress" | "resolved";

export type ContactSubmissionRow = {
  id: string;
  user_id: string | null;
  heritage_item_id: string | null;
  kind: ContactSubmissionKind;
  name: string;
  email: string;
  organization: string | null;
  message: string;
  status: ContactSubmissionStatus;
  created_at: string;
  updated_at: string;
};

export type ImportJobType = "heritage" | "media";
export type ImportJobStatus = "pending" | "processing" | "completed" | "failed";

export type ImportJobRow = {
  id: string;
  job_type: ImportJobType;
  status: ImportJobStatus;
  source_file_name: string | null;
  source_file_type: string | null;
  total_rows: number;
  success_rows: number;
  error_rows: number;
  duplicate_rows: number;
  skipped_rows: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ImportJobRowDetail = {
  id: string;
  job_id: string;
  row_number: number;
  entity_key: string | null;
  entity_type: string;
  action: "create" | "update" | "duplicate" | "skipped" | "error";
  status: "pending" | "success" | "failed" | "duplicate" | "skipped";
  errors: Record<string, unknown>;
  payload: Record<string, unknown>;
  created_at: string;
};

export type FeishuSyncSourceRow = {
  id: string;
  name: string;
  app_token: string;
  table_id: string;
  view_id: string | null;
  active: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FeishuRecordMappingRow = {
  id: string;
  source_id: string;
  feishu_record_id: string;
  heritage_id: string | null;
  slug: string;
  last_feishu_modified_time: number | null;
  last_payload_hash: string | null;
  deleted_at: string | null;
  synced_at: string;
  created_at: string;
};

export type FeishuSyncLogRow = {
  id: string;
  source_id: string | null;
  source: "manual" | "cron";
  status: "processing" | "completed" | "failed";
  started_at: string;
  finished_at: string | null;
  inserted_count: number;
  updated_count: number;
  deleted_count: number;
  skipped_count: number;
  failed_count: number;
  message: string | null;
  errors: Record<string, unknown>[];
  metadata: Record<string, unknown>;
};
