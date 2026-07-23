import { describe, expect, it } from "vitest";
import {
  buildSupabaseStoragePublicUrl,
  buildVideoPosterStoragePath,
  buildVideoStoragePath,
  detectVideoCodec,
  getVideoUploadDimensions,
  isSupportedVideoUpload
} from "@/lib/admin/video-upload";

describe("admin video upload helpers", () => {
  it("detects browser-compatible H.264 and rejects HEVC codec markers", () => {
    const bytes = (value: string) => new TextEncoder().encode(`....ftyp....${value}....moov`).buffer;

    expect(detectVideoCodec(bytes("avc1"))).toBe("h264");
    expect(detectVideoCodec(bytes("hvc1"))).toBe("hevc");
    expect(detectVideoCodec(bytes("hev1"))).toBe("hevc");
    expect(detectVideoCodec(bytes("mp4v"))).toBe("unknown");
  });

  it("accepts MP4 and MOV video uploads", () => {
    expect(isSupportedVideoUpload({ name: "archive.mp4", type: "video/mp4" })).toBe(true);
    expect(isSupportedVideoUpload({ name: "archive.mov", type: "video/quicktime" })).toBe(true);
  });

  it("rejects unsupported video formats", () => {
    expect(isSupportedVideoUpload({ name: "archive.webm", type: "video/webm" })).toBe(false);
    expect(isSupportedVideoUpload({ name: "archive.mp4", type: "application/octet-stream" })).toBe(false);
    expect(isSupportedVideoUpload({ name: "archive.mov", type: "video/mp4" })).toBe(false);
  });

  it("builds stable video and poster storage paths", () => {
    expect(buildVideoStoragePath("heritage-1", 1700000000000, "打铁花 MOV.mov")).toBe(
      "heritage-1/videos/1700000000000-datiehua-mov.mov"
    );
    expect(buildVideoPosterStoragePath("heritage-1/videos/1700000000000-datiehua-mov.mov")).toBe(
      "heritage-1/video-posters/1700000000000-datiehua-mov.webp"
    );
  });

  it("builds public URLs for Supabase Storage objects", () => {
    expect(
      buildSupabaseStoragePublicUrl(
        "https://example.supabase.co",
        "heritage-media",
        "heritage-1/videos/1700000000000-video.mp4"
      )
    ).toBe("https://example.supabase.co/storage/v1/object/public/heritage-media/heritage-1/videos/1700000000000-video.mp4");
  });

  it("parses video dimensions from form fields", () => {
    expect(getVideoUploadDimensions({ width: "3840", height: "2160" })).toEqual({ width: 3840, height: 2160 });
    expect(getVideoUploadDimensions({ width: "0", height: "-1" })).toEqual({ width: null, height: null });
  });
});
