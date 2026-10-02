export type ProfileBackgroundKey =
  | "mgp-grid"
  | "ember"
  | "tactical"
  | "midnight"
  | "rift-nebula"
  | "emberstorm"
  | "hextech-pulse";

export type ProfileBackgroundPreset = {
  key: ProfileBackgroundKey;
  name: { "pt-BR": string; en: string; es: string };
  description: { "pt-BR": string; en: string; es: string };
  className: string;
  premium?: boolean;
  animated?: boolean;
};

const DEFAULT_PROFILE_BACKGROUND: ProfileBackgroundPreset = {
  key: "mgp-grid",
  name: { "pt-BR": "Grade ÍMPAR", en: "ÍMPAR Grid", es: "Cuadrícula ÍMPAR" },
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
  {
    key: "rift-nebula",
    name: { "pt-BR": "Nébula do Rift", en: "Rift Nebula", es: "Nébula del Rift" },
    description: {
      "pt-BR": "Névoa cósmica em profundidade com estrelas em movimento.",
      en: "Deep-space mist with a drifting starfield.",
      es: "Niebla cósmica profunda con estrellas en movimiento.",
    },
    className: "profile-bg-rift-nebula",
    animated: true,
  },
  {
    key: "emberstorm",
    name: { "pt-BR": "Tempestade de Brasas", en: "Emberstorm", es: "Tormenta de Brasas" },
    description: {
      "pt-BR": "Luz quente e partículas de brasa subindo pelo perfil.",
      en: "Warm light and ember particles rising across your profile.",
      es: "Luz cálida y partículas de brasas ascendiendo por tu perfil.",
    },
    className: "profile-bg-emberstorm",
    animated: true,
  },
  {
    key: "hextech-pulse",
    name: { "pt-BR": "Pulso Hextech", en: "Hextech Pulse", es: "Pulso Hextech" },
    description: {
      "pt-BR": "Grade tecnológica azul-dourada com pulsos de energia.",
      en: "Blue-gold technological grid with moving energy pulses.",
      es: "Cuadrícula tecnológica azul-dorada con pulsos de energía.",
    },
    className: "profile-bg-hextech-pulse",
    animated: true,
  },
];

export function getProfileBackground(key?: string | null) {
  return PROFILE_BACKGROUNDS.find((preset) => preset.key === key) ?? DEFAULT_PROFILE_BACKGROUND;
}
