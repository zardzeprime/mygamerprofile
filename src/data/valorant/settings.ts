import type { EsportsSource, ProPlayerSettings } from "./types";

export const VERIFIED_AT = "2026-09-17";

export const VERIFIED_SETTINGS: Record<string, { settings: ProPlayerSettings; source: EsportsSource }> = {
  cryocells: {
    settings: { dpi: 1600, sensitivity: 0.087, edpi: 139.2, pollingRateHz: 8000, mouse: "Logitech G Pro X2 SUPERSTRIKE Lunar Eclipse", resolution: "1280x1024", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;c;5;o;1;0l;3;0o;0;0a;1;0f;0;1b;0" },
    source: { url: "https://prosettings.net/players/cryocells/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  jinggg: {
    settings: { dpi: 1600, sensitivity: 0.175, edpi: 280, pollingRateHz: 2000, mouse: "Pulsar Jinggg-x", keyboard: "Wooting 60HE v2 Silver", monitor: "ZOWIE XL2566K", headset: "HyperX Cloud III Wireless", mousepad: "Artisan Ninja FX Zero Soft Orange", resolution: "1920x1080", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;c;5;o;1;f;0;m;1;0t;3;0l;0;0v;1;0g;1;0o;0;0a;1;0f;0;1t;1;1l;4;1g;1;1o;0;1a;1;1m;0;1f;0;S;c;5;o;1" },
    source: { url: "https://prosettings.net/players/jinggg/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  f0rsaken: {
    settings: { dpi: 800, sensitivity: 0.712, edpi: 569.6, pollingRateHz: 4000, mouse: "Pulsar Susanto-X", keyboard: "Wooting 60HE v2 Silver", monitor: "ZOWIE XL2566X+", headset: "HyperX Cloud III Wireless", mousepad: "Pulsar eS Saturn Pro Red", crosshairCode: "0;p;0;c;1;s;1;P;h;0;f;0;s;0;0l;3;0v;3;0g;1;0o;0;0a;1;0f;0;1b;0;A;o;1;d;1;0b;0;1b;0;S;d;0" },
    source: { url: "https://prosettings.net/players/f0rsaken/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  aspas: {
    settings: { dpi: 800, sensitivity: 0.4, edpi: 320, pollingRateHz: 1000, mouse: "Logitech G Pro X Superlight 2 Black", keyboard: "ATK RS6 Ultra Aspas Edition", monitor: "ZOWIE XL2586X", headset: "Razer BlackShark V3 Pro Black", mousepad: "SteelSeries QcK Large Black", resolution: "1920x1080", displayMode: "Fullscreen", crosshairCode: "0;P;h;0;0l;4;0o;0;0a;1;0f;0;1b;0" },
    source: { url: "https://prosettings.net/players/aspas/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  saadhak: {
    settings: { keyboard: "Wooting 60HE+", monitor: "ZOWIE XL2566X+", headset: "Logitech G PRO X 2 Headset Magenta", mousepad: "Pulsar eS Saturn Pro Black", earphones: "Shure SE215 Blue", dpi: 900, sensitivity: 0.255, edpi: 229.5, pollingRateHz: 500, mouse: "Logitech G Pro X2 SUPERSTRIKE Lunar Eclipse", resolution: "1920x1080", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;c;3;h;0;d;1;z;1;a;0.7;0t;1;0l;2;0a;1;0f;0;1t;3;1o;1;1a;0.7;1m;0;1f;0;S;c;5;s;0;o;1" },
    source: { url: "https://prosettings.net/players/saadhak/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  less: {
    settings: { keyboard: "ASUS ROG Falcata", monitor: "ZOWIE XL2566K", headset: "HyperX Cloud Alpha", mousepad: "Pulsar eS Saturn Pro Red", dpi: 800, sensitivity: 0.32, edpi: 256, pollingRateHz: 4000, mouse: "Logitech G Pro 2 LIGHTSPEED Magenta", resolution: "1920x1080", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;o;1;d;1;f;0;0l;2;0o;0;0a;1;0f;0;1b;0" },
    source: { url: "https://prosettings.net/players/less/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  splash: {
    settings: { dpi: 1600, sensitivity: 0.125, edpi: 200, pollingRateHz: 2000, mouse: "VAXEE NP-01S V3 Galapagos Green" },
    source: { url: "https://prosettings.net/players/splash/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  c0m: {
    settings: { keyboard: "Wooting 60HE+", monitor: "ZOWIE XL2566X+", headset: "HyperX Cloud II", mousepad: "Artisan Ninja FX Zero Mid", dpi: 800, sensitivity: 0.2, edpi: 160, pollingRateHz: 1000, mouse: "Logitech G Pro X2 SUPERSTRIKE Lunar Eclipse", resolution: "1440x1080", displayMode: "Fullscreen", crosshairCode: "0;p;0;s;1;P;c;5;o;1;f;0;0t;1;0l;3;0o;2;0a;1;0f;0;1b;0;A;c;5;o;1;0t;1;0l;3;0o;2;0a;1;0f;0;1b;0;S;s;0.823;o;1" },
    source: { url: "https://prosettings.net/players/c0m/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  nats: {
    settings: { dpi: 800, sensitivity: 0.49, edpi: 392, pollingRateHz: 1000, mouse: "ZOWIE U2-DW Black", resolution: "1280x960", displayMode: "Fullscreen", crosshairCode: "0;P;c;1;o;1;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0" },
    source: { url: "https://prosettings.net/players/nats/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  basic: {
    settings: { dpi: 800, sensitivity: 0.28, edpi: 224, pollingRateHz: 2000, mouse: "Logitech G Pro X2 SUPERSTRIKE Lunar Eclipse" },
    source: { url: "https://prosettings.net/players/basic/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  zekken: {
    settings: { dpi: 1600, sensitivity: 0.175, edpi: 280, pollingRateHz: 1000, mouse: "Razer Viper V4 Pro Black", keyboard: "MelGeek MADE68 Ultra V2", monitor: "ZOWIE XL2586X+", headset: "Razer BlackShark V3 Pro Black", mousepad: "Artisan Ninja FX Zero Soft Black", crosshairCode: "0;s;1;P;c;1;t;2;o;1;d;1;0b;0;1b;0;S;b;1;c;8;s;0.823" },
    source: { url: "https://prosettings.net/players/zekken/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings and gear page checked for MGP." },
  },
  boaster: {
    settings: { dpi: 800, sensitivity: 0.2, edpi: 160, pollingRateHz: 1000, mouse: "Fnatic x Lamzu Thorn", keyboard: "Sony INZONE KBD-H75", monitor: "SONY INZONE M10S", headset: "SONY INZONE H9 II", mousepad: "SONY INZONE MAT-F", crosshairCode: "0;s;1;P;c;1;o;1;d;1;0l;0;0o;2;0a;1;0f;0;1t;0;1l;0;1o;0;1a;0;S;c;1;o;1" },
    source: { url: "https://prosettings.net/players/boaster/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings and gear page checked for MGP; roster status requires refresh." },
  },
  alfajer: {
    settings: { dpi: 400, sensitivity: 0.45, edpi: 180, pollingRateHz: 1000, mouse: "Logitech G Pro X2 SUPERSTRIKE Lunar Eclipse", keyboard: "Sony INZONE KBD-H75", monitor: "SONY INZONE M10S", headset: "HyperX Cloud II", mousepad: "Artisan Ninja FX Zero Soft Orange", crosshairCode: "0;p;0;s;1;P;h;0;f;0;0l;2;0o;2;0a;1;0f;0;1b;0;A;c;5;o;1;d;1;0b;0;1b;0;S;s;0.628;o;1" },
    source: { url: "https://prosettings.net/players/alfajer/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings and gear page checked for MGP." },
  },
  zmjjkk: {
    settings: { dpi: 800, sensitivity: 0.395, edpi: 316, pollingRateHz: 4000, mouse: "VAXEE NP-01S V3 Pink", keyboard: "Wooting 60HE+", monitor: "ZOWIE XL2566X+", headset: "HyperX Cloud III Wireless", mousepad: "Artisan Type-99 Gray", earphones: "Moondrop Blessing 3", crosshairCode: "0;P;h;0;d;1;f;0;0l;2;0v;2;0g;1;0o;1;0f;0;1b;0" },
    source: { url: "https://prosettings.net/players/zmjjkk/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings and gear page checked for MGP." },
  },
  nobody: {
    settings: { dpi: 800, sensitivity: 0.26, edpi: 208, pollingRateHz: 1000, mouse: "Razer DeathAdder V3 HyperSpeed", keyboard: "IQUNIX EZ63 HE", monitor: "ZOWIE XL2566X+", headset: "Razer BlackShark V3 Pro Black", mousepad: "VAXEE PD151", crosshairCode: "0;s;1;P;o;1;m;1;0t;1;0l;2;0v;2;0g;1;0o;2;0a;1;0f;0;1b;0;S;c;5;o;1" },
    source: { url: "https://prosettings.net/players/nobody/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings and gear page checked for MGP." },
  },
};

export const VERIFIED_ROLES: Record<string, string> = {
  cryocells: "Duelista",
  jinggg: "Duelista",
  f0rsaken: "Flex",
  aspas: "Duelista",
  zekken: "Duelista",
  boaster: "Controlador / IGL",
  alfajer: "Sentinela / flex",
  zmjjkk: "Duelista / operador",
  nobody: "Iniciador",
};

