import type { AppLocale } from "@/i18n/routing";
import { buildAssistantSystemPrompt, formatContextBlock } from "@/lib/ai/assistant-rag";
import type { AssistantChatMessage, AssistantContextDocument } from "@/lib/types/assistant";

const openAIBaseUrl = "https://api.openai.com/v1";

function getOpenAIKey() {
  return process.env.OPENAI_API_KEY;
}

export function hasOpenAIConfig() {
  return Boolean(getOpenAIKey());
}

export function getAssistantModel() {
  return process.env.OPENAI_ASSISTANT_MODEL || "gpt-5.5";
}

export function getEmbeddingModel() {
  return process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
}

async function openAIRequest<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const apiKey = getOpenAIKey();

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const response = await fetch(`${openAIBaseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${message}`);
  }

  return (await response.json()) as T;
}

type EmbeddingResponse = {
  data: Array<{
    embedding: number[];
  }>;
};

export async function createEmbedding(input: string) {
  const response = await openAIRequest<EmbeddingResponse>("/embeddings", {
    model: getEmbeddingModel(),
    input
  });

  return response.data[0]?.embedding ?? [];
}

export async function createEmbeddings(inputs: string[]) {
  if (!inputs.length) {
    return [];
  }

  const response = await openAIRequest<EmbeddingResponse>("/embeddings", {
    model: getEmbeddingModel(),
    input: inputs
  });

  return response.data.map((item) => item.embedding);
}

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

export async function createAssistantCompletion({
  messages,
  contextDocuments,
  locale
}: {
  messages: AssistantChatMessage[];
  contextDocuments: AssistantContextDocument[];
  locale: AppLocale;
}) {
  const systemPrompt = [
    buildAssistantSystemPrompt(locale),
    "",
    "Huayun website context:",
    formatContextBlock(contextDocuments)
  ].join("\n");

  const response = await openAIRequest<ChatCompletionResponse>("/chat/completions", {
    model: getAssistantModel(),
    temperature: 0.25,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content
      }))
    ]
  });

  const answer = response.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("OpenAI returned an empty assistant response.");
  }

  return answer;
}
