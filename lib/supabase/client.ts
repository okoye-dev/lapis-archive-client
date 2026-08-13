import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "./config";

let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (client) return client;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Login isn't configured yet");
  }

  client = createBrowserClient(supabaseUrl, supabaseKey);
  return client;
}
