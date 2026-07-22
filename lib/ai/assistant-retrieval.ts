import { createClient } from "@supabase/supabase-js";
import { createAssistantDocuments, rankLocalAssistantDocuments } from "@/lib/ai/assistant-rag";
import { createEmbedding, hasOpenAIConfig } from "@/lib/ai/openai";
import { createInheritorProfilesFromHeritageItems } from "@/lib/content/inheritor-repository";
import { getHeritageItems } from "@/lib/content/heritage-repository";
import type { AppLocale } from "@/i18n/routing";
import { captureAppException } from "@/lib/monitoring/sentry";
import type { AssistantContextDocument, AssistantSourceType } from "@/lib/types/assistant";

type AssistantDocumentMatchRow = {
  id: string;
  source_type: AssistantSourceType;
  source_id: string;
  locale: AppLocale;
  title: string;
  summary: string;
  content: string;
  href: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
};

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

function mapMatchRow(row: AssistantDocumentMatchRow): AssistantContextDocument {
  return {
    id: row.id,
    sourceId: row.source_id,
    sourceType: row.source_type,
    locale: row.locale,
    title: row.title,
    summary: row.summary,
    content: row.content,
    href: row.href,
    metadata: row.metadata ?? {},
    similarity: row.similarity
  };
}

async function retrieveVectorDocuments(question: string, locale: AppLocale, limit: number) {
  if (!hasSupabaseConfig() || !hasOpenAIConfig()) {
    return [];
  }

  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return [];
  }

  try {
    const embedding = await createEmbedding(question);

    if (!embedding.length) {
      return [];
    }

    const { data, error } = await supabase.rpc("match_assistant_documents", {
      query_embedding: embedding,
      match_count: limit,
      match_locale: locale
    });

    if (error) {
      captureAppException(error, {
        module: "supabase",
        operation: "assistant_vector_rpc",
        tags: {
          locale
        },
        extra: {
          limit
        }
      });
      console.error("Assistant vector retrieval failed:", error.message);
      return [];
    }

    return ((data ?? []) as AssistantDocumentMatchRow[]).map(mapMatchRow);
  } catch (error) {
    captureAppException(error, {
      module: "ai",
      operation: "assistant_vector_retrieval",
      tags: {
        locale
      },
      extra: {
        question,
        limit
      }
    });
    console.error("Assistant vector retrieval failed:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function retrieveAssistantContext({
  question,
  locale,
  limit = 8
}: {
  question: string;
  locale: AppLocale;
  limit?: number;
}) {
  const vectorDocuments = await retrieveVectorDocuments(question, locale, limit);

  if (vectorDocuments.length) {
    return vectorDocuments;
  }

  const items = await getHeritageItems();
  const inheritors = createInheritorProfilesFromHeritageItems(items);
  const documents = createAssistantDocuments({ items, inheritors, locale });

  return rankLocalAssistantDocuments(question, documents, limit);
}
