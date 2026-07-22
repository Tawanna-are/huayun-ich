"use client";

import { useState, type DragEvent } from "react";
import * as tus from "tus-js-client";
import { AlertCircle, CheckCircle2, Film, Loader2, UploadCloud, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  IMAGE_OUTPUT_MIME_TYPE,
  VIDEO_POSTER_WEBP_QUALITY,
  getStorageCacheControlForMimeType
} from "@/lib/admin/media-performance";
import {
  buildSupabaseStoragePublicUrl,
  buildVideoPosterStoragePath,
  buildVideoStoragePath,
  isSupportedVideoUpload
} from "@/lib/admin/video-upload";
import type { AppLocale } from "@/i18n/routing";

type HeritageOption = {
  id: string;
  name: string;
  slug: string;
  region: string;
};

type VideoUploadPanelProps = {
  locale: AppLocale;
  adminKey: string;
  isAuthenticated: boolean;
  heritageOptions: HeritageOption[];
  onUploaded: () => Promise<void> | void;
};

type VideoQueueItem = {
  id: string;
  file: File;
  status: "queued" | "poster" | "uploading" | "registering" | "done" | "error";
  progress: number;
  message: string;
  posterSize?: number;
};

const copy = {
  zh: {
    title: "视频上传",
    description: "拖拽 MP4 或 MOV 视频到这里。系统会自动生成视频封面，并通过分片上传写入 Supabase Storage。",
    chooseVideos: "选择视频",
    uploadAll: "上传视频队列",
    clear: "清空",
    project: "目标非遗项目",
    unsupported: "仅支持 MP4、MOV 视频。",
    selectProject: "请先选择目标非遗项目。",
    ready: "等待上传",
    generatingPoster: "生成视频封面",
    uploading: "分片上传中",
    registering: "登记媒体记录",
    uploaded: "上传完成",
    failed: "上传失败",
    locked: "请先登录后台"
  },
  en: {
    title: "Video upload",
    description: "Drag MP4 or MOV videos here. The CMS generates a poster image and uploads large files with resumable chunks to Supabase Storage.",
    chooseVideos: "Choose videos",
    uploadAll: "Upload video queue",
    clear: "Clear",
    project: "Target heritage item",
    unsupported: "Only MP4 and MOV videos are supported.",
    selectProject: "Select a heritage item before uploading.",
    ready: "Ready",
    generatingPoster: "Generating poster",
    uploading: "Chunk upload",
    registering: "Registering media",
    uploaded: "Uploaded",
    failed: "Upload failed",
    locked: "Sign in first"
  }
} satisfies Record<AppLocale, Record<string, string>>;

function formatFileSize(size: number) {
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

function loadVideoMetadata(file: File) {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => resolve(video);
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read video metadata."));
    };
    video.src = url;
  });
}

function captureVideoPoster(file: File) {
  return new Promise<{ posterFile: File; width: number; height: number }>(async (resolve, reject) => {
    let video: HTMLVideoElement | null = null;

    try {
      video = await loadVideoMetadata(file);
      const sourceUrl = video.src;
      const seekTime = Number.isFinite(video.duration) && video.duration > 2 ? 1 : 0;
      let settled = false;

      const drawPoster = () => {
        if (settled) {
          return;
        }

        settled = true;
        try {
          const width = video?.videoWidth || 1280;
          const height = video?.videoHeight || 720;
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context || !video) {
            throw new Error("Canvas is not available.");
          }

          canvas.width = width;
          canvas.height = height;
          context.drawImage(video, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(sourceUrl);

              if (!blob) {
                reject(new Error("Failed to generate video poster."));
                return;
              }

              resolve({
                posterFile: new File([blob], `${file.name.replace(/\.(mp4|mov)$/i, "")}-poster.webp`, {
                  type: IMAGE_OUTPUT_MIME_TYPE
                }),
                width,
                height
              });
            },
            IMAGE_OUTPUT_MIME_TYPE,
            VIDEO_POSTER_WEBP_QUALITY
          );
        } catch (error) {
          URL.revokeObjectURL(sourceUrl);
          reject(error);
        }
      };

      video.onseeked = drawPoster;
      video.onloadeddata = () => {
        if (seekTime === 0) {
          drawPoster();
        }
      };

      if (seekTime > 0) {
        video.currentTime = seekTime;
      } else if (video.readyState >= 2) {
        drawPoster();
      } else {
        video.load();
      }
    } catch (error) {
      reject(error);
    }
  });
}

function uploadWithTus({
  file,
  storagePath,
  adminKey,
  onProgress
}: {
  file: File;
  storagePath: string;
  adminKey: string;
  onProgress: (progress: number) => void;
}) {
  return new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: "/api/admin/media/tus",
      chunkSize: 6 * 1024 * 1024,
      retryDelays: [0, 3000, 5000, 10000],
      removeFingerprintOnSuccess: true,
      headers: {
        "x-admin-key": adminKey,
        "x-upsert": "false"
      },
      metadata: {
        bucketName: "heritage-media",
        objectName: storagePath,
        contentType: file.type,
        cacheControl: getStorageCacheControlForMimeType(file.type)
      },
      onError: reject,
      onProgress: (bytesUploaded, bytesTotal) => {
        onProgress(bytesTotal > 0 ? Math.round((bytesUploaded / bytesTotal) * 100) : 0);
      },
      onSuccess: () => resolve()
    });

    upload
      .findPreviousUploads()
      .then((previousUploads) => {
        if (previousUploads.length > 0) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }

        upload.start();
      })
      .catch(() => upload.start());
  });
}

export function VideoUploadPanel({
  locale,
  adminKey,
  isAuthenticated,
  heritageOptions,
  onUploaded
}: VideoUploadPanelProps) {
  const t = copy[locale];
  const [queue, setQueue] = useState<VideoQueueItem[]>([]);
  const [heritageId, setHeritageId] = useState(heritageOptions[0]?.id ?? "");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const uploadTarget = heritageOptions.find((item) => item.id === heritageId);

  function updateItem(id: string, patch: Partial<VideoQueueItem>) {
    setQueue((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addFiles(files: FileList | File[]) {
    const incomingFiles = Array.from(files);
    const validItems = incomingFiles
      .filter(isSupportedVideoUpload)
      .map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        status: "queued" as const,
        progress: 0,
        message: t.ready
      }));

    setQueue((current) => [...current, ...validItems]);

    if (validItems.length !== incomingFiles.length) {
      setQueue((current) => [
        ...current,
        {
          id: `error-${crypto.randomUUID()}`,
          file: new File([], t.unsupported, { type: "text/plain" }),
          status: "error",
          progress: 0,
          message: t.unsupported
        }
      ]);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  async function uploadVideoItem(item: VideoQueueItem) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
    }

    updateItem(item.id, { status: "poster", message: t.generatingPoster, progress: 3 });
    const poster = await captureVideoPoster(item.file);
    const videoPath = buildVideoStoragePath(heritageId, Date.now(), item.file.name);
    const posterPath = buildVideoPosterStoragePath(videoPath);
    const fileName = videoPath.split("/").pop() ?? item.file.name;

    updateItem(item.id, { status: "uploading", message: t.uploading, posterSize: poster.posterFile.size });
    await uploadWithTus({
      file: item.file,
      storagePath: videoPath,
      adminKey,
      onProgress: (progress) => updateItem(item.id, { progress: Math.min(90, Math.max(4, Math.round(progress * 0.9))) })
    });
    await uploadWithTus({
      file: poster.posterFile,
      storagePath: posterPath,
      adminKey,
      onProgress: (progress) => updateItem(item.id, { progress: 90 + Math.round(progress * 0.1) })
    });

    updateItem(item.id, { status: "registering", message: t.registering, progress: 100 });
    const response = await fetch("/api/admin/media", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey
      },
      body: JSON.stringify({
        uploadMode: "resumable-video",
        heritageId,
        url: buildSupabaseStoragePublicUrl(supabaseUrl, "heritage-media", videoPath),
        storagePath: videoPath,
        fileName,
        fileSize: item.file.size,
        mimeType: item.file.type,
        thumbnailUrl: buildSupabaseStoragePublicUrl(supabaseUrl, "heritage-media", posterPath),
        thumbnailStoragePath: posterPath,
        originalFileName: item.file.name,
        width: poster.width,
        height: poster.height,
        alt: uploadTarget?.name ?? item.file.name,
        caption: "CMS video upload"
      })
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      throw new Error(payload.error ?? "Failed to register video metadata.");
    }

    updateItem(item.id, { status: "done", message: t.uploaded, progress: 100 });
  }

  async function uploadQueue() {
    if (!isAuthenticated) {
      return;
    }

    if (!heritageId) {
      setQueue((current) => [
        ...current,
        {
          id: `error-${crypto.randomUUID()}`,
          file: new File([], t.selectProject, { type: "text/plain" }),
          status: "error",
          progress: 0,
          message: t.selectProject
        }
      ]);
      return;
    }

    const pendingItems = queue.filter((item) => item.status === "queued" || item.status === "error").filter((item) => item.file.size > 0);

    setIsUploading(true);

    for (const item of pendingItems) {
      try {
        await uploadVideoItem(item);
      } catch (error) {
        updateItem(item.id, {
          status: "error",
          message: error instanceof Error ? error.message : t.failed
        });
      }
    }

    setIsUploading(false);
    await onUploaded();
  }

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-museumGold">Video</p>
            <h2 className="serif-title mt-1 text-3xl font-normal">{t.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-rice/58">{t.description}</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void uploadQueue()}
              disabled={!isAuthenticated || isUploading || queue.length === 0}
            >
              {isUploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
              {t.uploadAll}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setQueue([])} disabled={isUploading || queue.length === 0}>
              <X className="size-4" />
              {t.clear}
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
              isDragging ? "border-museumGold bg-museumGold/10" : "border-museumGold/26 bg-rice/[0.035]"
            }`}
          >
            <div className="max-w-md">
              <div className="mx-auto grid size-14 place-items-center rounded-md border border-museumGold/28 bg-museumGold/10 text-museumGold">
                <Film className="size-7" />
              </div>
              <p className="mt-4 text-sm text-rice/68">MP4 / MOV</p>
              <label className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-museumGold px-4 text-sm font-medium text-ink transition hover:bg-museumGold/88">
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,.mp4,.mov"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    if (event.target.files) {
                      addFiles(event.target.files);
                      event.target.value = "";
                    }
                  }}
                />
                {t.chooseVideos}
              </label>
            </div>
          </div>

          <label className="block self-start text-sm text-rice/62">
            <span>{t.project}</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-museumGold/22 bg-ink px-3 text-sm text-rice"
              value={heritageId}
              onChange={(event) => setHeritageId(event.target.value)}
            >
              {heritageOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {!isAuthenticated ? <span className="mt-2 block text-xs text-cinnabar">{t.locked}</span> : null}
          </label>
        </div>

        {queue.length > 0 ? (
          <div className="grid gap-2">
            {queue.map((item) => (
              <div key={item.id} className="rounded-md border border-rice/10 bg-ink/48 p-3 text-sm">
                <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      {item.status === "done" ? (
                        <CheckCircle2 className="size-4 shrink-0 text-celadon" />
                      ) : item.status === "error" ? (
                        <AlertCircle className="size-4 shrink-0 text-cinnabar" />
                      ) : item.status === "poster" || item.status === "uploading" || item.status === "registering" ? (
                        <Loader2 className="size-4 shrink-0 animate-spin text-museumGold" />
                      ) : (
                        <Film className="size-4 shrink-0 text-museumGold" />
                      )}
                      <span className="truncate font-medium text-rice">{item.file.name}</span>
                      <Badge>{formatFileSize(item.file.size)}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-rice/48">
                      {item.message}
                      {item.posterSize ? ` · poster ${formatFileSize(item.posterSize)}` : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setQueue((current) => current.filter((candidate) => candidate.id !== item.id))}
                    disabled={isUploading}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-rice/10">
                  <div className="h-full bg-museumGold transition-all" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
