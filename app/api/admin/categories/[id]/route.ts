import { NextResponse } from "next/server";
import { validateCategoryPayload } from "@/lib/admin/validation";
import { createSupabaseAdminClient, verifyAdminRequest } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateCategoryPayload(body);

    if (!validation.ok) {
      return NextResponse.json({ error: "表单校验失败。", errors: validation.errors }, { status: 422 });
    }

    const supabase = await createSupabaseAdminClient();
    const { error } = await supabase
      .from("categories")
      .update({
        slug: validation.data.slug,
        name: validation.data.name,
        english_name: validation.data.englishName,
        summary: validation.data.summary,
        color: validation.data.color,
        sort_order: validation.data.sortOrder
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update category." },
      { status: 503 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const supabase = await createSupabaseAdminClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete category." },
      { status: 503 }
    );
  }
}
