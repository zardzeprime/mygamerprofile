import { supabase } from "@/integrations/supabase/client";

export type PublicProfileSearchResult = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
};

export async function searchPublicProfilesClient(
  query: string,
  limit = 6,
): Promise<PublicProfileSearchResult[]> {
  const term = query.trim().replace(/[%_,()*]/g, "").slice(0, 80);
  if (!term) return [];

  const pattern = `%${term}%`;
  const select = "id,username,display_name,avatar_url,bio";

  const [usernameResult, displayNameResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(select)
      .eq("visibility", "public")
      .ilike("username", pattern)
      .limit(limit),
    supabase
      .from("profiles")
      .select(select)
      .eq("visibility", "public")
      .ilike("display_name", pattern)
      .limit(limit),
  ]);

  if (usernameResult.error) throw usernameResult.error;
  if (displayNameResult.error) throw displayNameResult.error;

  const merged = [
    ...(usernameResult.data ?? []),
    ...(displayNameResult.data ?? []),
  ] as PublicProfileSearchResult[];

  const unique = Array.from(
    new Map(merged.map((profile) => [profile.id, profile])).values(),
  );

  const q = term.toLowerCase();
  return unique
    .sort((first, second) => {
      const firstUsername = first.username.toLowerCase();
      const secondUsername = second.username.toLowerCase();
      const firstScore =
        firstUsername === q
          ? 0
          : firstUsername.startsWith(q)
            ? 1
            : first.display_name.toLowerCase().startsWith(q)
              ? 2
              : 3;
      const secondScore =
        secondUsername === q
          ? 0
          : secondUsername.startsWith(q)
            ? 1
            : second.display_name.toLowerCase().startsWith(q)
              ? 2
              : 3;
      return firstScore - secondScore || firstUsername.localeCompare(secondUsername);
    })
    .slice(0, limit);
}
