import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getSupabasePublic } from "./supabase.server";

export const createReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { target_type, target_id, reason, details } = data as {
      target_type: string;
      target_id: string;
      reason: string;
      details?: string;
    };
    const supabase = context.supabase;
    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        reporter_id: context.userId,
        target_type,
        target_id,
        reason,
        details: details ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return report;
  });

export const listReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!isAdmin) throw new Error("unauthorized");

    const supabase = getSupabasePublic();
    const { data: reports, error } = await supabase
      .from("reports")
      .select("*, reporter:profiles(id, username, display_name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return reports ?? [];
  });

export const updateReportStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { id, status } = data as { id: string; status: string };
    const { data: isAdmin } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!isAdmin) throw new Error("unauthorized");

    const supabase = context.supabase;
    const { data: report, error } = await supabase
      .from("reports")
      .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: context.userId })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return report;
  });
