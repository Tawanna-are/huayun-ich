"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { defaultLocale, isAppLocale } from "@/i18n/routing";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawLocale = useLocale();
  const locale = isAppLocale(rawLocale) ? rawLocale : defaultLocale;
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function exchangeSession() {
      const code = searchParams.get("code");

      if (!code) {
        router.replace("/login");
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          throw exchangeError;
        }

        router.replace("/profile");
      } catch (callbackError) {
        if (!active) {
          return;
        }

        setError(callbackError instanceof Error ? callbackError.message : "Authentication callback failed.");
      }
    }

    exchangeSession();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  return (
    <div className="mx-auto flex min-h-[48vh] max-w-lg flex-col items-center justify-center px-6 text-center text-rice">
      <Loader2 className="size-8 animate-spin text-museumGold" />
      <p className="mt-5 text-sm uppercase text-museumGold">Auth Callback</p>
      <h1 className="serif-title mt-3 text-4xl font-normal">
        {locale === "en" ? "Completing sign in" : "正在完成登录"}
      </h1>
      {error ? <p className="mt-5 rounded-md border border-cinnabar/30 bg-cinnabar/12 p-3 text-sm">{error}</p> : null}
    </div>
  );
}
