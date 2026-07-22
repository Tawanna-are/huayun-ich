import { createSupabaseClient } from "@/lib/supabase/client";

let browserClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createBrowserSupabaseClient() {
  if (!browserClient) {
    browserClient = createSupabaseClient();
  }

  return browserClient;
}
