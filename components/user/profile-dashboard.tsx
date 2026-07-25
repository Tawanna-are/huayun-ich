"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocale } from "next-intl";
import type { User } from "@supabase/supabase-js";
import { ArrowUpRight, Clock, Heart, Languages, LogOut, MessageSquare, Send, Sparkles, Tags, UserCircle } from "lucide-react";
import { HeritageCard } from "@/components/heritage/heritage-card";
import { InheritorCard } from "@/components/inheritors/inheritor-card";
import { FavoriteOfflineCache } from "@/components/pwa/favorite-offline-cache";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FavoriteButton } from "@/components/user/favorite-button";
import { Link } from "@/i18n/navigation";
import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/routing";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type {
  ContactSubmissionRow,
  ContactSubmissionStatus,
  HeritageCommentRow,
  HeritageCommentStatus,
  UserBrowsingHistoryRow,
  UserFavoriteRow,
  UserPreferenceRow
} from "@/lib/types/database";
import type { HeritageItem } from "@/lib/types/heritage";
import type { InheritorProfile } from "@/lib/types/inheritor";
import type { MuseumFeaturedTopic } from "@/lib/types/museum";
import { normalizeInterestTags, normalizePreferredLocale } from "@/lib/user/preferences";
import { createHeritageRecommendations } from "@/lib/user/recommendations";
import { cn } from "@/lib/utils";

type ProfileDashboardProps = {
  items: HeritageItem[];
  inheritors: InheritorProfile[];
  museumTopics: MuseumFeaturedTopic[];
};

type FavoriteSummary = Pick<UserFavoriteRow, "heritage_item_id" | "target_type" | "target_id" | "created_at">;
type HistorySummary = Pick<UserBrowsingHistoryRow, "heritage_item_id" | "viewed_at">;
type PreferenceSummary = Pick<UserPreferenceRow, "preferred_locale" | "interest_tags"> | null;
type CommentSummary = Pick<HeritageCommentRow, "id" | "heritage_item_id" | "body" | "status" | "created_at">;
type SubmissionSummary = Pick<ContactSubmissionRow, "id" | "heritage_item_id" | "kind" | "message" | "status" | "created_at">;

const copy: Record<
  AppLocale,
  {
    title: string;
    description: string;
    loginPrompt: string;
    loginAction: string;
    loading: string;
    signOut: string;
    favorites: string;
    history: string;
    language: string;
    interests: string;
    interestsDescription: string;
    recommendations: string;
    recommendationsDescription: string;
    emptyFavorites: string;
    emptyHistory: string;
    emptyRecommendations: string;
    comments: string;
    applications: string;
    emptyComments: string;
    emptyApplications: string;
    commentStatuses: Record<HeritageCommentStatus, string>;
    submissionStatuses: Record<ContactSubmissionStatus, string>;
    heritageFavorites: string;
    imageFavoritesLabel: string;
    inheritorFavorites: string;
    museumTopicFavorites: string;
    viewDetails: string;
    viewTopic: string;
    cacheFavoritesOffline: string;
    cacheFavoritesOfflineReady: string;
    cacheFavoritesOfflineEmpty: string;
    cacheFavoritesOfflineUnavailable: string;
    saved: string;
    tagsSaved: string;
    zh: string;
    en: string;
  }
> = {
  zh: {
    title: "\u4e2a\u4eba\u4e2d\u5fc3",
    description: "\u7ba1\u7406\u4f60\u7684\u975e\u9057\u6536\u85cf\u3001\u6d4f\u89c8\u8bb0\u5f55\u4e0e\u8bed\u8a00\u504f\u597d\u3002",
    loginPrompt: "\u767b\u5f55\u540e\u53ef\u4ee5\u4fdd\u5b58\u81ea\u5df1\u7684\u9986\u85cf\u7ebf\u7d22\u3002",
    loginAction: "\u524d\u5f80\u767b\u5f55",
    loading: "\u6b63\u5728\u8bfb\u53d6\u4e2a\u4eba\u9986\u85cf...",
    signOut: "\u9000\u51fa\u767b\u5f55",
    favorites: "\u6536\u85cf",
    history: "\u6d4f\u89c8\u8bb0\u5f55",
    language: "\u8bed\u8a00\u8bbe\u7f6e",
    interests: "\u5174\u8da3\u6807\u7b7e",
    interestsDescription: "\u9009\u62e9\u4f60\u5173\u6ce8\u7684\u975e\u9057\u7ebf\u7d22\uff0c\u63a8\u8350\u4f1a\u7ed3\u5408\u6536\u85cf\u548c\u6d4f\u89c8\u8bb0\u5f55\u66f4\u65b0\u3002",
    recommendations: "\u4e3a\u4f60\u63a8\u8350",
    recommendationsDescription: "\u57fa\u4e8e\u4f60\u7684\u6d4f\u89c8\u3001\u6536\u85cf\u548c\u5174\u8da3\u6807\u7b7e\u751f\u6210\u7684\u4e2a\u4eba\u5316\u9986\u85cf\u7ebf\u7d22\u3002",
    emptyFavorites: "\u8fd8\u6ca1\u6709\u6536\u85cf\u9879\u76ee\u3002",
    emptyHistory: "\u8fd8\u6ca1\u6709\u6d4f\u89c8\u8bb0\u5f55\u3002",
    emptyRecommendations: "\u6682\u65f6\u6ca1\u6709\u53ef\u63a8\u8350\u7684\u5185\u5bb9\u3002",
    comments: "\u6211\u7684\u8bc4\u8bba",
    applications: "\u652f\u6301\u4e0e\u5408\u4f5c",
    emptyComments: "\u8fd8\u6ca1\u6709\u63d0\u4ea4\u8bc4\u8bba\u3002",
    emptyApplications: "\u8fd8\u6ca1\u6709\u5173\u8054\u5230\u8d26\u53f7\u7684\u7533\u8bf7\u3002",
    commentStatuses: { pending: "\u7b49\u5f85\u5ba1\u6838", approved: "\u5df2\u901a\u8fc7", rejected: "\u672a\u901a\u8fc7" },
    submissionStatuses: { new: "\u65b0\u63d0\u4ea4", in_progress: "\u5904\u7406\u4e2d", resolved: "\u5df2\u5b8c\u6210" },
    heritageFavorites: "\u975e\u9057\u9879\u76ee",
    imageFavoritesLabel: "\u56fe\u7247\u6536\u85cf",
    inheritorFavorites: "\u4f20\u627f\u4eba",
    museumTopicFavorites: "\u5c55\u89c8\u4e13\u9898",
    viewDetails: "\u67e5\u770b\u6863\u6848",
    viewTopic: "\u8fdb\u5165\u4e13\u9898",
    cacheFavoritesOffline: "\u79bb\u7ebf\u4fdd\u5b58\u6536\u85cf",
    cacheFavoritesOfflineReady: "\u6536\u85cf\u5185\u5bb9\u5df2\u52a0\u5165\u79bb\u7ebf\u7f13\u5b58\u3002",
    cacheFavoritesOfflineEmpty: "\u6682\u65e0\u53ef\u79bb\u7ebf\u4fdd\u5b58\u7684\u975e\u9057\u6536\u85cf\u3002",
    cacheFavoritesOfflineUnavailable: "\u5f53\u524d\u6d4f\u89c8\u5668\u6682\u4e0d\u652f\u6301\u79bb\u7ebf\u7f13\u5b58\u3002",
    saved: "\u8bed\u8a00\u504f\u597d\u5df2\u4fdd\u5b58",
    tagsSaved: "\u5174\u8da3\u6807\u7b7e\u5df2\u66f4\u65b0",
    zh: "\u4e2d\u6587",
    en: "English"
  },
  en: {
    title: "Profile",
    description: "Manage saved heritage items, browsing history and language preference.",
    loginPrompt: "Sign in to keep your personal museum trail.",
    loginAction: "Go to sign in",
    loading: "Loading your collection...",
    signOut: "Sign out",
    favorites: "Favorites",
    history: "Browsing History",
    language: "Language",
    interests: "Interest Tags",
    interestsDescription: "Choose the heritage cues you care about. Recommendations update with your saved and viewed records.",
    recommendations: "Recommended For You",
    recommendationsDescription: "Personal collection leads generated from browsing history, favorites and interest tags.",
    emptyFavorites: "No saved items yet.",
    emptyHistory: "No browsing history yet.",
    emptyRecommendations: "No recommendations available yet.",
    comments: "My Comments",
    applications: "Support & Cooperation",
    emptyComments: "No comments submitted yet.",
    emptyApplications: "No account-linked requests yet.",
    commentStatuses: { pending: "Awaiting review", approved: "Approved", rejected: "Not approved" },
    submissionStatuses: { new: "New", in_progress: "In progress", resolved: "Resolved" },
    heritageFavorites: "Heritage Items",
    imageFavoritesLabel: "Saved Images",
    inheritorFavorites: "Inheritors",
    museumTopicFavorites: "Exhibition Topics",
    viewDetails: "View archive",
    viewTopic: "Explore topic",
    cacheFavoritesOffline: "Save favorites offline",
    cacheFavoritesOfflineReady: "Favorites added to offline cache.",
    cacheFavoritesOfflineEmpty: "No heritage favorites are ready for offline saving.",
    cacheFavoritesOfflineUnavailable: "Offline caching is unavailable in this browser.",
    saved: "Language preference saved",
    tagsSaved: "Interest tags updated",
    zh: "\u4e2d\u6587",
    en: "English"
  }
};

function rowsToItems<T extends { heritage_item_id: string }>(rows: T[], itemById: Map<string, HeritageItem>) {
  return rows.map((row) => itemById.get(row.heritage_item_id)).filter((item): item is HeritageItem => Boolean(item));
}

function rowsToHeritageFavorites(rows: FavoriteSummary[], itemById: Map<string, HeritageItem>) {
  return rows
    .filter((row) => row.target_type === "heritage")
    .map((row) => {
      const targetId = row.target_id || row.heritage_item_id;
      return targetId ? itemById.get(targetId) : undefined;
    })
    .filter((item): item is HeritageItem => Boolean(item));
}

function rowsToInheritorFavorites(rows: FavoriteSummary[], inheritorById: Map<string, InheritorProfile>) {
  return rows
    .filter((row) => row.target_type === "inheritor")
    .map((row) => inheritorById.get(row.target_id))
    .filter((profile): profile is InheritorProfile => Boolean(profile));
}

function rowsToImageFavorites(
  rows: FavoriteSummary[],
  imageById: Map<string, { image: HeritageItem["gallery"][number]; item: HeritageItem }>
) {
  return rows
    .filter((row) => row.target_type === "heritage_image")
    .map((row) => imageById.get(row.target_id))
    .filter((entry): entry is { image: HeritageItem["gallery"][number]; item: HeritageItem } => Boolean(entry));
}

function rowsToMuseumTopicFavorites(rows: FavoriteSummary[], topicById: Map<string, MuseumFeaturedTopic>) {
  return rows
    .filter((row) => row.target_type === "museum_topic")
    .map((row) => topicById.get(row.target_id))
    .filter((topic): topic is MuseumFeaturedTopic => Boolean(topic));
}

function FavoriteGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-sm uppercase tracking-[0.18em] text-museumGold/72">{title}</h3>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

function MuseumTopicFavoriteCard({
  topic,
  locale,
  viewLabel
}: {
  topic: MuseumFeaturedTopic;
  locale: AppLocale;
  viewLabel: string;
}) {
  const displayTitle = locale === "en" ? topic.englishTitle : topic.title;
  const displaySubtitle = locale === "en" ? topic.title : topic.englishTitle;

  return (
    <article className="group relative h-full transition duration-300 hover:-translate-y-2 hover:scale-[1.01]">
      <div className="absolute right-4 top-4 z-30">
        <FavoriteButton targetType="museum_topic" targetId={topic.id} compact />
      </div>
      <Link
        href={topic.href}
        className="flex h-full flex-col overflow-hidden rounded-lg border border-museumGold/18 bg-rice/[0.045] shadow-goldline"
      >
        <div className="relative aspect-[1.3/0.8] overflow-hidden">
          <Image
            src={topic.image}
            alt={displayTitle}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/84 via-ink/12 to-transparent" />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="serif-title text-3xl font-normal text-rice">{displayTitle}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-museumGold/72">{displaySubtitle}</p>
            </div>
            <ArrowUpRight className="mt-1 size-5 shrink-0 text-museumGold transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-rice/62">{topic.summary}</p>
          <span className="mt-auto pt-5 text-sm text-museumGold">{viewLabel}</span>
        </div>
      </Link>
    </article>
  );
}

function ImageFavoriteCard({
  image,
  item,
  locale,
  viewLabel
}: {
  image: HeritageItem["gallery"][number];
  item: HeritageItem;
  locale: AppLocale;
  viewLabel: string;
}) {
  const itemName = locale === "en" ? item.englishName || item.name : item.name;
  const imageName = image.caption || image.alt || itemName;

  return (
    <article className="group relative overflow-hidden rounded-lg border border-museumGold/18 bg-rice/[0.045] shadow-goldline">
      <div className="absolute right-4 top-4 z-30">
        <FavoriteButton itemId={item.id} targetType="heritage_image" targetId={image.id} compact />
      </div>
      <Link href={`/heritage/${item.slug}`} className="block h-full">
        <div className="relative aspect-[4/3] overflow-hidden bg-rice/5">
          <Image
            src={image.src}
            alt={image.alt || imageName}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-base text-rice">{imageName}</h3>
              <p className="mt-2 text-xs text-museumGold/72">{itemName}</p>
            </div>
            <ArrowUpRight className="size-5 shrink-0 text-museumGold transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <span className="mt-4 block text-sm text-museumGold">{viewLabel}</span>
        </div>
      </Link>
    </article>
  );
}

export function ProfileDashboard({ items, inheritors, museumTopics }: ProfileDashboardProps) {
  const rawLocale = useLocale();
  const locale = isAppLocale(rawLocale) ? rawLocale : defaultLocale;
  const text = copy[locale];
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [favorites, setFavorites] = useState<FavoriteSummary[]>([]);
  const [history, setHistory] = useState<HistorySummary[]>([]);
  const [comments, setComments] = useState<CommentSummary[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [preferredLocale, setPreferredLocale] = useState<AppLocale>(locale);
  const [interestTags, setInterestTags] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const itemById = useMemo(() => new Map<string, HeritageItem>(items.map((item) => [item.id, item])), [items]);
  const imageById = useMemo(
    () => new Map(items.flatMap((item) => item.gallery.map((image) => [image.id, { image, item }] as const))),
    [items]
  );
  const availableInterestTags = useMemo(
    () =>
      Array.from(new Set(items.flatMap((item) => item.tags.map((tag) => tag.trim()).filter(Boolean)))).slice(0, 18),
    [items]
  );
  const inheritorById = useMemo(
    () => new Map<string, InheritorProfile>(inheritors.map((profile) => [profile.id, profile])),
    [inheritors]
  );
  const museumTopicById = useMemo(
    () => new Map<string, MuseumFeaturedTopic>(museumTopics.map((topic) => [topic.id, topic])),
    [museumTopics]
  );
  const favoriteItems = useMemo(() => rowsToHeritageFavorites(favorites, itemById), [favorites, itemById]);
  const imageFavorites = useMemo(() => rowsToImageFavorites(favorites, imageById), [favorites, imageById]);
  const favoriteInheritors = useMemo(
    () => rowsToInheritorFavorites(favorites, inheritorById),
    [favorites, inheritorById]
  );
  const favoriteMuseumTopics = useMemo(
    () => rowsToMuseumTopicFavorites(favorites, museumTopicById),
    [favorites, museumTopicById]
  );
  const favoriteCount = favoriteItems.length + imageFavorites.length + favoriteInheritors.length + favoriteMuseumTopics.length;
  const historyItems = useMemo(() => rowsToItems(history, itemById), [history, itemById]);
  const recommendedItems = useMemo(
    () =>
      createHeritageRecommendations({
        items,
        favorites,
        history,
        interestTags,
        inheritors,
        limit: 6
      }).map((recommendation) => recommendation.item),
    [favorites, history, inheritors, interestTags, items]
  );

  const loadProfile = useCallback(async () => {
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser();

      setUser(currentUser ?? null);

      if (!currentUser) {
        return;
      }

      const [favoriteResult, historyResult, preferenceResult, commentResult, submissionResult] = await Promise.all([
        supabase
          .from("user_favorites")
          .select("heritage_item_id, target_type, target_id, created_at")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("user_browsing_history")
          .select("heritage_item_id, viewed_at")
          .eq("user_id", currentUser.id)
          .order("viewed_at", { ascending: false })
          .limit(24),
        supabase
          .from("user_preferences")
          .select("preferred_locale, interest_tags")
          .eq("user_id", currentUser.id)
          .maybeSingle(),
        supabase
          .from("heritage_comments")
          .select("id, heritage_item_id, body, status, created_at")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("contact_submissions")
          .select("id, heritage_item_id, kind, message, status, created_at")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(30)
      ]);

      if (favoriteResult.error) {
        throw favoriteResult.error;
      }

      if (historyResult.error) {
        throw historyResult.error;
      }

      if (preferenceResult.error) {
        throw preferenceResult.error;
      }

      if (commentResult.error) throw commentResult.error;
      if (submissionResult.error) throw submissionResult.error;

      setFavorites((favoriteResult.data ?? []) as FavoriteSummary[]);
      setHistory((historyResult.data ?? []) as HistorySummary[]);
      setComments((commentResult.data ?? []) as CommentSummary[]);
      setSubmissions((submissionResult.data ?? []) as SubmissionSummary[]);
      setPreferredLocale(normalizePreferredLocale((preferenceResult.data as PreferenceSummary)?.preferred_locale));
      setInterestTags(normalizeInterestTags((preferenceResult.data as PreferenceSummary)?.interest_tags));
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : "Failed to load profile.");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function updateLanguage(nextLocale: AppLocale) {
    if (!user) {
      return;
    }

    setStatus("");
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: preferenceError } = await supabase.from("user_preferences").upsert(
        {
          user_id: user.id,
          preferred_locale: nextLocale,
          interest_tags: interestTags
        },
        {
          onConflict: "user_id"
        }
      );

      if (preferenceError) {
        throw preferenceError;
      }

      setPreferredLocale(nextLocale);
      setStatus(text.saved);
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : "Failed to save language preference.");
    }
  }

  async function updateInterestTags(nextTags: string[]) {
    if (!user) {
      return;
    }

    const normalizedTags = normalizeInterestTags(nextTags);
    setStatus("");
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: preferenceError } = await supabase.from("user_preferences").upsert(
        {
          user_id: user.id,
          preferred_locale: preferredLocale,
          interest_tags: normalizedTags
        },
        {
          onConflict: "user_id"
        }
      );

      if (preferenceError) {
        throw preferenceError;
      }

      setInterestTags(normalizedTags);
      setStatus(text.tagsSaved);
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : "Failed to save interest tags.");
    }
  }

  function toggleInterestTag(tag: string) {
    const nextTags = interestTags.includes(tag)
      ? interestTags.filter((item) => item !== tag)
      : [...interestTags, tag];

    void updateInterestTags(nextTags);
  }

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
    setFavorites([]);
    setHistory([]);
    setComments([]);
    setSubmissions([]);
    setInterestTags([]);
  }

  if (user === undefined) {
    return (
      <div className="museum-container py-32 text-center text-rice/62">
        <UserCircle className="mx-auto size-10 text-museumGold" />
        <p className="mt-4">{text.loading}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <section className="bg-ink py-32 text-rice">
        <div className="museum-container">
          <Card className="mx-auto max-w-xl text-center">
            <CardContent className="p-8">
              <UserCircle className="mx-auto size-10 text-museumGold" />
              <h1 className="serif-title mt-5 text-4xl font-normal">{text.title}</h1>
              <p className="mt-4 text-rice/62">{text.loginPrompt}</p>
              <Button asChild className="mt-6">
                <Link href="/login">{text.loginAction}</Link>
              </Button>
              {error ? <p className="mt-5 text-sm text-cinnabar">{error}</p> : null}
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-ink py-24 text-rice md:py-32">
      <div className="museum-container">
        <div className="flex flex-col justify-between gap-6 border-b border-museumGold/18 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase text-museumGold">Member Archive</p>
            <h1 className="serif-title mt-3 text-5xl font-normal md:text-7xl">{text.title}</h1>
            <p className="mt-4 max-w-2xl text-rice/62">{text.description}</p>
            <p className="mt-3 text-sm text-rice/42">{user.email}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="border-rice/45 bg-transparent text-rice hover:border-rice/70 hover:bg-rice/10 hover:text-rice"
            onClick={signOut}
          >
            <LogOut className="size-4" />
            {text.signOut}
          </Button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <Card>
            <CardContent>
              <Heart className="size-5 text-museumGold" />
              <p className="mt-4 text-sm text-rice/48">{text.favorites}</p>
              <p className="serif-title mt-1 text-4xl text-rice">{favoriteCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <MessageSquare className="size-5 text-museumGold" />
              <p className="mt-4 text-sm text-rice/48">{text.comments}</p>
              <p className="serif-title mt-1 text-4xl text-rice">{comments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Send className="size-5 text-museumGold" />
              <p className="mt-4 text-sm text-rice/48">{text.applications}</p>
              <p className="serif-title mt-1 text-4xl text-rice">{submissions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Clock className="size-5 text-museumGold" />
              <p className="mt-4 text-sm text-rice/48">{text.history}</p>
              <p className="serif-title mt-1 text-4xl text-rice">{historyItems.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Languages className="size-5 text-museumGold" />
              <p className="mt-4 text-sm text-rice/48">{text.language}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(["zh", "en"] as AppLocale[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm transition",
                      preferredLocale === item
                        ? "border-museumGold bg-museumGold text-ink"
                        : "border-museumGold/18 text-rice/64 hover:text-rice"
                    )}
                    onClick={() => updateLanguage(item)}
                  >
                    {text[item]}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-5">
          <CardContent>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <div className="flex items-center gap-3">
                  <Tags className="size-5 text-museumGold" />
                  <h2 className="serif-title text-2xl font-normal text-rice">{text.interests}</h2>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-rice/58">{text.interestsDescription}</p>
              </div>
              <p className="text-sm text-museumGold">{interestTags.length}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {availableInterestTags.map((tag) => {
                const selected = interestTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition",
                      selected
                        ? "border-museumGold bg-museumGold text-ink"
                        : "border-museumGold/18 text-rice/58 hover:border-museumGold/48 hover:text-rice"
                    )}
                    onClick={() => toggleInterestTag(tag)}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {status ? <p className="mt-5 text-sm text-museumGold">{status}</p> : null}
        {error ? <p className="mt-5 text-sm text-cinnabar">{error}</p> : null}

        <div className="mt-12 grid gap-12">
          <section>
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="flex items-center gap-3">
                <Heart className="size-5 text-museumGold" />
                <h2 className="serif-title text-3xl font-normal">{text.favorites}</h2>
              </div>
              <FavoriteOfflineCache
                items={favoriteItems}
                locale={locale}
                label={text.cacheFavoritesOffline}
                readyLabel={text.cacheFavoritesOfflineReady}
                emptyLabel={text.cacheFavoritesOfflineEmpty}
                unavailableLabel={text.cacheFavoritesOfflineUnavailable}
              />
            </div>
            {favoriteCount ? (
              <div className="grid gap-9">
                {favoriteItems.length ? (
                  <FavoriteGroup title={text.heritageFavorites}>
                    {favoriteItems.map((item) => (
                      <HeritageCard key={item.slug} item={item} compact />
                    ))}
                  </FavoriteGroup>
                ) : null}
                {imageFavorites.length ? (
                  <FavoriteGroup title={text.imageFavoritesLabel}>
                    {imageFavorites.map(({ image, item }) => (
                      <ImageFavoriteCard
                        key={image.id}
                        image={image}
                        item={item}
                        locale={locale}
                        viewLabel={text.viewDetails}
                      />
                    ))}
                  </FavoriteGroup>
                ) : null}
                {favoriteInheritors.length ? (
                  <FavoriteGroup title={text.inheritorFavorites}>
                    {favoriteInheritors.map((profile) => (
                      <InheritorCard key={profile.id} profile={profile} viewLabel={text.viewDetails} />
                    ))}
                  </FavoriteGroup>
                ) : null}
                {favoriteMuseumTopics.length ? (
                  <FavoriteGroup title={text.museumTopicFavorites}>
                    {favoriteMuseumTopics.map((topic) => (
                      <MuseumTopicFavoriteCard
                        key={topic.id}
                        topic={topic}
                        locale={locale}
                        viewLabel={text.viewTopic}
                      />
                    ))}
                  </FavoriteGroup>
                ) : null}
              </div>
            ) : (
              <Card>
                <CardContent className="text-rice/58">{text.emptyFavorites}</CardContent>
              </Card>
            )}
          </section>

          <section>
            <div className="mb-5 flex items-center gap-3">
              <MessageSquare className="size-5 text-museumGold" />
              <h2 className="serif-title text-3xl font-normal">{text.comments}</h2>
            </div>
            {comments.length ? (
              <div className="grid gap-3">
                {comments.map((comment) => {
                  const item = itemById.get(comment.heritage_item_id);
                  return (
                    <Card key={comment.id}>
                      <CardContent>
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-rice/48">
                          <span>{item ? (locale === "en" ? item.englishName || item.name : item.name) : "-"}</span>
                          <span className="text-museumGold">{text.commentStatuses[comment.status]}</span>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-rice/72">{comment.body}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : <Card><CardContent className="text-rice/58">{text.emptyComments}</CardContent></Card>}
          </section>

          <section>
            <div className="mb-5 flex items-center gap-3">
              <Send className="size-5 text-museumGold" />
              <h2 className="serif-title text-3xl font-normal">{text.applications}</h2>
            </div>
            {submissions.length ? (
              <div className="grid gap-3">
                {submissions.map((submission) => {
                  const item = submission.heritage_item_id ? itemById.get(submission.heritage_item_id) : null;
                  return (
                    <Card key={submission.id}>
                      <CardContent>
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-rice/48">
                          <span>{item ? (locale === "en" ? item.englishName || item.name : item.name) : submission.kind}</span>
                          <span className="text-museumGold">{text.submissionStatuses[submission.status]}</span>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-rice/72">{submission.message}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : <Card><CardContent className="text-rice/58">{text.emptyApplications}</CardContent></Card>}
          </section>

          <section>
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <div className="flex items-center gap-3">
                  <Sparkles className="size-5 text-museumGold" />
                  <h2 className="serif-title text-3xl font-normal">{text.recommendations}</h2>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-rice/58">{text.recommendationsDescription}</p>
              </div>
            </div>
            {recommendedItems.length ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {recommendedItems.map((item) => (
                  <HeritageCard key={item.slug} item={item} compact />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-rice/58">{text.emptyRecommendations}</CardContent>
              </Card>
            )}
          </section>

          <section>
            <div className="mb-5 flex items-center gap-3">
              <Clock className="size-5 text-museumGold" />
              <h2 className="serif-title text-3xl font-normal">{text.history}</h2>
            </div>
            {historyItems.length ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {historyItems.map((item) => (
                  <HeritageCard key={item.slug} item={item} compact />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-rice/58">{text.emptyHistory}</CardContent>
              </Card>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
