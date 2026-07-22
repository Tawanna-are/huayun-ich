import { NextResponse } from "next/server";
import {
  updateMediaAssetByStorageIdentity,
  updateMediaAssetMetadataByStorageIdentity
} from "@/lib/admin/media-assets";
import { deleteAdminMediaAssets } from "@/lib/admin/media-library";
import {
  buildSetCoverUpdates,
  buildSetMainVideoUpdates,
  moveProjectMedia,
  validateProjectMediaActionPayload
} from "@/lib/admin/project-media";
import { createSupabaseAdminClient, verifyAdminRequest } from "@/lib/supabase/admin";
import type { HeritageMediaRow } from "@/lib/types/database";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const mediaSelect = `
  id,
  heritage_item_id,
  media_type,
  role,
  url,
  alt,
  caption,
  file_name,
  file_size,
  mime_type,
  storage_path,
  thumbnail_url,
  thumbnail_storage_path,
  original_file_name,
  width,
  height,
  sort_order,
  created_at
`;

async function getProjectMediaRows(mediaId: string) {
  const supabase = await createSupabaseAdminClient();
  const { data: selected, error: selectedError } = await supabase
    .from("heritage_media")
    .select(mediaSelect)
    .eq("id", mediaId)
    .single();

  if (selectedError || !selected) {
    throw new Error(selectedError?.message ?? "Media asset not found.");
  }

  const selectedRow = selected as unknown as HeritageMediaRow;
  const { data, error } = await supabase
    .from("heritage_media")
    .select(mediaSelect)
    .eq("heritage_item_id", selectedRow.heritage_item_id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return {
    supabase,
    rows: (data ?? []) as unknown as HeritageMediaRow[]
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const validation = validateProjectMediaActionPayload(await request.json());

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    const { supabase, rows } = await getProjectMediaRows(id);

    if (validation.action === "update-metadata") {
      const selected = rows.find((row) => row.id === id);

      if (!selected || selected.media_type !== "image") {
        return NextResponse.json({ error: "Only image metadata can be edited here." }, { status: 422 });
      }

      const values = {
        caption: validation.caption,
        alt: validation.alt || null
      };
      const { error } = await supabase.from("heritage_media").update(values).eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      await updateMediaAssetMetadataByStorageIdentity(
        supabase,
        { url: selected.url, storagePath: selected.storage_path },
        values
      );

      return NextResponse.json({ ok: true, updated: 1 });
    }

    let updates;

    if (validation.action === "move") {
      updates = moveProjectMedia(rows, id, validation.direction);
    } else if (validation.action === "set-cover") {
      updates = buildSetCoverUpdates(rows, id);
    } else {
      updates = buildSetMainVideoUpdates(rows, id);
    }

    for (const update of updates) {
      const sourceRow = rows.find((row) => row.id === update.id);
      const { error } = await supabase
        .from("heritage_media")
        .update({
          role: update.role,
          sort_order: update.sort_order
        })
        .eq("id", update.id);

      if (error) {
        throw new Error(error.message);
      }

      if (sourceRow) {
        await updateMediaAssetByStorageIdentity(
          supabase,
          {
            url: sourceRow.url,
            storagePath: sourceRow.storage_path
          },
          {
            role: update.role,
            mediaType: sourceRow.media_type,
            sortOrder: update.sort_order
          }
        );
      }
    }

    return NextResponse.json({ ok: true, updated: updates.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update media asset." },
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
    const result = await deleteAdminMediaAssets([id]);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete media asset." },
      { status: 503 }
    );
  }
}
