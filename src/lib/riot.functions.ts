import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const riotIdSchema = z
  .string()
  .trim()
  .min(3)
  .max(64)
  .refine((value) => value.includes("#"), "Use o formato Nome#TAG");

const lookupSchema = z.object({
  riotId: riotIdSchema,
  routing: z.enum(["americas", "europe", "asia", "sea"]).default("americas"),
});

export type RiotAccountLookupResult = {
  puuid: string;
  gameName: string;
  tagLine: string;
};

function parseRiotId(value: string) {
  const separator = value.lastIndexOf("#");
  const gameName = value.slice(0, separator).trim();
  const tagLine = value.slice(separator + 1).trim();

  if (!gameName || !tagLine || gameName.length > 32 || tagLine.length > 12) {
    throw new Error("RIOT_ID_INVALID");
  }

  return { gameName, tagLine };
}

export const lookupRiotAccount = createServerFn({ method: "POST" })
  .inputValidator((data) => lookupSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["RIOT_API_KEY"]?.trim();
    if (!apiKey) {
      throw new Error("RIOT_API_NOT_CONFIGURED");
    }

    const { gameName, tagLine } = parseRiotId(data.riotId);
    const endpoint = new URL(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      `https://${data.routing}.api.riotgames.com`,
    );

    const response = await fetch(endpoint, {
      headers: {
        "X-Riot-Token": apiKey,
      },
    });

    if (response.status === 404) throw new Error("RIOT_ACCOUNT_NOT_FOUND");
    if (response.status === 403) throw new Error("RIOT_API_FORBIDDEN");
    if (response.status === 429) throw new Error("RIOT_API_RATE_LIMIT");
    if (!response.ok) throw new Error(`RIOT_API_${response.status}`);

    const account = (await response.json()) as Partial<RiotAccountLookupResult>;
    if (!account.puuid || !account.gameName || !account.tagLine) {
      throw new Error("RIOT_API_INVALID_RESPONSE");
    }

    return {
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
    } satisfies RiotAccountLookupResult;
  });


export const getRiotApiReadiness = createServerFn({ method: "GET" }).handler(async () => ({
  apiKeyConfigured: Boolean(process.env["RIOT_API_KEY"]?.trim()),
  rsoConfigured: Boolean(
    process.env["RIOT_RSO_CLIENT_ID"]?.trim() &&
      process.env["RIOT_RSO_CLIENT_SECRET"]?.trim(),
  ),
  publicAppUrlConfigured: Boolean(process.env["PUBLIC_APP_URL"]?.trim()),
}));
