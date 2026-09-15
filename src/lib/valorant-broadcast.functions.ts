import { createServerFn } from "@tanstack/react-start";

type YouTubeVideo = {
  id: { videoId?: string };
  snippet: { title: string; scheduledStartTime?: string; liveBroadcastContent?: string };
};

type YouTubeSearchResponse = { items?: YouTubeVideo[] };
type YouTubeChannelResponse = { items?: Array<{ id: string }> };

export type ValorantBroadcast = {
  videoId: string;
  title: string;
  url: string;
  status: "live" | "upcoming";
  scheduledAt?: string;
};

let cache: { expiresAt: number; data: ValorantBroadcast[] } | null = null;

async function youtubeJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`youtube_api_${response.status}`);
  return (await response.json()) as T;
}

export const getValorantOfficialBroadcasts = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["YOUTUBE_API_KEY"];
  if (!key) return { configured: false as const, broadcasts: [] as ValorantBroadcast[] };

  if (cache && cache.expiresAt > Date.now()) {
    return { configured: true as const, broadcasts: cache.data };
  }

  const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
  channelUrl.searchParams.set("part", "id");
  channelUrl.searchParams.set("forHandle", "ValorantEsports");
  channelUrl.searchParams.set("key", key);
  const channel = await youtubeJson<YouTubeChannelResponse>(channelUrl);
  const channelId = channel.items?.[0]?.id;
  if (!channelId) return { configured: true as const, broadcasts: [] as ValorantBroadcast[] };

  const results: ValorantBroadcast[] = [];
  for (const eventType of ["live", "upcoming"] as const) {
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("channelId", channelId);
    searchUrl.searchParams.set("eventType", eventType);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("order", "date");
    searchUrl.searchParams.set("maxResults", "5");
    searchUrl.searchParams.set("key", key);
    const payload = await youtubeJson<YouTubeSearchResponse>(searchUrl);
    for (const item of payload.items ?? []) {
      const videoId = item.id.videoId;
      if (!videoId) continue;
      const broadcast: ValorantBroadcast = {
        videoId,
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        status: eventType,
      };
      if (item.snippet.scheduledStartTime) broadcast.scheduledAt = item.snippet.scheduledStartTime;
      results.push(broadcast);
    }
  }

  cache = { expiresAt: Date.now() + 2 * 60 * 1000, data: results };
  return { configured: true as const, broadcasts: results };
});
