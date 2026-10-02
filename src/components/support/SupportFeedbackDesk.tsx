import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock3,
  LogIn,
  MessageSquareText,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type FeedbackRow = Database["public"]["Tables"]["site_feedback"]["Row"];
type FeedbackCategory = FeedbackRow["category"];

const CATEGORY_VALUES: FeedbackCategory[] = ["bug", "idea", "content", "next_game", "other"];

export function SupportFeedbackDesk() {
  const { locale } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  const [category, setCategory] = useState<FeedbackCategory>("idea");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoryLabels: Record<FeedbackCategory, string> = {
    bug: copy("Bug", "Bug", "Error"),
    idea: copy("Ideia", "Idea", "Idea"),
    content: copy("Conteúdo / guia", "Content / guide", "Contenido / guía"),
    next_game: copy("Próximo jogo", "Next game", "Próximo juego"),
    other: copy("Outro", "Other", "Otro"),
  };

  const statusLabel = (status: string) => {
    if (status === "answered") return copy("Respondido", "Answered", "Respondido");
    if (status === "reviewing") return copy("Em análise", "Reviewing", "En revisión");
    if (status === "closed") return copy("Encerrado", "Closed", "Cerrado");
    return copy("Recebido", "Received", "Recibido");
  };

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      if (!user) {
        setRows([]);
        setHistoryLoading(false);
        return;
      }

      setHistoryLoading(true);
      const { data, error } = await supabase
        .from("site_feedback")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!active) return;
      if (error) {
        console.error("[ÍMPAR] feedback history", error);
        setRows([]);
      } else {
        setRows(data ?? []);
      }
      setHistoryLoading(false);
    };

    void loadHistory();
    return () => {
      active = false;
    };
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || submitting) return;

    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();
    setErrorMessage(null);
    setSent(false);

    if (cleanSubject.length < 3 || cleanMessage.length < 10) {
      setErrorMessage(
        copy(
          "Escreva um título curto e uma mensagem um pouco mais detalhada.",
          "Add a short subject and a slightly more detailed message.",
          "Añade un asunto corto y un mensaje un poco más detallado.",
        ),
      );
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase
      .from("site_feedback")
      .insert({
        user_id: user.id,
        category,
        subject: cleanSubject,
        message: cleanMessage,
        status: "open",
      })
      .select("*")
      .single();

    if (error) {
      console.error("[ÍMPAR] feedback submit", error);
      setErrorMessage(
        copy(
          "Não consegui enviar agora. Tente novamente em instantes.",
          "Could not send it right now. Please try again shortly.",
          "No se pudo enviar ahora. Inténtalo de nuevo en unos instantes.",
        ),
      );
    } else {
      setRows((current) => [data, ...current]);
      setSubject("");
      setMessage("");
      setCategory("idea");
      setSent(true);
    }
    setSubmitting(false);
  };

  if (authLoading) {
    return (
      <section className="surface-panel p-5 sm:p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 className="size-4 animate-pulse text-gold-strong" />
          {copy("Carregando canal de feedback…", "Loading feedback desk…", "Cargando canal de feedback…")}
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="surface-panel p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-gold/20 bg-gold/[0.06] text-gold-strong">
            <LogIn className="size-4" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              {copy("Feedback direto pelo ÍMPAR", "Direct feedback through ÍMPAR", "Feedback directo por ÍMPAR")}
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {copy(
                "Entre na sua conta para mandar uma mensagem direto para a caixa administrativa do projeto e acompanhar a resposta por aqui.",
                "Sign in to send a message directly to the project's admin inbox and track the reply here.",
                "Inicia sesión para enviar un mensaje directo a la bandeja administrativa del proyecto y seguir la respuesta aquí.",
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/login" className="brand-button min-h-10">
                {copy("Entrar", "Sign in", "Entrar")}
              </Link>
              <Link to="/register" className="brand-button-secondary min-h-10">
                {copy("Criar conta", "Create account", "Crear cuenta")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)]">
      <form onSubmit={handleSubmit} className="surface-panel p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-gold/20 bg-gold/[0.06] text-gold-strong">
            <MessageSquareText className="size-4" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              {copy("Falar com o projeto", "Talk to the project", "Hablar con el proyecto")}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {copy(
                "Bug, ideia, guia que está faltando ou até sugestão do próximo jogo: tudo cai na mesma caixa administrativa.",
                "Bug, idea, missing guide or even a suggestion for the next game: it all lands in the same admin inbox.",
                "Error, idea, guía que falta o incluso una sugerencia para el próximo juego: todo llega a la misma bandeja administrativa.",
              )}
            </p>
          </div>
        </div>

        <label className="mt-5 block">
          <span className="text-xs font-semibold text-foreground">
            {copy("Tipo de mensagem", "Message type", "Tipo de mensaje")}
          </span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as FeedbackCategory)}
            className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-gold/50"
          >
            {CATEGORY_VALUES.map((value) => (
              <option key={value} value={value}>
                {categoryLabels[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-semibold text-foreground">
            {copy("Assunto", "Subject", "Asunto")}
          </span>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value.slice(0, 120))}
            maxLength={120}
            placeholder={copy(
              "Ex.: Próximo jogo, bug no mobile, ideia para perfil…",
              "E.g. Next game, mobile bug, profile idea…",
              "Ej.: Próximo juego, error en móvil, idea para perfil…",
            )}
            className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/50"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-semibold text-foreground">
            {copy("Mensagem", "Message", "Mensaje")}
          </span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, 4000))}
            maxLength={4000}
            rows={6}
            placeholder={copy(
              "Conta o que você sentiu falta, o que ficou confuso, o que funcionou bem ou o que você gostaria de ver no ÍMPAR.",
              "Tell us what felt missing, confusing, useful or what you would like to see in ÍMPAR.",
              "Cuéntanos qué echaste en falta, qué resultó confuso, qué funcionó bien o qué te gustaría ver en ÍMPAR.",
            )}
            className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-3 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/50"
          />
          <span className="mt-1 block text-right text-[0.65rem] text-muted-foreground">
            {message.length}/4000
          </span>
        </label>

        {errorMessage ? (
          <p className="mt-3 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-xs leading-5 text-destructive">
            {errorMessage}
          </p>
        ) : null}

        {sent ? (
          <p className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] px-3 py-2 text-xs leading-5 text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0" />
            {copy(
              "Mensagem recebida. Quando houver resposta, ela aparece no histórico ao lado.",
              "Message received. When there is a reply, it will appear in your history.",
              "Mensaje recibido. Cuando haya una respuesta, aparecerá en tu historial.",
            )}
          </p>
        ) : null}

        <button type="submit" disabled={submitting} className="brand-button mt-4 min-h-11 gap-2 disabled:opacity-60">
          <Send className="size-4" />
          {submitting
            ? copy("Enviando…", "Sending…", "Enviando…")
            : copy("Enviar feedback", "Send feedback", "Enviar feedback")}
        </button>
      </form>

      <div className="surface-panel p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-gold-strong" />
          <p className="font-display text-lg font-semibold text-foreground">
            {copy("Suas mensagens", "Your messages", "Tus mensajes")}
          </p>
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {copy(
            "Só você e a administração conseguem ver estas mensagens.",
            "Only you and the admin team can see these messages.",
            "Solo tú y la administración pueden ver estos mensajes.",
          )}
        </p>

        <div className="mt-4 space-y-3">
          {historyLoading ? (
            <p className="text-sm text-muted-foreground">
              {copy("Carregando histórico…", "Loading history…", "Cargando historial…")}
            </p>
          ) : rows.length ? (
            rows.map((row) => (
              <article key={row.id} className="rounded-xl border border-border bg-background/45 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border border-border px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                    {categoryLabels[row.category as FeedbackCategory]}
                  </span>
                  <span className="text-[0.65rem] font-semibold text-gold-strong">
                    {statusLabel(row.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{row.subject}</p>
                <p className="mt-1 whitespace-pre-line text-xs leading-5 text-muted-foreground">
                  {row.message}
                </p>
                {row.admin_reply ? (
                  <div className="mt-3 rounded-lg border border-gold/20 bg-gold/[0.05] p-3">
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-gold-strong">
                      {copy("Resposta do ÍMPAR", "ÍMPAR reply", "Respuesta de ÍMPAR")}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-xs leading-5 text-foreground/90">
                      {row.admin_reply}
                    </p>
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm leading-6 text-muted-foreground">
              {copy(
                "Você ainda não enviou nenhuma mensagem por aqui.",
                "You have not sent any messages here yet.",
                "Todavía no has enviado ningún mensaje por aquí.",
              )}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
