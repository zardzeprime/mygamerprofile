export type SupportMethodStatus = "active" | "setup";

export type SupportMethod = {
  id: "pix" | "recurring";
  status: SupportMethodStatus;
  label: string;
  description: string;
  provider?: string;
  url?: string | null;
  pixKey?: string | null;
  pixRecipientName?: string | null;
  pixMerchantCity?: string | null;
  pixCopyPasteCode?: string | null;
  pixQrImageUrl?: string | null;
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
    status: "active",
    label: "Pix",
    description: "Apoio pontual direto ao projeto.",
    pixKey: "fb7a6f3e-3a3a-4870-8b34-ff608d6c99cf",
    pixRecipientName: "Esdras Oliveira e Oliveira Junior",
    pixMerchantCity: "Conceição do Almeida, BA",
    pixCopyPasteCode:
      "00020126580014br.gov.bcb.pix0136fb7a6f3e-3a3a-4870-8b34-ff608d6c99cf5204000053039865802BR5922ESDRAS OLIVEIRA JUNIOR6013CONCEICAO ALM62070503***6304252C",
    pixQrImageUrl: "/support/mgp-pix-qr.png",
  },
  {
    id: "recurring",
    status: "active",
    label: "Apoio recorrente",
    description: "Apoio mensal para ajudar o ÍMPAR a manter custos contínuos.",
    provider: "Ko-fi",
    url: "https://ko-fi.com/P3I627EQG9",
  },
];


export const SUPPORT_INSTAGRAM_HANDLE = "@zard.prime";
export const SUPPORT_INSTAGRAM_URL = "https://www.instagram.com/zard.prime/";
export const SUPPORT_EMAIL = "mgprofilesocial@gmail.com";


export const SUPPORT_KOFI_ID = "P3I627EQG9";
export const SUPPORT_KOFI_URL = "https://ko-fi.com/P3I627EQG9";
