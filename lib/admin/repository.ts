import { heritageSelect, normalizeHeritageItemSelectRow } from "@/lib/content/heritage-repository";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CategoryRow, HeritageItemSelectRow } from "@/lib/types/database";

export async function getAdminCategories() {
  const supabase = await createSupabaseAdminClient();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order", {
    ascending: true
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CategoryRow[];
}

export async function getAdminHeritageRows() {
  const supabase = await createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("heritage_items")
    .select(heritageSelect)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as HeritageItemSelectRow[]).map(normalizeHeritageItemSelectRow);
}
