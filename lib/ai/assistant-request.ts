import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import type { AssistantChatMessage } from "@/lib/types/assistant";

type AssistantRequestSuccess = {
  ok: true;
  locale: AppLocale;
  messages: AssistantChatMessage[];
  question: string;
};

type AssistantRequestFailure = {
  ok: false;
  status: 400;
  error: string;
};

const maxMessages = 12;
const maxMessageLength = 1200;

function isMessage(value: unknown): value is AssistantChatMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const message = value as Partial<AssistantChatMessage>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

export function parseAssistantRequest(value: unknown): AssistantRequestSuccess | AssistantRequestFailure {
  if (typeof value !== "object" || value === null) {
    return {
      ok: false,
      status: 400,
      error: "Invalid request body."
    };
  }

  const body = value as { locale?: string; messages?: unknown };
  const locale = isAppLocale(body.locale) ? body.locale : defaultLocale;
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages = rawMessages
    .filter(isMessage)
    .slice(-maxMessages)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, maxMessageLength)
    }));
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");

  if (!lastUserMessage) {
    return {
      ok: false,
      status: 400,
      error: "Missing user question."
    };
  }

  return {
    ok: true,
    locale,
    messages,
    question: lastUserMessage.content
  };
}
