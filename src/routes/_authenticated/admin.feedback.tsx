import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock3,
  Inbox,
  MessageSquareReply,
  Save,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type FeedbackRow = Database["public"]["Tables"]["site_feedback"]["Row"];
type FeedbackStatus = "open" | "reviewing" | "answered" | "closed";
type FeedbackCategory = "bug" | "idea" | "content" | "next_game" | "other";
type AdminFeedbackRow = FeedbackRow & {
  author: {
    id: string;
    username: string;
    display_name: string;
  } | null;
};

export const Route = createFileRoute("/_authenticated/admin/feedback")({
  loader: async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw redirect({ to: "/login" });

    const { data: role, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", auth.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !role) throw redirect({ to: "/" });

    const { data, error } = await supabase
      .from("site_feedback")
      .select("*, author:profiles!site_feedback_user_id_fkey(id,username,display_name)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return { rows: (data ?? []) as AdminFeedbackRow[] };
  },
  head: () => ({
    meta: [
      { title: "Admin — Feedback — MGP" },
      { name: "description", content: "Caixa administrativa de feedback do MG Profile." },
    ],
  }),
  component: AdminFeedbackPage,
});

function AdminFeedbackPage() {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const { rows: initialRows } = Route.useLoaderData();
  const [rows, setRows] = useState(initialRows);
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(initialRows.map((row) => [row.id, row.admin_reply ?? ""])),
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | FeedbackStatus>("all");

  const categoryLabels: Record<FeedbackCategory, string> = {
    bug: copy("Bug", "Bug", "Error"),
    idea: copy("Ideia", "Idea", "Idea"),
    content: copy("Conteúdo / guia", "Content / guide", "Contenido / guía"),
    next_game: copy("Próximo jogo", "Next game", "Próximo juego"),
    other: copy("Outro", "Other", "Otro"),
  };

  const statusLabels: Record<FeedbackStatus, string> = {
    open: copy("Recebido", "Received", "Recibido"),
    reviewing: copy("Em análise", "Reviewing", "En revisión"),
    answered: copy("Respondido", "Answered", "Respondido"),
    closed: copy("Encerrado", "Closed", "Cerrado"),
  };

  const visibleRows = useMemo(
    () => rows.filter((row) => filter === "all" || row.status === filter),
    [filter, rows],
  );

  const updateStatus = async (id: string, status: FeedbackStatus) => {
    setSavingId(id);
    const { data, error } = await supabase
      .from("site_feedback")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (!error && data) {
      setRows((current) =>
        current.map((row) => (row.id === id ? { ...row, ...data } : row)),
      );
    } else if (error) {
      console.error("[MGP] admin feedback status", error);
    }
    setSavingId(null);
  };

  const saveReply = async (row: AdminFeedbackRow) => {
    const reply = (drafts[row.id] ?? "").trim();
    if (!reply) return;

    setSavingId(row.id);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setSavingId(null);
      return;
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("site_feedback")
      .update({
        admin_reply: reply,
        status: "answered",
        replied_by: auth.user.id,
        replied_at: now,
        updated_at: now,
      })
      .eq("id", row.id)
      .select("*")
      .single();

    if (!error && data) {
      setRows((current) =>
        current.map((item) => (item.id === row.id ? { ...item, ...data } : item)),
      );
    } else if (error) {
      console.error("[MGP] admin feedback reply", error);
    }
    setSavingId(null);
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">MGP ADMIN</p>
          <h1 className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold text-foreground">
            <Inbox className="size-5 text-gold-strong" />
            {copy("Caixa de feedback", "Feedback inbox", "Bandeja de feedback")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {copy(
              "Mensagens enviadas pela página de apoio. Você pode acompanhar, responder e encerrar cada conversa daqui.",
              "Messages sent through the support page. Review, reply and close each conversation here.",
              "Mensajes enviados desde la página de apoyo. Puedes revisar, responder y cerrar cada conversación aquí.",
            )}
          </p>
        </div>
        <Link to="/admin/reports" className="brand-button-secondary min-h-10">
          {copy("Ver denúncias", "View reports", "Ver denuncias")}
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["all", "open", "reviewing", "answered", "closed"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={
              filter === value
                ? "rounded-full border border-gold/40 bg-gold/[0.09] px-3 py-2 text-xs font-bold text-gold-strong"
                : "rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            }
          >
            {value === "all" ? copy("Todos", "All", "Todos") : statusLabels[value]}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {visibleRows.length ? (
          visibleRows.map((row) => (
            <article key={row.id} className="surface-panel overflow-hidden">
              <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.08em] text-muted-foreground">
                      {categoryLabels[(row.category as FeedbackCategory) ?? "other"]}
                    </span>
                    <span className="rounded-full border border-gold/25 bg-gold/[0.06] px-2 py-1 text-[0.62rem] font-bold text-gold-strong">
                      {statusLabels[(row.status as FeedbackStatus) ?? "open"]}
                    </span>
                  </div>

                  <h2 className="mt-3 font-display text-lg font-semibold text-foreground">
                    {row.subject}
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                    {row.message}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <UserRound className="size-3.5" />
                    <span>
                      {row.author?.display_name ?? "MGP user"}
                      {row.author?.username ? " · @" + row.author.username : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.65rem] text-muted-foreground/80">
                    {new Date(row.created_at).toLocaleString(locale)}
                  </p>

                  <label className="mt-4 block">
                    <span className="text-xs font-semibold text-foreground">
                      {copy("Status", "Status", "Estado")}
                    </span>
                    <select
                      value={row.status}
                      disabled={savingId === row.id}
                      onChange={(event) =>
                        void updateStatus(row.id, event.target.value as FeedbackStatus)
                      }
                      className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-gold/50"
                    >
                      {(Object.keys(statusLabels) as FeedbackStatus[]).map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="rounded-2xl border border-border bg-background/40 p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquareReply className="size-4 text-gold-strong" />
                    <p className="text-sm font-semibold text-foreground">
                      {copy("Responder", "Reply", "Responder")}
                    </p>
                  </div>
                  <textarea
                    value={drafts[row.id] ?? ""}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [row.id]: event.target.value.slice(0, 4000),
                      }))
                    }
                    rows={7}
                    maxLength={4000}
                    placeholder={copy(
                      "Escreva a resposta que vai aparecer para o usuário na página de apoio.",
                      "Write the reply that will appear to the user on the support page.",
                      "Escribe la respuesta que aparecerá al usuario en la página de apoyo.",
                    )}
                    className="mt-3 w-full resize-y rounded-xl border border-border bg-background px-3 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/50"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[0.65rem] text-muted-foreground">
                      {(drafts[row.id] ?? "").length}/4000
                    </span>
                    <button
                      type="button"
                      disabled={savingId === row.id || !(drafts[row.id] ?? "").trim()}
                      onClick={() => void saveReply(row)}
                      className="brand-button min-h-10 gap-2 disabled:opacity-50"
                    >
                      {savingId === row.id ? (
                        <Clock3 className="size-4 animate-pulse" />
                      ) : row.admin_reply ? (
                        <Save className="size-4" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      {row.admin_reply
                        ? copy("Atualizar resposta", "Update reply", "Actualizar respuesta")
                        : copy("Enviar resposta", "Send reply", "Enviar respuesta")}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="surface-panel p-8 text-center text-sm text-muted-foreground">
            {copy(
              "Nenhuma mensagem neste filtro.",
              "No messages in this filter.",
              "No hay mensajes en este filtro.",
            )}
          </div>
        )}
      </div>
    </main>
  );
}
