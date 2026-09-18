import type { ComponentType } from "react";
import { avapgvReportTemplate } from "./avapgv-report";

export interface TemplateEntry {
  component: ComponentType<any>;
  subject: string | ((data: Record<string, any>) => string);
  displayName?: string;
  previewData?: Record<string, any>;
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string;
}

/**
 * Template registry — maps template names to their React Email components.
 * Templates stay recipient-agnostic: callers decide where operational reports go.
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  "avapgv-report": avapgvReportTemplate,
};
