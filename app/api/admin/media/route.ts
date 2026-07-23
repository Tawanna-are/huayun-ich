import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildThumbnailStoragePath,
  getImageUploadDimensions,
  isSupportedImageUpload,
  normalizeUploadFileName
} from "@/lib/admin/image-upload";
import { insertMediaAsset } from "@/lib/admin/media-assets";
import { IMAGE_STORAGE_CACHE_CONTROL, getStorageCacheControlForMimeType } from "@/lib/admin/media-performance";
import { getVideoUploadDimensions, isSupportedVideoUpload } from "@/lib/admin/video-upload";
import { rateLimitRequest } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient, verifyAdminRequest } from "@/lib/supabase/admin";
import type { HeritageMediaRole } from "@/lib/types/database";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function readString(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(body: Record<string, unknown>, key: string) {
  const value = body[key];

  if (typeof value !== "number") {
    return null;
  }

  return Number.isFinite(value) && value > 0 ? value : null;
}

async function revalidateHeritageMediaPages(supabase: SupabaseClient, heritageId: string) {
  const { data } = await supabase.from("heritage_items").select("slug").eq("id", heritageId).maybeSingle();
  const slug = typeof data?.slug === "string" ? data.slug : "";

  if (!slug) {
    return;
  }

  for (const locale of ["zh", "en"] as const) {
    revalidatePath(`/${locale}/heritage/${slug}`);
  }
}

async function registerResumableVideo(body: Record<string, unknown>) {
  const heritageId = readString(body, "heritageId");
  const url = readString(body, "url");
  const storagePath = readString(body, "storagePath");
  const fileName = sanitizeFileName(readString(body, "fileName"));
  const originalFileName = readString(body, "originalFileName") || fileName;
  const mimeType = readString(body, "mimeType");
  const thumbnailUrl = readString(body, "thumbnailUrl") || null;
  const thumbnailStoragePath = readString(body, "thumbnailStoragePath") || null;
  const alt = readString(body, "alt");
  const caption = readString(body, "caption");
  const fileSize = readNumber(body, "fileSize");
  const dimensions = getVideoUploadDimensions({
    width: String(readNumber(body, "width") ?? ""),
    height: String(readNumber(body, "height") ?? "")
  });

  if (!heritageId || !url || !storagePath || !fileName || !fileSize) {
    return NextResponse.json({ error: "Missing video upload metadata." }, { status: 400 });
  }

  if (!isSupportedVideoUpload({ name: fileName, type: mimeType })) {
    return NextResponse.json({ error: "Only MP4 and MOV videos are supported." }, { status: 400 });
  }

  const supabase = await createSupabaseAdminClient();
  const { error } = await supabase.from("heritage_media").insert({
    heritage_item_id: heritageId,
    media_type: "video",
    role: "video",
    url,
    alt,
    caption,
    file_name: fileName,
    file_size: fileSize,
    mime_type: mimeType,
    storage_path: storagePath,
    thumbnail_url: thumbnailUrl,
    thumbnail_storage_path: thumbnailStoragePath,
    original_file_name: originalFileName,
    width: dimensions.width,
    height: dimensions.height
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await insertMediaAsset(supabase, {
    heritageId,
    title: caption || alt || originalFileName || fileName,
    mediaType: "video",
    role: "video",
    url,
    thumbnailUrl,
    fileSize,
    mimeType,
    storagePath,
    thumbnailStoragePath,
    alt,
    caption,
    sortOrder: 0
  });

  await revalidateHeritageMediaPages(supabase, heritageId);

  return NextResponse.json({ url, path: storagePath, fileName });
}

export async function POST(request: Request) {
  const rateLimited = rateLimitRequest(request, "api:admin:media", 30);

  if (rateLimited) {
    return rateLimited;
  }

  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      return await registerResumableVideo(body);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const thumbnail = formData.get("thumbnail");
    const heritageId = String(formData.get("heritageId") ?? "");
    const mediaType = String(formData.get("mediaType") ?? "image");
    const role = String(formData.get("role") ?? (mediaType === "video" ? "video" : "gallery"));
    const alt = String(formData.get("alt") ?? "");
    const caption = String(formData.get("caption") ?? "");
    const originalFileName = String(formData.get("originalFileName") ?? "");
    const dimensions = getImageUploadDimensions({
      width: formData.get("width"),
      height: formData.get("height")
    });

    if (!(file instanceof File) || !heritageId) {
      return NextResponse.json({ error: "Missing file or heritage id." }, { status: 400 });
    }

    if (mediaType !== "image" && mediaType !== "video") {
      return NextResponse.json({ error: "Invalid media type." }, { status: 400 });
    }

    if (mediaType === "image" && !isSupportedImageUpload(file)) {
      return NextResponse.json({ error: "Only JPG, PNG and WEBP images are supported." }, { status: 400 });
    }

    if (mediaType === "image" && thumbnail instanceof File && !isSupportedImageUpload(thumbnail)) {
      return NextResponse.json({ error: "Only JPG, PNG and WEBP thumbnails are supported." }, { status: 400 });
    }

    if (!["cover", "hero", "gallery", "video", "poster"].includes(role)) {
      return NextResponse.json({ error: "Invalid media role." }, { status: 400 });
    }

    if (mediaType === "video" && role !== "video") {
      return NextResponse.json({ error: "Video files must use the video role." }, { status: 400 });
    }

    if (mediaType === "image" && role === "video") {
      return NextResponse.json({ error: "Image files cannot use the video role." }, { status: 400 });
    }

    const supabase = await createSupabaseAdminClient();
    const fileName = sanitizeFileName(normalizeUploadFileName(file.name));
    const path = `${heritageId}/${Date.now()}-${fileName}`;
    const { error: uploadError } = await supabase.storage.from("heritage-media").upload(path, file, {
      cacheControl: getStorageCacheControlForMimeType(file.type),
      contentType: file.type,
      upsert: false
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data: publicUrl } = supabase.storage.from("heritage-media").getPublicUrl(path);
    let thumbnailUrl: string | null = null;
    let thumbnailPath: string | null = null;

    if (mediaType === "image" && thumbnail instanceof File) {
      thumbnailPath = buildThumbnailStoragePath(path);
      const { error: thumbnailUploadError } = await supabase.storage.from("heritage-media").upload(thumbnailPath, thumbnail, {
        cacheControl: IMAGE_STORAGE_CACHE_CONTROL,
        contentType: thumbnail.type,
        upsert: false
      });

      if (thumbnailUploadError) {
        return NextResponse.json({ error: thumbnailUploadError.message }, { status: 400 });
      }

      const { data: thumbnailPublicUrl } = supabase.storage.from("heritage-media").getPublicUrl(thumbnailPath);
      thumbnailUrl = thumbnailPublicUrl.publicUrl;
    }

    const { error: insertError } = await supabase.from("heritage_media").insert({
      heritage_item_id: heritageId,
      media_type: mediaType,
      role,
      url: publicUrl.publicUrl,
      alt,
      caption,
      file_name: fileName,
      file_size: file.size,
      mime_type: file.type,
      storage_path: path,
      thumbnail_url: thumbnailUrl,
      thumbnail_storage_path: thumbnailPath,
      original_file_name: originalFileName || file.name,
      width: dimensions.width,
      height: dimensions.height
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    await insertMediaAsset(supabase, {
      heritageId,
      title: caption || alt || originalFileName || fileName,
      mediaType,
      role: role as HeritageMediaRole,
      url: publicUrl.publicUrl,
      thumbnailUrl,
      fileSize: file.size,
      mimeType: file.type,
      storagePath: path,
      thumbnailStoragePath: thumbnailPath,
      alt,
      caption,
      sortOrder: 0
    });

    await revalidateHeritageMediaPages(supabase, heritageId);

    return NextResponse.json({ url: publicUrl.publicUrl, path, fileName });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload media." },
      { status: 503 }
    );
  }
}
