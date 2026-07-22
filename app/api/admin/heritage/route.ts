import { NextResponse } from "next/server";
import { insertMediaAsset } from "@/lib/admin/media-assets";
import { buildPrimaryMediaAssetRows, buildPrimaryMediaRows } from "@/lib/admin/primary-media";
import { getAdminHeritageRows } from "@/lib/admin/repository";
import { validateHeritagePayload, type HeritageAdminPayload } from "@/lib/admin/validation";
import { createSupabaseAdminClient, verifyAdminRequest } from "@/lib/supabase/admin";

type AdminSupabaseClient = Awaited<ReturnType<typeof createSupabaseAdminClient>>;

async function getCategoryId(supabase: AdminSupabaseClient, categorySlug: string) {
  const { data, error } = await supabase.from("categories").select("id").eq("slug", categorySlug).single();

  if (error || !data) {
    throw new Error("Category not found.");
  }

  return data.id as string;
}

function mapPayload(payload: HeritageAdminPayload, categoryId: string) {
  return {
    category_id: categoryId,
    slug: payload.slug,
    name: payload.name,
    english_name: payload.englishName,
    summary: payload.summary,
    region: payload.region,
    province: payload.province,
    city: payload.city,
    inscription_year: payload.inscriptionYear,
    history: payload.history,
    timeline: payload.timeline,
    tags: payload.tags,
    related_slugs: payload.relatedSlugs,
    latitude: payload.latitude,
    longitude: payload.longitude,
    map_x: payload.mapX,
    map_y: payload.mapY,
    published: payload.published,
    featured: payload.featured
  };
}

async function replacePrimaryMedia(
  supabase: AdminSupabaseClient,
  heritageItemId: string,
  payload: HeritageAdminPayload
) {
  const { error: deleteMediaError } = await supabase
    .from("heritage_media")
    .delete()
    .eq("heritage_item_id", heritageItemId)
    .in("role", ["cover", "hero", "video"]);

  if (deleteMediaError) {
    throw new Error(deleteMediaError.message);
  }

  const mediaRows = buildPrimaryMediaRows(payload, heritageItemId);

  if (mediaRows.length > 0) {
    const { error: insertMediaError } = await supabase.from("heritage_media").insert(mediaRows);

    if (insertMediaError) {
      throw new Error(insertMediaError.message);
    }
  }

  const { error: deleteAssetError } = await supabase
    .from("media_assets")
    .delete()
    .eq("heritage_id", heritageItemId)
    .in("asset_role", ["cover", "hero", "main_video"]);

  if (deleteAssetError) {
    throw new Error(deleteAssetError.message);
  }

  for (const asset of buildPrimaryMediaAssetRows(payload, heritageItemId)) {
    await insertMediaAsset(supabase, {
      heritageId: asset.heritage_id,
      title: asset.title,
      mediaType: asset.file_type,
      role: asset.asset_role === "main_video" ? "video" : asset.asset_role,
      assetRole: asset.asset_role,
      url: asset.file_url,
      thumbnailUrl: asset.thumbnail_url,
      fileSize: asset.file_size,
      mimeType: asset.mime_type,
      storagePath: asset.storage_path,
      thumbnailStoragePath: asset.thumbnail_storage_path,
      alt: asset.alt,
      caption: asset.caption,
      sortOrder: asset.sort_order
    });
  }
}

async function replaceInheritor(
  supabase: AdminSupabaseClient,
  heritageItemId: string,
  payload: HeritageAdminPayload
) {
  const { error: deleteError } = await supabase.from("inheritors").delete().eq("heritage_item_id", heritageItemId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (!payload.inheritorName && !payload.inheritorTitle && !payload.inheritorBio) {
    return;
  }

  const { error: insertError } = await supabase.from("inheritors").insert({
    heritage_item_id: heritageItemId,
    name: payload.inheritorName || "Pending",
    title: payload.inheritorTitle || "Inheritor profile pending",
    bio: payload.inheritorBio || "This inheritor profile will be completed in the CMS.",
    image_url: payload.inheritorImageUrl || "/assets/inheritor-craft.png",
    sort_order: 0
  });

  if (insertError) {
    throw new Error(insertError.message);
  }
}

export async function GET(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  const items = await getAdminHeritageRows();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateHeritagePayload(body);

    if (!validation.ok) {
      return NextResponse.json({ error: "Invalid heritage payload.", errors: validation.errors }, { status: 422 });
    }

    const supabase = await createSupabaseAdminClient();
    const categoryId = await getCategoryId(supabase, validation.data.categorySlug);
    const { data, error } = await supabase
      .from("heritage_items")
      .insert(mapPayload(validation.data, categoryId))
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const heritageItemId = data.id as string;
    await replacePrimaryMedia(supabase, heritageItemId, validation.data);
    await replaceInheritor(supabase, heritageItemId, validation.data);
    return NextResponse.json({ id: heritageItemId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create heritage item." },
      { status: 503 }
    );
  }
}
