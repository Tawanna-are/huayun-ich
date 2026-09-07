import { NextResponse } from "next/server";
import { createSupabaseAdminClient, verifyAdminRequest } from "@/lib/supabase/admin";

type Context = { params: Promise<{ id: string }> };
const text = (value: unknown) => typeof value === "string" ? value.trim() : value;

export async function PATCH(request: Request, { params }: Context) {
  if (!verifyAdminRequest(request)) return NextResponse.json({ error: "Admin Key 无效。" }, { status: 401 });
  const { id } = await params; const body = await request.json(); const payload = Object.fromEntries(Object.entries(body).filter(([key]) => ["title_zh", "title_en", "description_zh", "description_en", "cta_zh", "cta_en", "href", "media_alt_zh", "media_alt_en", "published"].includes(key)).map(([key, value]) => [key, key === "published" ? Boolean(value) : text(value)]));
  const supabase = await createSupabaseAdminClient(); const { data, error } = await supabase.from("homepage_promotions").update(payload).eq("id", id).select().single(); return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ promotion: data });
}

export async function DELETE(request: Request, { params }: Context) {
  if (!verifyAdminRequest(request)) return NextResponse.json({ error: "Admin Key 无效。" }, { status: 401 });
  const { id } = await params; const supabase = await createSupabaseAdminClient(); const { data: row, error: readError } = await supabase.from("homepage_promotions").select("storage_path").eq("id", id).single(); if (readError) return NextResponse.json({ error: readError.message }, { status: 404 });
  const { error } = await supabase.from("homepage_promotions").delete().eq("id", id); if (error) return NextResponse.json({ error: error.message }, { status: 500 }); const storage = row.storage_path ? await supabase.storage.from("heritage-media").remove([row.storage_path]) : { error: null }; return NextResponse.json({ ok: true, storageWarning: storage.error?.message ?? null });
}
