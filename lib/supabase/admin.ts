import { timingSafeEqual } from "node:crypto";

export async function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  const { createClient } = await import("@supabase/supabase-js");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function verifyAdminRequest(request: Request) {
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    return false;
  }

  const providedKey = request.headers.get("x-admin-key");

  if (!providedKey) {
    return false;
  }

  const expected = Buffer.from(expectedKey);
  const provided = Buffer.from(providedKey);

  return expected.length === provided.length && timingSafeEqual(expected, provided);
}
