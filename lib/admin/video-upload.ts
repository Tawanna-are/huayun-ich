import { normalizeUploadFileName } from "@/lib/admin/image-upload";

export const supportedVideoMimeTypes = ["video/mp4", "video/quicktime"] as const;

const videoExtensionByMimeType: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/quicktime": ".mov"
};

export type VideoUploadLike = {
  name: string;
  type: string;
};

export type VideoUploadDimensionsInput = {
  width?: FormDataEntryValue | string | null;
  height?: FormDataEntryValue | string | null;
};

export function isSupportedVideoUpload(file: VideoUploadLike) {
  const normalizedType = file.type.toLowerCase();
  const normalizedName = file.name.toLowerCase();
  const expectedExtension = videoExtensionByMimeType[normalizedType];

  return Boolean(expectedExtension && normalizedName.endsWith(expectedExtension));
}

export function buildVideoStoragePath(heritageId: string, timestamp: number, fileName: string) {
  const safeFileName = normalizeUploadFileName(fileName);
  return `${heritageId}/videos/${timestamp}-${safeFileName}`;
}

export function buildVideoPosterStoragePath(videoStoragePath: string) {
  const segments = videoStoragePath.split("/");
  const fileName = segments.pop() ?? "video.webp";
  const folder = segments.join("/").replace(/\/videos$/, "");
  const baseName = fileName.replace(/\.(mp4|mov)$/i, "");

  return folder ? `${folder}/video-posters/${baseName}.webp` : `video-posters/${baseName}.webp`;
}

function encodeStoragePath(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function buildSupabaseStoragePublicUrl(supabaseUrl: string, bucketName: string, storagePath: string) {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucketName}/${encodeStoragePath(storagePath)}`;
}

function parsePositiveInteger(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function getVideoUploadDimensions(input: VideoUploadDimensionsInput) {
  const width = parsePositiveInteger(input.width);
  const height = parsePositiveInteger(input.height);

  if (!width || !height) {
    return { width: null, height: null };
  }

  return { width, height };
}
