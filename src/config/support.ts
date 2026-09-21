export type SupportMethodStatus = "active" | "setup";

export type SupportMethod = {
  id: "pix" | "recurring";
  status: SupportMethodStatus;
  label: string;
  description: string;
  provider?: string;
  url?: string | null;
  pixKey?: string | null;
};

/**
 * Public support configuration.
 *
 * Do not place CPF, phone numbers, private email addresses or secret payment
 * credentials here. For Pix, prefer a random key dedicated to the project.
 */
export const SUPPORT_METHODS: SupportMethod[] = [
  {
    id: "pix",
    status: "setup",
    label: "Pix",
    description: "Apoio pontual direto ao projeto.",
    pixKey: null,
  },
  {
    id: "recurring",
    status: "active",
    label: "Apoio recorrente",
    description: "Apoio mensal para ajudar o MGP a manter custos contínuos.",
    provider: "Ko-fi",
    url: "https://ko-fi.com/P3I627EQG9",
  },
];


export const SUPPORT_INSTAGRAM_HANDLE = "@zard.prime";
export const SUPPORT_INSTAGRAM_URL = "https://www.instagram.com/zard.prime/";
export const SUPPORT_EMAIL = "contato@mgprofile.online";


export const SUPPORT_KOFI_ID = "P3I627EQG9";
export const SUPPORT_KOFI_URL = "https://ko-fi.com/P3I627EQG9";
