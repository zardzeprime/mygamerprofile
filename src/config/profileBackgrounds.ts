export type ProfileBackgroundKey = "mgp-grid" | "ember" | "tactical" | "midnight";

export type ProfileBackgroundPreset = {
  key: ProfileBackgroundKey;
  name: { "pt-BR": string; en: string; es: string };
  description: { "pt-BR": string; en: string; es: string };
  className: string;
  premium?: boolean;
};

const DEFAULT_PROFILE_BACKGROUND: ProfileBackgroundPreset = {
    key: "mgp-grid",
    name: { "pt-BR": "Grade MGP", en: "MGP Grid", es: "Cuadrícula MGP" },
    description: {
      "pt-BR": "Identidade institucional em preto e dourado.",
      en: "Institutional black-and-gold identity.",
      es: "Identidad institucional en negro y dorado.",
    },
    className: "profile-bg-mgp-grid",
  };

export const PROFILE_BACKGROUNDS: ProfileBackgroundPreset[] = [
  DEFAULT_PROFILE_BACKGROUND,
  {
    key: "ember",
    name: { "pt-BR": "Brasas", en: "Embers", es: "Brasas" },
    description: {
      "pt-BR": "Calor, fumaça e brilho de fogueira.",
      en: "Heat, smoke and bonfire glow.",
      es: "Calor, humo y brillo de hoguera.",
    },
    className: "profile-bg-ember",
  },
  {
    key: "tactical",
    name: { "pt-BR": "Tático", en: "Tactical", es: "Táctico" },
    description: {
      "pt-BR": "Linhas frias e energia competitiva.",
      en: "Cool lines and competitive energy.",
      es: "Líneas frías y energía competitiva.",
    },
    className: "profile-bg-tactical",
  },
  {
    key: "midnight",
    name: { "pt-BR": "Meia-noite", en: "Midnight", es: "Medianoche" },
    description: {
      "pt-BR": "Minimalista, escuro e discreto.",
      en: "Minimal, dark and understated.",
      es: "Minimalista, oscuro y discreto.",
    },
    className: "profile-bg-midnight",
  },
];

export function getProfileBackground(key?: string | null) {
  return PROFILE_BACKGROUNDS.find((preset) => preset.key === key) ?? DEFAULT_PROFILE_BACKGROUND;
}
