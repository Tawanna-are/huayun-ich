"use client";

import { FormEvent, useEffect, useState } from "react";
import { LockKeyhole, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "@/i18n/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { AppLocale } from "@/i18n/routing";

const copy = { zh: { eyebrow: "Huayun Account", title: "设置新密码", description: "请输入至少 6 位的新密码。", password: "新密码", confirm: "确认新密码", submit: "更新密码", loading: "更新中...", success: "密码已更新，请重新登录。", mismatch: "两次输入的密码不一致。", invalid: "重置链接已失效，请重新申请密码重置。", failed: "密码更新失败，请重新尝试。", back: "返回登录" }, en: { eyebrow: "Huayun Account", title: "Set a new password", description: "Use at least 6 characters for your new password.", password: "New password", confirm: "Confirm new password", submit: "Update password", loading: "Updating...", success: "Password updated. Please sign in again.", mismatch: "The passwords do not match.", invalid: "This reset link has expired. Request a new one.", failed: "Unable to update the password. Please try again.", back: "Back to sign in" } } as const;

export function PasswordResetForm({ locale }: { locale: AppLocale }) {
  const t = copy[locale]; const router = useRouter(); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [status, setStatus] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [ready, setReady] = useState(false);
  useEffect(() => { const supabase = createBrowserSupabaseClient(); supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session))); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); setStatus(""); if (!ready) { setError(t.invalid); return; } if (password.length < 6 || password !== confirm) { setError(password !== confirm ? t.mismatch : t.description); return; } setLoading(true); const { error: updateError } = await createBrowserSupabaseClient().auth.updateUser({ password }); if (updateError) setError(updateError.message || t.failed); else { setStatus(t.success); await createBrowserSupabaseClient().auth.signOut(); } setLoading(false); }
  return <Card className="bg-rice/[0.04]"><CardContent className="p-6 md:p-8"><p className="text-sm uppercase text-museumGold">{t.eyebrow}</p><h1 className="serif-title mt-3 text-4xl font-normal md:text-5xl">{t.title}</h1><p className="mt-4 text-sm leading-7 text-rice/62">{t.description}</p><form className="mt-8 grid gap-4" onSubmit={submit}><label className="grid gap-2 text-sm text-rice/70">{t.password}<Input type="password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} className="text-rice caret-rice placeholder:text-rice/35" /></label><label className="grid gap-2 text-sm text-rice/70">{t.confirm}<Input type="password" minLength={6} required value={confirm} onChange={(event) => setConfirm(event.target.value)} className="text-rice caret-rice placeholder:text-rice/35" /></label><Button type="submit" disabled={loading}><LockKeyhole className="size-4" />{loading ? <Loader2 className="animate-spin" /> : t.submit}</Button></form>{status ? <p className="mt-5 rounded-md border border-museumGold/20 bg-museumGold/10 p-3 text-sm text-rice/72">{status}</p> : null}{error ? <p className="mt-5 rounded-md border border-cinnabar/30 bg-cinnabar/12 p-3 text-sm text-rice/78">{error}</p> : null}<button type="button" className="mt-5 text-sm text-museumGold hover:text-rice" onClick={() => router.push("/login")}>{t.back}</button></CardContent></Card>;
}
