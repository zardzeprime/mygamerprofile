import { supabase } from "@/integrations/supabase/client";

export type LeagueBuildItem = {
  id: string;
  name: string;
};

export type LeagueBuildVariant = {
  id: string;
  label: "primary" | "alternative";
  startingItems: LeagueBuildItem[];
  items: LeagueBuildItem[];
};

export type LeagueBuildResponse = {
  champion: string;
  slug: string;
  role: string | null;
  patch: string | null;
  source: {
    label: string;
    url: string;
    verifiedAt: string;
  };
  builds: LeagueBuildVariant[];
};

const CACHE = new Map<string, Promise<LeagueBuildResponse>>();

export function getLeagueChampionBuilds(champion: string) {
  const key = champion.trim().toLowerCase();
  const cached = CACHE.get(key);
  if (cached) return cached;

  const request = supabase.functions
    .invoke<LeagueBuildResponse>("league-builds", {
      body: { champion },
    })
    .then(({ data, error }) => {
      if (error || !data) {
        throw error ?? new Error("LEAGUE_BUILDS_EMPTY");
      }
      return data;
    })
    .catch((error) => {
      CACHE.delete(key);
      throw error;
    });

  CACHE.set(key, request);
  return request;
}
