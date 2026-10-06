import { createBrowserClient } from "@supabase/ssr";
import { FALLBACK_SUPABASE_ANON_KEY, FALLBACK_SUPABASE_URL } from "./config";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

  return createBrowserClient(url, key);
}
