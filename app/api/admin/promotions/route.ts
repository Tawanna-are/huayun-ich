import { NextResponse } from "next/server";
import {
  promotionStoragePath,
  validatePromotionFile
} from "@/lib/admin/homepage-promotions";
import {
  createSupabaseAdminClient,
  verifyAdminRequest
} from "@/lib/supabase/admin";

const bucket = "heritage-media";
const slots = new Set(["top_banner", "middle_card_1", "middle_card_2", "video", "bottom_banner"]);
type MediaType = "image" | "video";
type PromotionFields = {
  slot: string;
  media_type: MediaType;
  storage_path: string;
  media_alt_zh: string;
  media_alt_en: string;
  title_zh: string;
  title_en: string;
  description_zh: string;
  description_en: string;
  cta_zh: string | null;
  cta_en: string | null;
  href: string | null;
};

function formText(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function jsonText(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function fieldsFromForm(form: FormData, path: string): PromotionFields {
  return {
    slot: formText(form, "slot"),
    media_type: formText(form, "media_type") as MediaType,
    storage_path: path,
    media_alt_zh: formText(form, "media_alt_zh"),
    media_alt_en: formText(form, "media_alt_en"),
    title_zh: formText(form, "title_zh"),
    title_en: formText(form, "title_en"),
    description_zh: formText(form, "description_zh"),
    description_en: formText(form, "description_en"),
    cta_zh: formText(form, "cta_zh") || null,
    cta_en: formText(form, "cta_en") || null,
    href: formText(form, "href") || null
  };
}

function fieldsFromJson(body: Record<string, unknown>): PromotionFields {
  return {
    slot: jsonText(body, "slot"),
    media_type: jsonText(body, "media_type") as MediaType,
    storage_path: jsonText(body, "storage_path"),
    media_alt_zh: jsonText(body, "media_alt_zh"),
    media_alt_en: jsonText(body, "media_alt_en"),
    title_zh: jsonText(body, "title_zh"),
    title_en: jsonText(body, "title_en"),
    description_zh: jsonText(body, "description_zh"),
    description_en: jsonText(body, "description_en"),
    cta_zh: jsonText(body, "cta_zh") || null,
    cta_en: jsonText(body, "cta_en") || null,
    href: jsonText(body, "href") || null
  };
}

function validVideoPath(path: string) {
  return path.startsWith("homepage-promotions/video/") && path.toLowerCase().endsWith(".mp4");
}

export async function GET(request: Request) {
  if (!verifyAdminRequest(request)) return NextResponse.json({ error: "Admin Key 无效。" }, { status: 401 });
  const supabase = await createSupabaseAdminClient(); const { data, error } = await supabase.from("homepage_promotions").select("*").order("slot");
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ promotions: data ?? [] });
}

export async function POST(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Admin Key 无效。" }, { status: 401 });
  }

  const supabase = await createSupabaseAdminClient();
  let uploadedPath: string | null = null;
  const cleanupUploadedVideo = async (path: string) => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return error?.message ?? null;
  };

  try {
    const contentType = request.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    let fields: PromotionFields;

    if (isJson) {
      const body = (await request.json()) as Record<string, unknown>;
      fields = fieldsFromJson(body);
      if (fields.media_type !== "video" || !validVideoPath(fields.storage_path)) {
        return NextResponse.json({ error: "视频媒体信息或 Storage 路径无效。" }, { status: 400 });
      }
    } else {
      const form = await request.formData();
      const slot = formText(form, "slot");
      const mediaType = formText(form, "media_type") as MediaType;
      const file = form.get("file");
      if (mediaType === "video") {
        return NextResponse.json({ error: "视频必须使用 Storage 直传。" }, { status: 400 });
      }
      if (!slots.has(slot) || mediaType !== "image") {
        return NextResponse.json({ error: "广告位或媒体类型无效。" }, { status: 400 });
      }

      const { data: current, error: currentError } = await supabase
        .from("homepage_promotions")
        .select("storage_path, media_type")
        .eq("slot", slot)
        .maybeSingle();
      if (currentError) {
        return NextResponse.json({ error: currentError.message }, { status: 500 });
      }

      let path = current?.storage_path ?? "";
      if (file instanceof File && file.size > 0) {
        const validation = validatePromotionFile(file, "image");
        if (validation) {
          return NextResponse.json({ error: "不支持的图片格式。" }, { status: 400 });
        }
        path = promotionStoragePath("image", crypto.randomUUID(), file);
        const { error } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: false, contentType: file.type });
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 502 });
        }
        uploadedPath = path;
      } else if (current?.media_type && current.media_type !== mediaType) {
        return NextResponse.json(
          { error: "切换媒体类型时，请选择新的媒体文件。" },
          { status: 400 }
        );
      }
      if (!path) {
        return NextResponse.json({ error: "请先选择广告媒体文件。" }, { status: 400 });
      }
      fields = fieldsFromForm(form, path);
    }

    if (!slots.has(fields.slot)) {
      return NextResponse.json({ error: "广告位或媒体类型无效。" }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from("homepage_promotions")
      .select("storage_path, media_type")
      .eq("slot", fields.slot)
      .maybeSingle();
    if (existingError) {
      if (uploadedPath) await cleanupUploadedVideo(uploadedPath);
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (!uploadedPath && existing?.media_type && existing.media_type !== fields.media_type) {
      const isNewVideoUpload =
        fields.media_type === "video" && existing.storage_path !== fields.storage_path;
      if (!isNewVideoUpload) {
        return NextResponse.json(
          { error: "切换媒体类型时，请选择新的媒体文件。" },
          { status: 400 }
        );
      }
    }

    const isNewVideoUpload =
      fields.media_type === "video" && existing?.storage_path !== fields.storage_path;
    if (isNewVideoUpload) uploadedPath = fields.storage_path;

    const { data, error } = await supabase
      .from("homepage_promotions")
      .upsert({ ...fields, published: true }, { onConflict: "slot" })
      .select()
      .single();
    if (error) {
      const cleanupError = uploadedPath
        ? await cleanupUploadedVideo(uploadedPath)
        : null;
      return NextResponse.json(
        { error: error.message, ...(cleanupError ? { cleanupError } : {}) },
        { status: 500 }
      );
    }

    let storageWarning: string | null = null;
    if (existing?.storage_path && existing.storage_path !== fields.storage_path) {
      const { error: removeError } = await supabase.storage
        .from(bucket)
        .remove([existing.storage_path]);
      storageWarning = removeError?.message ?? null;
    }

    return NextResponse.json({
      promotion: data,
      ...(storageWarning ? { storageWarning } : {})
    });
  } catch (error) {
    if (uploadedPath) await cleanupUploadedVideo(uploadedPath);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "广告保存失败。" },
      { status: 500 }
    );
  }
}
