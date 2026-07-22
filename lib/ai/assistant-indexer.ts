import { createHash } from "node:crypto";
import { locales } from "@/i18n/routing";
import { createAssistantDocuments } from "@/lib/ai/assistant-rag";
import { createEmbeddings } from "@/lib/ai/openai";
import { createInheritorProfilesFromHeritageItems } from "@/lib/content/inheritor-repository";
import { getHeritageItems } from "@/lib/content/heritage-repository";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AssistantContextDocument } from "@/lib/types/assistant";

function checksum(document: AssistantContextDocument) {
  return createHash("sha256")
    .update([document.title, document.summary, document.content, document.href].join("\n"))
    .digest("hex");
}

function toAssistantDocumentRow(document: AssistantContextDocument, embedding: number[]) {
  return {
    id: `${document.locale}:${document.id}`,
    source_type: document.sourceType,
    source_id: document.sourceId,
    locale: document.locale,
    title: document.title,
    summary: document.summary,
    content: document.content,
    href: document.href,
    metadata: document.metadata,
    embedding,
    checksum: checksum(document)
  };
}

async function createDocuments() {
  const items = await getHeritageItems();
  const inheritors = createInheritorProfilesFromHeritageItems(items);

  return locales.flatMap((locale) => createAssistantDocuments({ items, inheritors, locale }));
}

export async function reindexAssistantDocuments() {
  const documents = await createDocuments();
  const embeddings = await createEmbeddings(documents.map((document) => document.content));
  const rows = documents.map((document, index) => toAssistantDocumentRow(document, embeddings[index] ?? []));
  const supabase = await createSupabaseAdminClient();

  if (!rows.length) {
    return {
      count: 0
    };
  }

  const { error } = await supabase.from("assistant_documents").upsert(rows, {
    onConflict: "id"
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    count: rows.length
  };
}
