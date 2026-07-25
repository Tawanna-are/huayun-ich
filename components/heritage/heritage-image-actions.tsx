"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/user/favorite-button";
import { useRouter } from "@/i18n/navigation";
import { defaultLocale, isAppLocale } from "@/i18n/routing";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const engagementEvent = "huayun:image-engagement";

type ImageEngagementDetail = {
  imageId: string;
  favorite?: boolean;
  liked?: boolean;
  count?: number;
};

type HeritageImageActionsProps = {
  heritageItemId: string;
  imageId: string;
  light?: boolean;
};

const copy = {
  zh: { like: "\u70b9\u8d5e", liked: "\u5df2\u70b9\u8d5e", unavailable: "\u6682\u65f6\u65e0\u6cd5\u70b9\u8d5e" },
  en: { like: "Like", liked: "Liked", unavailable: "Likes are temporarily unavailable" }
} as const;

export function HeritageImageActions({ heritageItemId, imageId, light = false }: HeritageImageActionsProps) {
  const router = useRouter();
  const rawLocale = useLocale();
  const locale = isAppLocale(rawLocale) ? rawLocale : defaultLocale;
  const text = copy[locale];
  const [authenticated, setAuthenticated] = useState(false);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteVersion, setFavoriteVersion] = useState(0);

  const publish = useCallback((detail: Omit<ImageEngagementDetail, "imageId">) => {
    window.dispatchEvent(new CustomEvent<ImageEngagementDetail>(engagementEvent, { detail: { imageId, ...detail } }));
  }, [imageId]);

  useEffect(() => {
    function synchronize(event: Event) {
      const detail = (event as CustomEvent<ImageEngagementDetail>).detail;
      if (!detail || detail.imageId !== imageId) return;
      if (typeof detail.liked === "boolean") setLiked(detail.liked);
      if (typeof detail.count === "number") setCount(detail.count);
      if (typeof detail.favorite === "boolean") setFavoriteVersion((version) => version + 1);
    }

    window.addEventListener(engagementEvent, synchronize);
    return () => window.removeEventListener(engagementEvent, synchronize);
  }, [imageId]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        const query = new URLSearchParams({ heritageItemId, imageId });
        const response = await fetch(`/api/engagement/image-likes?${query}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        const result = (await response.json()) as { count?: number; liked?: boolean; authenticated?: boolean };
        if (!response.ok) throw new Error("image_likes_unavailable");
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
  }, [heritageItemId, imageId, text.unavailable]);

  async function toggleLike() {
    if (!authenticated) {
      router.push("/login");
      return;
    }

    const nextLiked = !liked;
    const previousCount = count;
    const nextCount = Math.max(0, previousCount + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setCount(nextCount);
    publish({ liked: nextLiked, count: nextCount });
    setLoading(true);
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setAuthenticated(false);
        router.push("/login");
        throw new Error("authentication_required");
      }

      const response = await fetch("/api/engagement/image-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ heritageItemId, imageId, liked: nextLiked })
      });
      const result = (await response.json()) as { count?: number; liked?: boolean };
      if (!response.ok) throw new Error("image_likes_unavailable");
      const confirmedLiked = Boolean(result.liked);
      const confirmedCount = result.count ?? previousCount;
      setLiked(confirmedLiked);
      setCount(confirmedCount);
      publish({ liked: confirmedLiked, count: confirmedCount });
    } catch {
      setLiked(liked);
      setCount(previousCount);
      publish({ liked, count: previousCount });
      setError(text.unavailable);
    } finally {
      setLoading(false);
    }
  }

  const buttonClassName = cn(
    "h-9 gap-1.5 px-3 text-xs",
    light && "border-white/45 bg-black/35 text-white hover:bg-white hover:text-black"
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FavoriteButton
        key={favoriteVersion}
        itemId={heritageItemId}
        targetType="heritage_image"
        targetId={imageId}
        className={buttonClassName}
        onChange={(favorite) => publish({ favorite })}
      />
      <div>
        <Button
          type="button"
          variant={liked ? "secondary" : "outline"}
          className={buttonClassName}
          onClick={toggleLike}
          disabled={loading}
          aria-pressed={liked}
        >
          <ThumbsUp className={liked ? "fill-current" : ""} />
          {liked ? text.liked : text.like} {count}
        </Button>
        {error ? <p className={cn("mt-1 text-xs text-[#9b3b32]", light && "text-white")} role="status">{error}</p> : null}
      </div>
    </div>
  );
}
