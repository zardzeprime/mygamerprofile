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
    status: "setup",
    label: "Apoio recorrente",
    description: "Apoio mensal para ajudar o MGP a manter custos contínuos.",
    provider: "Ko-fi",
    url: null,
  },
];
