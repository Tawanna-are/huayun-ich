import { createHash } from "node:crypto";
import type { HeritageAdminPayload } from "@/lib/admin/validation";
import type { HeritageMediaType } from "@/lib/types/database";
import type { HeritageCategorySlug } from "@/lib/types/heritage";

export type FeishuAttachment = {
  file_token?: string;
  token?: string;
  name?: string;
  type?: string;
  mime_type?: string;
  size?: number;
  url?: string;
  tmp_url?: string;
};

export type FeishuRecord = {
  record_id: string;
  fields: Record<string, unknown>;
  created_time?: number;
  last_modified_time?: number;
};

const categoryByName: Record<string, HeritageCategorySlug> = {
  "传统戏曲": "traditional-opera",
  "传统工艺": "traditional-craft",
  "传统技艺": "traditional-technique",
  "民俗活动": "folk-activity",
  "民间文学": "folk-literature",
  "traditional opera": "traditional-opera",
  "traditional craft": "traditional-craft",
  "traditional technique": "traditional-technique",
  "folk activity": "folk-activity",
  "folk literature": "folk-literature"
};

const pinyinMap: Record<string, string> = {
  京: "jing",
  剧: "ju",
  昆: "kun",
  曲: "qu",
  苏: "su",
  绣: "xiu",
  湘: "xiang",
  蜀: "shu",
  粤: "yue",
  龙: "long",
  泉: "quan",
  青: "qing",
  瓷: "ci",
  景: "jing",
  德: "de",
  镇: "zhen",
  手: "shou",
  工: "gong",
  制: "zhi",
  技: "ji",
  艺: "yi",
  打: "da",
  铁: "tie",
  花: "hua",
  茶: "cha",
  传: "chuan",
  统: "tong",
  节: "jie",
  庆: "qing",
  民: "min",
  俗: "su",
  文: "wen",
  学: "xue"
};

function readTextNode(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(readTextNode).filter(Boolean).join("");
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;

    if (typeof record.text === "string") {
      return record.text;
    }

    if (typeof record.name === "string") {
      return record.name;
    }

    if (typeof record.value === "string") {
      return record.value;
    }
  }

  return "";
}

function readField(fields: Record<string, unknown>, key: string) {
  return readTextNode(fields[key]).trim();
}

function splitParagraphs(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeFeishuPublishStatus(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  const text = readTextNode(value).trim().toLowerCase();

  if (!text) {
    return false;
  }

  return !["草稿", "未发布", "不发布", "否", "false", "draft", "unpublished", "0"].includes(text);
}

export function slugifyFeishuHeritageName(name: string) {
  const mapped = Array.from(name)
    .map((character) => {
      if (/[\u4e00-\u9fff]/.test(character)) {
        return pinyinMap[character] ?? "";
      }

      return character;
    })
    .join("-");

  return mapped
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || `feishu-${createPayloadHash(name).slice(0, 10)}`;
}

export function normalizeFeishuCategory(value: unknown): HeritageCategorySlug {
  const text = readTextNode(value).trim();
  return categoryByName[text] ?? categoryByName[text.toLowerCase()] ?? "traditional-craft";
}

export function buildFeishuHeritagePayload(record: FeishuRecord): HeritageAdminPayload {
  const fields = record.fields;
  const name = readField(fields, "名称");
  const englishName = readField(fields, "英文名称") || slugifyFeishuHeritageName(name);
  const province = readField(fields, "省份");
  const summary = readField(fields, "简介");
  const history = splitParagraphs(readField(fields, "历史背景"));
  const value = splitParagraphs(readField(fields, "传承价值"));
  const categorySlug = normalizeFeishuCategory(fields["分类"]);

  return {
    slug: slugifyFeishuHeritageName(name),
    name,
    englishName,
    categorySlug,
    summary,
    region: province,
    province,
    city: province,
    inscriptionYear: null,
    history: [...history, ...value],
    timeline: [],
    tags: [readTextNode(fields["分类"]).trim(), province].filter(Boolean),
    relatedSlugs: [],
    latitude: null,
    longitude: null,
    mapX: null,
    mapY: null,
    imageUrl: "",
    heroImageUrl: "",
    videoUrl: "",
    inheritorName: "",
    inheritorTitle: "",
    inheritorBio: "",
    inheritorImageUrl: "",
    published: normalizeFeishuPublishStatus(fields["发布状态"]),
    featured: normalizeFeishuPublishStatus(fields["首页推荐"])
  };
}

export function createPayloadHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function getFeishuAttachments(value: unknown): FeishuAttachment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is FeishuAttachment => {
    return typeof item === "object" && item !== null && Boolean((item as FeishuAttachment).file_token ?? (item as FeishuAttachment).token);
  });
}

export function classifyFeishuAttachment(attachment: FeishuAttachment): HeritageMediaType | null {
  const type = String(attachment.type ?? attachment.mime_type ?? "").toLowerCase();
  const name = String(attachment.name ?? "").toLowerCase();

  if (type.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/.test(name)) {
    return "image";
  }

  if (type.startsWith("video/") || /\.(mp4|mov)$/.test(name)) {
    return "video";
  }

  return null;
}

export function getAttachmentToken(attachment: FeishuAttachment) {
  return attachment.file_token ?? attachment.token ?? "";
}
