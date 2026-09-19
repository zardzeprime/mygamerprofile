import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// These are public project coordinates, not privileged credentials. Keep the
// server fallback aligned with the generated browser client so SSR/serverFns and
// NEXUS can still reach Supabase when a host does not inject VITE_* variables.
const PUBLIC_SUPABASE_URL = "https://gudvdgpjfapshzqyfcpj.supabase.co";
const PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_JXVaM-rr7Yu59l3x7WyHEg_qlR-uDMX";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    // Modern Supabase publishable keys are opaque API keys, not JWT access tokens.
    // supabase-js may otherwise mirror the project key into Authorization on
    // server-side anonymous calls, which makes PostgREST/Auth reject it as an
    // invalid bearer token. Keep it only in `apikey`; preserve real user JWTs.
    if (
      isNewSupabaseApiKey(supabaseKey) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

export function getSupabasePublicConfig() {
  // Keep SSR/server public reads on the same canonical project as the browser.
  // The hosting workspace currently injects a separate empty Supabase project.
  return {
    url: PUBLIC_SUPABASE_URL,
    publishableKey: PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function getSupabasePublicConfigs() {
  return [getSupabasePublicConfig()];
}

export function getSupabasePublic() {
  const { url, publishableKey } = getSupabasePublicConfig();

  return createClient<Database>(url, publishableKey, {
    global: {
      fetch: createSupabaseFetch(publishableKey),
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
