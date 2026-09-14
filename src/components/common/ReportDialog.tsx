import { useState } from "react";
import { Flag } from "lucide-react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createReport } from "@/lib/reports.functions";
import { useServerFn } from "@tanstack/react-start";

const REASONS = [
  "spam",
  "harassment",
  "hate",
  "sexual_content",
  "extreme_violence",
  "scam",
  "other",
] as const;

interface ReportDialogProps {
  targetType: "profile" | "post" | "comment" | "lfg";
  targetId: string;
  username?: string;
}

export function ReportDialog({ targetType, targetId, username }: ReportDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = useServerFn(createReport);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setLoading(true);
    await submit({ data: { target_type: targetType, target_id: targetId, reason, details } });
    setLoading(false);
    setSent(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Flag className="mr-2 size-4" />
          {t("profile.report")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("report.title")}</DialogTitle>
        </DialogHeader>
        {sent ? (
          <p className="text-muted-foreground">{t("report.sent")}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {username && <p className="text-sm text-muted-foreground">@{username}</p>}
            <div className="space-y-2">
              <Label htmlFor="reason">{t("report.reason")}</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder={t("report.reason")} />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t(`report.reasons.${r}` as const)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">{t("report.details")}</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={!reason || loading}>
              {loading ? t("common.loading") : t("report.submit")}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
