# Souls boss artwork provenance

The boss artwork under `public/assets/bosses/` is stored locally so the MGP UI does not depend on third-party hotlinks at runtime.

## Runtime folders

- `public/assets/bosses/ds1/` — 26 Dark Souls / Dark Souls Remastered boss images.
- `public/assets/bosses/ds3/` — 25 Dark Souls III boss images.

## Technical import sources

Most DS1 and DS3 binaries were mirrored from:
- https://github.com/joshuamooredev/boss-tracker-collection

Exceptions:
- DS1 Ornstein & Smough: https://github.com/WilliamWang5632/Rankify/blob/main/rankify/client/src/assets/ornstein-and-smough.jpg
- DS1 Moonlight Butterfly: https://github.com/luxzap7/Dark-Souls-Pathfinder/blob/main/public/assets/images/bosses/ds1/moonlight_butterfly.jpg
- DS3 Soul of Cinder: https://github.com/lcasort/DEWS_LCO/blob/master/DarkSouls/public/img/bosses/soul-of-cinder.jpg

The original/reference page for each displayed image remains stored in the corresponding boss image data module and is exposed in the UI as “Reference / rights”. The exact technical mirror used to obtain each local binary is exposed separately as “File source”.

## Rights note

Mirroring a file into this repository is not a claim of ownership or a blanket license grant. Dark Souls, its characters, artwork, screenshots, and related assets remain the property of their respective rights holders. The UI keeps visible source/reference links and an ownership notice alongside the artwork.

Do not remove source metadata when replacing an asset. When an image is replaced, update both its local file and the technical provenance mapping.
