export const IMAGE_STORAGE_CACHE_CONTROL = "31536000";
export const VIDEO_STORAGE_CACHE_CONTROL = "31536000";
export const IMAGE_OUTPUT_MIME_TYPE = "image/webp";
export const IMAGE_OUTPUT_EXTENSION = ".webp";

export const IMAGE_MAIN_MAX_DIMENSION = 2200;
export const IMAGE_THUMBNAIL_MAX_DIMENSION = 480;
export const IMAGE_MAIN_WEBP_QUALITY = 0.84;
export const IMAGE_THUMBNAIL_WEBP_QUALITY = 0.78;
export const VIDEO_POSTER_WEBP_QUALITY = 0.78;

export function getStorageCacheControlForMimeType(mimeType: string) {
  const normalizedMimeType = mimeType.toLowerCase();

  if (normalizedMimeType.startsWith("video/")) {
    return VIDEO_STORAGE_CACHE_CONTROL;
  }

  return IMAGE_STORAGE_CACHE_CONTROL;
}
