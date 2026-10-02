export type ProfileCustomizationSlot =
  | "background"
  | "banner"
  | "avatar_frame"
  | "cursor"
  | "profile_effect"
  | "chibi"
  | "badges";

export type CustomizationReadiness = "available" | "foundation" | "planned";

export type ProfileCustomizationSlotDefinition = {
  id: ProfileCustomizationSlot;
  label: { "pt-BR": string; en: string; es: string };
  description: { "pt-BR": string; en: string; es: string };
  readiness: CustomizationReadiness;
  maxEquipped?: number;
};

export const PROFILE_CUSTOMIZATION_SLOTS: ProfileCustomizationSlotDefinition[] = [
  {
    id: "background",
    label: { "pt-BR": "Plano de fundo", en: "Background", es: "Fondo" },
    description: {
      "pt-BR": "Fundos estáticos ou animados que definem a atmosfera do perfil.",
      en: "Static or animated backgrounds that define your profile atmosphere.",
      es: "Fondos estáticos o animados que definen la atmósfera del perfil.",
    },
    readiness: "available",
  },
  {
    id: "banner",
    label: { "pt-BR": "Banner", en: "Banner", es: "Banner" },
    description: {
      "pt-BR": "Faixa visual independente do fundo, preparada para coleções e conquistas.",
      en: "A visual strip independent from the background, prepared for collections and achievements.",
      es: "Una franja visual independiente del fondo, preparada para colecciones y logros.",
    },
    readiness: "foundation",
  },
  {
    id: "avatar_frame",
    label: { "pt-BR": "Moldura do avatar", en: "Avatar frame", es: "Marco del avatar" },
    description: {
      "pt-BR": "Molduras fixas ou animadas ao redor do avatar, com slot próprio no loadout.",
      en: "Static or animated frames around your avatar with a dedicated loadout slot.",
      es: "Marcos estáticos o animados alrededor del avatar con un espacio propio en el loadout.",
    },
    readiness: "foundation",
  },
  {
    id: "cursor",
    label: { "pt-BR": "Cursor", en: "Cursor", es: "Cursor" },
    description: {
      "pt-BR": "Cursores equipáveis para desktop; touch e movimento reduzido continuam respeitados.",
      en: "Equipable desktop cursors; touch and reduced-motion preferences remain respected.",
      es: "Cursores equipables para escritorio; se respetan touch y movimiento reducido.",
    },
    readiness: "foundation",
  },
  {
    id: "profile_effect",
    label: { "pt-BR": "Efeito de perfil", en: "Profile effect", es: "Efecto de perfil" },
    description: {
      "pt-BR": "Partículas, brilho, névoa ou sinais discretos por cima da composição do perfil.",
      en: "Particles, glow, mist or restrained signals layered over the profile composition.",
      es: "Partículas, brillo, niebla o señales discretas sobre la composición del perfil.",
    },
    readiness: "foundation",
  },
  {
    id: "chibi",
    label: { "pt-BR": "Mascote / chibi", en: "Mascot / chibi", es: "Mascota / chibi" },
    description: {
      "pt-BR": "Companheiro visual do perfil; personagens de jogos só entram com direitos revisados.",
      en: "A visual profile companion; game characters only enter after rights review.",
      es: "Compañero visual del perfil; personajes de juegos solo entran tras revisar derechos.",
    },
    readiness: "foundation",
  },
  {
    id: "badges",
    label: { "pt-BR": "Insígnias", en: "Badges", es: "Insignias" },
    description: {
      "pt-BR": "Conquistas, eventos e identidade: até seis insígnias equipadas ao mesmo tempo.",
      en: "Achievements, events and identity: equip up to six badges at once.",
      es: "Logros, eventos e identidad: equipa hasta seis insignias a la vez.",
    },
    readiness: "foundation",
    maxEquipped: 6,
  },
];

export type ProfileIdentityPack = {
  id: string;
  label: { "pt-BR": string; en: string; es: string };
  description: { "pt-BR": string; en: string; es: string };
  inspiration: "mgp" | "souls" | "tactical" | "rift";
  previewClass: string;
  slots: ProfileCustomizationSlot[];
};

export const PROFILE_IDENTITY_PACK_CONCEPTS: ProfileIdentityPack[] = [
  {
    id: "mgp-core",
    label: { "pt-BR": "ÍMPAR Core", en: "ÍMPAR Core", es: "ÍMPAR Core" },
    description: {
      "pt-BR": "A identidade preta, grafite e dourada do ÍMPAR.",
      en: "ÍMPAR's black, graphite and gold identity.",
      es: "La identidad negra, grafito y dorada de ÍMPAR.",
    },
    inspiration: "mgp",
    previewClass: "customization-pack-mgp",
    slots: ["background", "banner", "avatar_frame", "cursor", "profile_effect"],
  },
  {
    id: "ashen-pilgrim",
    label: { "pt-BR": "Peregrino das Cinzas", en: "Ashen Pilgrim", es: "Peregrino de Ceniza" },
    description: {
      "pt-BR": "Conceito original de brasa, metal gasto e luz de fogueira para os hubs Souls.",
      en: "Original ember, worn-metal and bonfire-light concept for Souls hubs.",
      es: "Concepto original de brasas, metal gastado y luz de hoguera para los hubs Souls.",
    },
    inspiration: "souls",
    previewClass: "customization-pack-ashen",
    slots: ["background", "avatar_frame", "cursor", "profile_effect"],
  },
  {
    id: "signal-protocol",
    label: { "pt-BR": "Protocolo de Sinal", en: "Signal Protocol", es: "Protocolo de Señal" },
    description: {
      "pt-BR": "Conceito tático original para perfis ligados a FPS competitivo, sem reutilizar assets de terceiros.",
      en: "Original tactical concept for competitive-FPS profiles without reusing third-party assets.",
      es: "Concepto táctico original para perfiles de FPS competitivo sin reutilizar recursos de terceros.",
    },
    inspiration: "tactical",
    previewClass: "customization-pack-signal",
    slots: ["background", "banner", "cursor", "badges"],
  },
  {
    id: "rift-arc",
    label: { "pt-BR": "Arco do Rift", en: "Rift Arc", es: "Arco del Rift" },
    description: {
      "pt-BR": "Conceito mágico-tecnológico original para o futuro ecossistema de League of Legends.",
      en: "Original magic-tech concept for the future League of Legends ecosystem.",
      es: "Concepto mágico-tecnológico original para el futuro ecosistema de League of Legends.",
    },
    inspiration: "rift",
    previewClass: "customization-pack-rift",
    slots: ["background", "banner", "avatar_frame", "profile_effect", "badges"],
  },
];
