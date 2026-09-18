# VALORANT pro-settings exhaustive review — 2026-09-18

## Scope

The current MG Profile competitive directory contains 350 roster entries and 349 unique normalized handles.

At the start of this review, 115 unique handles had no sourced settings record in the MGP merge layers. Every one of those 115 handles was individually attempted against current public sources, with ProSettings as the primary settings reference and VLR used to reconcile roster identity when a handle differed.

This was a manual identity/source review. It was **not** a bulk scrape.

## Added after a safe identity match

The review found five records that were safe enough to add:

- `Jerrwin` — exact Sentinels player identity; ProSettings individual page.
- `Eggsterr` — VLR exact roster handle; ProSettings uses `Eggster` for the same ENVY player context.
- `P0PPIN` — VLR identifies Matteo Weber; ProSettings `Poppin` is Matteo Weber on Team Envy.
- `Boni` — exact M80 player page.
- `alvinboy` — VLR identifies Alvin Hong; ProSettings `Alvin` is Alvin Hong on M80.

Each added record keeps its individual ProSettings URL and a reconciliation note where the public handle differs.

After these additions the source map has 239 settings keys. The actual CI coverage is validated separately by `scripts/check-valorant-data.cjs`.

## Attempted but still unresolved

The following 110 unique handles remain without a source-safe settings record:

- `erde`
- `ion`
- `GLYPH`
- `Brinks`
- `KROSTALY`
- `Proxh`
- `Chaza`
- `Ruxic`
- `Kolosha`
- `GSR`
- `Spear`
- `audaz`
- `Favian`
- `echo`
- `kozzy`
- `hezacoil`
- `Kachoww`
- `DeadInk`
- `b1squw1`
- `kamyk`
- `Pa1ze`
- `musashi`
- `Jamelinho213`
- `kendo`
- `SSeeS`
- `yatsuka`
- `Caedye`
- `Akame`
- `Killua`
- `seph1roth`
- `thyy`
- `Leviathan`
- `Ash`
- `Efina`
- `Raxcal`
- `Xiesta`
- `DH`
- `natz`
- `Zeus`
- `STYRON`
- `Absol`
- `eKo`
- `C1ndeR`
- `Klaus`
- `XuNa`
- `oonzmlp`
- `Zexy`
- `WoohyuN`
- `Ivy`
- `Kippei`
- `Misaya`
- `yuran`
- `margaret`
- `Hermes`
- `Ray`
- `Cloudy`
- `Wolverine`
- `Faither`
- `Kadoom`
- `Apinya`
- `Laz`
- `NIZ`
- `canady`
- `doffy`
- `aLerT`
- `endoist`
- `Shr1mp`
- `Bai`
- `iamgrq`
- `yilai`
- `bud`
- `FT`
- `Jieni7`
- `stew`
- `zjc`
- `Xlele`
- `Setrod`
- `jkuro`
- `zhe`
- `crownfisher`
- `kodeth`
- `GREEN`
- `lucas`
- `Dynamite`
- `ra1ny`
- `Coco`
- `Spitfires`
- `FKEY`
- `Toosy`
- `Erv`
- `xihe`
- `glacier`
- `aluba`
- `nothing`
- `WsLeo`
- `Sharks`
- `NoMan`
- `Flex1n`
- `Verse`
- `SpiritZ1`
- `Akeman`
- `sibeastw0w`
- `Tonk`
- `Ying`
- `Krst1Ng`
- `Folykiki`
- `Dingwei`
- `Layla`
- `Pink`
- `Chaos`

Because one normalized handle is duplicated across roster entries, this corresponds to 111 of the 350 directory entries still lacking sourced settings.

## Deliberately rejected ambiguous matches

Examples of search results that were **not** inserted:

- `natz` in the current MGP roster is Jonathan Adiputra of Team Secret, not Ayaz “nAts” Akhmetshin.
- `Laz` in the current MGP roster is Kittikawin Jirawatkakan of Sharper Esports, not Koji “Laz” Ushida.
- `Dingwei` on VLR is Wei Dingwei on A Team, while the ProSettings page found under the same handle identifies Wei Ting-wei from Taiwan; this identity mismatch is not safe to merge.
- `Cloudy` was not treated as `Cloud`.
- `Coco` was not treated as `coconut`.
- `Krst1Ng` was not treated as `k1Ng`.
- `Zeus` was not matched to unrelated League/CS players sharing the handle.
- community comments or partial gear reports were not upgraded into a complete settings record without an individual source page.

## Rule going forward

“Complete all players” means attempting every directory entry, not fabricating missing information.

A player remains visible in the directory even if settings are unavailable. Settings, crosshair and peripherals stay hidden until an individual source can be tied to the correct player with sufficient confidence. New verified records should be added field-by-field so older sourced data is not erased by a newer partial page.

## Full attempted set

- `Jerrwin`
- `Eggsterr`
- `P0PPIN`
- `Boni`
- `alvinboy`
- `erde`
- `ion`
- `GLYPH`
- `Brinks`
- `KROSTALY`
- `Proxh`
- `Chaza`
- `Ruxic`
- `Kolosha`
- `GSR`
- `Spear`
- `audaz`
- `Favian`
- `echo`
- `kozzy`
- `hezacoil`
- `Kachoww`
- `DeadInk`
- `b1squw1`
- `kamyk`
- `Pa1ze`
- `musashi`
- `Jamelinho213`
- `kendo`
- `SSeeS`
- `yatsuka`
- `Caedye`
- `Akame`
- `Killua`
- `seph1roth`
- `thyy`
- `Leviathan`
- `Ash`
- `Efina`
- `Raxcal`
- `Xiesta`
- `DH`
- `natz`
- `Zeus`
- `STYRON`
- `Absol`
- `eKo`
- `C1ndeR`
- `Klaus`
- `XuNa`
- `oonzmlp`
- `Zexy`
- `WoohyuN`
- `Ivy`
- `Kippei`
- `Misaya`
- `yuran`
- `margaret`
- `Hermes`
- `Ray`
- `Cloudy`
- `Wolverine`
- `Faither`
- `Kadoom`
- `Apinya`
- `Laz`
- `NIZ`
- `canady`
- `doffy`
- `aLerT`
- `endoist`
- `Shr1mp`
- `Bai`
- `iamgrq`
- `yilai`
- `bud`
- `FT`
- `Jieni7`
- `stew`
- `zjc`
- `Xlele`
- `Setrod`
- `jkuro`
- `zhe`
- `crownfisher`
- `kodeth`
- `GREEN`
- `lucas`
- `Dynamite`
- `ra1ny`
- `Coco`
- `Spitfires`
- `FKEY`
- `Toosy`
- `Erv`
- `xihe`
- `glacier`
- `aluba`
- `nothing`
- `WsLeo`
- `Sharks`
- `NoMan`
- `Flex1n`
- `Verse`
- `SpiritZ1`
- `Akeman`
- `sibeastw0w`
- `Tonk`
- `Ying`
- `Krst1Ng`
- `Folykiki`
- `Dingwei`
- `Layla`
- `Pink`
- `Chaos`
