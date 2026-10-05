import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";
const APP_URL = "https://mgprofile.online";
const LINK_TTL_MS = 10 * 60 * 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function randomState() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function requireUser(req: Request) {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) throw new Error("AUTH_REQUIRED");

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRole) throw new Error("SERVER_CONFIG_MISSING");

  const admin = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const token = auth.slice("Bearer ".length);
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new Error("AUTH_INVALID");
  return { admin, user: data.user };
}

async function getSteamSummary(steamId: string) {
  const key = Deno.env.get("STEAM_WEB_API_KEY")?.trim();
  if (!key) return null;

  const url = new URL("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/");
  url.searchParams.set("key", key);
  url.searchParams.set("steamids", steamId);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.response?.players?.[0] ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  try {
    const { admin, user } = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const action = typeof body?.action === "string" ? body.action : "";

    if (action === "begin") {
      const state = randomState();
      const stateHash = await sha256(state);
      const expiresAt = new Date(Date.now() + LINK_TTL_MS).toISOString();

      await admin.from("steam_link_states").delete().lt("expires_at", new Date().toISOString());

      const { error } = await admin.from("steam_link_states").insert({
        state_hash: stateHash,
        user_id: user.id,
        expires_at: expiresAt,
      });
      if (error) throw new Error("STEAM_LINK_STATE_FAILED");

      const returnTo = `${APP_URL}/connect/steam/callback?state=${encodeURIComponent(state)}`;
      const url = new URL(STEAM_OPENID_ENDPOINT);
      url.searchParams.set("openid.ns", "http://specs.openid.net/auth/2.0");
      url.searchParams.set("openid.mode", "checkid_setup");
      url.searchParams.set("openid.return_to", returnTo);
      url.searchParams.set("openid.realm", `${APP_URL}/`);
      url.searchParams.set("openid.identity", "http://specs.openid.net/auth/2.0/identifier_select");
      url.searchParams.set("openid.claimed_id", "http://specs.openid.net/auth/2.0/identifier_select");
      return json({ ok: true, url: url.toString() });
    }

    if (action === "complete") {
      const state = typeof body?.state === "string" ? body.state : "";
      const params =
        body?.params && typeof body.params === "object"
          ? (body.params as Record<string, string>)
          : {};
      if (!state || Object.keys(params).length === 0) throw new Error("STEAM_OPENID_RESPONSE_INVALID");

      const stateHash = await sha256(state);
      const { data: linkState, error: stateError } = await admin
        .from("steam_link_states")
        .select("user_id,expires_at")
        .eq("state_hash", stateHash)
        .maybeSingle();

      if (stateError || !linkState) throw new Error("STEAM_LINK_STATE_INVALID");
      if (linkState.user_id !== user.id) throw new Error("STEAM_LINK_STATE_OWNER_MISMATCH");
      if (new Date(linkState.expires_at).getTime() <= Date.now()) {
        await admin.from("steam_link_states").delete().eq("state_hash", stateHash);
        throw new Error("STEAM_LINK_STATE_EXPIRED");
      }

      const expectedReturnTo = `${APP_URL}/connect/steam/callback?state=${encodeURIComponent(state)}`;
      const mode = params["openid.mode"];
      const opEndpoint = params["openid.op_endpoint"];
      const returnTo = params["openid.return_to"];
      const claimedId = params["openid.claimed_id"];
      const identity = params["openid.identity"];

      if (mode !== "id_res") throw new Error("STEAM_OPENID_CANCELLED");
      if (opEndpoint !== STEAM_OPENID_ENDPOINT) throw new Error("STEAM_OPENID_ENDPOINT_INVALID");
      if (returnTo !== expectedReturnTo) throw new Error("STEAM_OPENID_RETURN_INVALID");
      if (!claimedId || identity !== claimedId) throw new Error("STEAM_OPENID_IDENTITY_INVALID");

      const match = claimedId.match(/^https:\/\/steamcommunity\.com\/openid\/id\/(7656119\d{10})$/);
      const steamId = match?.[1];
      if (!steamId) throw new Error("STEAM_OPENID_IDENTITY_INVALID");

      const verification = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (key.startsWith("openid.") && typeof value === "string") verification.set(key, value);
      }
      verification.set("openid.mode", "check_authentication");

      const verifyResponse = await fetch(STEAM_OPENID_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "text/plain" },
        body: verification.toString(),
        signal: AbortSignal.timeout(12_000),
      });
      if (!verifyResponse.ok) throw new Error("STEAM_OPENID_VERIFY_FAILED");
      const verifyText = await verifyResponse.text();
      if (!/(^|\n)is_valid:true(\n|$)/.test(verifyText)) throw new Error("STEAM_OPENID_VERIFY_FAILED");

      const { data: existing, error: existingError } = await admin
        .from("connected_accounts")
        .select("user_id")
        .eq("provider", "steam")
        .eq("provider_user_id", steamId)
        .maybeSingle();
      if (existingError) throw new Error("STEAM_LINK_LOOKUP_FAILED");
      if (existing && existing.user_id !== user.id) throw new Error("STEAM_ACCOUNT_ALREADY_LINKED");

      const player = await getSteamSummary(steamId);
      const now = new Date().toISOString();
      const displayName =
        typeof player?.personaname === "string" && player.personaname.trim()
          ? player.personaname.trim()
          : `Steam ${steamId.slice(-6)}`;

      const { error: upsertError } = await admin.from("connected_accounts").upsert(
        {
          user_id: user.id,
          provider: "steam",
          provider_user_id: steamId,
          display_name: displayName,
          status: "connected",
          granted_scopes: [],
          public_metadata: {
            profile_url:
              typeof player?.profileurl === "string"
                ? player.profileurl
                : `https://steamcommunity.com/profiles/${steamId}/`,
            avatar_url: player?.avatarfull || player?.avatarmedium || player?.avatar || null,
            country_code: player?.loccountrycode ?? null,
            visibility:
              player?.communityvisibilitystate === 3 ? "public" : "private_or_limited",
          },
          connected_at: now,
          last_synced_at: now,
          disconnected_at: null,
        },
        { onConflict: "user_id,provider" },
      );
      if (upsertError) throw new Error("STEAM_LINK_SAVE_FAILED");

      await admin.from("steam_link_states").delete().eq("state_hash", stateHash);
      return json({ ok: true, steamId, displayName });
    }

    if (action === "disconnect") {
      const { error } = await admin
        .from("connected_accounts")
        .delete()
        .eq("user_id", user.id)
        .eq("provider", "steam");
      if (error) throw new Error("STEAM_DISCONNECT_FAILED");
      return json({ ok: true });
    }

    return json({ error: "UNKNOWN_ACTION" }, 400);
  } catch (error) {
    const code = error instanceof Error ? error.message : "STEAM_OPENID_ERROR";
    const status =
      code === "AUTH_REQUIRED" || code === "AUTH_INVALID"
        ? 401
        : code === "STEAM_ACCOUNT_ALREADY_LINKED"
          ? 409
          : 400;
    return json({ error: code }, status);
  }
});
