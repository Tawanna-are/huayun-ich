export const MAX_PROMOTION_VIDEO_BYTES = 150 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const VIDEO_TYPES = ["video/mp4"] as const;

export function validatePromotionFile(file: File, mediaType: "image" | "video") {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (mediaType === "video") {
    if (!VIDEO_TYPES.includes(file.type as (typeof VIDEO_TYPES)[number]) || extension !== "mp4") return "unsupported_video" as const;
    if (file.size > MAX_PROMOTION_VIDEO_BYTES) return "video_too_large" as const;
    return null;
  }
  if (!IMAGE_TYPES.includes(file.type as (typeof IMAGE_TYPES)[number]) || !["jpg", "jpeg", "png", "webp"].includes(extension ?? "")) return "unsupported_image" as const;
  return null;
}

export function promotionStoragePath(mediaType: "image" | "video", id: string, file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? (mediaType === "video" ? "mp4" : "jpg");
  return `homepage-promotions/${mediaType === "video" ? "video" : "images"}/${id}.${extension}`;
}
