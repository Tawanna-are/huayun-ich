"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/i18n/routing";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { ContactSubmissionKind } from "@/lib/types/database";

const copy = {
  zh: {
    name: "姓名",
    namePlaceholder: "如何称呼你",
    email: "邮箱",
    emailPlaceholder: "用于接收回复",
    kind: "联系类型",
    organization: "机构（选填）",
    organizationPlaceholder: "学校、品牌或机构",
    message: "留言",
    messagePlaceholder: "请简要说明你的想法",
    consent: "我同意网站仅将这些信息用于本次联系。",
    submit: "提交申请",
    submitting: "正在提交…",
    success: "提交成功，我们会尽快查看并回复。",
    error: "提交失败，请检查内容或稍后再试。",
    related: "关联项目",
    kinds: { general: "普通咨询", supporter: "成为传承支持者", cooperation: "项目合作", licensing: "内容授权" }
  },
  en: {
    name: "Name",
    namePlaceholder: "How should we address you?",
    email: "Email",
    emailPlaceholder: "For our reply",
    kind: "Contact type",
    organization: "Organization (optional)",
    organizationPlaceholder: "School, brand or organization",
    message: "Message",
    messagePlaceholder: "Tell us briefly what you have in mind",
    consent: "I agree that this information may be used only to respond to this inquiry.",
    submit: "Submit",
    submitting: "Submitting…",
    success: "Submitted. We will review your message and respond soon.",
    error: "Submission failed. Check the form or try again later.",
    related: "Related project",
    kinds: { general: "General inquiry", supporter: "Become a heritage supporter", cooperation: "Project cooperation", licensing: "Content licensing" }
  }
} as const;

type ContactApplicationFormProps = {
  locale: AppLocale;
  defaultKind?: ContactSubmissionKind;
  heritageItemId?: string;
  heritageItemName?: string;
};

const fieldClass = "mt-2 h-11 w-full rounded-[4px] border border-[#31594c]/20 bg-white px-3 text-sm outline-none transition focus:border-[#31594c]";

export function ContactApplicationForm({
  locale,
  defaultKind = "general",
  heritageItemId,
  heritageItemName
}: ContactApplicationFormProps) {
  const text = copy[locale];
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"" | "success" | "error">("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    setStatus("");

    try {
      const supabase = createBrowserSupabaseClient();
      const { data: authData } = await supabase.auth.getSession();
      const token = authData.session?.access_token;
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          kind: data.get("kind"),
          organization: data.get("organization"),
          message: data.get("message"),
          consent: data.get("consent") === "on",
          website: data.get("website"),
          heritageItemId: heritageItemId ?? null
        })
      });

      if (!response.ok) throw new Error("contact_failed");
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-[#fffefa] p-5 text-[#1d2925] shadow-[0_16px_45px_rgba(22,46,38,0.12)] sm:p-7">
      {heritageItemName ? <p className="mb-5 text-sm text-[#65716b]"><span className="text-[#9b3b32]">{text.related}</span> · {heritageItemName}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs text-[#52605a]">{text.name} *<input name="name" required minLength={2} maxLength={80} className={fieldClass} placeholder={text.namePlaceholder} /></label>
        <label className="text-xs text-[#52605a]">{text.email} *<input name="email" required type="email" maxLength={254} className={fieldClass} placeholder={text.emailPlaceholder} /></label>
        <label className="text-xs text-[#52605a]">{text.kind} *
          <select name="kind" required defaultValue={defaultKind} className={fieldClass}>
            {(Object.keys(text.kinds) as ContactSubmissionKind[]).map((kind) => <option key={kind} value={kind}>{text.kinds[kind]}</option>)}
          </select>
        </label>
        <label className="text-xs text-[#52605a]">{text.organization}<input name="organization" maxLength={120} className={fieldClass} placeholder={text.organizationPlaceholder} /></label>
        <label className="text-xs text-[#52605a] sm:col-span-2">{text.message} *<textarea name="message" required minLength={10} maxLength={2000} className={`${fieldClass} h-28 resize-y py-3`} placeholder={text.messagePlaceholder} /></label>
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px]" aria-hidden="true" />
      <label className="mt-4 flex items-start gap-3 text-xs leading-5 text-[#65716b]"><input name="consent" type="checkbox" required className="mt-1 size-4 accent-[#31594c]" />{text.consent}</label>
      <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={submitting}><Send />{submitting ? text.submitting : text.submit}</Button>
        {status ? <p role="status" className={`text-sm ${status === "success" ? "text-[#31594c]" : "text-[#9b3b32]"}`}>{status === "success" ? text.success : text.error}</p> : null}
      </div>
    </form>
  );
}
