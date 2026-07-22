"use client";

import { useMemo, useState } from "react";
import { DownloadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/i18n/routing";
import type { HeritageItem } from "@/lib/types/heritage";
import { cn } from "@/lib/utils";

type FavoriteOfflineCacheProps = {
  items: HeritageItem[];
  locale: AppLocale;
  label: string;
  emptyLabel: string;
  readyLabel: string;
  unavailableLabel: string;
  className?: string;
};

function normalizeCacheUrl(url: string | undefined) {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("http") || url.startsWith("/")) {
    return url;
  }

  return `/${url}`;
}

function buildFavoriteCacheUrls(items: HeritageItem[], locale: AppLocale) {
  return Array.from(
    new Set(
      items.flatMap((item) =>
        [
          `/${locale}/heritage/${item.slug}`,
          normalizeCacheUrl(item.image),
          normalizeCacheUrl(item.heroImage),
          normalizeCacheUrl(item.videoPoster)
        ].filter((url): url is string => Boolean(url))
      )
    )
  );
}

export function FavoriteOfflineCache({
  items,
  locale,
  label,
  emptyLabel,
  readyLabel,
  unavailableLabel,
  className
}: FavoriteOfflineCacheProps) {
  const [status, setStatus] = useState("");
  const [isCaching, setIsCaching] = useState(false);
  const urls = useMemo(() => buildFavoriteCacheUrls(items, locale), [items, locale]);

  async function cacheFavoritesOffline() {
    setStatus("");

    if (!items.length) {
      setStatus(emptyLabel);
      return;
    }

    if (!("serviceWorker" in navigator)) {
      setStatus(unavailableLabel);
      return;
    }

    setIsCaching(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const worker = registration.active ?? navigator.serviceWorker.controller;
      worker?.postMessage({ type: "CACHE_FAVORITES", urls });
      setStatus(readyLabel);
    } catch {
      setStatus(unavailableLabel);
    } finally {
      setIsCaching(false);
    }
  }

  return (
    <div className={cn("flex flex-col items-start gap-2 sm:items-end", className)}>
      <Button type="button" variant="outline" size="sm" disabled={isCaching || !items.length} onClick={cacheFavoritesOffline}>
        <DownloadCloud className="size-4" />
        {label}
      </Button>
      {status ? <p className="text-xs text-rice/48">{status}</p> : null}
    </div>
  );
}
