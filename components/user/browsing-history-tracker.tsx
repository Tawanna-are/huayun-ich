"use client";

import { useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type BrowsingHistoryTrackerProps = {
  itemId: string;
};

export function BrowsingHistoryTracker({ itemId }: BrowsingHistoryTrackerProps) {
  useEffect(() => {
    let active = true;

    async function recordView() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!active || !user) {
          return;
        }

        const { error } = await supabase.from("user_browsing_history").upsert(
          {
            user_id: user.id,
            heritage_item_id: itemId,
            viewed_at: new Date().toISOString()
          },
          {
            onConflict: "user_id,heritage_item_id"
          }
        );

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error("Failed to record browsing history:", error instanceof Error ? error.message : error);
      }
    }

    recordView();

    return () => {
      active = false;
    };
  }, [itemId]);

  return null;
}
