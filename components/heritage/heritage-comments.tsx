"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { defaultLocale, isAppLocale } from "@/i18n/routing";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { HeritageCommentStatus } from "@/lib/types/database";

type CommentView = { id: string; body: string; status: HeritageCommentStatus; created_at: string };

const copy = {
  zh: {
    eyebrow: "Community",
    title: "交流与回应",
    description: "评论经后台审核后公开显示。",
    placeholder: "写下你对这项技艺的理解或问题…",
    submit: "提交评论",
    login: "登录后评论",
    member: "社区成员",
    mine: "我的评论",
    pending: "等待审核",
    rejected: "未通过审核",
    empty: "还没有公开评论。",
    success: "评论已提交，审核通过后会公开显示。",
    error: "评论暂时无法提交，请稍后再试。"
  },
  en: {
    eyebrow: "Community",
    title: "Conversation & Response",
    description: "Comments appear publicly after moderation.",
    placeholder: "Share a thought or question about this craft…",
    submit: "Submit comment",
    login: "Sign in to comment",
    member: "Community member",
    mine: "My comment",
    pending: "Awaiting review",
    rejected: "Not approved",
    empty: "No public comments yet.",
    success: "Comment submitted. It will appear after approval.",
    error: "Comments are temporarily unavailable. Please try again later."
  }
} as const;

export function HeritageComments({ itemId }: { itemId: string }) {
  const router = useRouter();
  const rawLocale = useLocale();
  const locale = isAppLocale(rawLocale) ? rawLocale : defaultLocale;
  const text = copy[locale];
  const [comments, setComments] = useState<CommentView[]>([]);
  const [ownComments, setOwnComments] = useState<CommentView[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        const response = await fetch(`/api/engagement/comments?heritageItemId=${encodeURIComponent(itemId)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!response.ok) throw new Error("comments_unavailable");
        const result = (await response.json()) as {
          comments?: CommentView[];
          ownComments?: CommentView[];
          authenticated?: boolean;
        };
        if (active) {
          setComments(result.comments ?? []);
          setOwnComments(result.ownComments ?? []);
          setAuthenticated(Boolean(result.authenticated));
        }
      } catch {
        if (active) setStatus(text.error);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [itemId, text.error]);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authenticated) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        router.push("/login");
        return;
      }
      const response = await fetch("/api/engagement/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ heritageItemId: itemId, body })
      });
      const result = (await response.json()) as CommentView;
      if (!response.ok) throw new Error("comments_unavailable");
      setOwnComments((current) => [result, ...current]);
      setBody("");
      setStatus(text.success);
    } catch {
      setStatus(text.error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (value: string) => new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", { dateStyle: "medium" }).format(new Date(value));

  return (
    <section data-section="heritage-comments" className="bg-[#f7f5f0] py-16 md:py-24">
      <div className="museum-container">
        <div className="flex flex-col justify-between gap-3 border-b border-[#31594c]/15 pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] uppercase text-[#9b3b32]">{text.eyebrow}</p>
            <h2 className="serif-title mt-2 text-3xl font-normal md:text-5xl">{text.title}</h2>
          </div>
          <p className="text-sm text-[#6e7973]">{text.description}</p>
        </div>

        <form onSubmit={submitComment} className="mt-7 grid gap-3 md:grid-cols-[1fr_auto]">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            minLength={2}
            maxLength={800}
            required
            className="min-h-24 resize-y border border-[#31594c]/20 bg-[#fffefa] px-4 py-3 text-sm outline-none focus:border-[#31594c]"
            placeholder={text.placeholder}
            disabled={!authenticated || loading}
          />
          <Button type={authenticated ? "submit" : "button"} onClick={authenticated ? undefined : () => router.push("/login")} disabled={loading || (authenticated && body.trim().length < 2)} className="md:h-full">
            <MessageSquare />
            {authenticated ? text.submit : text.login}
          </Button>
        </form>
        {status ? <p className="mt-3 text-sm text-[#8f463d]" role="status">{status}</p> : null}

        <div className="mt-8 divide-y divide-[#31594c]/12">
          {ownComments.map((comment) => (
            <article key={comment.id} className="py-5">
              <div className="flex flex-wrap items-center gap-3 text-sm"><strong>{text.mine}</strong><span className="rounded-sm bg-[#eee3d2] px-2 py-1 text-xs text-[#805b38]">{comment.status === "pending" ? text.pending : text.rejected}</span><time className="text-[#7a847e]">{formatDate(comment.created_at)}</time></div>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-[#39463f]">{comment.body}</p>
            </article>
          ))}
          {comments.map((comment) => (
            <article key={comment.id} className="py-5">
              <div className="flex items-center gap-3 text-sm"><strong>{text.member}</strong><time className="text-[#7a847e]">{formatDate(comment.created_at)}</time></div>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-[#39463f]">{comment.body}</p>
            </article>
          ))}
          {!loading && !comments.length && !ownComments.length ? <p className="py-7 text-sm text-[#7a847e]">{text.empty}</p> : null}
        </div>
      </div>
    </section>
  );
}
