"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode, type TextareaHTMLAttributes } from "react";
import {
  Cloud,
  FileText,
  ImageUp,
  Layers3,
  Lock,
  LogOut,
  Megaphone,
  Plus,
  Save,
  Search,
  Trash2,
  UploadCloud
} from "lucide-react";
import { ProjectMediaManager } from "@/components/admin/project-media-manager";
import { HomepagePromotionsAdmin } from "@/components/admin/homepage-promotions-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import {
  formatTimelineText,
  validateCategoryPayload,
  validateHeritagePayload
} from "@/lib/admin/validation";
import { campaignDefinitions, type CampaignSlug } from "@/lib/content/multichannel-content";
import type {
  CategoryRow,
  FeishuSyncLogRow,
  HeritageItemSelectRow,
  HeritageMediaRole,
  MediaAssetRole
} from "@/lib/types/database";
import type { HeritageCategory, HeritageItem } from "@/lib/types/heritage";

type AdminTab = "heritage" | "categories" | "media" | "campaigns" | "promotions";

type HeritageFormState = {
  id?: string;
  name: string;
  slug: string;
  englishName: string;
  categorySlug: string;
  summary: string;
  region: string;
  province: string;
  city: string;
  inscriptionYear: string;
  latitude: string;
  longitude: string;
  mapX: string;
  mapY: string;
  imageUrl: string;
  heroImageUrl: string;
  videoUrl: string;
  history: string;
  timeline: string;
  tags: string;
  relatedSlugs: string;
  inheritorName: string;
  inheritorTitle: string;
  inheritorBio: string;
  inheritorImageUrl: string;
  published: boolean;
  featured: boolean;
};

type CategoryFormState = {
  id?: string;
  name: string;
  slug: string;
  englishName: string;
  summary: string;
  color: string;
  sortOrder: string;
};

type AdminContentResponse = {
  items: HeritageItemSelectRow[];
  categories: CategoryRow[];
};

type FeishuSyncResponse = {
  insertedCount: number;
  updatedCount: number;
  deletedCount: number;
  skippedCount: number;
  failedCount: number;
  message: string;
  error?: string;
};

type CampaignConfigFormState = {
  slug: CampaignSlug;
  title: string;
  englishTitle: string;
  summary: string;
  englishSummary: string;
  description: string;
  englishDescription: string;
  heroImage: string;
  accent: string;
  prioritySlugs: string;
  keywords: string;
  published: boolean;
  sortOrder: string;
};

const adminStorageKey = "huayun-admin-key";

const emptyHeritageForm: HeritageFormState = {
  name: "",
  slug: "",
  englishName: "",
  categorySlug: "traditional-craft",
  summary: "",
  region: "",
  province: "",
  city: "",
  inscriptionYear: "",
  latitude: "",
  longitude: "",
  mapX: "",
  mapY: "",
  imageUrl: "",
  heroImageUrl: "",
  videoUrl: "",
  history: "",
  timeline: "",
  tags: "",
  relatedSlugs: "",
  inheritorName: "",
  inheritorTitle: "",
  inheritorBio: "",
  inheritorImageUrl: "",
  published: true,
  featured: false
};

const emptyCategoryForm: CategoryFormState = {
  name: "",
  slug: "",
  englishName: "",
  summary: "",
  color: "#C8A96A",
  sortOrder: "0"
};

function rowCategory(row: HeritageItemSelectRow) {
  return Array.isArray(row.category) ? row.category[0] : row.category;
}

function findMediaUrl(row: HeritageItemSelectRow, role: HeritageMediaRole) {
  const assetRole: MediaAssetRole = role === "video" ? "main_video" : role;
  return (
    row.media_assets?.find((asset) => asset.asset_role === assetRole)?.file_url ??
    row.heritage_media?.find((media) => media.role === role)?.url ??
    ""
  );
}

function rowToHeritageForm(row: HeritageItemSelectRow): HeritageFormState {
  const inheritor = row.inheritors?.[0];
  const category = rowCategory(row);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    englishName: row.english_name,
    categorySlug: category?.slug ?? "traditional-craft",
    summary: row.summary,
    region: row.region,
    province: row.province,
    city: row.city,
    inscriptionYear: row.inscription_year ? String(row.inscription_year) : "",
    latitude: row.latitude ? String(row.latitude) : "",
    longitude: row.longitude ? String(row.longitude) : "",
    mapX: row.map_x ? String(row.map_x) : "",
    mapY: row.map_y ? String(row.map_y) : "",
    imageUrl: findMediaUrl(row, "cover"),
    heroImageUrl: findMediaUrl(row, "hero"),
    videoUrl: findMediaUrl(row, "video"),
    history: (row.history ?? []).join("\n"),
    timeline: formatTimelineText(Array.isArray(row.timeline) ? row.timeline : []),
    tags: (row.tags ?? []).join(", "),
    relatedSlugs: (row.related_slugs ?? []).join(", "),
    inheritorName: inheritor?.name ?? "",
    inheritorTitle: inheritor?.title ?? "",
    inheritorBio: inheritor?.bio ?? "",
    inheritorImageUrl: inheritor?.image_url ?? "",
    published: row.published,
    featured: row.featured
  };
}

function categoryToForm(category: CategoryRow | HeritageCategory): CategoryFormState {
  return {
    id: "id" in category ? category.id : undefined,
    name: category.name,
    slug: category.slug,
    englishName: "english_name" in category ? category.english_name : category.englishName,
    summary: category.summary,
    color: category.color,
    sortOrder: "sort_order" in category ? String(category.sort_order) : "0"
  };
}

function normalizeCategories(categories: Array<CategoryRow | HeritageCategory>): CategoryRow[] {
  return categories.map((category, index) => ({
    id: "id" in category ? category.id : `initial-${category.slug}`,
    slug: category.slug,
    name: category.name,
    english_name: "english_name" in category ? category.english_name : category.englishName,
    summary: category.summary,
    color: category.color,
    sort_order: "sort_order" in category ? category.sort_order : index * 10,
    created_at: "created_at" in category ? category.created_at : new Date(0).toISOString()
  }));
}

function fieldClass(hasError?: boolean) {
  return hasError ? "border-cinnabar/70 focus-visible:ring-cinnabar/70" : "";
}

function normalizeCampaignSlug(slug: unknown): CampaignSlug {
  const candidate = String(slug ?? "");
  return campaignDefinitions.some((campaign) => campaign.slug === candidate)
    ? (candidate as CampaignSlug)
    : campaignDefinitions[0].slug;
}

function campaignToForm(campaign: (typeof campaignDefinitions)[number], index: number): CampaignConfigFormState {
  return {
    slug: campaign.slug,
    title: campaign.title,
    englishTitle: campaign.englishTitle,
    summary: campaign.summary,
    englishSummary: campaign.englishSummary,
    description: campaign.description,
    englishDescription: campaign.englishDescription,
    heroImage: campaign.heroImage,
    accent: campaign.accent,
    prioritySlugs: campaign.prioritySlugs.join(", "),
    keywords: campaign.keywords.join(", "),
    published: true,
    sortOrder: String(index * 10)
  };
}

function campaignConfigToForm(campaign: CampaignConfigFormState | Record<string, unknown>): CampaignConfigFormState {
  return {
    slug: normalizeCampaignSlug(campaign.slug),
    title: String(campaign.title ?? ""),
    englishTitle: String(campaign.englishTitle ?? ""),
    summary: String(campaign.summary ?? ""),
    englishSummary: String(campaign.englishSummary ?? ""),
    description: String(campaign.description ?? ""),
    englishDescription: String(campaign.englishDescription ?? ""),
    heroImage: String(campaign.heroImage ?? "/assets/hero-museum.png"),
    accent: String(campaign.accent ?? "#C8A96A"),
    prioritySlugs: Array.isArray(campaign.prioritySlugs)
      ? campaign.prioritySlugs.join(", ")
      : String(campaign.prioritySlugs ?? ""),
    keywords: Array.isArray(campaign.keywords) ? campaign.keywords.join(", ") : String(campaign.keywords ?? ""),
    published: Boolean(campaign.published ?? true),
    sortOrder: String(campaign.sortOrder ?? 0)
  };
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function HeritageAdminClient({
  locale,
  items,
  categories,
  adminRows
}: {
  locale: AppLocale;
  items: HeritageItem[];
  categories: HeritageCategory[];
  adminRows: HeritageItemSelectRow[];
}) {
  const initialCategoryRows = useMemo(() => normalizeCategories(categories), [categories]);
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tab, setTab] = useState<AdminTab>("heritage");
  const [rows, setRows] = useState<HeritageItemSelectRow[]>(adminRows);
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>(initialCategoryRows);
  const [heritageForm, setHeritageForm] = useState<HeritageFormState>(
    adminRows[0] ? rowToHeritageForm(adminRows[0]) : emptyHeritageForm
  );
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(
    initialCategoryRows[0] ? categoryToForm(initialCategoryRows[0]) : emptyCategoryForm
  );
  const [campaignForms, setCampaignForms] = useState<CampaignConfigFormState[]>(
    campaignDefinitions.map(campaignToForm)
  );
  const [selectedCampaignSlug, setSelectedCampaignSlug] = useState(campaignDefinitions[0]?.slug ?? "four-embroideries");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feishuLogs, setFeishuLogs] = useState<FeishuSyncLogRow[]>([]);
  const [isFeishuSyncing, setIsFeishuSyncing] = useState(false);

  useEffect(() => {
    const storedKey = window.localStorage.getItem(adminStorageKey);

    if (storedKey) {
      setAdminKey(storedKey);
    }
  }, []);

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) => {
      return [row.name, row.english_name, row.slug, row.region, row.province, row.city]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [query, rows]);

  const selectedRow = useMemo(
    () => rows.find((row) => row.id === heritageForm.id || row.slug === heritageForm.slug),
    [heritageForm.id, heritageForm.slug, rows]
  );
  const selectedCampaign = useMemo(
    () => campaignForms.find((campaign) => campaign.slug === selectedCampaignSlug) ?? campaignForms[0],
    [campaignForms, selectedCampaignSlug]
  );

  function updateHeritageField(field: keyof HeritageFormState, value: string | boolean) {
    setHeritageForm((current) => ({ ...current, [field]: value }));
  }

  function updateCategoryField(field: keyof CategoryFormState, value: string) {
    setCategoryForm((current) => ({ ...current, [field]: value }));
  }

  function updateCampaignField(field: keyof CampaignConfigFormState, value: string | boolean) {
    setCampaignForms((current) =>
      current.map((campaign) =>
        campaign.slug === selectedCampaignSlug
          ? {
              ...campaign,
              [field]: value
            }
          : campaign
      )
    );
  }

  async function refreshContent(key = adminKey) {
    const response = await fetch("/api/admin/content", {
      cache: "no-store",
      headers: {
        "x-admin-key": key
      }
    });
    const payload = (await response.json()) as Partial<AdminContentResponse> & { error?: string };

    if (!response.ok) {
      throw new Error(payload.error ?? "刷新后台内容失败。");
    }

    setRows(payload.items ?? []);
    setCategoryRows(payload.categories ?? []);
  }

  async function selectTab(nextTab: AdminTab) {
    setTab(nextTab);
    if (nextTab !== "media" || !isAuthenticated) return;

    try {
      await refreshContent();
    } catch (error) {
      setStatus(error instanceof Error ? `媒体列表刷新失败：${error.message}` : "媒体列表刷新失败。");
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("正在校验管理员身份...");

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: {
        "x-admin-key": adminKey
      }
    });

    if (!response.ok) {
      setIsAuthenticated(false);
      setStatus("Admin Key 无效，请检查环境变量 ADMIN_API_KEY。");
      return;
    }

    window.localStorage.setItem(adminStorageKey, adminKey);
    setIsAuthenticated(true);
    await refreshContent(adminKey);
    await loadFeishuSyncLogs(adminKey);
    setStatus("已登录，可以维护全部非遗内容。");
  }

  function logout() {
    window.localStorage.removeItem(adminStorageKey);
    setIsAuthenticated(false);
    setStatus("已退出后台。");
  }

  async function saveHeritage() {
    const validation = validateHeritagePayload(heritageForm);

    if (!validation.ok) {
      setErrors(validation.errors);
      setStatus("请先修正表单中的错误。");
      return;
    }

    setErrors({});
    setStatus("正在保存非遗项目...");
    const endpoint = heritageForm.id
      ? `/api/admin/heritage/${encodeURIComponent(heritageForm.id)}`
      : "/api/admin/heritage";
    const method = heritageForm.id ? "PATCH" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey
      },
      body: JSON.stringify(heritageForm)
    });
    const payload = await response.json();

    if (!response.ok) {
      setErrors(payload.errors ?? {});
      setStatus(payload.error ?? "保存失败。");
      return;
    }

    await refreshContent();
    setStatus("非遗项目已保存。刷新前台页面即可查看最新内容。");
  }

  async function submitHeritage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveHeritage();
  }

  async function deleteHeritage() {
    if (!heritageForm.id) {
      setStatus("请先选择一个项目。");
      return;
    }

    setStatus("正在删除非遗项目...");
    const response = await fetch(`/api/admin/heritage/${encodeURIComponent(heritageForm.id)}`, {
      method: "DELETE",
      headers: {
        "x-admin-key": adminKey
      }
    });
    const payload = await response.json();

    if (!response.ok) {
      setStatus(payload.error ?? "删除失败。");
      return;
    }

    setHeritageForm(emptyHeritageForm);
    await refreshContent();
    setStatus("非遗项目已删除。");
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateCategoryPayload(categoryForm);

    if (!validation.ok) {
      setErrors(validation.errors);
      setStatus("请先修正分类表单。");
      return;
    }

    setErrors({});
    setStatus("正在保存分类...");
    const endpoint = categoryForm.id
      ? `/api/admin/categories/${encodeURIComponent(categoryForm.id)}`
      : "/api/admin/categories";
    const method = categoryForm.id ? "PATCH" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey
      },
      body: JSON.stringify(categoryForm)
    });
    const payload = await response.json();

    if (!response.ok) {
      setErrors(payload.errors ?? {});
      setStatus(payload.error ?? "分类保存失败。");
      return;
    }

    await refreshContent();
    setStatus("分类已保存。");
  }

  async function deleteCategory() {
    if (!categoryForm.id) {
      setStatus("请先选择一个分类。");
      return;
    }

    setStatus("正在删除分类...");
    const response = await fetch(`/api/admin/categories/${encodeURIComponent(categoryForm.id)}`, {
      method: "DELETE",
      headers: {
        "x-admin-key": adminKey
      }
    });
    const payload = await response.json();

    if (!response.ok) {
      setStatus(payload.error ?? "删除失败，可能仍有项目引用该分类。");
      return;
    }

    setCategoryForm(emptyCategoryForm);
    await refreshContent();
    setStatus("分类已删除。");
  }

  async function loadCampaignConfigs() {
    setStatus("正在读取活动配置...");
    const response = await fetch("/api/admin/campaigns", {
      headers: {
        "x-admin-key": adminKey
      }
    });
    const payload = (await response.json()) as { campaigns?: Array<Record<string, unknown>>; error?: string };

    if (!response.ok) {
      setStatus(payload.error ?? "活动配置读取失败，请确认已执行 campaign_configs 迁移。");
      return;
    }

    const nextCampaigns = (payload.campaigns ?? []).map(campaignConfigToForm);
    setCampaignForms(nextCampaigns.length ? nextCampaigns : campaignDefinitions.map(campaignToForm));
    setStatus("活动配置已加载。");
  }

  async function saveCampaignConfig() {
    if (!selectedCampaign) {
      setStatus("请先选择一个活动配置。");
      return;
    }

    setStatus("正在保存活动配置...");
    const response = await fetch(`/api/admin/campaigns/${encodeURIComponent(selectedCampaign.slug)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey
      },
      body: JSON.stringify({
        ...selectedCampaign,
        prioritySlugs: splitList(selectedCampaign.prioritySlugs),
        keywords: splitList(selectedCampaign.keywords),
        sortOrder: Number(selectedCampaign.sortOrder || 0)
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      setStatus(payload.error ?? "活动配置保存失败。");
      return;
    }

    setStatus("活动配置已保存。");
  }

  async function loadFeishuSyncLogs(key = adminKey) {
    const response = await fetch("/api/admin/feishu-sync/logs", {
      headers: {
        "x-admin-key": key
      }
    });
    const payload = (await response.json()) as { logs?: FeishuSyncLogRow[]; error?: string };

    if (!response.ok) {
      setStatus(payload.error ?? "飞书同步日志读取失败。");
      return;
    }

    setFeishuLogs(payload.logs ?? []);
  }

  async function syncFeishuNow() {
    setIsFeishuSyncing(true);
    setStatus("正在同步飞书多维表格...");

    const response = await fetch("/api/admin/feishu-sync", {
      method: "POST",
      headers: {
        "x-admin-key": adminKey
      }
    });
    const payload = (await response.json()) as FeishuSyncResponse;

    setIsFeishuSyncing(false);

    if (!response.ok) {
      setStatus(payload.error ?? "飞书同步失败。");
      await loadFeishuSyncLogs();
      return;
    }

    await refreshContent();
    await loadFeishuSyncLogs();
    setStatus(
      `飞书同步完成：新增 ${payload.insertedCount}，更新 ${payload.updatedCount}，删除 ${payload.deletedCount}，失败 ${payload.failedCount}。`
    );
  }

  const tabs: Array<{ id: AdminTab; label: string; icon: typeof FileText }> = [
    { id: "heritage", label: "非遗项目", icon: FileText },
    { id: "categories", label: "分类管理", icon: Layers3 },
    { id: "media", label: "图片/视频", icon: ImageUp },
    { id: "campaigns", label: "活动配置", icon: Megaphone },
    { id: "promotions", label: "首页广告", icon: Megaphone }
  ];

  return (
    <section className="bg-ink py-10 text-rice md:py-14">
      <div className="museum-container grid min-w-0 gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="min-w-0 space-y-4">
          <Card>
            <CardContent className="space-y-4">
              <form onSubmit={login}>
                <label className="block text-sm text-rice/62">
                  Admin Key
                  <Input
                    className="mt-2"
                    type="password"
                    value={adminKey}
                    onChange={(event) => setAdminKey(event.target.value)}
                    placeholder="ADMIN_API_KEY"
                  />
                </label>
                <div className="mt-4 flex gap-2">
                  <Button type="submit" size="sm">
                    <Lock className="size-4" />
                    登录
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={logout}>
                    <LogOut className="size-4" />
                    退出
                  </Button>
                </div>
              </form>
              <div className="flex items-center justify-between rounded-md border border-rice/10 bg-ink/48 px-3 py-2">
                <span className="text-sm text-rice/62">权限状态</span>
                <Badge className={isAuthenticated ? "" : "border-rice/20 bg-rice/8 text-rice/54"}>
                  {isAuthenticated ? "已认证" : "未登录"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-rice/36" />
                <Input
                  className="pl-9"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索项目、地区、slug"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm uppercase text-museumGold">项目</p>
                <Button type="button" size="sm" variant="ghost" onClick={() => setHeritageForm(emptyHeritageForm)}>
                  <Plus className="size-4" />
                  新增
                </Button>
              </div>
              <div className="mt-3 max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {visibleRows.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setHeritageForm(rowToHeritageForm(row))}
                    className="w-full rounded-md border border-rice/8 bg-ink/54 p-3 text-left transition hover:border-museumGold/42"
                  >
                    <span className="serif-title block text-xl">{row.name}</span>
                    <span className="mt-1 block text-xs text-rice/42">
                      {row.region} · {row.published ? "已发布" : "草稿"}
                      {row.featured ? " · 首页精选" : ""}
                    </span>
                  </button>
                ))}
                {visibleRows.length === 0 ? <p className="py-6 text-sm text-rice/42">暂无匹配项目。</p> : null}
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0 space-y-4">
          <div className="flex flex-col gap-2 rounded-lg border border-museumGold/18 bg-rice/[0.035] p-2 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    type="button"
                    variant={tab === item.id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => void selectTab(item.id)}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!isAuthenticated || isFeishuSyncing}
              onClick={() => void syncFeishuNow()}
            >
              <Cloud className="size-4" />
              {isFeishuSyncing ? "同步中" : "立即同步飞书"}
            </Button>
            <Button asChild type="button" variant="outline" size="sm">
              <Link href="/admin/import">
                <UploadCloud className="size-4" />
                批量导入
              </Link>
            </Button>
          </div>

          {status ? (
            <div className="rounded-md border border-museumGold/18 bg-rice/[0.045] p-3 text-sm text-rice/70">
              {status}
            </div>
          ) : null}

          {feishuLogs.length > 0 ? (
            <Card>
              <CardContent>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase text-museumGold">Feishu Sync</p>
                    <h2 className="serif-title mt-1 text-2xl font-normal">同步日志</h2>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => void loadFeishuSyncLogs()}>
                    <Search className="size-4" />
                    刷新
                  </Button>
                </div>
                <div className="grid gap-2">
                  {feishuLogs.map((log) => (
                    <div
                      key={log.id}
                      className="grid gap-2 rounded-md border border-rice/10 bg-ink/44 p-3 text-sm text-rice/62 md:grid-cols-[1.3fr_0.8fr_1.4fr]"
                    >
                      <span>{new Date(log.started_at).toLocaleString("zh-CN")}</span>
                      <span>
                        {log.status} · {log.source}
                      </span>
                      <span>
                        新增 {log.inserted_count} / 更新 {log.updated_count} / 删除 {log.deleted_count} / 失败{" "}
                        {log.failed_count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {tab === "heritage" ? (
            <form onSubmit={submitHeritage} className="space-y-4">
              <Card>
                <CardContent>
                  <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <p className="text-sm uppercase text-museumGold">{heritageForm.id ? "Edit" : "Create"}</p>
                      <h2 className="serif-title mt-1 text-3xl font-normal">非遗项目管理</h2>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">
                        <Save className="size-4" />
                        保存
                      </Button>
                      <Button type="button" variant="outline" onClick={deleteHeritage}>
                        <Trash2 className="size-4" />
                        删除
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="名称" error={errors.name}>
                      <Input
                        className={fieldClass(Boolean(errors.name))}
                        value={heritageForm.name}
                        onChange={(event) => updateHeritageField("name", event.target.value)}
                      />
                    </Field>
                    <Field label="Slug" error={errors.slug}>
                      <Input
                        className={fieldClass(Boolean(errors.slug))}
                        value={heritageForm.slug}
                        onChange={(event) => updateHeritageField("slug", event.target.value)}
                      />
                    </Field>
                    <Field label="英文名称" error={errors.englishName}>
                      <Input
                        value={heritageForm.englishName}
                        onChange={(event) => updateHeritageField("englishName", event.target.value)}
                      />
                    </Field>
                    <Field label="分类" error={errors.categorySlug}>
                      <select
                        className="h-11 w-full rounded-md border border-museumGold/22 bg-ink px-3 text-sm text-rice"
                        value={heritageForm.categorySlug}
                        onChange={(event) => updateHeritageField("categorySlug", event.target.value)}
                      >
                        {categoryRows.map((category) => (
                          <option key={category.id} value={category.slug}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="所属地区" error={errors.region}>
                      <Input
                        value={heritageForm.region}
                        onChange={(event) => updateHeritageField("region", event.target.value)}
                      />
                    </Field>
                    <Field label="省份" error={errors.province}>
                      <Input
                        value={heritageForm.province}
                        onChange={(event) => updateHeritageField("province", event.target.value)}
                      />
                    </Field>
                    <Field label="城市" error={errors.city}>
                      <Input
                        value={heritageForm.city}
                        onChange={(event) => updateHeritageField("city", event.target.value)}
                      />
                    </Field>
                  </div>

                  <Field className="mt-4" label="简介" error={errors.summary}>
                    <Textarea
                      value={heritageForm.summary}
                      onChange={(event) => updateHeritageField("summary", event.target.value)}
                    />
                  </Field>

                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                    <label className="flex items-center gap-3 text-sm text-rice/70">
                      <input
                        type="checkbox"
                        checked={heritageForm.published}
                        onChange={(event) => updateHeritageField("published", event.target.checked)}
                      />
                      发布到前台
                    </label>
                    <label className="flex items-center gap-3 text-sm text-rice/70">
                      <input
                        type="checkbox"
                        checked={heritageForm.featured}
                        onChange={(event) => updateHeritageField("featured", event.target.checked)}
                      />
                      首页精选
                    </label>
                  </div>
                </CardContent>
              </Card>
            </form>
          ) : null}

          {tab === "categories" ? (
            <form onSubmit={submitCategory}>
              <Card>
                <CardContent>
                  <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <p className="text-sm uppercase text-museumGold">Taxonomy</p>
                      <h2 className="serif-title mt-1 text-3xl font-normal">分类管理</h2>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" onClick={() => setCategoryForm(emptyCategoryForm)}>
                        <Plus className="size-4" />
                        新增
                      </Button>
                      <Button type="submit">
                        <Save className="size-4" />
                        保存
                      </Button>
                      <Button type="button" variant="outline" onClick={deleteCategory}>
                        <Trash2 className="size-4" />
                        删除
                      </Button>
                    </div>
                  </div>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {categoryRows.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setCategoryForm(categoryToForm(category))}
                        className="rounded-full border border-museumGold/24 px-3 py-1 text-sm text-rice/70 transition hover:border-museumGold hover:text-rice"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Field label="分类名称" error={errors.name}>
                      <Input
                        value={categoryForm.name}
                        onChange={(event) => updateCategoryField("name", event.target.value)}
                      />
                    </Field>
                    <Field label="Slug" error={errors.slug}>
                      <Input
                        value={categoryForm.slug}
                        onChange={(event) => updateCategoryField("slug", event.target.value)}
                      />
                    </Field>
                    <Field label="英文名称" error={errors.englishName}>
                      <Input
                        value={categoryForm.englishName}
                        onChange={(event) => updateCategoryField("englishName", event.target.value)}
                      />
                    </Field>
                    <Field label="色值" error={errors.color}>
                      <div className="grid grid-cols-[52px_1fr] gap-2">
                        <input
                          type="color"
                          className="h-11 w-full rounded-md border border-museumGold/22 bg-transparent"
                          value={categoryForm.color}
                          onChange={(event) => updateCategoryField("color", event.target.value)}
                        />
                        <Input
                          value={categoryForm.color}
                          onChange={(event) => updateCategoryField("color", event.target.value)}
                        />
                      </div>
                    </Field>
                    <Field label="排序">
                      <Input
                        value={categoryForm.sortOrder}
                        onChange={(event) => updateCategoryField("sortOrder", event.target.value)}
                      />
                    </Field>
                  </div>
                  <Field className="mt-4" label="简介" error={errors.summary}>
                    <Textarea
                      value={categoryForm.summary}
                      onChange={(event) => updateCategoryField("summary", event.target.value)}
                    />
                  </Field>
                </CardContent>
              </Card>
            </form>
          ) : null}

          {tab === "media" ? (
            <ProjectMediaManager
              locale={locale}
              adminKey={adminKey}
              isAuthenticated={isAuthenticated}
              selectedRow={selectedRow}
              onChanged={refreshContent}
            />
          ) : null}

          {tab === "campaigns" ? (
            <Card>
              <CardContent>
                <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm uppercase text-museumGold">Campaign</p>
                    <h2 className="serif-title mt-1 text-3xl font-normal">活动配置</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-rice/56">
                      维护 H5 活动专题的标题、摘要、主图、关键词和优先关联项目。保存前请先执行 campaign_configs 数据库迁移。
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => void loadCampaignConfigs()}>
                      <Search className="size-4" />
                      读取配置
                    </Button>
                    <Button type="button" onClick={() => void saveCampaignConfig()}>
                      <Save className="size-4" />
                      保存活动
                    </Button>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                  <div className="space-y-2">
                    {campaignForms.map((campaign) => (
                      <button
                        key={campaign.slug}
                        type="button"
                        onClick={() => setSelectedCampaignSlug(campaign.slug)}
                        className={`w-full rounded-md border p-3 text-left transition ${
                          selectedCampaignSlug === campaign.slug
                            ? "border-museumGold bg-museumGold/12"
                            : "border-rice/10 bg-ink/48 hover:border-museumGold/42"
                        }`}
                      >
                        <span className="serif-title block text-xl">{campaign.title}</span>
                        <span className="mt-1 block text-xs text-rice/42">{campaign.slug}</span>
                      </button>
                    ))}
                  </div>

                  {selectedCampaign ? (
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="标题">
                          <Input
                            value={selectedCampaign.title}
                            onChange={(event) => updateCampaignField("title", event.target.value)}
                          />
                        </Field>
                        <Field label="英文标题">
                          <Input
                            value={selectedCampaign.englishTitle}
                            onChange={(event) => updateCampaignField("englishTitle", event.target.value)}
                          />
                        </Field>
                        <Field label="主图 URL">
                          <Input
                            value={selectedCampaign.heroImage}
                            onChange={(event) => updateCampaignField("heroImage", event.target.value)}
                          />
                        </Field>
                        <Field label="强调色">
                          <Input
                            value={selectedCampaign.accent}
                            onChange={(event) => updateCampaignField("accent", event.target.value)}
                          />
                        </Field>
                      </div>
                      <Field label="中文摘要">
                        <Textarea
                          value={selectedCampaign.summary}
                          onChange={(event) => updateCampaignField("summary", event.target.value)}
                        />
                      </Field>
                      <Field label="英文摘要">
                        <Textarea
                          value={selectedCampaign.englishSummary}
                          onChange={(event) => updateCampaignField("englishSummary", event.target.value)}
                        />
                      </Field>
                      <Field label="中文描述">
                        <Textarea
                          className="min-h-36"
                          value={selectedCampaign.description}
                          onChange={(event) => updateCampaignField("description", event.target.value)}
                        />
                      </Field>
                      <Field label="英文描述">
                        <Textarea
                          className="min-h-36"
                          value={selectedCampaign.englishDescription}
                          onChange={(event) => updateCampaignField("englishDescription", event.target.value)}
                        />
                      </Field>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="优先项目 Slug，逗号分隔">
                          <Textarea
                            value={selectedCampaign.prioritySlugs}
                            onChange={(event) => updateCampaignField("prioritySlugs", event.target.value)}
                          />
                        </Field>
                        <Field label="关键词，逗号分隔">
                          <Textarea
                            value={selectedCampaign.keywords}
                            onChange={(event) => updateCampaignField("keywords", event.target.value)}
                          />
                        </Field>
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {tab === "promotions" ? (
            <HomepagePromotionsAdmin locale={locale} adminKey={adminKey} isAuthenticated={isAuthenticated} />
          ) : null}

        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  className,
  children
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block text-sm text-rice/62 ${className ?? ""}`}>
      <span>{label}</span>
      <div className="mt-2">{children}</div>
      {error ? <span className="mt-1 block text-xs text-cinnabar">{error}</span> : null}
    </label>
  );
}

function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-28 w-full rounded-md border border-museumGold/22 bg-rice/[0.055] p-3 text-sm text-rice placeholder:text-rice/38 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-museumGold/70 ${className}`}
      {...props}
    />
  );
}
