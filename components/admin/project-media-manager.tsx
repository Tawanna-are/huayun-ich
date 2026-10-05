"use client";

import { useEffect, useMemo, useState, type DragEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Loader2,
  Pencil,
  Save,
  Star,
  Trash2,
  UploadCloud,
  Video,
  X
} from "lucide-react";
import { VideoUploadPanel } from "@/components/admin/video-upload-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AppLocale } from "@/i18n/routing";
import { isSupportedImageUpload, normalizeUploadFileName } from "@/lib/admin/image-upload";
import {
  IMAGE_MAIN_MAX_DIMENSION,
  IMAGE_MAIN_WEBP_QUALITY,
  IMAGE_OUTPUT_MIME_TYPE,
  IMAGE_THUMBNAIL_MAX_DIMENSION,
  IMAGE_THUMBNAIL_WEBP_QUALITY
} from "@/lib/admin/media-performance";
import type { HeritageItemSelectRow, HeritageMediaRole, HeritageMediaRow, MediaAssetRow } from "@/lib/types/database";

type ProjectMediaManagerProps = {
  locale: AppLocale;
  adminKey: string;
  isAuthenticated: boolean;
  selectedRow: HeritageItemSelectRow | undefined;
  onChanged: () => Promise<void> | void;
};

type ImageUploadRole = Extract<HeritageMediaRole, "gallery" | "hero" | "poster">;

type UploadQueueItem = {
  id: string;
  file: File;
  status: "queued" | "compressing" | "uploading" | "done" | "error";
  message: string;
  originalSize: number;
  compressedSize?: number;
  thumbnailSize?: number;
};

function sortMedia(rows: HeritageMediaRow[]) {
  return [...rows].sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return a.created_at.localeCompare(b.created_at);
  });
}

function findMediaAsset(media: HeritageMediaRow, assets: MediaAssetRow[] | null | undefined) {
  return assets?.find((asset) =>
    asset.heritage_id === media.heritage_item_id &&
    asset.file_type === "image" &&
    asset.asset_role === "gallery" &&
    (media.storage_path ? asset.storage_path === media.storage_path : asset.file_url === media.url)
  );
}

function formatMediaFileSize(size: number | null | undefined) {
  if (size == null) {
    return "-";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = size / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

function loadImageElement(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read image."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to compress image."));
          return;
        }

        resolve(blob);
      },
      type,
      quality
    );
  });
}

async function renderImageBlob(file: File, maxDimension: number, quality: number) {
  const image = await loadImageElement(file);
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return {
    blob: await canvasToBlob(canvas, IMAGE_OUTPUT_MIME_TYPE, quality),
    width,
    height
  };
}

async function prepareCompressedImage(file: File) {
  const normalizedBaseName = normalizeUploadFileName(file.name).replace(/\.(jpe?g|png|webp)$/i, "");
  const [main, thumbnail] = await Promise.all([
    renderImageBlob(file, IMAGE_MAIN_MAX_DIMENSION, IMAGE_MAIN_WEBP_QUALITY),
    renderImageBlob(file, IMAGE_THUMBNAIL_MAX_DIMENSION, IMAGE_THUMBNAIL_WEBP_QUALITY)
  ]);
  const fileName = `${normalizedBaseName || "image"}.webp`;

  return {
    compressedFile: new File([main.blob], fileName, { type: IMAGE_OUTPUT_MIME_TYPE }),
    thumbnailFile: new File([thumbnail.blob], fileName, { type: IMAGE_OUTPUT_MIME_TYPE }),
    width: main.width,
    height: main.height
  };
}

function MediaPreview({ media }: { media: HeritageMediaRow }) {
  if (media.media_type === "video") {
    return (
      <div className="relative h-full w-full bg-ink">
        {media.thumbnail_url ? (
          <img src={media.thumbnail_url} alt={media.alt ?? media.file_name ?? "Video poster"} className="h-full w-full object-cover opacity-86" />
        ) : (
          <video src={media.url} muted preload="metadata" className="h-full w-full object-cover opacity-78" />
        )}
        <div className="absolute inset-0 grid place-items-center bg-ink/28">
          <Video className="size-8 text-museumGold" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={media.thumbnail_url ?? media.url}
      alt={media.alt ?? media.file_name ?? "Heritage image"}
      loading="lazy"
      className="h-full w-full object-cover"
    />
  );
}

function MediaCard({
  media,
  isFirst,
  isLast,
  isBusy,
  onAction,
  onDelete,
  onMetadataSave,
  onHomeFeatured,
  featuredOnHome,
  hasMediaAsset,
  locale
}: {
  media: HeritageMediaRow;
  isFirst: boolean;
  isLast: boolean;
  isBusy: boolean;
  onAction: (mediaId: string, action: "set-cover" | "set-main-video" | "move", direction?: "up" | "down") => void;
  onDelete: (mediaId: string) => void;
  onMetadataSave: (mediaId: string, values: { caption: string; alt: string }) => Promise<boolean>;
  onHomeFeatured: (mediaId: string, featured: boolean) => void;
  featuredOnHome: boolean;
  hasMediaAsset: boolean;
  locale: AppLocale;
}) {
  const isImage = media.media_type === "image";
  const fileName = media.file_name ?? media.original_file_name ?? media.url.split("/").pop() ?? "media";
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(media.caption ?? "");
  const [alt, setAlt] = useState(media.alt ?? "");

  useEffect(() => {
    setCaption(media.caption ?? "");
    setAlt(media.alt ?? "");
  }, [media.alt, media.caption]);

  function cancelEditing() {
    setCaption(media.caption ?? "");
    setAlt(media.alt ?? "");
    setIsEditing(false);
  }

  async function saveMetadata() {
    const saved = await onMetadataSave(media.id, { caption, alt });

    if (saved) {
      setIsEditing(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-rice/10 bg-ink/48">
      <div className="aspect-[4/3] overflow-hidden bg-ink">
        <MediaPreview media={media} />
      </div>
      <div className="space-y-3 p-3">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Badge>{media.role}</Badge>
              {isImage && media.role === "cover" ? <Badge className="border-cinnabar/36 bg-cinnabar/12 text-rice">Cover</Badge> : null}
              {!isImage && media.sort_order === 0 ? <Badge className="border-cinnabar/36 bg-cinnabar/12 text-rice">Main</Badge> : null}
            </div>
            <p className="mt-2 truncate text-sm font-medium text-rice">{media.caption || fileName}</p>
            <p className="mt-1 text-xs text-rice/42">
              {formatMediaFileSize(media.file_size)} / order {media.sort_order}
            </p>
          </div>
        </div>

        {media.media_type === "image" && media.role === "gallery" ? (
          <label className="flex items-center gap-2 text-sm text-rice">
            <input
              type="checkbox"
              checked={featuredOnHome}
              onChange={(event) => onHomeFeatured(media.id, event.target.checked)}
              disabled={isBusy || !hasMediaAsset}
              className="size-4 accent-museumGold"
            />
            {locale === "zh" ? "首页展示" : "Show on Home"}
          </label>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={() => onAction(media.id, "move", "up")} disabled={isBusy || isFirst}>
            <ChevronUp className="size-4" />
            Up
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => onAction(media.id, "move", "down")} disabled={isBusy || isLast}>
            <ChevronDown className="size-4" />
            Down
          </Button>
          {isImage ? (
            <Button type="button" size="sm" variant="outline" onClick={() => onAction(media.id, "set-cover")} disabled={isBusy || media.role === "cover"}>
              <Star className="size-4" />
              Cover
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onAction(media.id, "set-main-video")}
              disabled={isBusy || media.sort_order === 0}
            >
              <Star className="size-4" />
              Main
            </Button>
          )}
          <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(media.id)} disabled={isBusy}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>

        {isImage ? (
          isEditing ? (
            <div className="space-y-3 border-t border-rice/10 pt-3">
              <label className="block space-y-1.5 text-xs text-rice/66">
                <span>Image name</span>
                <Input
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  maxLength={160}
                  disabled={isBusy}
                />
              </label>
              <label className="block space-y-1.5 text-xs text-rice/66">
                <span>Image description</span>
                <textarea
                  value={alt}
                  onChange={(event) => setAlt(event.target.value)}
                  maxLength={300}
                  rows={3}
                  disabled={isBusy}
                  className="flex w-full rounded-md border border-museumGold/22 bg-ink px-3 py-2 text-sm text-rice outline-none transition placeholder:text-rice/30 focus:border-museumGold disabled:cursor-not-allowed disabled:opacity-50"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => void saveMetadata()} disabled={isBusy || !caption.trim()}>
                  {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={cancelEditing} disabled={isBusy}>
                  <X className="size-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" size="sm" variant="ghost" className="w-full" onClick={() => setIsEditing(true)} disabled={isBusy}>
              <Pencil className="size-4" />
              Edit image details
            </Button>
          )
        ) : null}
      </div>
    </div>
  );
}

export function ProjectMediaManager({
  locale,
  adminKey,
  isAuthenticated,
  selectedRow,
  onChanged
}: ProjectMediaManagerProps) {
  const [uploadRole, setUploadRole] = useState<ImageUploadRole>("gallery");
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [busyMediaId, setBusyMediaId] = useState<string | null>(null);
  const [status, setStatus] = useState("Select a heritage item to manage its images and videos.");
  const mediaRows = useMemo(() => sortMedia(selectedRow?.heritage_media ?? []), [selectedRow?.heritage_media]);
  const images = mediaRows.filter((media) => media.media_type === "image");
  const videos = mediaRows.filter((media) => media.media_type === "video");
  const videoOptions = selectedRow
    ? [
        {
          id: selectedRow.id,
          name: selectedRow.name,
          slug: selectedRow.slug,
          region: selectedRow.region
        }
      ]
    : [];

  useEffect(() => {
    setUploadQueue([]);
    setStatus(selectedRow ? `Managing media for ${selectedRow.name}.` : "Select a heritage item to manage its images and videos.");
    setBusyMediaId(null);
  }, [selectedRow?.id, selectedRow?.name]);

  function addFilesToQueue(files: FileList | File[]) {
    const incomingFiles = Array.from(files);
    const validItems = incomingFiles.filter(isSupportedImageUpload).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      status: "queued" as const,
      message: "Ready",
      originalSize: file.size
    }));

    if (validItems.length > 0) {
      setUploadQueue((current) => [...current, ...validItems]);
    }

    if (validItems.length !== incomingFiles.length) {
      setStatus("Only JPG, PNG and WEBP images are supported.");
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFilesToQueue(event.dataTransfer.files);
  }

  function updateUploadItem(id: string, patch: Partial<UploadQueueItem>) {
    setUploadQueue((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function uploadImageItem(item: UploadQueueItem) {
    if (!selectedRow) {
      throw new Error("Select a heritage item before uploading.");
    }

    updateUploadItem(item.id, { status: "compressing", message: "Compressing" });
    const prepared = await prepareCompressedImage(item.file);
    updateUploadItem(item.id, {
      status: "uploading",
      message: "Uploading",
      compressedSize: prepared.compressedFile.size,
      thumbnailSize: prepared.thumbnailFile.size
    });

    const formData = new FormData();
    formData.set("heritageId", selectedRow.id);
    formData.set("mediaType", "image");
    formData.set("role", uploadRole);
    formData.set("alt", selectedRow.name);
    formData.set("caption", "Project media image");
    formData.set("originalFileName", item.file.name);
    formData.set("width", String(prepared.width));
    formData.set("height", String(prepared.height));
    formData.set("file", prepared.compressedFile);
    formData.set("thumbnail", prepared.thumbnailFile);

    const response = await fetch("/api/admin/media", {
      method: "POST",
      headers: {
        "x-admin-key": adminKey
      },
      body: formData
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      throw new Error(payload.error ?? "Upload failed.");
    }

    updateUploadItem(item.id, { status: "done", message: "Uploaded" });
  }

  async function uploadImages() {
    if (!isAuthenticated) {
      setStatus("Sign in before uploading media.");
      return;
    }

    if (!selectedRow) {
      setStatus("Select a heritage item before uploading.");
      return;
    }

    const pendingItems = uploadQueue.filter((item) => item.status === "queued" || item.status === "error");

    if (pendingItems.length === 0) {
      return;
    }

    setIsUploading(true);

    for (const item of pendingItems) {
      try {
        await uploadImageItem(item);
      } catch (error) {
        updateUploadItem(item.id, {
          status: "error",
          message: error instanceof Error ? error.message : "Upload failed."
        });
      }
    }

    setIsUploading(false);
    setStatus("Image upload queue finished.");
    await onChanged();
  }

  async function runMediaAction(mediaId: string, action: "set-cover" | "set-main-video" | "move", direction?: "up" | "down") {
    if (!isAuthenticated) {
      setStatus("Sign in before editing media.");
      return;
    }

    setBusyMediaId(mediaId);
    const response = await fetch(`/api/admin/media/${encodeURIComponent(mediaId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey
      },
      body: JSON.stringify({
        action,
        ...(direction ? { direction } : {})
      })
    });
    const payload = (await response.json()) as { error?: string };
    setBusyMediaId(null);

    if (!response.ok) {
      setStatus(payload.error ?? "Failed to update media.");
      return;
    }

    setStatus("Media updated.");
    await onChanged();
  }

  async function setHomeFeatured(mediaId: string, featured: boolean) {
    if (!isAuthenticated) {
      setStatus("Sign in before editing media.");
      return;
    }

    setBusyMediaId(mediaId);
    try {
      const response = await fetch(`/api/admin/media/${encodeURIComponent(mediaId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ action: "set-home-featured", featured })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus(payload.error ?? "Failed to update homepage display.");
        return;
      }
      await onChanged();
      setStatus("Homepage display updated.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to update homepage display.");
    } finally {
      setBusyMediaId(null);
    }
  }

  async function saveMediaMetadata(mediaId: string, values: { caption: string; alt: string }) {
    if (!isAuthenticated) {
      setStatus("Sign in before editing media.");
      return false;
    }

    setBusyMediaId(mediaId);

    try {
      const response = await fetch(`/api/admin/media/${encodeURIComponent(mediaId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify({ action: "update-metadata", ...values })
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus(payload.error ?? "Failed to update image details.");
        return false;
      }

      setStatus("Image details updated.");
      await onChanged();
      return true;
    } finally {
      setBusyMediaId(null);
    }
  }

  async function deleteMedia(mediaId: string) {
    if (!isAuthenticated) {
      setStatus("Sign in before deleting media.");
      return;
    }

    if (!window.confirm("Delete this media asset? This removes the database record and Storage file when available.")) {
      return;
    }

    setBusyMediaId(mediaId);
    const response = await fetch(`/api/admin/media/${encodeURIComponent(mediaId)}`, {
      method: "DELETE",
      headers: {
        "x-admin-key": adminKey
      }
    });
    const payload = (await response.json()) as { error?: string };
    setBusyMediaId(null);

    if (!response.ok) {
      setStatus(payload.error ?? "Failed to delete media.");
      return;
    }

    setStatus("Media deleted.");
    await onChanged();
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-museumGold">Project Media</p>
              <h2 className="serif-title mt-1 text-3xl font-normal">Images and videos</h2>
              <p className="mt-2 text-sm leading-6 text-rice/58">
                Current item: {selectedRow?.name ?? "Select an item from the left list"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{images.length} images</Badge>
              <Badge>{videos.length} videos</Badge>
            </div>
          </div>

          <div className="rounded-md border border-museumGold/18 bg-rice/[0.035] p-3 text-sm text-rice/66">
            {status}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-museumGold">Images</p>
              <h3 className="serif-title mt-1 text-2xl font-normal">Upload and arrange images</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="h-9 rounded-md border border-museumGold/22 bg-ink px-3 text-sm text-rice"
                value={uploadRole}
                onChange={(event) => setUploadRole(event.target.value as ImageUploadRole)}
              >
                <option value="gallery">Gallery</option>
                <option value="hero">Hero</option>
                <option value="poster">Video poster</option>
              </select>
              <Button type="button" size="sm" variant="secondary" onClick={() => void uploadImages()} disabled={!selectedRow || !isAuthenticated || isUploading || uploadQueue.length === 0}>
                {isUploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                Upload
              </Button>
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`grid min-h-44 place-items-center rounded-md border border-dashed p-6 text-center transition ${
              isDragging ? "border-museumGold bg-museumGold/10" : "border-museumGold/26 bg-rice/[0.035]"
            }`}
          >
            <div>
              <div className="mx-auto grid size-12 place-items-center rounded-md border border-museumGold/28 bg-museumGold/10 text-museumGold">
                <ImageIcon className="size-6" />
              </div>
              <p className="mt-3 text-sm text-rice/68">Drag JPG, PNG or WEBP images here.</p>
              <label className="mt-4 inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-museumGold px-4 text-sm font-medium text-ink transition hover:bg-museumGold/88">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    if (event.target.files) {
                      addFilesToQueue(event.target.files);
                      event.target.value = "";
                    }
                  }}
                />
                Choose images
              </label>
            </div>
          </div>

          {uploadQueue.length > 0 ? (
            <div className="grid gap-2">
              {uploadQueue.map((item) => (
                <div key={item.id} className="rounded-md border border-rice/10 bg-ink/48 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        {item.status === "done" ? (
                          <CheckCircle2 className="size-4 shrink-0 text-celadon" />
                        ) : item.status === "error" ? (
                          <AlertCircle className="size-4 shrink-0 text-cinnabar" />
                        ) : item.status === "compressing" || item.status === "uploading" ? (
                          <Loader2 className="size-4 shrink-0 animate-spin text-museumGold" />
                        ) : (
                          <ImageIcon className="size-4 shrink-0 text-museumGold" />
                        )}
                        <span className="truncate font-medium text-rice">{item.file.name}</span>
                        <Badge>{formatMediaFileSize(item.originalSize)}</Badge>
                      </div>
                      <p className="mt-2 text-xs text-rice/48">
                        {item.message}
                        {item.compressedSize ? ` / compressed ${formatMediaFileSize(item.compressedSize)}` : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setUploadQueue((current) => current.filter((candidate) => candidate.id !== item.id))}
                      disabled={isUploading}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {images.map((media, index) => (
              <MediaCard
                key={media.id}
                media={media}
                isFirst={index === 0}
                isLast={index === images.length - 1}
                isBusy={busyMediaId === media.id || isUploading}
                onAction={runMediaAction}
                onDelete={deleteMedia}
                onMetadataSave={saveMediaMetadata}
                onHomeFeatured={setHomeFeatured}
                featuredOnHome={findMediaAsset(media, selectedRow?.media_assets)?.featured_on_home === true}
                hasMediaAsset={typeof findMediaAsset(media, selectedRow?.media_assets)?.featured_on_home === "boolean"}
                locale={locale}
              />
            ))}
            {images.length === 0 ? <p className="py-6 text-sm text-rice/42">No images for this item yet.</p> : null}
          </div>
        </CardContent>
      </Card>

      {selectedRow ? (
        <VideoUploadPanel
          key={selectedRow.id}
          locale={locale}
          adminKey={adminKey}
          isAuthenticated={isAuthenticated}
          heritageOptions={videoOptions}
          onUploaded={onChanged}
        />
      ) : null}

      <Card>
        <CardContent className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-museumGold">Videos</p>
            <h3 className="serif-title mt-1 text-2xl font-normal">Arrange project videos</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((media, index) => (
              <MediaCard
                key={media.id}
                media={media}
                isFirst={index === 0}
                isLast={index === videos.length - 1}
                isBusy={busyMediaId === media.id}
                onAction={runMediaAction}
                onDelete={deleteMedia}
                onMetadataSave={saveMediaMetadata}
                onHomeFeatured={setHomeFeatured}
                featuredOnHome={false}
                hasMediaAsset={false}
                locale={locale}
              />
            ))}
            {videos.length === 0 ? <p className="py-6 text-sm text-rice/42">No videos for this item yet.</p> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
