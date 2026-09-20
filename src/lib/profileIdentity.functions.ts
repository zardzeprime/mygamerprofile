import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { getSupabasePublicConfig } from "@/lib/supabase.server";

const authSchema = z.object({
  accessToken: z.string().min(20).max(4096),
});

const equipSchema = authSchema.extend({
  slot: z.enum(["title", "background", "avatar_frame", "profile_effect", "banner", "cursor", "nameplate"]),
  slug: z.string().trim().min(2).max(80).nullable(),
});

const publicSchema = z.object({
  userId: z.string().uuid(),
});

type LocalizedText = {
  "pt-BR"?: string;
  en?: string;
  es?: string;
};

type SerializableValue =
  | string
  | number
  | boolean
  | null
  | SerializableValue[]
  | { [key: string]: SerializableValue };

export type ProfileIdentityRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic";

export type ProfileTitleCatalogItem = {
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  rarity: ProfileIdentityRarity;
  source: string;
  icon_key: string;
  unlock_rule: { [key: string]: SerializableValue };
  unlocked: boolean;
  unlocked_at: string | null;
  is_new: boolean;
};

export type ProfileCosmeticCatalogItem = {
  slug: string;
  kind: "background" | "banner" | "avatar_frame" | "cursor" | "profile_effect" | "badge" | "chibi" | "nameplate";
  name: LocalizedText;
  description: LocalizedText;
  css_class: string | null;
  rarity: ProfileIdentityRarity;
  animated: boolean;
  acquisition_method: string;
  unlocked: boolean;
  unlocked_at: string | null;
  is_new: boolean;
};

export type ProfileIdentityLoadout = {
  title_slug: string | null;
  background_slug: string | null;
  avatar_frame_slug: string | null;
  effect_slug: string | null;
  banner_slug: string | null;
  cursor_slug: string | null;
  nameplate_slug: string | null;
};

export type PublicProfileLoadout = {
  title: {
    slug: string;
    name: LocalizedText;
    description: LocalizedText;
    rarity: ProfileIdentityRarity;
    iconKey: string;
  } | null;
  background: {
    slug: string;
    name: LocalizedText;
    rarity: ProfileIdentityRarity;
    cssClass: string | null;
    animated: boolean;
  } | null;
  avatarFrame: {
    slug: string;
    name: LocalizedText;
    rarity: ProfileIdentityRarity;
    cssClass: string | null;
    animated: boolean;
  } | null;
  effect: {
    slug: string;
    name: LocalizedText;
    rarity: ProfileIdentityRarity;
    cssClass: string | null;
    animated: boolean;
  } | null;
  banner: {
    slug: string;
    name: LocalizedText;
    rarity: ProfileIdentityRarity;
    cssClass: string | null;
    animated: boolean;
  } | null;
  cursor: {
    slug: string;
    name: LocalizedText;
    rarity: ProfileIdentityRarity;
    cssClass: string | null;
    animated: boolean;
  } | null;
  nameplate: {
    slug: string;
    name: LocalizedText;
    rarity: ProfileIdentityRarity;
    cssClass: string | null;
    animated: boolean;
  } | null;
};

function createUserDb(accessToken: string) {
  const { url, publishableKey } = getSupabasePublicConfig();
  return createClient(url, publishableKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function authenticate(accessToken: string) {
  const db = createUserDb(accessToken);
  const { data, error } = await db.auth.getUser(accessToken);
  if (error || !data.user) throw new Error("PROFILE_IDENTITY_AUTH_INVALID");
  return { db, userId: data.user.id };
}

export const getProfileIdentityStudio = createServerFn({ method: "POST" })
  .validator((data) => authSchema.parse(data))
  .handler(async ({ data }) => {
    const { db, userId } = await authenticate(data.accessToken);

    await db
      .rpc("evaluate_profile_unlocks", { target_user_id: userId })
      .then(({ error }) => {
        if (error) console.warn("[MGP Identity] evaluation failed", error);
      });

    const [titlesResult, titleUnlocksResult, cosmeticsResult, cosmeticUnlocksResult, loadoutResult] =
      await Promise.all([
        db
          .from("profile_titles")
          .select("slug,name,description,rarity,source,icon_key,unlock_rule")
          .eq("active", true)
          .order("created_at"),
        db
          .from("profile_title_unlocks")
          .select("title_slug,unlocked_at,is_new")
          .eq("user_id", userId),
        db
          .from("profile_cosmetics")
          .select("slug,kind,name,description,css_class,rarity,animated,acquisition_method")
          .eq("active", true)
          .in("kind", ["background", "avatar_frame", "profile_effect", "banner", "cursor", "nameplate"])
          .order("kind")
          .order("created_at"),
        db
          .from("profile_cosmetic_unlocks")
          .select("cosmetic_slug,unlocked_at,is_new")
          .eq("user_id", userId),
        db
          .from("profile_loadouts")
          .select("title_slug,background_slug,avatar_frame_slug,effect_slug,banner_slug,cursor_slug,nameplate_slug")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

    if (titlesResult.error) throw new Error("PROFILE_TITLES_LOAD_FAILED");
    if (titleUnlocksResult.error) throw new Error("PROFILE_TITLE_UNLOCKS_LOAD_FAILED");
    if (cosmeticsResult.error) throw new Error("PROFILE_COSMETICS_LOAD_FAILED");
    if (cosmeticUnlocksResult.error) throw new Error("PROFILE_COSMETIC_UNLOCKS_LOAD_FAILED");
    if (loadoutResult.error) throw new Error("PROFILE_LOADOUT_LOAD_FAILED");

    const titleUnlockMap = new Map(
      (titleUnlocksResult.data ?? []).map((item) => [item.title_slug, item]),
    );
    const cosmeticUnlockMap = new Map(
      (cosmeticUnlocksResult.data ?? []).map((item) => [item.cosmetic_slug, item]),
    );

    const titles = (titlesResult.data ?? []).map((item) => {
      const unlock = titleUnlockMap.get(item.slug);
      return {
        ...item,
        name: item.name as LocalizedText,
        description: item.description as LocalizedText,
        unlock_rule: (item.unlock_rule ?? {}) as { [key: string]: SerializableValue },
        rarity: item.rarity as ProfileIdentityRarity,
        unlocked: Boolean(unlock),
        unlocked_at: unlock?.unlocked_at ?? null,
        is_new: unlock?.is_new ?? false,
      } satisfies ProfileTitleCatalogItem;
    });

    const cosmetics = (cosmeticsResult.data ?? []).map((item) => {
      const unlock = cosmeticUnlockMap.get(item.slug);
      return {
        ...item,
        name: item.name as LocalizedText,
        description: item.description as LocalizedText,
        rarity: item.rarity as ProfileIdentityRarity,
        unlocked: Boolean(unlock),
        unlocked_at: unlock?.unlocked_at ?? null,
        is_new: unlock?.is_new ?? false,
      } satisfies ProfileCosmeticCatalogItem;
    });

    const loadout: ProfileIdentityLoadout = loadoutResult.data ?? {
      title_slug: null,
      background_slug: null,
      avatar_frame_slug: null,
      effect_slug: null,
      banner_slug: null,
      cursor_slug: null,
      nameplate_slug: null,
    };

    return { titles, cosmetics, loadout };
  });

export const equipProfileIdentity = createServerFn({ method: "POST" })
  .validator((data) => equipSchema.parse(data))
  .handler(async ({ data }) => {
    const { db, userId } = await authenticate(data.accessToken);

    if (data.slug) {
      if (data.slot === "title") {
        const { data: unlock, error } = await db
          .from("profile_title_unlocks")
          .select("title_slug")
          .eq("user_id", userId)
          .eq("title_slug", data.slug)
          .maybeSingle();
        if (error || !unlock) throw new Error("PROFILE_TITLE_LOCKED");
      } else {
        const expectedKind =
          data.slot === "profile_effect" ? "profile_effect" : data.slot;
        const [{ data: unlock, error: unlockError }, { data: cosmetic, error: cosmeticError }] =
          await Promise.all([
            db
              .from("profile_cosmetic_unlocks")
              .select("cosmetic_slug")
              .eq("user_id", userId)
              .eq("cosmetic_slug", data.slug)
              .maybeSingle(),
            db
              .from("profile_cosmetics")
              .select("kind")
              .eq("slug", data.slug)
              .eq("active", true)
              .maybeSingle(),
          ]);
        if (unlockError || !unlock) throw new Error("PROFILE_COSMETIC_LOCKED");
        if (cosmeticError || !cosmetic || cosmetic.kind !== expectedKind) {
          throw new Error("PROFILE_COSMETIC_SLOT_MISMATCH");
        }
      }
    }

    const column =
      data.slot === "title"
        ? "title_slug"
        : data.slot === "profile_effect"
          ? "effect_slug"
          : data.slot === "avatar_frame"
            ? "avatar_frame_slug"
            : `${data.slot}_slug`;

    const { error } = await db
      .from("profile_loadouts")
      .upsert(
        {
          user_id: userId,
          [column]: data.slug,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (error) throw new Error("PROFILE_IDENTITY_EQUIP_FAILED");

    if (data.slot === "title" && data.slug) {
      await db
        .from("profile_title_unlocks")
        .update({ is_new: false })
        .eq("user_id", userId)
        .eq("title_slug", data.slug);
    } else if (data.slug) {
      await db
        .from("profile_cosmetic_unlocks")
        .update({ is_new: false })
        .eq("user_id", userId)
        .eq("cosmetic_slug", data.slug);
    }

    return { ok: true, slot: data.slot, slug: data.slug };
  });

export const getPublicProfileLoadout = createServerFn({ method: "GET" })
  .validator((data) => publicSchema.parse(data))
  .handler(async ({ data }) => {
    const { url, publishableKey } = getSupabasePublicConfig();
    const endpoint = new URL("/rest/v1/rpc/get_public_profile_loadout", url);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ target_user_id: data.userId }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      console.warn("[MGP Identity] public loadout failed", response.status);
      return null;
    }

    return (await response.json()) as PublicProfileLoadout | null;
  });
