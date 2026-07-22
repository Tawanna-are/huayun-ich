import type { AppLocale } from "@/i18n/routing";

export type AssistantChatRole = "user" | "assistant";

export type AssistantChatMessage = {
  role: AssistantChatRole;
  content: string;
};

export type AssistantSourceType = "heritage" | "inheritor" | "category" | "region";

export type AssistantDocumentMetadata = {
  categorySlug?: string;
  categoryName?: string;
  province?: string;
  region?: string;
  image?: string;
  heritageSlug?: string;
  heritageName?: string;
  count?: number;
};

export type AssistantContextDocument = {
  id: string;
  sourceId: string;
  sourceType: AssistantSourceType;
  locale: AppLocale;
  title: string;
  summary: string;
  content: string;
  href: string;
  metadata: AssistantDocumentMetadata;
  similarity?: number;
};

export type AssistantRecommendation = {
  type: AssistantSourceType;
  title: string;
  description: string;
  href: string;
  image?: string;
};

export type AssistantMode = "openai" | "local" | "unconfigured";

export type AssistantResponsePayload = {
  answer: string;
  mode: AssistantMode;
  sources: AssistantContextDocument[];
  recommendations: AssistantRecommendation[];
  notice?: string;
};
