"use client";

import { useState } from "react";
import { Check, MessageSquare, RefreshCw, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/i18n/routing";
import type { ContactSubmissionKind, ContactSubmissionStatus, HeritageCommentStatus } from "@/lib/types/database";

type HeritageReference = { name: string; english_name: string; slug: string } | null;
type AdminComment = { id: string; body: string; status: HeritageCommentStatus; created_at: string; heritage_item: HeritageReference | HeritageReference[] };
type AdminSubmission = { id: string; kind: ContactSubmissionKind; name: string; email: string; organization: string | null; message: string; status: ContactSubmissionStatus; created_at: string; heritage_item: HeritageReference | HeritageReference[] };

const adminStorageKey = "huayun-admin-key";
const dataSources = ["heritage_comments", "contact_submissions"] as const;

const copy = {
  zh: { title: "互动与联系", comments: "评论审核", submissions: "联系申请", refresh: "刷新队列", login: "请先在上方使用 Admin Key 登录后台。", empty: "当前队列暂无内容。", approve: "通过", reject: "驳回", progress: "处理中", resolve: "已完成", error: "读取或更新失败，请重新登录后台后重试。", general: "普通咨询", supporter: "传承支持", cooperation: "项目合作", licensing: "内容授权" },
  en: { title: "Engagement & Contact", comments: "Comment moderation", submissions: "Contact requests", refresh: "Refresh queues", login: "Sign in with the Admin Key above first.", empty: "This queue is empty.", approve: "Approve", reject: "Reject", progress: "In progress", resolve: "Resolved", error: "Unable to load or update. Sign in to admin again and retry.", general: "General", supporter: "Heritage support", cooperation: "Cooperation", licensing: "Licensing" }
} as const;

function reference(value: HeritageReference | HeritageReference[]) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function EngagementAdminClient({ locale }: { locale: AppLocale }) {
  const text = copy[locale];
  const [tab, setTab] = useState<"comments" | "submissions">("comments");
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function adminFetch(url: string, init?: RequestInit) {
    const key = window.localStorage.getItem(adminStorageKey);
    if (!key) throw new Error("admin_login_required");
    const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", "x-admin-key": key, ...(init?.headers ?? {}) } });
    if (!response.ok) throw new Error("admin_request_failed");
    return response;
  }

  async function loadQueues() {
    setLoading(true);
    setMessage("");
    try {
      const [commentResponse, submissionResponse] = await Promise.all([
        adminFetch("/api/admin/comments?status=pending"),
        adminFetch("/api/admin/contact-submissions?status=new")
      ]);
      const commentData = (await commentResponse.json()) as { comments?: AdminComment[] };
      const submissionData = (await submissionResponse.json()) as { submissions?: AdminSubmission[] };
      setComments(commentData.comments ?? []);
      setSubmissions(submissionData.submissions ?? []);
    } catch (error) {
      setMessage(error instanceof Error && error.message === "admin_login_required" ? text.login : text.error);
    } finally {
      setLoading(false);
    }
  }

  async function moderateComment(id: string, status: "approved" | "rejected") {
    try {
      await adminFetch(`/api/admin/comments/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setComments((current) => current.filter((comment) => comment.id !== id));
    } catch {
      setMessage(text.error);
    }
  }

  async function updateSubmission(id: string, status: "in_progress" | "resolved") {
    try {
      await adminFetch(`/api/admin/contact-submissions/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setSubmissions((current) => current.filter((submission) => submission.id !== id));
    } catch {
      setMessage(text.error);
    }
  }

  return (
    <section data-sources={dataSources.join(",")} className="bg-[#f4f1ea] py-14 text-[#18231e]">
      <div className="museum-container">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div><p className="text-[11px] uppercase text-[#9b3b32]">Admin</p><h2 className="serif-title mt-2 text-3xl font-normal">{text.title}</h2></div>
          <Button type="button" variant="outline" onClick={loadQueues} disabled={loading}><RefreshCw />{text.refresh}</Button>
        </div>
        <div className="mt-7 flex gap-2 border-b border-[#31594c]/15">
          <button type="button" onClick={() => setTab("comments")} className={`px-4 py-3 text-sm ${tab === "comments" ? "border-b-2 border-[#9b3b32] text-[#9b3b32]" : "text-[#65716b]"}`}><MessageSquare className="mr-2 inline size-4" />{text.comments} ({comments.length})</button>
          <button type="button" onClick={() => setTab("submissions")} className={`px-4 py-3 text-sm ${tab === "submissions" ? "border-b-2 border-[#9b3b32] text-[#9b3b32]" : "text-[#65716b]"}`}><Send className="mr-2 inline size-4" />{text.submissions} ({submissions.length})</button>
        </div>
        {message ? <p className="mt-5 text-sm text-[#9b3b32]">{message}</p> : null}
        <div className="mt-5 grid gap-3">
          {tab === "comments" ? comments.map((comment) => { const item = reference(comment.heritage_item); return <article key={comment.id} className="border border-[#31594c]/12 bg-[#fffefa] p-5"><div className="flex flex-wrap justify-between gap-3 text-xs text-[#7a847e]"><span>{item ? (locale === "en" ? item.english_name || item.name : item.name) : "-"}</span><time>{new Date(comment.created_at).toLocaleString()}</time></div><p className="mt-3 whitespace-pre-wrap leading-7">{comment.body}</p><div className="mt-4 flex gap-2"><Button size="sm" onClick={() => moderateComment(comment.id, "approved")}><Check />{text.approve}</Button><Button size="sm" variant="outline" onClick={() => moderateComment(comment.id, "rejected")}><X />{text.reject}</Button></div></article>; }) : submissions.map((submission) => { const item = reference(submission.heritage_item); return <article key={submission.id} className="border border-[#31594c]/12 bg-[#fffefa] p-5"><div className="flex flex-wrap justify-between gap-3 text-xs text-[#7a847e]"><span>{text[submission.kind]}{item ? ` · ${locale === "en" ? item.english_name || item.name : item.name}` : ""}</span><time>{new Date(submission.created_at).toLocaleString()}</time></div><h3 className="mt-3 font-medium">{submission.name}{submission.organization ? ` · ${submission.organization}` : ""}</h3><a className="mt-1 block text-sm text-[#31594c]" href={`mailto:${submission.email}`}>{submission.email}</a><p className="mt-3 whitespace-pre-wrap leading-7">{submission.message}</p><div className="mt-4 flex gap-2"><Button size="sm" onClick={() => updateSubmission(submission.id, "in_progress")}>{text.progress}</Button><Button size="sm" variant="outline" onClick={() => updateSubmission(submission.id, "resolved")}><Check />{text.resolve}</Button></div></article>; })}
          {!loading && !(tab === "comments" ? comments.length : submissions.length) && !message ? <p className="py-8 text-sm text-[#7a847e]">{text.empty}</p> : null}
        </div>
      </div>
    </section>
  );
}
