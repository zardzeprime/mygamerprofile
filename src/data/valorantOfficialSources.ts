export type ValorantOfficialSource = {
  id: string;
  label: string;
  url: string;
  region: "BR" | "global";
  kind: "news" | "esports" | "youtube" | "instagram" | "tiktok";
  automation: "active" | "api-required";
};

export const VALORANT_OFFICIAL_SOURCES: ValorantOfficialSource[] = [
  {
    id: "riot-news-br",
    label: "VALORANT Brasil · Notícias",
    url: "https://playvalorant.com/pt-br/news/",
    region: "BR",
    kind: "news",
    automation: "active",
  },
  {
    id: "vct-news-br",
    label: "VALORANT Esports · Brasil",
    url: "https://valorantesports.com/pt-BR/news",
    region: "BR",
    kind: "esports",
    automation: "active",
  },
  {
    id: "youtube-br",
    label: "VALORANT // Brasil · YouTube",
    url: "https://www.youtube.com/@valorantbrasil",
    region: "BR",
    kind: "youtube",
    automation: "active",
  },
  {
    id: "instagram-br",
    label: "VALORANT Brasil · Instagram",
    url: "https://www.instagram.com/valorantbrasil/",
    region: "BR",
    kind: "instagram",
    automation: "api-required",
  },
  {
    id: "tiktok-br",
    label: "VALORANT Brasil · TikTok",
    url: "https://www.tiktok.com/@valorantbrasil",
    region: "BR",
    kind: "tiktok",
    automation: "api-required",
  },
  {
    id: "riot-news-global",
    label: "VALORANT · Global News",
    url: "https://playvalorant.com/en-us/news/",
    region: "global",
    kind: "news",
    automation: "active",
  },
];
