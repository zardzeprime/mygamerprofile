import { createClient } from "@supabase/supabase-js";

function getSupabaseAdminConfig() {
  const url = process.env["SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"];
  const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!url || !serviceRoleKey) {
    throw new Error("Missing server-side Supabase admin configuration.");
  }

  return { url, serviceRoleKey };
}

/**
 * Server-only client for trusted backend workflows that cannot use end-user RLS,
 * such as anonymous NEXUS trial sessions. Never import this file into client code.
 */
export function getSupabaseAdmin() {
  const { url, serviceRoleKey } = getSupabaseAdminConfig();

  return createClient(url, serviceRoleKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
