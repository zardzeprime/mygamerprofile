import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { listReports, updateReportStatus } from "@/lib/reports.functions";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useServerFn } from "@tanstack/react-start";

const STATUSES = ["pending", "reviewing", "resolved", "rejected"] as const;

export const Route = createFileRoute("/_authenticated/admin/reports")({
  loader: async () => {
    try {
      const reports = await listReports({ data: {} });
      return { reports };
    } catch {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Admin — Denúncias — MGP" },
      { name: "description", content: "Fila de denúncias do My Gamer Profile." },
    ],
  }),
  component: AdminReportsPage,
});

function AdminReportsPage() {
  const { t } = useI18n();
  const { reports: initial } = Route.useLoaderData();
  const [reports, setReports] = useState(initial);
  const doUpdate = useServerFn(updateReportStatus);

  const handleStatusChange = async (id: string, status: string) => {
    const updated = await doUpdate({ data: { id, status } });
    setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-semibold">{t("admin.title")}</h1>
      {reports.length === 0 ? (
        <p className="text-muted-foreground">{t("admin.noReports")}</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <article key={report.id} className="surface-panel rounded-xl p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{report.target_type}</Badge>
                    <Badge
                      className={
                        report.status === "pending"
                          ? "bg-gold-soft text-gold-foreground"
                          : report.status === "resolved"
                            ? "bg-success/20 text-success"
                            : report.status === "rejected"
                              ? "bg-muted text-muted-foreground"
                              : "bg-gold-soft/50 text-gold-foreground"
                      }
                    >
                      {t(`admin.status.${report.status}` as const)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm">
                    {t(`report.reasons.${report.reason}` as const)} · {report.reporter?.display_name} (@
                    {report.reporter?.username})
                  </p>
                  {report.details && <p className="mt-1 text-sm text-muted-foreground">{report.details}</p>}
                </div>
                <Select
                  value={report.status}
                  onValueChange={(value) => handleStatusChange(report.id, value)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`admin.status.${s}` as const)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
