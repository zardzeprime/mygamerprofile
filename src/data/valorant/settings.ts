import type { EsportsSource, ProPlayerSettings } from "./types";

export const VERIFIED_AT = "2026-09-16";

export const VERIFIED_SETTINGS: Record<string, { settings: ProPlayerSettings; source: EsportsSource }> = {
  cryocells: {
    settings: { dpi: 1600, sensitivity: 0.087, edpi: 139.2, pollingRateHz: 8000, mouse: "Logitech G Pro X2 SUPERSTRIKE Lunar Eclipse", resolution: "1280x1024", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;c;5;o;1;0l;3;0o;0;0a;1;0f;0;1b;0" },
    source: { url: "https://prosettings.net/players/cryocells/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  jinggg: {
    settings: { dpi: 1600, sensitivity: 0.175, edpi: 280, pollingRateHz: 2000, mouse: "Pulsar Jinggg-x", resolution: "1920x1080", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;c;5;o;1;f;0;m;1;0t;3;0l;0;0v;1;0g;1;0o;0;0a;1;0f;0;1t;1;1l;4;1g;1;1o;0;1a;1;1m;0;1f;0;S;c;5;o;1" },
    source: { url: "https://prosettings.net/players/jinggg/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  f0rsaken: {
    settings: { dpi: 800, sensitivity: 0.712, edpi: 569.6, pollingRateHz: 4000, mouse: "Pulsar Susanto-X" },
    source: { url: "https://prosettings.net/players/f0rsaken/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  aspas: {
    settings: { dpi: 800, sensitivity: 0.4, edpi: 320, pollingRateHz: 1000, mouse: "Logitech G Pro X Superlight 2 Black", resolution: "1920x1080", displayMode: "Fullscreen", crosshairCode: "0;P;h;0;0l;4;0o;0;0a;1;0f;0;1b;0" },
    source: { url: "https://prosettings.net/players/aspas/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  saadhak: {
    settings: { dpi: 900, sensitivity: 0.255, edpi: 229.5, pollingRateHz: 500, mouse: "Logitech G Pro X2 SUPERSTRIKE Lunar Eclipse", resolution: "1920x1080", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;c;3;h;0;d;1;z;1;a;0.7;0t;1;0l;2;0a;1;0f;0;1t;3;1o;1;1a;0.7;1m;0;1f;0;S;c;5;s;0;o;1" },
    source: { url: "https://prosettings.net/players/saadhak/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  less: {
    settings: { dpi: 800, sensitivity: 0.32, edpi: 256, pollingRateHz: 4000, mouse: "Logitech G Pro 2 LIGHTSPEED Magenta", resolution: "1920x1080", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;o;1;d;1;f;0;0l;2;0o;0;0a;1;0f;0;1b;0" },
    source: { url: "https://prosettings.net/players/less/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  splash: {
    settings: { dpi: 1600, sensitivity: 0.125, edpi: 200, pollingRateHz: 2000, mouse: "VAXEE NP-01S V3 Galapagos Green" },
    source: { url: "https://prosettings.net/players/splash/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  c0m: {
    settings: { dpi: 800, sensitivity: 0.2, edpi: 160, pollingRateHz: 1000, mouse: "Logitech G Pro X2 SUPERSTRIKE Lunar Eclipse", resolution: "1440x1080", displayMode: "Fullscreen", crosshairCode: "0;p;0;s;1;P;c;5;o;1;f;0;0t;1;0l;3;0o;2;0a;1;0f;0;1b;0;A;c;5;o;1;0t;1;0l;3;0o;2;0a;1;0f;0;1b;0;S;s;0.823;o;1" },
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
};

export const VERIFIED_ROLES: Record<string, string> = {
  cryocells: "Duelista",
  jinggg: "Duelista",
  f0rsaken: "Flex",
  aspas: "Duelista",
};
