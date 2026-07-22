import { createClient } from "@supabase/supabase-js";
import type { AppLocale } from "@/i18n/routing";
import { createEmbedding, hasOpenAIConfig } from "@/lib/ai/openai";
import { captureAppException } from "@/lib/monitoring/sentry";
import type { AssistantSourceType } from "@/lib/types/assistant";
import type { HeritageItem } from "@/lib/types/heritage";

export type SemanticSearchMode = "vector" | "local" | "empty";

export type SemanticSearchOptions = {
  locale: AppLocale;
  category?: string;
  province?: string;
  limit?: number;
};

export type SemanticSearchResponse = {
  items: HeritageItem[];
  mode: SemanticSearchMode;
};

type SearchTermGroup = {
  triggers: string[];
  terms: string[];
};

type AssistantDocumentMatchRow = {
  source_type: AssistantSourceType;
  source_id: string;
  metadata: Record<string, unknown> | null;
};

const semanticTermGroups: SearchTermGroup[] = [
  {
    triggers: ["刺绣", "绣", "embroidery"],
    terms: [
      "刺绣",
      "苏绣",
      "湘绣",
      "蜀绣",
      "丝线",
      "丝绸",
      "针法",
      "双面绣",
      "绣品",
      "embroidery"
    ]
  },
  {
    triggers: ["广绣", "潮绣"],
    terms: ["广绣", "潮绣", "刺绣", "丝线", "针法"]
  },
  {
    triggers: ["儿童", "孩子", "少儿", "亲子", "kids", "children", "family"],
    terms: [
      "儿童",
      "孩子",
      "少儿",
      "亲子",
      "入门",
      "体验",
      "手作",
      "展演",
      "表演",
      "故事",
      "脸谱",
      "节庆",
      "光影",
      "色彩",
      "适合儿童",
      "beginner",
      "family",
      "hands-on",
      "visual"
    ]
  },
  {
    triggers: ["陶瓷", "瓷器", "青瓷", "porcelain", "ceramic", "celadon"],
    terms: ["陶瓷", "瓷器", "青瓷", "青花", "窑火", "釉色", "器物", "porcelain", "ceramic", "celadon"]
  },
  {
    triggers: ["戏曲", "opera", "stage"],
    terms: ["戏曲", "川剧", "京剧", "唱念做打", "水磨腔", "脸谱", "opera"]
  },
  {
    triggers: ["节庆", "民俗", "festival", "ritual"],
    terms: ["节庆", "民俗", "展演", "仪式", "夜色", "火花", "庙会", "festival", "ritual"]
  }
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function cjkNgrams(value: string) {
  const groups = value.match(/\p{Script=Han}+/gu) ?? [];
  const tokens: string[] = [];

  for (const group of groups) {
    if (group.length <= 4) {
      tokens.push(group);
    }

    for (let index = 0; index < group.length - 1; index += 1) {
      tokens.push(group.slice(index, index + 2));
    }
  }

  return tokens;
}

function tokenize(value: string) {
  const lower = normalize(value);
  const asciiTokens = lower.split(/[^a-z0-9-]+/).filter((token) => token.length > 1);
  return unique([...asciiTokens, ...cjkNgrams(value)].map(normalize).filter((token) => token.length > 1));
}

function expandedTerms(query: string) {
  const normalizedQuery = normalize(query);
  const baseTerms = tokenize(query);
  const semanticTerms = semanticTermGroups.flatMap((group) => {
    const matched = group.triggers.some((trigger) => normalizedQuery.includes(normalize(trigger)));
    return matched ? group.terms : [];
  });

  return unique([...baseTerms, ...semanticTerms.map(normalize)].filter((term) => term.length > 1));
}

function matchesFilter(item: HeritageItem, options: SemanticSearchOptions) {
  const category = options.category && options.category !== "all" ? options.category : "";
  const province = options.province && options.province !== "all" ? options.province : "";

  return (!category || item.categorySlug === category) && (!province || item.province === province);
}

function itemSearchText(item: HeritageItem) {
  return [
    item.name,
    item.englishName,
    item.categoryName,
    item.summary,
    item.region,
    item.province,
    item.city,
    item.history.join(" "),
    item.timeline.map((event) => `${event.year} ${event.title} ${event.description}`).join(" "),
    item.inheritor.name,
    item.inheritor.title,
    item.inheritor.bio,
    item.tags.join(" ")
  ]
    .join(" ")
    .toLowerCase();
}

function scoreItem(query: string, terms: string[], item: HeritageItem) {
  const normalizedQuery = normalize(query);
  const name = normalize(item.name);
  const englishName = normalize(item.englishName);
  const summary = normalize(item.summary);
  const categoryName = normalize(item.categoryName);
  const tags = item.tags.map(normalize);
  const text = itemSearchText(item);
  let score = 0;

  if (normalizedQuery && name.includes(normalizedQuery)) {
    score += 50;
  }

  if (normalizedQuery && englishName.includes(normalizedQuery)) {
    score += 42;
  }

  if (normalizedQuery && text.includes(normalizedQuery)) {
    score += 26;
  }

  for (const term of terms) {
    if (name.includes(term)) {
      score += 18;
    }

    if (englishName.includes(term)) {
      score += 14;
    }

    if (tags.some((tag) => tag.includes(term))) {
      score += 12;
    }

    if (summary.includes(term)) {
      score += 8;
    }

    if (categoryName.includes(term) || normalize(item.region).includes(term) || normalize(item.province).includes(term)) {
      score += 3;
    }

    if (text.includes(term)) {
      score += 2;
    }
  }

  return score;
}

export function rankHeritageItemsByIntent(
  query: string,
  items: HeritageItem[],
  options: SemanticSearchOptions
): HeritageItem[] {
  const limit = options.limit ?? 12;
  const normalizedQuery = query.trim();
  const filteredItems = items.filter((item) => matchesFilter(item, options));

  if (!normalizedQuery) {
    return filteredItems.slice(0, limit);
  }

  const terms = expandedTerms(normalizedQuery);

  return filteredItems
    .map((item, index) => ({
      item,
      index,
      score: scoreItem(normalizedQuery, terms, item)
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function mergeRankedHeritageItems(
  primaryItems: HeritageItem[],
  fallbackItems: HeritageItem[],
  limit: number
) {
  const seen = new Set<string>();
  const merged: HeritageItem[] = [];

  for (const item of [...primaryItems, ...fallbackItems]) {
    if (seen.has(item.slug)) {
      continue;
    }

    seen.add(item.slug);
    merged.push(item);

    if (merged.length >= limit) {
      break;
    }
  }

  return merged;
}

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function createPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function heritageSlugFromMatch(row: AssistantDocumentMatchRow) {
  if (row.source_type === "heritage") {
    return row.source_id;
  }

  const metadataSlug = row.metadata?.heritageSlug;
  return typeof metadataSlug === "string" ? metadataSlug : undefined;
}

async function retrieveVectorHeritageItems({
  query,
  items,
  locale,
  limit
}: {
  query: string;
  items: HeritageItem[];
  locale: AppLocale;
  limit: number;
}) {
  if (!hasSupabaseConfig() || !hasOpenAIConfig()) {
    return [];
  }

  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return [];
  }

  try {
    const embedding = await createEmbedding(query);

    if (!embedding.length) {
      return [];
    }

    const { data, error } = await supabase.rpc("match_assistant_documents", {
      query_embedding: embedding,
      match_count: limit * 4,
      match_locale: locale
    });

    if (error) {
      captureAppException(error, {
        module: "supabase",
        operation: "semantic_search_vector_rpc",
        tags: {
          locale
        },
        extra: {
          limit
        }
      });
      console.error("Semantic search vector retrieval failed:", error.message);
      return [];
    }

    const itemBySlug = new Map(items.map((item) => [item.slug, item]));
    const seen = new Set<string>();

    return ((data ?? []) as AssistantDocumentMatchRow[]).flatMap((row) => {
      const slug = heritageSlugFromMatch(row);
      const item = slug ? itemBySlug.get(slug) : undefined;

      if (!item || seen.has(item.slug)) {
        return [];
      }

      seen.add(item.slug);
      return [item];
    });
  } catch (error) {
    captureAppException(error, {
      module: "search",
      operation: "semantic_search_vector_retrieval",
      tags: {
        locale
      },
      extra: {
        query,
        limit
      }
    });
    console.error("Semantic search vector retrieval failed:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function searchHeritageItemsByIntent({
  query,
  items,
  locale,
  category,
  province,
  limit = 12
}: {
  query: string;
  items: HeritageItem[];
  locale: AppLocale;
  category?: string;
  province?: string;
  limit?: number;
}): Promise<SemanticSearchResponse> {
  const options = { locale, category, province, limit };

  if (!query.trim()) {
    return {
      items: rankHeritageItemsByIntent(query, items, options),
      mode: "empty"
    };
  }

  const vectorItems = await retrieveVectorHeritageItems({ query, items, locale, limit });
  const filteredVectorItems = vectorItems.filter((item) => matchesFilter(item, options)).slice(0, limit);
  const localItems = rankHeritageItemsByIntent(query, items, options);

  if (filteredVectorItems.length) {
    return {
      items: mergeRankedHeritageItems(filteredVectorItems, localItems, limit),
      mode: "vector"
    };
  }

  return {
    items: localItems,
    mode: "local"
  };
}
