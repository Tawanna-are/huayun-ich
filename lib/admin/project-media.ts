import type { HeritageMediaRole, HeritageMediaRow, HeritageMediaType } from "@/lib/types/database";

export type ProjectMediaAction = "set-cover" | "set-main-video" | "move" | "update-metadata" | "set-home-featured";
export type ProjectMediaMoveDirection = "up" | "down";

export type ProjectMediaUpdate = {
  id: string;
  role: HeritageMediaRole;
  sort_order: number;
};

type ProjectMediaActionValidationResult =
  | {
      ok: true;
      action: "set-cover" | "set-main-video";
    }
  | {
      ok: true;
      action: "move";
      direction: ProjectMediaMoveDirection;
    }
  | {
      ok: true;
      action: "update-metadata";
      caption: string;
      alt: string;
    }
  | {
      ok: true;
      action: "set-home-featured";
      featured: boolean;
    }
  | {
      ok: false;
      error: string;
    };

function bySortOrderThenCreatedAt(a: HeritageMediaRow, b: HeritageMediaRow) {
  if (a.sort_order !== b.sort_order) {
    return a.sort_order - b.sort_order;
  }

  return a.created_at.localeCompare(b.created_at);
}

function findMedia(rows: HeritageMediaRow[], selectedId: string) {
  const selected = rows.find((row) => row.id === selectedId);

  if (!selected) {
    throw new Error("Media asset not found.");
  }

  return selected;
}

function normalizeSequentialUpdates(rows: HeritageMediaRow[], roleForSelected?: (row: HeritageMediaRow) => HeritageMediaRole) {
  return rows.map((row, index) => ({
    id: row.id,
    role: roleForSelected?.(row) ?? row.role,
    sort_order: index * 10
  }));
}

export function buildSetCoverUpdates(rows: HeritageMediaRow[], selectedId: string): ProjectMediaUpdate[] {
  const selected = findMedia(rows, selectedId);

  if (selected.media_type !== "image") {
    throw new Error("Only image media can be used as a cover.");
  }

  const imageRows = rows.filter((row) => row.media_type === "image").sort(bySortOrderThenCreatedAt);
  const currentCovers = imageRows.filter((row) => row.role === "cover" && row.id !== selectedId);
  const updates: ProjectMediaUpdate[] = [
    {
      id: selected.id,
      role: "cover",
      sort_order: 0
    }
  ];

  for (const [index, currentCover] of currentCovers.entries()) {
    updates.push({
      id: currentCover.id,
      role: "gallery",
      sort_order: (index + 1) * 10
    });
  }

  return updates;
}

export function buildSetMainVideoUpdates(rows: HeritageMediaRow[], selectedId: string): ProjectMediaUpdate[] {
  const selected = findMedia(rows, selectedId);

  if (selected.media_type !== "video") {
    throw new Error("Only video media can be used as the main video.");
  }

  const videoRows = rows.filter((row) => row.media_type === "video").sort(bySortOrderThenCreatedAt);
  const orderedRows = [selected, ...videoRows.filter((row) => row.id !== selected.id)];

  return normalizeSequentialUpdates(orderedRows, () => "video");
}

export function moveProjectMedia(
  rows: HeritageMediaRow[],
  selectedId: string,
  direction: ProjectMediaMoveDirection
): ProjectMediaUpdate[] {
  const selected = findMedia(rows, selectedId);
  const sameTypeRows = rows.filter((row) => row.media_type === selected.media_type).sort(bySortOrderThenCreatedAt);
  const selectedIndex = sameTypeRows.findIndex((row) => row.id === selectedId);
  const targetIndex = direction === "up" ? selectedIndex - 1 : selectedIndex + 1;

  if (selectedIndex < 0 || targetIndex < 0 || targetIndex >= sameTypeRows.length) {
    return [];
  }

  const reordered = [...sameTypeRows];
  const [moved] = reordered.splice(selectedIndex, 1);
  reordered.splice(targetIndex, 0, moved);
  const sortSlots = sameTypeRows.map((row) => row.sort_order);

  return reordered.map((row, index) => ({
    id: row.id,
    role: row.role,
    sort_order: sortSlots[index] ?? index * 10
  }));
}

export function validateProjectMediaActionPayload(body: unknown): ProjectMediaActionValidationResult {
  const action = (body as { action?: unknown }).action;

  if (action === "set-home-featured") {
    const featured = (body as { featured?: unknown }).featured;
    return typeof featured === "boolean"
      ? { ok: true, action, featured }
      : { ok: false, error: "Invalid homepage featured value." };
  }

  if (action === "set-cover" || action === "set-main-video") {
    return { ok: true, action };
  }

  if (action === "move") {
    const direction = (body as { direction?: unknown }).direction;

    if (direction !== "up" && direction !== "down") {
      return { ok: false, error: "Invalid media move direction." };
    }

    return { ok: true, action, direction };
  }

  if (action === "update-metadata") {
    const captionValue = (body as { caption?: unknown }).caption;
    const altValue = (body as { alt?: unknown }).alt;
    const caption = typeof captionValue === "string" ? captionValue.trim() : "";
    const alt = typeof altValue === "string" ? altValue.trim() : "";

    if (!caption) {
      return { ok: false, error: "Image name is required." };
    }

    if (caption.length > 160) {
      return { ok: false, error: "Image name must be 160 characters or fewer." };
    }

    if (alt.length > 300) {
      return { ok: false, error: "Image description must be 300 characters or fewer." };
    }

    return { ok: true, action, caption, alt };
  }

  return { ok: false, error: "Invalid project media action." };
}

export function getProjectMediaTypeLabel(mediaType: HeritageMediaType) {
  return mediaType === "image" ? "Image" : "Video";
}
