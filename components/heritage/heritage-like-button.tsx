"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { defaultLocale, isAppLocale } from "@/i18n/routing";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const copy = {
  zh: { like: "点赞", liked: "已点赞", unavailable: "暂时无法点赞" },
  en: { like: "Like", liked: "Liked", unavailable: "Likes are temporarily unavailable" }
} as const;

export function HeritageLikeButton({ itemId, className }: { itemId: string; className?: string }) {
  const router = useRouter();
  const rawLocale = useLocale();
  const locale = isAppLocale(rawLocale) ? rawLocale : defaultLocale;
  const text = copy[locale];
  const [authenticated, setAuthenticated] = useState(false);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        const response = await fetch(`/api/engagement/likes?heritageItemId=${encodeURIComponent(itemId)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        const result = (await response.json()) as { count?: number; liked?: boolean; authenticated?: boolean };
        if (!response.ok) throw new Error("likes_unavailable");
        if (active) {
          setCount(result.count ?? 0);
          setLiked(Boolean(result.liked));
          setAuthenticated(Boolean(result.authenticated));
        }
      } catch {
        if (active) setError(text.unavailable);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [itemId, text.unavailable]);

  async function toggleLike() {
    if (!authenticated) {
      router.push("/login");
      return;
    }

    const nextLiked = !liked;
    const previousCount = count;
    setLiked(nextLiked);
    setCount(Math.max(0, previousCount + (nextLiked ? 1 : -1)));
    setLoading(true);
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setAuthenticated(false);
        router.push("/login");
        return;
      }

      const response = await fetch("/api/engagement/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ heritageItemId: itemId, liked: nextLiked })
      });
      const result = (await response.json()) as { count?: number; liked?: boolean };
      if (!response.ok) throw new Error("likes_unavailable");
      setCount(result.count ?? previousCount);
      setLiked(Boolean(result.liked));
    } catch {
      setLiked(!nextLiked);
      setCount(previousCount);
      setError(text.unavailable);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button type="button" variant={liked ? "secondary" : "outline"} className={className} onClick={toggleLike} disabled={loading} aria-pressed={liked}>
        <Heart className={liked ? "fill-current" : ""} />
        {liked ? text.liked : text.like} {count}
      </Button>
      {error ? <p className="mt-2 text-xs text-[#9b3b32]" role="status">{error}</p> : null}
    </div>
  );
}
