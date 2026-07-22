import type { AppLocale } from "@/i18n/routing";
import type {
  AssistantContextDocument,
  AssistantRecommendation,
  AssistantSourceType
} from "@/lib/types/assistant";
import type { HeritageItem } from "@/lib/types/heritage";
import type { InheritorProfile } from "@/lib/types/inheritor";

type CreateAssistantDocumentsInput = {
  items: HeritageItem[];
  inheritors: InheritorProfile[];
  locale: AppLocale;
};

const sourcePriority: Record<AssistantSourceType, number> = {
  heritage: 4,
  inheritor: 3,
  region: 2,
  category: 1
};

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function compactText(parts: Array<string | number | undefined | null | string[]>) {
  return parts
    .flatMap((part) => (Array.isArray(part) ? part : [part]))
    .filter((part): part is string | number => part !== undefined && part !== null && String(part).trim().length > 0)
    .map((part) => String(part).trim())
    .join("\n");
}

function getHeritageTitle(item: HeritageItem, locale: AppLocale) {
  return locale === "en" ? item.englishName || item.name : item.name;
}

function getHeritageSubtitle(item: HeritageItem, locale: AppLocale) {
  return locale === "en" ? item.name : item.englishName;
}

function createHeritageDocument(item: HeritageItem, locale: AppLocale): AssistantContextDocument {
  const title = getHeritageTitle(item, locale);

  return {
    id: `heritage:${item.slug}`,
    sourceId: item.slug,
    sourceType: "heritage",
    locale,
    title,
    summary: item.summary,
    href: `/heritage/${item.slug}`,
    metadata: {
      categorySlug: item.categorySlug,
      categoryName: item.categoryName,
      province: item.province,
      region: item.region,
      image: item.image,
      heritageSlug: item.slug,
      heritageName: title
    },
    content: compactText([
      title,
      getHeritageSubtitle(item, locale),
      item.categoryName,
      item.region,
      item.province,
      item.city,
      item.summary,
      item.history,
      item.timeline.map((event) => `${event.year} ${event.title} ${event.description}`),
      item.inheritor.name,
      item.inheritor.title,
      item.inheritor.bio,
      item.tags
    ])
  };
}

function createInheritorDocument(profile: InheritorProfile, locale: AppLocale): AssistantContextDocument {
  const title = profile.name;
  const heritageTitle = locale === "en" ? profile.heritageEnglishName || profile.heritageName : profile.heritageName;

  return {
    id: `inheritor:${profile.id}`,
    sourceId: profile.id,
    sourceType: "inheritor",
    locale,
    title,
    summary: profile.bio,
    href: `/inheritors/${profile.id}`,
    metadata: {
      categoryName: profile.heritageCategoryName,
      province: profile.province,
      region: profile.region,
      image: profile.image,
      heritageSlug: profile.heritageSlug,
      heritageName: heritageTitle
    },
    content: compactText([
      profile.name,
      profile.title,
      profile.bio,
      profile.region,
      profile.province,
      profile.city,
      heritageTitle,
      profile.heritageName,
      profile.heritageEnglishName,
      profile.heritageCategoryName,
      profile.representativeWorks.map((work) => `${work.title} ${work.englishTitle} ${work.summary}`)
    ])
  };
}

function createCategoryDocuments(items: HeritageItem[], locale: AppLocale): AssistantContextDocument[] {
  const groups = new Map<string, HeritageItem[]>();

  for (const item of items) {
    groups.set(item.categorySlug, [...(groups.get(item.categorySlug) ?? []), item]);
  }

  return Array.from(groups.entries()).map(([categorySlug, groupItems]) => {
    const lead = groupItems[0];
    const title = locale === "en" ? lead?.categorySlug.replace(/-/g, " ") ?? categorySlug : lead?.categoryName ?? categorySlug;

    return {
      id: `category:${categorySlug}`,
      sourceId: categorySlug,
      sourceType: "category",
      locale,
      title,
      summary: groupItems.map((item) => getHeritageTitle(item, locale)).join(", "),
      href: `/heritage?category=${categorySlug}`,
      metadata: {
        categorySlug,
        categoryName: lead?.categoryName,
        count: groupItems.length,
        image: lead?.image
      },
      content: compactText([
        title,
        lead?.categoryName,
        groupItems.map((item) => `${getHeritageTitle(item, locale)} ${item.summary} ${item.region}`)
      ])
    };
  });
}

function createRegionDocuments(items: HeritageItem[], locale: AppLocale): AssistantContextDocument[] {
  const groups = new Map<string, HeritageItem[]>();

  for (const item of items) {
    groups.set(item.province, [...(groups.get(item.province) ?? []), item]);
  }

  return Array.from(groups.entries()).map(([province, groupItems]) => ({
    id: `region:${province}`,
    sourceId: province,
    sourceType: "region",
    locale,
    title: province,
    summary: groupItems.map((item) => `${getHeritageTitle(item, locale)} · ${item.city}`).join(", "),
    href: `/heritage?province=${encodeURIComponent(province)}`,
    metadata: {
      province,
      region: province,
      count: groupItems.length,
      image: groupItems[0]?.image
    },
    content: compactText([
      province,
      groupItems.map((item) => `${getHeritageTitle(item, locale)} ${item.englishName} ${item.summary} ${item.city}`)
    ])
  }));
}

export function createAssistantDocuments({
  items,
  inheritors,
  locale
}: CreateAssistantDocumentsInput): AssistantContextDocument[] {
  return [
    ...items.map((item) => createHeritageDocument(item, locale)),
    ...inheritors.map((profile) => createInheritorDocument(profile, locale)),
    ...createCategoryDocuments(items, locale),
    ...createRegionDocuments(items, locale)
  ];
}

function tokenize(value: string) {
  const lower = value.toLowerCase();
  const asciiTokens = lower.split(/[^a-z0-9]+/).filter((token) => token.length > 1);
  const cjkTokens = Array.from(value.matchAll(/\p{Script=Han}/gu)).map(([char]) => char);

  return unique([...asciiTokens, ...cjkTokens]);
}

function scoreDocument(query: string, document: AssistantContextDocument) {
  const normalizedQuery = query.trim().toLowerCase();
  const title = document.title.toLowerCase();
  const content = document.content.toLowerCase();
  const tokens = tokenize(query);
  let score = sourcePriority[document.sourceType] * 0.2;

  if (normalizedQuery && title.includes(normalizedQuery)) {
    score += 14;
  }

  if (normalizedQuery && content.includes(normalizedQuery)) {
    score += 8;
  }

  for (const token of tokens) {
    if (title.includes(token)) {
      score += 3;
    }

    if (content.includes(token)) {
      score += 1;
    }
  }

  return score;
}

export function rankLocalAssistantDocuments(
  query: string,
  documents: AssistantContextDocument[],
  limit = 8
): AssistantContextDocument[] {
  return documents
    .map((document) => ({
      ...document,
      similarity: scoreDocument(query, document)
    }))
    .filter((document) => (document.similarity ?? 0) > 0)
    .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0) || sourcePriority[b.sourceType] - sourcePriority[a.sourceType])
    .slice(0, limit);
}

export function createAssistantRecommendations(documents: AssistantContextDocument[], limit = 5): AssistantRecommendation[] {
  const seen = new Set<string>();
  const recommendations: AssistantRecommendation[] = [];

  for (const document of documents) {
    const key = `${document.sourceType}:${document.sourceId}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    recommendations.push({
      type: document.sourceType,
      title: document.title,
      description: document.summary,
      href: document.href,
      image: document.metadata.image
    });

    if (recommendations.length >= limit) {
      break;
    }
  }

  return recommendations;
}

export function buildAssistantSystemPrompt(locale: AppLocale) {
  if (locale === "en") {
    return [
      "You are Huayun's AI heritage guide for Chinese intangible cultural heritage.",
      "Prioritize Huayun website context. If the context is insufficient, say what is missing and keep general knowledge clearly secondary.",
      "Answer only heritage-related questions. Recommend relevant heritage projects, inheritors, and regions when useful.",
      "Be concise, museum-grade, warm, and cite source titles from the provided context by name."
    ].join("\n");
  }

  return [
    "你是「华韵 · 中国非遗」的 AI 非遗导览助手。",
    "优先使用华韵站内内容回答问题。若站内内容不足，请明确说明不足，再谨慎补充一般背景。",
    "只回答与中国非物质文化遗产、传承人、地区、历史背景和展陈浏览相关的问题。",
    "回答应克制、清晰、有博物馆导览感；适合时推荐相关非遗项目、传承人和地区。"
  ].join("\n");
}

export function formatContextBlock(documents: AssistantContextDocument[]) {
  if (!documents.length) {
    return "No Huayun website context was retrieved.";
  }

  return documents
    .map((document, index) =>
      [
        `[${index + 1}] ${document.title}`,
        `Type: ${document.sourceType}`,
        `URL: ${document.href}`,
        `Summary: ${document.summary}`,
        `Content: ${document.content}`
      ].join("\n")
    )
    .join("\n\n");
}

export function createGroundedFallbackAnswer(
  question: string,
  documents: AssistantContextDocument[],
  locale: AppLocale
) {
  if (!documents.length) {
    return locale === "en"
      ? "I could not find matching Huayun website content for this question yet. Try asking about a listed heritage item, inheritor, category, or region."
      : "我暂时没有在华韵站内内容中找到匹配资料。你可以尝试询问已收录的非遗项目、传承人、分类或地区。";
  }

  const topDocuments = documents.slice(0, 3);
  const sourceLines = topDocuments.map((document, index) => `${index + 1}. ${document.title}：${document.summary}`);
  const recommendationLine = topDocuments
    .map((document) => document.title)
    .filter(Boolean)
    .join("、");

  if (locale === "en") {
    return [
      `Based on Huayun website content, your question "${question}" is most closely related to:`,
      ...sourceLines,
      recommendationLine ? `Recommended next viewing: ${recommendationLine}.` : ""
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `根据华韵站内内容，你的问题「${question}」最相关的线索是：`,
    ...sourceLines,
    recommendationLine ? `建议继续浏览：${recommendationLine}。` : ""
  ]
    .filter(Boolean)
    .join("\n");
}
