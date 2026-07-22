"use client";

import { useEffect, useMemo, useState, type DragEvent, type FormEvent, type ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ImageIcon,
  Library,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  Video,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VideoUploadPanel } from "@/components/admin/video-upload-panel";
import type { AppLocale } from "@/i18n/routing";
import { isSupportedImageUpload, normalizeUploadFileName } from "@/lib/admin/image-upload";
import {
  IMAGE_MAIN_MAX_DIMENSION,
  IMAGE_MAIN_WEBP_QUALITY,
  IMAGE_OUTPUT_MIME_TYPE,
  IMAGE_THUMBNAIL_MAX_DIMENSION,
  IMAGE_THUMBNAIL_WEBP_QUALITY
} from "@/lib/admin/media-performance";
import type { AdminMediaAsset, AdminMediaLibraryResponse } from "@/lib/admin/media-library";

type HeritageOption = {
  id: string;
  name: string;
  slug: string;
  region: string;
};

type MediaLibraryClientProps = {
  locale: AppLocale;
  heritageOptions: HeritageOption[];
};

type MediaTypeFilter = "all" | "image" | "video";

type MediaLibraryApiResponse = Partial<AdminMediaLibraryResponse> & {
  error?: string;
};

type UploadQueueItem = {
  id: string;
  file: File;
  status: "queued" | "compressing" | "uploading" | "done" | "error";
  message: string;
  originalSize: number;
  compressedSize?: number;
  thumbnailSize?: number;
};

const adminStorageKey = "huayun-admin-key";

const copy = {
  zh: {
    adminKey: "Admin Key",
    login: "登录",
    logout: "退出",
    locked: "未登录",
    ready: "已授权",
    search: "搜索文件名、非遗项目、地区",
    allProjects: "全部项目",
    allMedia: "全部媒体",
    images: "图片",
    videos: "视频",
    refresh: "刷新",
    deleteSelected: "批量删除",
    selected: "已选",
    assets: "资源",
    imageAssets: "图片",
    videoAssets: "视频",
    file: "文件",
    project: "所属非遗项目",
    uploadedAt: "上传时间",
    size: "大小",
    type: "类型",
    role: "用途",
    open: "打开",
    empty: "暂无媒体资源",
    loginHint: "输入后台 Admin Key 后可查看、筛选和批量删除媒体资源。",
    deleteHint: "请选择要删除的媒体资源。",
    deleting: "正在删除所选媒体资源...",
    loading: "正在读取媒体资源库...",
    loaded: "媒体资源库已更新。",
    unauthorized: "Admin Key 无效，请重新登录。",
    deleted: "媒体资源已删除。",
    confirmDelete: "确认删除所选媒体资源？此操作会同步删除数据库记录和可识别的 Storage 文件。",
    unknownProject: "未关联项目",
    uploadTitle: "图片上传",
    uploadDescription: "拖拽 JPG、PNG、WEBP 图片到这里，系统会在上传前自动压缩并生成缩略图。",
    chooseImages: "选择图片",
    uploadProject: "目标非遗项目",
    uploadRole: "图片用途",
    uploadAll: "上传队列",
    clearQueue: "清空",
    unsupportedFile: "仅支持 JPG、PNG、WEBP 图片。",
    selectProject: "请先选择目标非遗项目。",
    uploadComplete: "图片上传完成。"
  },
  en: {
    adminKey: "Admin Key",
    login: "Sign in",
    logout: "Sign out",
    locked: "Locked",
    ready: "Authorized",
    search: "Search filename, heritage item, region",
    allProjects: "All projects",
    allMedia: "All media",
    images: "Images",
    videos: "Videos",
    refresh: "Refresh",
    deleteSelected: "Delete selected",
    selected: "Selected",
    assets: "Assets",
    imageAssets: "Images",
    videoAssets: "Videos",
    file: "File",
    project: "Heritage item",
    uploadedAt: "Uploaded",
    size: "Size",
    type: "Type",
    role: "Role",
    open: "Open",
    empty: "No media assets",
    loginHint: "Enter the admin key to view, filter and bulk delete media assets.",
    deleteHint: "Select media assets to delete.",
    deleting: "Deleting selected media assets...",
    loading: "Loading media library...",
    loaded: "Media library refreshed.",
    unauthorized: "Invalid admin key. Please sign in again.",
    deleted: "Media assets deleted.",
    confirmDelete: "Delete selected media assets? This removes database records and recognized Storage files.",
    unknownProject: "Unlinked project",
    uploadTitle: "Image upload",
    uploadDescription: "Drag JPG, PNG or WEBP images here. Images are compressed and thumbnails are generated before upload.",
    chooseImages: "Choose images",
    uploadProject: "Target heritage item",
    uploadRole: "Image role",
    uploadAll: "Upload queue",
    clearQueue: "Clear",
    unsupportedFile: "Only JPG, PNG and WEBP images are supported.",
    selectProject: "Select a heritage item before uploading.",
    uploadComplete: "Image upload completed."
  }
} satisfies Record<AppLocale, Record<string, string>>;

const roleLabels: Record<string, string> = {
  cover: "Cover",
  hero: "Hero",
  gallery: "Gallery",
  video: "Video",
  poster: "Poster"
};

function formatFileSize(size: number | null | undefined) {
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

function formatDate(value: string, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function MediaPreview({ asset }: { asset: AdminMediaAsset }) {
  if (asset.mediaType === "image") {
    return (
      <img
        src={asset.thumbnailUrl ?? asset.url}
        alt={asset.alt ?? asset.fileName}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="relative h-full w-full bg-ink">
      {asset.thumbnailUrl ? (
        <img src={asset.thumbnailUrl} alt={asset.alt ?? asset.fileName} loading="lazy" className="h-full w-full object-cover opacity-86" />
      ) : (
        <video src={asset.url} muted preload="metadata" className="h-full w-full object-cover opacity-78" />
      )}
      <div className="absolute inset-0 grid place-items-center bg-ink/28">
        <Video className="size-7 text-museumGold" />
      </div>
    </div>
  );
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

export function MediaLibraryClient({ locale, heritageOptions }: MediaLibraryClientProps) {
  const t = copy[locale];
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [assets, setAssets] = useState<AdminMediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [imageCount, setImageCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [query, setQuery] = useState("");
  const [mediaType, setMediaType] = useState<MediaTypeFilter>("all");
  const [heritageId, setHeritageId] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [status, setStatus] = useState(t.loginHint);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadHeritageId, setUploadHeritageId] = useState(heritageOptions[0]?.id ?? "");
  const [uploadRole, setUploadRole] = useState<"cover" | "hero" | "gallery" | "poster">("gallery");
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allVisibleSelected = assets.length > 0 && assets.every((asset) => selectedSet.has(asset.id));
  const uploadTarget = heritageOptions.find((item) => item.id === uploadHeritageId);

  async function loadAssets(key = adminKey) {
    setIsLoading(true);
    setStatus(t.loading);

    const params = new URLSearchParams();
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    }

    if (mediaType !== "all") {
      params.set("type", mediaType);
    }

    if (heritageId !== "all") {
      params.set("heritageId", heritageId);
    }

    const response = await fetch(`/api/admin/media-library?${params.toString()}`, {
      headers: {
        "x-admin-key": key
      }
    });
    const payload = (await response.json()) as MediaLibraryApiResponse;

    setIsLoading(false);

    if (!response.ok) {
      setIsAuthenticated(false);
      setStatus(payload.error ?? t.unauthorized);
      return;
    }

    setIsAuthenticated(true);
    setAssets(payload.assets ?? []);
    setTotal(payload.total ?? 0);
    setImageCount(payload.imageCount ?? 0);
    setVideoCount(payload.videoCount ?? 0);
    setSelectedIds((current) => current.filter((id) => (payload.assets ?? []).some((asset) => asset.id === id)));
    setStatus(t.loaded);
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: {
        "x-admin-key": adminKey
      }
    });

    if (!response.ok) {
      setIsAuthenticated(false);
      setStatus(t.unauthorized);
      return;
    }

    window.localStorage.setItem(adminStorageKey, adminKey);
    await loadAssets(adminKey);
  }

  function logout() {
    window.localStorage.removeItem(adminStorageKey);
    setIsAuthenticated(false);
    setAssets([]);
    setSelectedIds([]);
    setStatus(t.loginHint);
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !assets.some((asset) => asset.id === id));
      }

      return Array.from(new Set([...current, ...assets.map((asset) => asset.id)]));
    });
  }

  async function deleteSelected() {
    if (selectedIds.length === 0) {
      setStatus(t.deleteHint);
      return;
    }

    if (!window.confirm(t.confirmDelete)) {
      return;
    }

    setIsDeleting(true);
    setStatus(t.deleting);
    const response = await fetch("/api/admin/media-library", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey
      },
      body: JSON.stringify({ ids: selectedIds })
    });
    const payload = (await response.json()) as { error?: string };
    setIsDeleting(false);

    if (!response.ok) {
      setStatus(payload.error ?? t.deleteHint);
      return;
    }

    setSelectedIds([]);
    setStatus(t.deleted);
    await loadAssets();
  }

  function addFilesToQueue(files: FileList | File[]) {
    const incomingFiles = Array.from(files);
    const nextItems: UploadQueueItem[] = [];
    const rejected = incomingFiles.filter((file) => !isSupportedImageUpload(file));

    for (const file of incomingFiles) {
      if (!isSupportedImageUpload(file)) {
        continue;
      }

      nextItems.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        status: "queued",
        message: "Ready",
        originalSize: file.size
      });
    }

    if (nextItems.length > 0) {
      setUploadQueue((current) => [...current, ...nextItems]);
    }

    if (rejected.length > 0) {
      setStatus(t.unsupportedFile);
    }
  }

  function removeUploadItem(id: string) {
    setUploadQueue((current) => current.filter((item) => item.id !== id));
  }

  function updateUploadItem(id: string, patch: Partial<UploadQueueItem>) {
    setUploadQueue((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFilesToQueue(event.dataTransfer.files);
  }

  async function uploadImageItem(item: UploadQueueItem) {
    updateUploadItem(item.id, { status: "compressing", message: "Compressing" });
    const prepared = await prepareCompressedImage(item.file);
    updateUploadItem(item.id, {
      status: "uploading",
      message: "Uploading",
      compressedSize: prepared.compressedFile.size,
      thumbnailSize: prepared.thumbnailFile.size
    });

    const formData = new FormData();
    formData.set("heritageId", uploadHeritageId);
    formData.set("mediaType", "image");
    formData.set("role", uploadRole);
    formData.set("alt", uploadTarget?.name ?? item.file.name);
    formData.set("caption", "CMS image upload");
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

  async function uploadQueuedImages() {
    if (!isAuthenticated) {
      setStatus(t.loginHint);
      return;
    }

    if (!uploadHeritageId) {
      setStatus(t.selectProject);
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
    setStatus(t.uploadComplete);
    await loadAssets();
  }

  useEffect(() => {
    const storedKey = window.localStorage.getItem(adminStorageKey);

    if (storedKey) {
      setAdminKey(storedKey);
      void loadAssets(storedKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadAssets();
    }, 260);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, mediaType, heritageId]);

  return (
    <section className="bg-ink py-10 text-rice md:py-14">
      <div className="museum-container space-y-6">
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-museumGold">Access</p>
                  <h2 className="serif-title mt-1 text-2xl font-normal">{t.adminKey}</h2>
                </div>
                <Badge className={isAuthenticated ? "" : "border-rice/20 bg-rice/8 text-rice/54"}>
                  {isAuthenticated ? t.ready : t.locked}
                </Badge>
              </div>

              <form onSubmit={login} className="space-y-3">
                <Input
                  type="password"
                  value={adminKey}
                  onChange={(event) => setAdminKey(event.target.value)}
                  placeholder={t.adminKey}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    <Lock className="size-4" />
                    {t.login}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={logout}>
                    <LogOut className="size-4" />
                    {t.logout}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label={t.assets} value={total} icon={<Library className="size-5" />} />
            <MetricCard label={t.imageAssets} value={imageCount} icon={<ImageIcon className="size-5" />} />
            <MetricCard label={t.videoAssets} value={videoCount} icon={<Video className="size-5" />} />
          </div>
        </div>

        <Card>
          <CardContent className="space-y-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-museumGold">Upload</p>
                <h2 className="serif-title mt-1 text-3xl font-normal">{t.uploadTitle}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-rice/58">{t.uploadDescription}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void uploadQueuedImages()}
                  disabled={!isAuthenticated || isUploading || uploadQueue.length === 0}
                >
                  {isUploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                  {t.uploadAll}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setUploadQueue([])}
                  disabled={isUploading || uploadQueue.length === 0}
                >
                  <X className="size-4" />
                  {t.clearQueue}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div
                role="button"
                tabIndex={0}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`grid min-h-52 place-items-center rounded-md border border-dashed p-6 text-center transition ${
                  isDragging
                    ? "border-museumGold bg-museumGold/10"
                    : "border-museumGold/26 bg-rice/[0.035]"
                }`}
              >
                <div className="max-w-md">
                  <div className="mx-auto grid size-14 place-items-center rounded-md border border-museumGold/28 bg-museumGold/10 text-museumGold">
                    <UploadCloud className="size-7" />
                  </div>
                  <p className="mt-4 text-sm text-rice/68">JPG / PNG / WEBP</p>
                  <label className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-museumGold px-4 text-sm font-medium text-ink transition hover:bg-museumGold/88">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="sr-only"
                      onChange={(event) => {
                        if (event.target.files) {
                          addFilesToQueue(event.target.files);
                          event.target.value = "";
                        }
                      }}
                    />
                    {t.chooseImages}
                  </label>
                </div>
              </div>

              <div className="grid gap-3 self-start">
                <label className="block text-sm text-rice/62">
                  <span>{t.uploadProject}</span>
                  <select
                    className="mt-2 h-11 w-full rounded-md border border-museumGold/22 bg-ink px-3 text-sm text-rice"
                    value={uploadHeritageId}
                    onChange={(event) => setUploadHeritageId(event.target.value)}
                  >
                    {heritageOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm text-rice/62">
                  <span>{t.uploadRole}</span>
                  <select
                    className="mt-2 h-11 w-full rounded-md border border-museumGold/22 bg-ink px-3 text-sm text-rice"
                    value={uploadRole}
                    onChange={(event) => setUploadRole(event.target.value as typeof uploadRole)}
                  >
                    <option value="gallery">Gallery</option>
                    <option value="cover">Cover</option>
                    <option value="hero">Hero</option>
                    <option value="poster">Poster</option>
                  </select>
                </label>
              </div>
            </div>

            {uploadQueue.length > 0 ? (
              <div className="grid gap-2">
                {uploadQueue.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-md border border-rice/10 bg-ink/48 p-3 text-sm md:grid-cols-[1fr_auto]"
                  >
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
                      </div>
                      <p className="mt-2 text-xs text-rice/48">
                        {item.message} · {formatFileSize(item.originalSize)}
                        {item.compressedSize ? ` → ${formatFileSize(item.compressedSize)}` : ""}
                        {item.thumbnailSize ? ` · thumb ${formatFileSize(item.thumbnailSize)}` : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeUploadItem(item.id)}
                      disabled={isUploading}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <VideoUploadPanel
          locale={locale}
          adminKey={adminKey}
          isAuthenticated={isAuthenticated}
          heritageOptions={heritageOptions}
          onUploaded={() => loadAssets()}
        />

        <Card>
          <CardContent className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_240px_auto_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-rice/36" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t.search}
                  className="pl-9"
                />
              </label>
              <select
                className="h-11 rounded-md border border-museumGold/22 bg-ink px-3 text-sm text-rice"
                value={mediaType}
                onChange={(event) => setMediaType(event.target.value as MediaTypeFilter)}
              >
                <option value="all">{t.allMedia}</option>
                <option value="image">{t.images}</option>
                <option value="video">{t.videos}</option>
              </select>
              <select
                className="h-11 rounded-md border border-museumGold/22 bg-ink px-3 text-sm text-rice"
                value={heritageId}
                onChange={(event) => setHeritageId(event.target.value)}
              >
                <option value="all">{t.allProjects}</option>
                {heritageOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <Button type="button" variant="ghost" onClick={() => void loadAssets()} disabled={!isAuthenticated || isLoading}>
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                {t.refresh}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void deleteSelected()}
                disabled={!isAuthenticated || selectedIds.length === 0 || isDeleting}
              >
                <Trash2 className="size-4" />
                {t.deleteSelected}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rice/10 pt-4 text-sm text-rice/58">
              <span>{status}</span>
              <span>
                {t.selected}: <strong className="text-museumGold">{selectedIds.length}</strong>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hidden overflow-hidden lg:block">
          <div className="grid grid-cols-[48px_120px_minmax(220px,1.2fr)_minmax(180px,0.8fr)_120px_120px_100px_84px] border-b border-rice/10 px-5 py-3 text-xs uppercase tracking-[0.16em] text-rice/42">
            <button type="button" className="text-left" onClick={toggleAllVisible} aria-label="Select all">
              <input type="checkbox" checked={allVisibleSelected} readOnly />
            </button>
            <span>{t.type}</span>
            <span>{t.file}</span>
            <span>{t.project}</span>
            <span>{t.uploadedAt}</span>
            <span>{t.size}</span>
            <span>{t.role}</span>
            <span>{t.open}</span>
          </div>
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="grid grid-cols-[48px_120px_minmax(220px,1.2fr)_minmax(180px,0.8fr)_120px_120px_100px_84px] items-center border-b border-rice/8 px-5 py-3 text-sm last:border-b-0"
            >
              <input type="checkbox" checked={selectedSet.has(asset.id)} onChange={() => toggleSelected(asset.id)} />
              <div className="h-16 w-24 overflow-hidden rounded-md border border-rice/10 bg-rice/[0.04]">
                <MediaPreview asset={asset} />
              </div>
              <div className="min-w-0 pr-4">
                <p className="truncate font-medium text-rice">{asset.fileName}</p>
                <p className="mt-1 truncate text-xs text-rice/42">{asset.mimeType ?? asset.mediaType}</p>
              </div>
              <div className="min-w-0 pr-4">
                <p className="truncate text-rice/78">{asset.heritageItem?.name ?? t.unknownProject}</p>
                <p className="mt-1 truncate text-xs text-rice/42">{asset.heritageItem?.region ?? "-"}</p>
              </div>
              <span className="text-xs text-rice/56">{formatDate(asset.createdAt, locale)}</span>
              <span className="text-rice/66">{formatFileSize(asset.fileSize)}</span>
              <Badge>{roleLabels[asset.role] ?? asset.role}</Badge>
              <Button asChild size="sm" variant="ghost">
                <a href={asset.url} target="_blank" rel="noreferrer" aria-label={`${t.open} ${asset.fileName}`}>
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            </div>
          ))}
          {assets.length === 0 ? <div className="px-5 py-12 text-center text-sm text-rice/42">{t.empty}</div> : null}
        </Card>

        <div className="grid gap-4 lg:hidden">
          {assets.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="grid gap-4 sm:grid-cols-[160px_1fr]">
                <div className="aspect-video overflow-hidden rounded-md border border-rice/10 bg-rice/[0.04]">
                  <MediaPreview asset={asset} />
                </div>
                <div className="min-w-0 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-rice">{asset.fileName}</p>
                      <p className="mt-1 text-xs text-rice/42">{asset.heritageItem?.name ?? t.unknownProject}</p>
                    </div>
                    <input type="checkbox" checked={selectedSet.has(asset.id)} onChange={() => toggleSelected(asset.id)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-rice/54">
                    <span>{formatDate(asset.createdAt, locale)}</span>
                    <span>{formatFileSize(asset.fileSize)}</span>
                    <span>{asset.mimeType ?? asset.mediaType}</span>
                    <span>{roleLabels[asset.role] ?? asset.role}</span>
                  </div>
                  <Button asChild size="sm" variant="ghost">
                    <a href={asset.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" />
                      {t.open}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {assets.length === 0 ? <Card><CardContent className="py-12 text-center text-sm text-rice/42">{t.empty}</CardContent></Card> : null}
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-rice/42">{label}</p>
            <p className="serif-title mt-3 text-4xl font-normal text-rice">{value}</p>
          </div>
          <span className="grid size-11 place-items-center rounded-md border border-museumGold/28 bg-museumGold/10 text-museumGold">
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
