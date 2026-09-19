
-- Remove the temporary game-referenced cosmetic prototype collection.
-- The underlying cosmetic/loadout system remains available for future curated assets.
delete from public.profile_cosmetics
where slug like 'brawlhalla-%' or slug like 'transformice-%' or slug like 'counter-strike-%' or slug like 'valorant-skye-%' or slug like 'league-%' or slug like 'minecraft-%' or slug like 'roblox-%' or slug like 'palworld-%' or slug like 'dark-souls-%' or slug like 'elden-ring-%';
