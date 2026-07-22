import { describe, expect, it } from "vitest";
import {
  buildThumbnailStoragePath,
  getImageUploadDimensions,
  isSupportedImageUpload,
  normalizeUploadFileName
} from "@/lib/admin/image-upload";

describe("admin image upload helpers", () => {
  it("accepts JPG, PNG and WEBP image uploads", () => {
    expect(isSupportedImageUpload({ name: "photo.jpg", type: "image/jpeg" })).toBe(true);
    expect(isSupportedImageUpload({ name: "photo.jpeg", type: "image/jpeg" })).toBe(true);
    expect(isSupportedImageUpload({ name: "photo.png", type: "image/png" })).toBe(true);
    expect(isSupportedImageUpload({ name: "photo.webp", type: "image/webp" })).toBe(true);
  });

  it("rejects unsupported image formats", () => {
    expect(isSupportedImageUpload({ name: "motion.gif", type: "image/gif" })).toBe(false);
    expect(isSupportedImageUpload({ name: "vector.svg", type: "image/svg+xml" })).toBe(false);
    expect(isSupportedImageUpload({ name: "fake.jpg", type: "application/octet-stream" })).toBe(false);
  });

  it("normalizes upload filenames for Supabase Storage paths", () => {
    expect(normalizeUploadFileName("苏绣 细节 #1.PNG")).toBe("suxiu-xijie-1.png");
    expect(normalizeUploadFileName("...")).toBe("image");
    expect(normalizeUploadFileName("Long File Name.webp")).toBe("long-file-name.webp");
  });

  it("builds thumbnail storage paths next to the heritage asset folder", () => {
    expect(buildThumbnailStoragePath("heritage-1/1700000000000-photo.webp")).toBe(
      "heritage-1/thumbnails/1700000000000-photo.webp"
    );
  });

  it("parses image dimensions from form fields", () => {
    expect(getImageUploadDimensions({ width: "1920", height: "1080" })).toEqual({ width: 1920, height: 1080 });
    expect(getImageUploadDimensions({ width: "-1", height: "0" })).toEqual({ width: null, height: null });
    expect(getImageUploadDimensions({ width: "abc", height: undefined })).toEqual({ width: null, height: null });
  });
});
