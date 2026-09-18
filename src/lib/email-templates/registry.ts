import type { ComponentType } from "react";
import {
  AvapgvReportEmail,
  type AvapgvReportData,
} from "./avapgv-report";

export interface TemplateEntry {
  component: ComponentType<Record<string, unknown>>;
  subject: string | ((data: Record<string, unknown>) => string);
  displayName?: string;
  previewData?: Record<string, unknown>;
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string;
}

const avapgvPreviewData = {
  status: "+/-",
  severity: "warning",
  title: "Revisão operacional do MG Profile",
  owningCore: "NEXUS (Coordenação e IA)",
  changed:
    "Uma alteração relevante foi detectada e precisa de validação antes de ser considerada concluída.",
  reference: "main · commit fcd91c5",
  impact:
    "A alteração não indica incidente crítico, mas pode afetar a experiência se ficar sem revisão.",
  nextAction:
    "Validar o comportamento no ambiente publicado e registrar o resultado no estado persistente do projeto.",
  timestamp: "18/09/2026 02:35",
  details:
    "Exemplo de pré-visualização. O relatório real deve diferenciar o que foi verificado do que não foi avaliado.",
} satisfies AvapgvReportData;

/**
 * Template registry — maps template names to their React Email components.
 * Templates stay recipient-agnostic: callers decide where operational reports go.
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  "avapgv-report": {
    component: AvapgvReportEmail as unknown as ComponentType<Record<string, unknown>>,
    displayName: "AVAPGV · Os Sete",
    subject: (data) => {
      const status =
        data["status"] === "BOM" || data["status"] === "+/-" || data["status"] === "RUIM"
          ? data["status"]
          : "+/-";
      const rawTitle = data["title"];
      const title =
        typeof rawTitle === "string" && rawTitle.trim()
          ? rawTitle.trim()
          : "Relatório operacional";
      return `[AVAPGV ${status}] ${title}`;
    },
    previewData: avapgvPreviewData,
  },
};
