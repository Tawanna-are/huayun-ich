import {
  filterHeritageItems,
  groupHeritageByProvince,
  type HeritageFilters
} from "@/lib/content/heritage-filters";
import type { CategoryRow, HeritageItemSelectRow, HeritageMediaRole, HeritageMediaRow, MediaAssetRow } from "@/lib/types/database";
import type {
  HeritageCategory,
  HeritageCategorySlug,
  HeritageItem,
  HeritageTimelineEvent
} from "@/lib/types/heritage";
import { captureAppException } from "@/lib/monitoring/sentry";

export { filterHeritageItems, groupHeritageByProvince };
export type { HeritageFilters };

const hiddenPublicHeritageSlugs = new Set(["yue-embroidery", "kunqu"]);

const tieDyeEnglishSummary = `Tie-dye, historically known as jiaoxie, is an ancient and distinctive Chinese textile-dyeing technique. Together with batik and clamp-resist dyeing, it forms China’s three traditional resist-dyeing methods. Originating in the Qin and Han dynasties and flourishing during the Tang, the craft is now best represented by Bai tie-dye from Dali, Yunnan, and tie-dye from Zigong, Sichuan. It is included in China’s national list of intangible cultural heritage.

The essence of tie-dye lies in binding and dyeing. Fabric is tied, folded, stitched or clamped before being immersed in natural plant dyes such as indigo. The bound areas resist the dye, creating naturally diffused patterns in varied shades. Classic blue-and-white tie-dye has a restrained, rustic beauty, and every piece is unique, like a painting made without a brush.`;

const tieDyeEnglishGalleryCaptions = [
  "Tie-dye Bag",
  "Tie-dye Bag",
  "Tie-dye Bag",
  "Tie-dye Bag",
  "Tie-dye Bag",
  "Tie-dye Bag",
  "Tie-dye Accessories",
  "Tie-dye Accessories",
  "Tie-dye Doll",
  "Tie-dye Doll",
  "Tie-dye Doll",
  "Tie-dye Bag"
] as const;

export function isPublicHeritageSlug(slug: string) {
  return !hiddenPublicHeritageSlugs.has(slug);
}

export const heritageSelect = `
  *,
  category:categories (
    id,
    slug,
    name,
    english_name,
    summary,
    color,
    sort_order,
    created_at
  ),
  heritage_media (
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
    created_at
  ),
  media_assets (
    id,
    title,
    file_type,
    file_url,
    thumbnail_url,
    file_size,
    duration,
    heritage_id,
    asset_role,
    alt,
    caption,
    mime_type,
    storage_path,
    thumbnail_storage_path,
    sort_order,
    created_at
  ),
  inheritors (
    id,
    heritage_item_id,
    name,
    title,
    bio,
    image_url,
    sort_order,
    created_at
  )
`;

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function getPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const { createClient } = await import("@supabase/supabase-js");

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function firstValue<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function sortBySortOrder<T extends { sort_order: number }>(items: T[] | null | undefined) {
  return [...(items ?? [])].sort((a, b) => a.sort_order - b.sort_order);
}

function findMedia(media: HeritageMediaRow[], role: HeritageMediaRole, mediaType?: HeritageMediaRow["media_type"]) {
  return media.find((item) => item.role === role && (!mediaType || item.media_type === mediaType));
}

function normalizeMediaAssetRole(asset: MediaAssetRow): HeritageMediaRole {
  if (asset.asset_role === "main_video") {
    return "video";
  }

  if (asset.file_type === "video") {
    return "video";
  }

  return asset.asset_role;
}

export function mapMediaAssetToHeritageMedia(asset: MediaAssetRow, heritageItemId: string): HeritageMediaRow {
  return {
    id: asset.id,
    heritage_item_id: asset.heritage_id ?? heritageItemId,
    media_type: asset.file_type,
    role: normalizeMediaAssetRole(asset),
    url: asset.file_url,
    alt: asset.alt ?? asset.title,
    caption: asset.caption ?? asset.title,
    file_name: asset.title,
    file_size: asset.file_size,
    mime_type: asset.mime_type,
    storage_path: asset.storage_path,
    thumbnail_url: asset.thumbnail_url,
    thumbnail_storage_path: asset.thumbnail_storage_path,
    original_file_name: asset.title,
    width: null,
    height: null,
    sort_order: asset.sort_order,
    created_at: asset.created_at
  };
}

function normalizeTimeline(value: HeritageItemSelectRow["timeline"]): HeritageTimelineEvent[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((event): event is HeritageTimelineEvent => {
    return (
      typeof event === "object" &&
      event !== null &&
      "year" in event &&
      "title" in event &&
      "description" in event &&
      typeof event.year === "string" &&
      typeof event.title === "string" &&
      typeof event.description === "string"
    );
  });
}

export function mapCategoryRow(row: CategoryRow): HeritageCategory {
  return {
    slug: row.slug as HeritageCategorySlug,
    name: row.name,
    englishName: row.english_name,
    summary: row.summary,
    color: row.color
  };
}

export function normalizeHeritageItemSelectRow(row: HeritageItemSelectRow): HeritageItemSelectRow {
  return {
    ...row,
    featured: row.featured ?? row.tags?.includes("homepage-featured") ?? false,
    category: firstValue(row.category) ?? null,
    heritage_media: sortBySortOrder(row.heritage_media),
    media_assets: sortBySortOrder(row.media_assets),
    inheritors: sortBySortOrder(row.inheritors),
    history: row.history ?? [],
    timeline: normalizeTimeline(row.timeline),
    tags: row.tags ?? [],
    related_slugs: row.related_slugs ?? []
  };
}

export function mapHeritageItemRow(row: HeritageItemSelectRow): HeritageItem {
  const category = firstValue(row.category);
  const mediaAssets = sortBySortOrder(row.media_assets);
  const mediaFromAssets = mediaAssets.map((asset) => mapMediaAssetToHeritageMedia(asset, row.id));
  const sortedMedia = mediaFromAssets.length > 0 ? mediaFromAssets : sortBySortOrder(row.heritage_media);
  const defaultImage = "/assets/hero-museum.png";
  const coverImage = findMedia(sortedMedia, "cover", "image");
  const heroImage = findMedia(sortedMedia, "hero", "image");
  const posterImage = findMedia(sortedMedia, "poster", "image") ?? sortedMedia.find((item) => item.media_type === "video" && item.thumbnail_url);
  const video = mediaFromAssets.find((item) => item.media_type === "video" && mediaAssets.find((asset) => asset.id === item.id)?.asset_role === "main_video")
    ?? findMedia(sortedMedia, "video", "video")
    ?? sortedMedia.find((item) => item.media_type === "video");
  const galleryImages = sortedMedia.filter((item) => item.media_type === "image" && item.role === "gallery");
  const videoItems = sortedMedia.filter((item) => item.media_type === "video");
  const inheritor = sortBySortOrder(row.inheritors)[0];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    englishName: row.english_name,
    categorySlug: (category?.slug ?? "traditional-craft") as HeritageCategorySlug,
    categoryName: category?.name ?? "未分类",
    categoryEnglishName: category?.english_name,
    summary: row.summary,
    region: row.region,
    province: row.province,
    city: row.city,
    inscriptionYear: row.inscription_year ?? 0,
    featured: row.featured ?? row.tags?.includes("homepage-featured") ?? false,
    image: coverImage?.url ?? heroImage?.url ?? defaultImage,
    heroImage: heroImage?.url ?? coverImage?.url ?? defaultImage,
    videoPoster: video?.thumbnail_url ?? posterImage?.thumbnail_url ?? posterImage?.url ?? heroImage?.url ?? coverImage?.url ?? defaultImage,
    videoUrl: video?.url ?? "",
    videos: videoItems.map((item) => ({
      title: item.caption ?? item.alt ?? item.file_name ?? row.name,
      url: item.url,
      poster: item.thumbnail_url ?? posterImage?.url ?? heroImage?.url ?? coverImage?.url ?? defaultImage
    })),
    history: row.history ?? [],
    gallery: galleryImages.map((image) => ({
      id: image.id,
      src: image.url,
      alt: image.alt ?? row.name,
      caption: image.caption ?? row.name
    })),
    timeline: normalizeTimeline(row.timeline),
    inheritor: {
      name: inheritor?.name ?? "待补充",
      title: inheritor?.title ?? "传承人信息待补充",
      bio: inheritor?.bio ?? "该项目的传承人资料将在内容后台补充。",
      image: inheritor?.image_url ?? "/assets/inheritor-craft.png"
    },
    location: {
      lat: row.latitude ?? 0,
      lng: row.longitude ?? 0,
      mapX: row.map_x ?? 50,
      mapY: row.map_y ?? 50
    },
    tags: row.tags ?? [],
    relatedSlugs: row.related_slugs ?? []
  };
}

export function localizeHeritageDetailItem(item: HeritageItem, locale: "zh" | "en"): HeritageItem {
  if (locale !== "en") {
    return item;
  }

  const englishItem = {
    ...item,
    name: item.englishName || item.name,
    categoryName: item.categoryEnglishName || item.categoryName
  };

  if (item.slug !== "tie-dye") {
    return englishItem;
  }

  return {
    ...englishItem,
    summary: tieDyeEnglishSummary,
    region: "Dali, Yunnan",
    gallery: item.gallery.map((image, index) => ({
      ...image,
      alt: "Tie-dye",
      caption: tieDyeEnglishGalleryCaptions[index] ?? image.caption
    }))
  };
}

export const mapDatabaseCategory = mapCategoryRow;
export const mapDatabaseHeritageItem = mapHeritageItemRow;

async function fetchHeritageRows({ includeUnpublished = false }: { includeUnpublished?: boolean } = {}) {
  const supabase = await getPublicSupabaseClient();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("heritage_items")
    .select(heritageSelect)
    .order("sort_order", { ascending: true });

  if (!includeUnpublished) {
    query = query.eq("published", true);
  }

  const { data, error } = await query;

  if (error) {
    captureAppException(error, {
      module: "supabase",
      operation: "fetch_heritage_rows",
      extra: {
        includeUnpublished
      }
    });
    console.error("Failed to fetch heritage content from Supabase:", error.message);
    return [];
  }

  return (data ?? []) as unknown as HeritageItemSelectRow[];
}

export async function getAdminHeritageRows() {
  const rows = await fetchHeritageRows({ includeUnpublished: true });
  return rows.map(normalizeHeritageItemSelectRow);
}

export async function getCategories() {
  const supabase = await getPublicSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from("categories").select("*").order("sort_order", {
    ascending: true
  });

  if (error) {
    captureAppException(error, {
      module: "supabase",
      operation: "fetch_categories"
    });
    console.error("Failed to fetch categories from Supabase:", error.message);
    return [];
  }

  return ((data ?? []) as CategoryRow[]).map(mapCategoryRow);
}

export async function getHeritageItems(filters: HeritageFilters = {}) {
  const rows = await fetchHeritageRows();
  const items = rows
    .map(mapHeritageItemRow)
    .filter((item) => isPublicHeritageSlug(item.slug));
  return filterHeritageItems(items, filters);
}

export async function getHeritageSlugs() {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = await getPublicSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from("heritage_items").select("slug").eq("published", true);

  if (error) {
    captureAppException(error, {
      module: "supabase",
      operation: "fetch_heritage_slugs"
    });
    console.error("Failed to fetch heritage slugs from Supabase:", error.message);
    return [];
  }

  return (data ?? [])
    .filter((item) => isPublicHeritageSlug(item.slug as string))
    .map((item) => item.slug as string);
}

export async function getHeritageBySlug(slug: string) {
  if (!isPublicHeritageSlug(slug)) {
    return undefined;
  }

  const supabase = await getPublicSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase
    .from("heritage_items")
    .select(heritageSelect)
    .eq("published", true)
    .eq("slug", slug)
    .limit(1);

  if (error) {
    captureAppException(error, {
      module: "supabase",
      operation: "fetch_heritage_by_slug",
      extra: {
        slug
      }
    });
    console.error(`Failed to fetch heritage item "${slug}" from Supabase:`, error.message);
    return undefined;
  }

  const [row] = (data ?? []) as unknown as HeritageItemSelectRow[];
  return row ? mapHeritageItemRow(row) : undefined;
}

export async function getRelatedHeritage(item: HeritageItem) {
  const items = await getHeritageItems();
  const preferred = item.relatedSlugs
    .map((slug) => items.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is HeritageItem => Boolean(candidate));

  if (preferred.length >= 3) {
    return preferred.slice(0, 3);
  }

  return [
    ...preferred,
    ...items.filter(
      (candidate) => candidate.slug !== item.slug && !preferred.some((related) => related.slug === candidate.slug)
    )
  ].slice(0, 3);
}
