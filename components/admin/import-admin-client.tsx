"use client";

import { useEffect, useMemo, useState } from "react";
import { DatabaseZap, FileSpreadsheet, ImageUp, Loader2, UploadCloud, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AppLocale } from "@/i18n/routing";

type ImportSummary = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  createRows: number;
  updateRows: number;
};

type ImportAdminClientProps = {
  locale: AppLocale;
};

const adminStorageKey = "huayun-admin-key";

const copy = {
  zh: {
    title: "Excel / CSV 非遗项目导入",
    description: "支持 Excel 与 CSV。建议一次最多 1000 条，提交时系统按 100 条分批写入。",
    mediaTitle: "批量图片 / 批量视频上传",
    mediaDescription: "文件名格式：heritage-slug__gallery__filename.webp，系统会自动关联媒体资源。",
    chooseFile: "选择 Excel 或 CSV",
    preview: "预览校验",
    commit: "确认导入",
    chooseMedia: "选择批量图片或批量视频",
    uploadMedia: "上传媒体",
    total: "总行数",
    valid: "有效",
    invalid: "错误",
    duplicate: "重复",
    create: "新增",
    update: "更新",
    noFile: "请先选择导入文件。",
    noMedia: "请先选择媒体文件。",
    done: "操作完成。"
  },
  en: {
    title: "Excel / CSV heritage import",
    description: "Supports Excel and CSV. Import up to 1000 rows; commits are written in 100-row batches.",
    mediaTitle: "Batch image / batch video upload",
    mediaDescription: "Filename format: heritage-slug__gallery__filename.webp. Media assets are linked automatically.",
    chooseFile: "Choose Excel or CSV",
    preview: "Preview validation",
    commit: "Commit import",
    chooseMedia: "Choose batch images or videos",
    uploadMedia: "Upload media",
    total: "Total",
    valid: "Valid",
    invalid: "Errors",
    duplicate: "Duplicate",
    create: "Create",
    update: "Update",
    noFile: "Choose an import file first.",
    noMedia: "Choose media files first.",
    done: "Operation complete."
  }
} as const;

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-museumGold/14 bg-ink/42 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-rice/42">{label}</p>
      <p className="serif-title mt-2 text-3xl text-rice">{value}</p>
    </div>
  );
}

export function ImportAdminClient({ locale }: ImportAdminClientProps) {
  const t = copy[locale];
  const [adminKey, setAdminKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [status, setStatus] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const mediaLabel = useMemo(() => mediaFiles.map((item) => item.name).join(", "), [mediaFiles]);

  useEffect(() => {
    setAdminKey(window.localStorage.getItem(adminStorageKey) ?? "");
  }, []);

  async function sendImportRequest(endpoint: string) {
    if (!file) {
      setStatus(t.noFile);
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    setIsWorking(true);
    setStatus("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "x-admin-key": adminKey
        },
        body: formData
      });
      const payload = (await response.json()) as { summary?: ImportSummary; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Import request failed.");
      }

      if (payload.summary) {
        setSummary(payload.summary);
      }

      setStatus(t.done);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setIsWorking(false);
    }
  }

  async function uploadMedia() {
    if (!mediaFiles.length) {
      setStatus(t.noMedia);
      return;
    }

    const formData = new FormData();
    mediaFiles.forEach((item) => formData.append("files", item));
    setIsWorking(true);
    setStatus("");

    try {
      const response = await fetch("/api/admin/import/media", {
        method: "POST",
        headers: {
          "x-admin-key": adminKey
        },
        body: formData
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Media import failed.");
      }

      setStatus(t.done);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Media import failed.");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <section className="bg-ink py-12 text-rice md:py-16">
      <div className="museum-container grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <FileSpreadsheet className="mt-1 size-6 text-museumGold" />
              <div>
                <h2 className="serif-title text-3xl font-normal">{t.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-rice/58">{t.description}</p>
              </div>
            </div>
            <div className="mt-6 rounded-lg border border-dashed border-museumGold/24 bg-rice/[0.035] p-5">
              <label className="block text-sm text-rice/64">
                <span>{t.chooseFile}</span>
                <input
                  className="mt-3 block w-full rounded-md border border-museumGold/20 bg-ink/72 p-3 text-sm text-rice"
                  type="file"
                  accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
              </label>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isWorking}
                  onClick={() => void sendImportRequest("/api/admin/import/heritage/preview")}
                >
                  {isWorking ? <Loader2 className="size-4 animate-spin" /> : <DatabaseZap className="size-4" />}
                  {t.preview}
                </Button>
                <Button
                  type="button"
                  disabled={isWorking}
                  onClick={() => void sendImportRequest("/api/admin/import/heritage/commit")}
                >
                  {isWorking ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                  {t.commit}
                </Button>
              </div>
            </div>
            {summary ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <SummaryCard label={t.total} value={summary.totalRows} />
                <SummaryCard label={t.valid} value={summary.validRows} />
                <SummaryCard label={t.invalid} value={summary.invalidRows} />
                <SummaryCard label={t.duplicate} value={summary.duplicateRows} />
                <SummaryCard label={t.create} value={summary.createRows} />
                <SummaryCard label={t.update} value={summary.updateRows} />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <ImageUp className="mt-1 size-6 text-museumGold" />
              <div>
                <h2 className="serif-title text-3xl font-normal">{t.mediaTitle}</h2>
                <p className="mt-2 text-sm leading-7 text-rice/58">{t.mediaDescription}</p>
              </div>
            </div>
            <div className="mt-6 rounded-lg border border-dashed border-museumGold/24 bg-rice/[0.035] p-5">
              <label className="block text-sm text-rice/64">
                <span>{t.chooseMedia}</span>
                <input
                  className="mt-3 block w-full rounded-md border border-museumGold/20 bg-ink/72 p-3 text-sm text-rice"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                  multiple
                  onChange={(event) => setMediaFiles(Array.from(event.target.files ?? []))}
                />
              </label>
              {mediaLabel ? <p className="mt-3 line-clamp-2 text-xs text-rice/42">{mediaLabel}</p> : null}
              <Button type="button" className="mt-5" disabled={isWorking} onClick={() => void uploadMedia()}>
                {isWorking ? <Loader2 className="size-4 animate-spin" /> : <Video className="size-4" />}
                {t.uploadMedia}
              </Button>
            </div>
          </CardContent>
        </Card>
        {status ? <p className="xl:col-span-2 text-sm text-museumGold">{status}</p> : null}
      </div>
    </section>
  );
}
