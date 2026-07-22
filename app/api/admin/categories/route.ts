import { NextResponse } from "next/server";
import { validateCategoryPayload } from "@/lib/admin/validation";
import { createSupabaseAdminClient, verifyAdminRequest } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateCategoryPayload(body);

    if (!validation.ok) {
      return NextResponse.json({ error: "表单校验失败。", errors: validation.errors }, { status: 422 });
    }

    const supabase = await createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .insert({
        slug: validation.data.slug,
        name: validation.data.name,
        english_name: validation.data.englishName,
        summary: validation.data.summary,
        color: validation.data.color,
        sort_order: validation.data.sortOrder
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create category." },
      { status: 503 }
    );
  }
}
