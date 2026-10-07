import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { FALLBACK_SUPABASE_ANON_KEY, FALLBACK_SUPABASE_URL } from "./config";

export function getAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
