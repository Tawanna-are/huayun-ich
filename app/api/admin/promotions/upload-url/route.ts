import { NextResponse } from "next/server";
import {
  MAX_PROMOTION_VIDEO_BYTES,
  promotionStoragePath
} from "@/lib/admin/homepage-promotions";
import {
  createSupabaseAdminClient,
  verifyAdminRequest
} from "@/lib/supabase/admin";

const slots = new Set([
  "top_banner",
  "middle_card_1",
  "middle_card_2",
  "video",
  "bottom_banner"
]);

type UploadRequest = {
  slot?: unknown;
  media_type?: unknown;
  file_name?: unknown;
  content_type?: unknown;
  file_size?: unknown;
};

export async function POST(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Admin Key 无效。" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as UploadRequest;
    const slot = typeof body.slot === "string" ? body.slot.trim() : "";
    const mediaType = body.media_type;
    const fileName = typeof body.file_name === "string" ? body.file_name.trim() : "";
    const contentType = typeof body.content_type === "string" ? body.content_type.trim() : "";
    const fileSize = typeof body.file_size === "number" ? body.file_size : Number.NaN;

    if (!slots.has(slot) || mediaType !== "video") {
      return NextResponse.json({ error: "广告位或媒体类型无效。" }, { status: 400 });
    }
    if (!fileName.toLowerCase().endsWith(".mp4") || contentType !== "video/mp4") {
      return NextResponse.json({ error: "视频仅支持 MP4 格式。" }, { status: 400 });
    }
    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      return NextResponse.json({ error: "视频文件大小无效。" }, { status: 400 });
    }
    if (fileSize > MAX_PROMOTION_VIDEO_BYTES) {
      return NextResponse.json({ error: "视频文件不能超过 150MB。" }, { status: 413 });
    }

    const path = promotionStoragePath("video", crypto.randomUUID(), { name: fileName });
    const supabase = await createSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from("heritage-media")
      .createSignedUploadUrl(path, { upsert: false });

    if (error || !data?.token) {
      return NextResponse.json(
        { error: error?.message ?? "无法创建视频上传地址。" },
        { status: 502 }
      );
    }

    return NextResponse.json({ path, token: data.token });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "无法准备视频上传。" },
      { status: 400 }
    );
  }
}
