import { NextResponse } from "next/server";
import { createSupabaseAdminClient, verifyAdminRequest } from "@/lib/supabase/admin";
import { MAX_PROMOTION_VIDEO_BYTES, promotionStoragePath, validatePromotionFile } from "@/lib/admin/homepage-promotions";

const slots = new Set(["top_banner", "middle_card_1", "middle_card_2", "video", "bottom_banner"]);
function text(form: FormData, key: string) { const value = form.get(key); return typeof value === "string" ? value.trim() : ""; }

export async function GET(request: Request) {
  if (!verifyAdminRequest(request)) return NextResponse.json({ error: "Admin Key 无效。" }, { status: 401 });
  const supabase = await createSupabaseAdminClient(); const { data, error } = await supabase.from("homepage_promotions").select("*").order("slot");
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ promotions: data ?? [] });
}

export async function POST(request: Request) {
  if (!verifyAdminRequest(request)) return NextResponse.json({ error: "Admin Key 无效。" }, { status: 401 });
  try { const form = await request.formData(); const slot = text(form, "slot"); const mediaType = text(form, "media_type") as "image" | "video"; const file = form.get("file");
    if (!slots.has(slot) || (mediaType !== "image" && mediaType !== "video")) return NextResponse.json({ error: "广告位或媒体类型无效。" }, { status: 400 });
    const supabase = await createSupabaseAdminClient(); const { data: existing } = await supabase.from("homepage_promotions").select("storage_path").eq("slot", slot).maybeSingle(); let path = existing?.storage_path ?? ""; let uploaded = false;
    if (file instanceof File && file.size > 0) { const validation = validatePromotionFile(file, mediaType); if (validation === "video_too_large") return NextResponse.json({ error: "视频文件不能超过 150MB。" }, { status: 413 }); if (validation) return NextResponse.json({ error: "不支持的媒体格式。" }, { status: 400 }); path = promotionStoragePath(mediaType, crypto.randomUUID(), file); const upload = await supabase.storage.from("heritage-media").upload(path, file, { upsert: false, contentType: file.type }); if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 502 }); uploaded = true; }
    if (!path) return NextResponse.json({ error: "请先选择广告媒体文件。" }, { status: 400 });
    const payload = { slot, media_type: mediaType, storage_path: path, media_alt_zh: text(form, "media_alt_zh"), media_alt_en: text(form, "media_alt_en"), title_zh: text(form, "title_zh"), title_en: text(form, "title_en"), description_zh: text(form, "description_zh"), description_en: text(form, "description_en"), cta_zh: text(form, "cta_zh") || null, cta_en: text(form, "cta_en") || null, href: text(form, "href") || null, published: true };
    const { data, error } = await supabase.from("homepage_promotions").upsert(payload, { onConflict: "slot" }).select().single(); if (error) return NextResponse.json({ error: error.message, storage_path: path }, { status: 500 }); if (uploaded && existing?.storage_path && existing.storage_path !== path) await supabase.storage.from("heritage-media").remove([existing.storage_path]);
    return NextResponse.json({ promotion: data });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "广告保存失败。" }, { status: 500 }); }
}
