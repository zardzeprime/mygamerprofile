# VALORANT official news automation

Status: active source-discovery foundation.

## Purpose

Keep the MG Profile VALORANT hub aware of official news without turning the site into an uncontrolled scraper or automatically publishing rumors.

The watch runs daily at 10:25 UTC and can also be started manually. It checks official first-party channels, writes only new candidates to `docs/editorial/valorant-news-candidates.json`, and opens or updates a review pull request. It never auto-merges and does not publish a candidate directly into the public feed.

## Source priority

1. VALORANT Brasil news on `playvalorant.com/pt-br/news/`.
2. VALORANT Esports Brasil on `valorantesports.com/pt-BR/news`.
3. Verified `VALORANT // Brasil` YouTube channel through YouTube's public channel feed.
4. Global Riot VALORANT news is a fallback/editorial reference.

The official Instagram and TikTok handles for VALORANT Brasil are registered in the application source registry, but automatic ingestion is intentionally marked `api-required`. MGP must not bypass platform access controls or depend on fragile unauthorized scraping. When an approved official API/connector is available, those sources can be enabled behind the same candidate-review pipeline.

## Review contract

Before a candidate is promoted to `src/data/valorantNews.ts`:

- confirm the URL is still official and accessible;
- confirm publication date and category;
- write or verify localized title/summary;
- remove duplicates;
- do not copy long source passages;
- preserve the official source URL;
- do not convert social rumors, replies or community posts into official Riot news.

## Failure mode

A source failure must not remove existing news. The script logs the failing source and continues with the remaining allowlisted sources. If no new candidates are found, no branch or pull request is created.
