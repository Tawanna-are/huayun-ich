"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { defaultLocale, isAppLocale } from "@/i18n/routing";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { UserFavoriteTargetType } from "@/lib/types/database";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  itemId?: string;
  targetType?: UserFavoriteTargetType;
  targetId?: string;
  compact?: boolean;
  className?: string;
};

export function FavoriteButton({ itemId, targetType = "heritage", targetId, compact = false, className }: FavoriteButtonProps) {
  const router = useRouter();
  const rawLocale = useLocale();
  const locale = isAppLocale(rawLocale) ? rawLocale : defaultLocale;
  const resolvedTargetId = targetId ?? itemId;
  const [userId, setUserId] = useState<string | null>(null);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const label = favoriteId
    ? locale === "en"
      ? "Saved"
      : "\u5df2\u6536\u85cf"
    : locale === "en"
      ? "Save"
      : "\u6536\u85cf";
  const compactClassName = compact
    ? favoriteId
      ? "relative z-20 h-10 w-10 rounded-full bg-museumGold px-0 text-ink shadow-goldline backdrop-blur hover:bg-museumGold/88"
      : "relative z-20 h-10 w-10 rounded-full bg-ink/72 px-0 text-rice shadow-goldline backdrop-blur hover:bg-museumGold hover:text-ink"
    : undefined;

  useEffect(() => {
    let active = true;

    async function loadFavorite() {
      if (!resolvedTargetId) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!active) {
          return;
        }

        setUserId(user?.id ?? null);

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("target_type", targetType)
          .eq("target_id", resolvedTargetId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (active) {
          setFavoriteId((data as { id?: string } | null)?.id ?? null);
        }
      } catch (error) {
        console.error("Failed to load favorite:", error instanceof Error ? error.message : error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadFavorite();

    return () => {
      active = false;
    };
  }, [resolvedTargetId, targetType]);

  async function toggleFavorite() {
    if (!resolvedTargetId) {
      return;
    }

    if (!userId) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();

      if (favoriteId) {
        const { error } = await supabase.from("user_favorites").delete().eq("id", favoriteId).eq("user_id", userId);

        if (error) {
          throw error;
        }

        setFavoriteId(null);
        return;
      }

      const { data, error } = await supabase
        .from("user_favorites")
        .insert({
          user_id: userId,
          heritage_item_id: targetType === "heritage" ? resolvedTargetId : null,
          target_type: targetType,
          target_id: resolvedTargetId
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      setFavoriteId((data as { id: string }).id);
    } catch (error) {
      console.error("Failed to toggle favorite:", error instanceof Error ? error.message : error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={favoriteId ? "secondary" : "outline"}
      size={compact ? "sm" : "default"}
      className={cn(compactClassName, className)}
      onClick={toggleFavorite}
      disabled={loading || !resolvedTargetId}
      aria-label={label}
    >
      <Heart className={favoriteId ? "fill-current" : ""} />
      {compact ? <span className="sr-only">{label}</span> : label}
    </Button>
  );
}
