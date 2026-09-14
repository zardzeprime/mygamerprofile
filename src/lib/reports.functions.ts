import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getSupabasePublic } from "./supabase.server";

const createReportSchema = z.object({
  target_type: z.enum(["profile", "post", "comment", "lfg"]),
  target_id: z.string(),
  reason: z.string(),
  details: z.string().optional(),
});
const listReportsSchema = z.object({
  status: z.string().optional(),
  page: z.number().default(1),
});
const updateReportSchema = z.object({ id: z.string(), status: z.enum(["pending", "reviewing", "resolved", "rejected"]) });

export const createReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createReportSchema.parse(data))
  .handler(async ({ context, data }) => {
    const supabase = context.supabase;
    const { error } = await supabase.from("reports").insert({
      reporter_id: context.userId,
      target_type: data.target_type,
      target_id: data.target_id,
      reason: data.reason,
      details: data.details ?? null,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => listReportsSchema.parse(data ?? {}))
  .handler(async ({ context, data }) => {
    const supabase = context.supabase;
    const pageSize = 50;
    const from = ((data.page ?? 1) - 1) * pageSize;
    let query = supabase
      .from("reports")
      .select(
        "*, reporter:profiles!reports_reporter_id_fkey(id, username, display_name)",
      )
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (data.status) query = query.eq("status", data.status);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows;
  });

export const updateReportStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => updateReportSchema.parse(data))
  .handler(async ({ context, data }) => {
    const supabase = context.supabase;
    const { data: report, error } = await supabase
      .from("reports")
      .update({
        status: data.status,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return report;
  });
