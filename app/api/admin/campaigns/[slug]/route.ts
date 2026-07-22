import { NextResponse } from "next/server";
import { upsertAdminCampaignConfig, type CampaignConfigPayload } from "@/lib/admin/campaign-configs";
import { verifyAdminRequest } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function normalizeList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizePayload(slug: string, body: Record<string, unknown>): CampaignConfigPayload {
  return {
    slug,
    title: String(body.title ?? ""),
    englishTitle: String(body.englishTitle ?? ""),
    summary: String(body.summary ?? ""),
    englishSummary: String(body.englishSummary ?? ""),
    description: String(body.description ?? ""),
    englishDescription: String(body.englishDescription ?? ""),
    heroImage: String(body.heroImage ?? "/assets/hero-museum.png"),
    accent: String(body.accent ?? "#C8A96A"),
    prioritySlugs: normalizeList(body.prioritySlugs),
    keywords: normalizeList(body.keywords),
    published: Boolean(body.published ?? true),
    sortOrder: Number(body.sortOrder ?? 0)
  };
}

export async function PUT(request: Request, context: RouteContext) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const { slug } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const payload = normalizePayload(slug, body);

    if (!payload.title || !payload.englishTitle) {
      return NextResponse.json({ error: "Campaign title and English title are required." }, { status: 422 });
    }

    await upsertAdminCampaignConfig(payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save campaign config." },
      { status: 503 }
    );
  }
}
