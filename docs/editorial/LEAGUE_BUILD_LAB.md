# League Build Lab

Status: active foundation.

## Runtime sources

- Riot Data Dragon: current champion list, champion artwork, item IDs, localized item names, item icons and prices.
- LoLalytics: current patch/role build path parsed server-side by `league-builds`.
- Riot champion pages, OP.GG, Mobalytics and League of Graphs: visible cross-check links for human/NEXUS review. Their data is not silently merged into the automatic build unless a future adapter explicitly declares it.

## Verification model

The UI uses the label **MGP Verificada** rather than “Riot recommended”. Data Dragon documents recommended-item structures but current 16.18.1 champion payloads can expose an empty `recommended` array (verified against Akali), so MGP does not pretend that empty data is an official Riot build.

The current service:

1. Receives a champion name.
2. Normalizes its LoLalytics slug.
3. Fetches the current champion build page server-side.
4. Reads patch, role, starting items, core build and later-slot alternatives.
5. Returns up to two paths: primary and alternative.
6. Caches the result in the Edge isolate for 30 minutes.
7. Resolves item presentation through Riot Data Dragon in the frontend.

Live probes on 2026-09-18 returned builds for Akali, Garen, Jinx and Yasuo on patch 16.18.

## Build creator

The League hub exposes a dedicated Builds module. Players can:

- choose a champion;
- choose one or two core items;
- add up to six total items;
- treat remaining slots as variants/situational choices;
- add their own explanation;
- compare their selected core with the current verified primary path.

## NEXUS Build Guide

NEXUS appears as a contextual helper beside the builder, not as a chat window. The first version is deterministic and source-grounded: it uses champion/build context and the current verified path to ask short questions such as whether the core is complete, whether the custom path diverges from the current statistical reference and which situational slots are still missing.

This is intentionally preferable to generating unsourced advice on every keystroke. A future NEXUS inference adapter may enrich the cards after adapters for Riot/OP.GG/Mobalytics/League of Graphs are independently declared, cached and source-labelled.

## Reliability

The public frontend never scrapes third-party build pages directly. `league-builds` is a bounded, rate-limited Supabase Edge Function with a 14-second upstream timeout and a project-key gate. If the source fails, MGP hides the verified recommendation rather than inventing one.
