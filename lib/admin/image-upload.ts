export const supportedImageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;

const supportedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

const basicPinyinMap: Record<string, string> = {
  苏: "su",
  蘇: "su",
  绣: "xiu",
  繡: "xiu",
  细: "xi",
  細: "xi",
  节: "jie",
  節: "jie",
  图: "tu",
  圖: "tu",
  片: "pian",
  非: "fei",
  遗: "yi",
  遺: "yi",
  打: "da",
  铁: "tie",
  鐵: "tie",
  花: "hua"
};

export type ImageUploadLike = {
  name: string;
  type: string;
};

export type ImageUploadDimensionsInput = {
  width?: FormDataEntryValue | string | null;
  height?: FormDataEntryValue | string | null;
};

export function isSupportedImageUpload(file: ImageUploadLike) {
  const normalizedName = file.name.toLowerCase();
  const normalizedType = file.type.toLowerCase();

  return (
    supportedImageMimeTypes.includes(normalizedType as (typeof supportedImageMimeTypes)[number]) &&
    supportedExtensions.some((extension) => normalizedName.endsWith(extension))
  );
}

function transliterateBasicChinese(value: string) {
  return Array.from(value)
    .map((character) => basicPinyinMap[character] ?? character)
    .join("");
}

export function normalizeUploadFileName(fileName: string) {
  const transliterated = transliterateBasicChinese(fileName)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const normalized = transliterated
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[._-]+|[._-]+$/g, "");

  return normalized || "image";
}

export function buildThumbnailStoragePath(storagePath: string) {
  const segments = storagePath.split("/");
  const fileName = segments.pop() ?? "thumbnail.webp";
  const folder = segments.join("/");

  return folder ? `${folder}/thumbnails/${fileName}` : `thumbnails/${fileName}`;
}

function parsePositiveInteger(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function getImageUploadDimensions(input: ImageUploadDimensionsInput) {
  const width = parsePositiveInteger(input.width);
  const height = parsePositiveInteger(input.height);

  if (!width || !height) {
    return { width: null, height: null };
  }

  return { width, height };
}
