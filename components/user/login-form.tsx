"use client";

import { FormEvent, useState } from "react";
import { useLocale } from "next-intl";
import { Chrome, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

const copy: Record<
  AppLocale,
  {
    title: string;
    description: string;
    email: string;
    password: string;
    login: string;
    signup: string;
    google: string;
    switchToSignup: string;
    switchToLogin: string;
    loading: string;
    checkEmail: string;
    passwordHint: string;
    forgotPassword: string;
    resetSent: string;
  }
> = {
  zh: {
    title: "进入个人馆藏",
    description: "登录后可收藏非遗项目、查看浏览记录，并保存语言偏好。",
    email: "邮箱",
    password: "密码",
    login: "邮箱登录",
    signup: "注册账号",
    google: "使用 Google 登录",
    switchToSignup: "还没有账号？注册",
    switchToLogin: "已有账号？登录",
    loading: "处理中...",
    checkEmail: "注册成功，请根据 Supabase 邮件配置确认邮箱或直接进入个人中心。",
    passwordHint: "密码至少 6 位",
    forgotPassword: "忘记密码？发送重置邮件",
    resetSent: "重置邮件已发送，请检查邮箱。"
  },
  en: {
    title: "Enter Your Collection",
    description: "Sign in to save heritage items, review browsing history and keep a language preference.",
    email: "Email",
    password: "Password",
    login: "Sign in with email",
    signup: "Create account",
    google: "Continue with Google",
    switchToSignup: "No account yet? Sign up",
    switchToLogin: "Already have an account? Sign in",
    loading: "Working...",
    checkEmail: "Account created. Confirm your email if required by Supabase, or continue to your profile.",
    passwordHint: "Use at least 6 characters",
    forgotPassword: "Forgot password? Send reset email",
    resetSent: "Reset email sent. Check your inbox."
  }
};

export function LoginForm() {
  const rawLocale = useLocale();
  const locale = isAppLocale(rawLocale) ? rawLocale : defaultLocale;
  const text = copy[locale];
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function redirectToProfile() {
    return `${window.location.origin}/${locale}/auth/callback?next=/${locale}/profile`;
  }

  async function handleEmailAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (password.trim().length < 6) {
      setError(text.passwordHint);
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const result =
        mode === "signup"
          ? await supabase.auth.signUp({
              email: email.trim(),
              password,
              options: {
                emailRedirectTo: redirectToProfile()
              }
            })
          : await supabase.auth.signInWithPassword({
              email: email.trim(),
              password
            });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (mode === "signup" && !result.data.session) {
        setStatus(text.checkEmail);
        return;
      }

      router.push("/profile");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setStatus("");
    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectToProfile()
        }
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Google login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    setError("");
    setStatus("");
    if (!email.trim()) {
      setError(text.email);
      return;
    }
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/${locale}/reset-password`
      });
      if (resetError) setError(resetError.message);
      else setStatus(text.resetSent);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Password reset failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-xl bg-rice/[0.04]">
      <CardContent className="p-6 md:p-8">
        <div className="mb-8">
          <p className="text-sm uppercase text-museumGold">Huayun Account</p>
          <h1 className="serif-title mt-3 text-4xl font-normal text-rice md:text-5xl">{text.title}</h1>
          <p className="mt-4 text-sm leading-7 text-rice/62">{text.description}</p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-md border border-museumGold/18 bg-ink/50 p-1">
          {(["login", "signup"] as AuthMode[]).map((item) => (
            <button
              key={item}
              type="button"
              className={cn(
                "rounded px-3 py-2 text-sm transition",
                mode === item ? "bg-museumGold text-ink" : "text-rice/58 hover:text-rice"
              )}
              onClick={() => setMode(item)}
            >
              {item === "login" ? text.login : text.signup}
            </button>
          ))}
        </div>

        <form className="grid gap-4" onSubmit={handleEmailAuth}>
          <label className="grid gap-2 text-sm text-rice/70">
            {text.email}
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="text-rice caret-rice placeholder:text-rice/35"
              required
            />
          </label>
          <label className="grid gap-2 text-sm text-rice/70">
            {text.password}
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="text-rice caret-rice placeholder:text-rice/35"
              minLength={6}
              required
            />
          </label>
          <Button type="submit" disabled={loading}>
            {mode === "login" ? <Mail className="size-4" /> : <UserPlus className="size-4" />}
            {loading ? text.loading : mode === "login" ? text.login : text.signup}
          </Button>
          {mode === "login" ? <button type="button" className="justify-self-start text-sm text-museumGold hover:text-rice" onClick={handlePasswordReset} disabled={loading}>{text.forgotPassword}</button> : null}
        </form>

        <div className="my-6 h-px bg-museumGold/16" />

        <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
          <Chrome className="size-4" />
          {text.google}
        </Button>

        <button
          type="button"
          className="mt-5 text-sm text-museumGold hover:text-rice"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? text.switchToSignup : text.switchToLogin}
        </button>

        {status ? <p className="mt-5 rounded-md border border-museumGold/20 bg-museumGold/10 p-3 text-sm text-rice/72">{status}</p> : null}
        {error ? <p className="mt-5 rounded-md border border-cinnabar/30 bg-cinnabar/12 p-3 text-sm text-rice/78">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
