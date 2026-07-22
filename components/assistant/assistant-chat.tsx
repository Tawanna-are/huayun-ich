"use client";

import { FormEvent, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Loader2, MessageSquareText, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import type {
  AssistantChatMessage,
  AssistantContextDocument,
  AssistantRecommendation
} from "@/lib/types/assistant";
import { cn } from "@/lib/utils";

type ChatEntry = AssistantChatMessage & {
  id: string;
  notice?: string;
  sources?: AssistantContextDocument[];
  recommendations?: AssistantRecommendation[];
};

type AssistantApiResponse = {
  answer: string;
  notice?: string;
  sources: AssistantContextDocument[];
  recommendations: AssistantRecommendation[];
};

function createId() {
  return Math.random().toString(36).slice(2);
}

export function AssistantChat() {
  const locale = useLocale();
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : defaultLocale;
  const t = useTranslations("AssistantPage");
  const suggestions = useMemo(() => [t("suggestions.history"), t("suggestions.inheritor"), t("suggestions.region")], [t]);
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t("welcome")
    }
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  async function ask(question: string) {
    const content = question.trim();

    if (!content || pending) {
      return;
    }

    const userMessage: ChatEntry = {
      id: createId(),
      role: "user",
      content
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setPending(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          locale: currentLocale,
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent
          }))
        })
      });

      if (!response.ok) {
        throw new Error(t("error"));
      }

      const data = (await response.json()) as AssistantApiResponse;
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content: data.answer,
          notice: data.notice,
          sources: data.sources,
          recommendations: data.recommendations
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content: t("error")
        }
      ]);
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
      <aside className="rounded-lg border border-museumGold/18 bg-rice/[0.035] p-6 shadow-goldline md:p-8">
        <div className="inline-flex size-12 items-center justify-center rounded-md border border-museumGold/34 bg-museumGold/12 text-museumGold">
          <Sparkles className="size-5" />
        </div>
        <h2 className="serif-title mt-6 text-4xl font-normal leading-tight text-rice md:text-5xl">
          {t("panelTitle")}
        </h2>
        <p className="mt-5 text-base leading-8 text-rice/62">{t("panelDescription")}</p>
        <div className="mt-8 grid gap-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              className="rounded-lg border border-rice/10 bg-ink/52 px-4 py-3 text-left text-sm leading-6 text-rice/72 transition hover:border-museumGold/42 hover:text-rice"
              onClick={() => void ask(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-[660px] flex-col overflow-hidden rounded-lg border border-museumGold/18 bg-rice/[0.045] shadow-goldline">
        <div className="flex items-center justify-between gap-4 border-b border-rice/10 px-5 py-4">
          <div className="inline-flex items-center gap-2 text-sm text-rice/72">
            <MessageSquareText className="size-4 text-museumGold" />
            {t("chatTitle")}
          </div>
          <span className="text-xs uppercase tracking-[0.18em] text-museumGold/72">RAG</span>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 md:px-6">
          {messages.map((message) => (
            <article
              key={message.id}
              className={cn("max-w-[92%]", message.role === "user" ? "ml-auto" : "mr-auto")}
            >
              <div
                className={cn(
                  "rounded-lg px-5 py-4 text-sm leading-7",
                  message.role === "user"
                    ? "bg-cinnabar text-rice"
                    : "border border-museumGold/16 bg-ink/72 text-rice/78"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.notice ? <p className="mt-4 text-xs text-museumGold/72">{message.notice}</p> : null}
              </div>

              {message.recommendations?.length ? (
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {message.recommendations.map((recommendation) => (
                    <Link
                      key={`${recommendation.type}-${recommendation.href}`}
                      href={recommendation.href}
                      className="group rounded-lg border border-museumGold/14 bg-ink/52 px-4 py-3 text-sm text-rice/66 transition hover:border-museumGold/42 hover:text-rice"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-museumGold/62">
                            {recommendation.type}
                          </p>
                          <p className="mt-1 line-clamp-1 text-rice">{recommendation.title}</p>
                        </div>
                        <ArrowUpRight className="size-4 shrink-0 text-museumGold transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
          {pending ? (
            <div className="inline-flex items-center gap-2 rounded-lg border border-museumGold/16 bg-ink/72 px-5 py-4 text-sm text-rice/58">
              <Loader2 className="size-4 animate-spin text-museumGold" />
              {t("thinking")}
            </div>
          ) : null}
        </div>

        <form className="border-t border-rice/10 p-4" onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <textarea
              className="min-h-12 flex-1 resize-none rounded-md border border-museumGold/22 bg-ink/72 px-4 py-3 text-sm leading-6 text-rice outline-none placeholder:text-rice/36 focus:border-museumGold/70"
              onChange={(event) => setInput(event.target.value)}
              placeholder={t("placeholder")}
              rows={1}
              value={input}
            />
            <Button disabled={pending || !input.trim()} type="submit" className="h-auto self-stretch">
              <Send className="size-4" />
              <span className="sr-only">{t("send")}</span>
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
