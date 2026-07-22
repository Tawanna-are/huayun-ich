import { createAssistantCompletion, hasOpenAIConfig } from "@/lib/ai/openai";
import {
  createAssistantRecommendations,
  createGroundedFallbackAnswer
} from "@/lib/ai/assistant-rag";
import { retrieveAssistantContext } from "@/lib/ai/assistant-retrieval";
import type { AppLocale } from "@/i18n/routing";
import { captureAppException } from "@/lib/monitoring/sentry";
import type { AssistantChatMessage, AssistantResponsePayload } from "@/lib/types/assistant";

export async function generateAssistantResponse({
  messages,
  question,
  locale
}: {
  messages: AssistantChatMessage[];
  question: string;
  locale: AppLocale;
}): Promise<AssistantResponsePayload> {
  const sources = await retrieveAssistantContext({ question, locale });
  const recommendations = createAssistantRecommendations(sources);
  const fallbackAnswer = createGroundedFallbackAnswer(question, sources, locale);

  if (!hasOpenAIConfig()) {
    return {
      answer: fallbackAnswer,
      mode: "unconfigured",
      sources,
      recommendations,
      notice:
        locale === "en"
          ? "OPENAI_API_KEY is not configured, so this response uses Huayun site retrieval only."
          : "当前未配置 OPENAI_API_KEY，因此本次回答仅使用华韵站内检索结果。"
    };
  }

  try {
    const answer = await createAssistantCompletion({
      messages,
      contextDocuments: sources,
      locale
    });

    return {
      answer,
      mode: "openai",
      sources,
      recommendations
    };
  } catch (error) {
    captureAppException(error, {
      module: "ai",
      operation: "assistant_completion",
      tags: {
        locale
      },
      extra: {
        question,
        messageCount: messages.length
      }
    });
    console.error("Assistant generation failed:", error instanceof Error ? error.message : error);

    return {
      answer: fallbackAnswer,
      mode: "local",
      sources,
      recommendations,
      notice:
        locale === "en"
          ? "The OpenAI response failed, so this answer falls back to Huayun site retrieval."
          : "OpenAI 生成失败，本次回答已回退为华韵站内检索结果。"
    };
  }
}
