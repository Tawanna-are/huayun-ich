import { campaignDefinitions, type CampaignDefinition } from "@/lib/content/multichannel-content";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type CampaignConfigPayload = {
  slug: string;
  title: string;
  englishTitle: string;
  summary: string;
  englishSummary: string;
  description: string;
  englishDescription: string;
  heroImage: string;
  accent: string;
  prioritySlugs: string[];
  keywords: string[];
  published: boolean;
  sortOrder: number;
};

type CampaignConfigRow = {
  slug: string;
  title: string;
  english_title: string;
  summary: string;
  english_summary: string;
  description: string;
  english_description: string;
  hero_image: string;
  accent: string;
  priority_slugs: string[];
  keywords: string[];
  published: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

function definitionToPayload(definition: CampaignDefinition, index: number): CampaignConfigPayload {
  return {
    slug: definition.slug,
    title: definition.title,
    englishTitle: definition.englishTitle,
    summary: definition.summary,
    englishSummary: definition.englishSummary,
    description: definition.description,
    englishDescription: definition.englishDescription,
    heroImage: definition.heroImage,
    accent: definition.accent,
    prioritySlugs: definition.prioritySlugs,
    keywords: definition.keywords,
    published: true,
    sortOrder: index * 10
  };
}

function rowToPayload(row: CampaignConfigRow): CampaignConfigPayload {
  return {
    slug: row.slug,
    title: row.title,
    englishTitle: row.english_title,
    summary: row.summary,
    englishSummary: row.english_summary,
    description: row.description,
    englishDescription: row.english_description,
    heroImage: row.hero_image,
    accent: row.accent,
    prioritySlugs: row.priority_slugs ?? [],
    keywords: row.keywords ?? [],
    published: row.published,
    sortOrder: row.sort_order
  };
}

function payloadToRow(payload: CampaignConfigPayload) {
  return {
    slug: payload.slug,
    title: payload.title,
    english_title: payload.englishTitle,
    summary: payload.summary,
    english_summary: payload.englishSummary,
    description: payload.description,
    english_description: payload.englishDescription,
    hero_image: payload.heroImage,
    accent: payload.accent,
    priority_slugs: payload.prioritySlugs,
    keywords: payload.keywords,
    published: payload.published,
    sort_order: payload.sortOrder,
    updated_at: new Date().toISOString()
  };
}

export function getDefaultCampaignConfigs(): CampaignConfigPayload[] {
  return campaignDefinitions.map(definitionToPayload);
}

export async function getAdminCampaignConfigs() {
  const supabase = await createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("campaign_configs")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const configured = ((data ?? []) as CampaignConfigRow[]).map(rowToPayload);
  return configured.length ? configured : getDefaultCampaignConfigs();
}

export async function upsertAdminCampaignConfig(payload: CampaignConfigPayload) {
  const supabase = await createSupabaseAdminClient();
  const { error } = await supabase.from("campaign_configs").upsert(payloadToRow(payload), {
    onConflict: "slug"
  });

  if (error) {
    throw new Error(error.message);
  }

  return { ok: true };
}
