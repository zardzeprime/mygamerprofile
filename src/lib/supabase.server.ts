import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// These are public project coordinates, not privileged credentials. Keep the
// server fallback aligned with the generated browser client so SSR/serverFns and
// NEXUS can still reach Supabase when a host does not inject VITE_* variables.
const PUBLIC_SUPABASE_URL = "https://gudvdgpjfapshzqyfcpj.supabase.co";
const PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_JXVaM-rr7Yu59l3x7WyHEg_qlR-uDMX";

export function getSupabasePublicConfig() {
  const url =
    import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"] || PUBLIC_SUPABASE_URL;
  const publishableKey =
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return { url, publishableKey };
}

export function getSupabasePublic() {
  const { url, publishableKey } = getSupabasePublicConfig();

  return createClient<Database>(url, publishableKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
