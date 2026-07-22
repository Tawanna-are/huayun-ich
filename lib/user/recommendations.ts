import type { UserBrowsingHistoryRow, UserFavoriteRow } from "@/lib/types/database";
import type { HeritageItem } from "@/lib/types/heritage";
import type { InheritorProfile } from "@/lib/types/inheritor";
import { getMuseumTopicBySlug, getRepresentativeItemsForTopic } from "@/lib/content/museum-topics";
import { normalizeInterestTags } from "@/lib/user/preferences";

export type RecommendationReason =
  | "interest_tag"
  | "favorite_related"
  | "history_related"
  | "shared_tag"
  | "category"
  | "region"
  | "curated";

export type RecommendationFavoriteSignal = Pick<UserFavoriteRow, "heritage_item_id" | "target_type" | "target_id">;

export type RecommendationHistorySignal = Pick<UserBrowsingHistoryRow, "heritage_item_id">;

export type HeritageRecommendation = {
  item: HeritageItem;
  score: number;
  reasons: RecommendationReason[];
};

type RecommendationInput = {
  items: HeritageItem[];
  favorites: RecommendationFavoriteSignal[];
  history: RecommendationHistorySignal[];
  interestTags: string[];
  inheritors: Pick<InheritorProfile, "id" | "heritageSlug">[];
  limit?: number;
};

function normalizeForCompare(value: string) {
  return value.trim().toLocaleLowerCase();
}

function hasOverlap(values: string[], lookup: Set<string>) {
  return values.some((value) => lookup.has(normalizeForCompare(value)));
}

function countOverlap(values: string[], lookup: Set<string>) {
  return values.reduce((count, value) => count + (lookup.has(normalizeForCompare(value)) ? 1 : 0), 0);
}

function addReason(reasons: RecommendationReason[], reason: RecommendationReason) {
  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
}

function isRelatedTo(candidate: HeritageItem, signals: HeritageItem[]) {
  return signals.some(
    (signal) =>
      candidate.relatedSlugs.includes(signal.slug) ||
      signal.relatedSlugs.includes(candidate.slug) ||
      candidate.slug === signal.slug
  );
}

function resolveFavoriteSignalItems({
  favorites,
  items,
  itemById,
  itemBySlug,
  inheritorById
}: {
  favorites: RecommendationFavoriteSignal[];
  items: HeritageItem[];
  itemById: Map<string, HeritageItem>;
  itemBySlug: Map<string, HeritageItem>;
  inheritorById: Map<string, Pick<InheritorProfile, "id" | "heritageSlug">>;
}) {
  const signals: HeritageItem[] = [];
  const topicSignals: HeritageItem[] = [];
  const categorySignals = new Set<string>();
  const topicPriorityBySlug = new Map<string, number>();

  for (const favorite of favorites) {
    if (favorite.target_type === "heritage") {
      const targetId = favorite.target_id || favorite.heritage_item_id;
      const item = targetId ? itemById.get(targetId) : undefined;

      if (item) {
        signals.push(item);
      }
    }

    if (favorite.target_type === "inheritor") {
      const inheritor = inheritorById.get(favorite.target_id);
      const item = inheritor ? itemBySlug.get(inheritor.heritageSlug) : undefined;

      if (item) {
        signals.push(item);
      }
    }

    if (favorite.target_type === "museum_topic") {
      const topic = getMuseumTopicBySlug(favorite.target_id);

      if (topic) {
        const representativeItems = getRepresentativeItemsForTopic(topic, items);
        topicSignals.push(...representativeItems);
        representativeItems.forEach((item, index) => {
          const current = topicPriorityBySlug.get(item.slug);

          if (current === undefined || index < current) {
            topicPriorityBySlug.set(item.slug, index);
          }
        });
        topic.categorySlugs?.forEach((categorySlug) => categorySignals.add(categorySlug));
      } else {
        categorySignals.add(favorite.target_id);
      }
    }
  }

  return {
    signals,
    topicSignals,
    topicPriorityBySlug,
    categorySignals
  };
}

export function createHeritageRecommendations({
  items,
  favorites,
  history,
  interestTags,
  inheritors,
  limit = 6
}: RecommendationInput): HeritageRecommendation[] {
  const itemById = new Map(items.map((item) => [item.id, item]));
  const itemBySlug = new Map(items.map((item) => [item.slug, item]));
  const inheritorById = new Map(inheritors.map((inheritor) => [inheritor.id, inheritor]));
  const normalizedInterestTags = new Set(normalizeInterestTags(interestTags).map(normalizeForCompare));
  const historySignals = history
    .map((row) => itemById.get(row.heritage_item_id))
    .filter((item): item is HeritageItem => Boolean(item));
  const favoriteSignalResult = resolveFavoriteSignalItems({
    favorites,
    items,
    itemById,
    itemBySlug,
    inheritorById
  });
  const favoriteSignals = favoriteSignalResult.signals;
  const topicSignals = favoriteSignalResult.topicSignals;
  const allSignals = [...favoriteSignals, ...historySignals, ...topicSignals];
  const excludedIds = new Set([...favoriteSignals, ...historySignals].map((item) => item.id));
  const signalTags = new Set(allSignals.flatMap((item) => item.tags.map(normalizeForCompare)));
  const signalCategories = new Set([
    ...allSignals.map((item) => item.categorySlug),
    ...favoriteSignalResult.categorySignals
  ]);
  const signalProvinces = new Set(allSignals.map((item) => item.province));

  const scored = items
    .filter((item) => !excludedIds.has(item.id))
    .map<HeritageRecommendation>((item) => {
      const reasons: RecommendationReason[] = [];
      let score = 0;
      const interestOverlap = countOverlap(item.tags, normalizedInterestTags);
      const signalTagOverlap = countOverlap(item.tags, signalTags);

      if (interestOverlap > 0) {
        score += interestOverlap * 8;
        addReason(reasons, "interest_tag");
      }

      if (isRelatedTo(item, [...favoriteSignals, ...topicSignals])) {
        score += 7;
        addReason(reasons, "favorite_related");
      }

      if (isRelatedTo(item, historySignals)) {
        score += 6;
        addReason(reasons, "history_related");
      }

      if (signalCategories.has(item.categorySlug)) {
        score += 5;
        addReason(reasons, "category");
      }

      if (signalTagOverlap > 0) {
        score += Math.min(signalTagOverlap * 2, 6);
        addReason(reasons, "shared_tag");
      }

      if (signalProvinces.has(item.province)) {
        score += 2;
        addReason(reasons, "region");
      }

      const topicPriority = favoriteSignalResult.topicPriorityBySlug.get(item.slug);

      if (topicPriority !== undefined) {
        score += Math.max(1, 4 - topicPriority);
        addReason(reasons, "shared_tag");
      }

      if (score === 0) {
        score = 1;
        addReason(reasons, "curated");
      }

      return {
        item,
        score,
        reasons
      };
    });

  return scored
    .sort((a, b) => b.score - a.score || b.item.inscriptionYear - a.item.inscriptionYear || a.item.slug.localeCompare(b.item.slug))
    .slice(0, limit);
}
