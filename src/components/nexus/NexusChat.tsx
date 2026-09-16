import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Code2, Gamepad2, Loader2, Plus, Send, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  getNexusStatus,
  listNexusMessages,
  listNexusThreads,
  sendNexusMessage,
} from "@/lib/nexus.functions";
import { cn } from "@/lib/utils";

type NexusMode = "gaming" | "development";

type NexusMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  provider?: string | null;
  model?: string | null;
  core_ids?: string[];
};

type NexusStatus = {
  isAdmin: boolean;
  providers: Array<{ id: string; configured: boolean; model: string }>;
  tools: Array<{ id: string; name: string; status: string }>;
};

export function NexusChat() {
  const { user, loading: authLoading } = useAuth();
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<NexusMode>("gaming");
  const [threadId, setThreadId] = useState<string | undefined>();
  const [messages, setMessages] = useState<NexusMessage[]>([]);
  const [status, setStatus] = useState<NexusStatus | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const configuredProviders = useMemo(
    () => status?.providers.filter((provider) => provider.configured) ?? [],
    [status],
  );

  useEffect(() => {
    if (!open || !user || status) return;

    let active = true;
    setLoadingChat(true);
    Promise.all([getNexusStatus(), listNexusThreads()])
      .then(async ([nextStatus, threads]) => {
        if (!active) return;
        setStatus(nextStatus as NexusStatus);

        const preferred = (threads as Array<{ id: string; mode: NexusMode }>).find(
          (thread) => thread.mode === mode,
        );
        if (!preferred) return;

        const history = (await listNexusMessages({ data: { threadId: preferred.id } })) as NexusMessage[];
        if (!active) return;
        setThreadId(preferred.id);
        setMessages(history.filter((message) => message.role === "user" || message.role === "assistant"));
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : String(reason));
      })
      .finally(() => {
        if (active) setLoadingChat(false);
      });

    return () => {
      active = false;
    };
  }, [open, user, status, mode]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, sending]);

  const startNewChat = (nextMode = mode) => {
    setMode(nextMode);
    setThreadId(undefined);
    setMessages([]);
    setInput("");
    setError("");
  };

  const changeMode = (nextMode: NexusMode) => {
    if (nextMode === "development" && !status?.isAdmin) return;
    startNewChat(nextMode);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending || !user) return;

    setInput("");
    setError("");
    setMessages((current) => [...current, { role: "user", content: message }]);
    setSending(true);

    try {
      const response = await sendNexusMessage({
        data: { threadId, mode, message },
      });
      setThreadId(response.threadId);
      setMessages((current) => [
        ...current,
        {
          ...(response.message as NexusMessage),
          role: "assistant",
          provider: response.provider,
          model: response.model,
          core_ids: response.coreIds,
        },
      ]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[70] grid size-14 place-items-center rounded-full border border-gold/40 bg-foreground text-background shadow-lift transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        aria-label={copy("Abrir NEXUS", "Open NEXUS", "Abrir NEXUS")}
      >
        {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
      </button>

      {open ? (
        <section className="fixed bottom-24 right-4 z-[69] flex h-[min(680px,calc(100vh-8rem))] w-[min(430px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-lift">
          <header className="border-b border-border bg-surface px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold-strong">
                  <Bot className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-bold text-foreground">NEXUS</h2>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {mode === "development" ? "DEV" : "GAMER"}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {configuredProviders.length
                      ? copy(
                          `${configuredProviders.length} provedor(es) disponível(is)`,
                          `${configuredProviders.length} provider(s) available`,
                          `${configuredProviders.length} proveedor(es) disponible(s)`,
                        )
                      : copy("Aguardando provedor de IA", "Waiting for an AI provider", "Esperando proveedor de IA")}
                  </p>
                </div>
              </div>

              <Button type="button" variant="ghost" size="icon" onClick={() => startNewChat()} title="Nova conversa">
                <Plus className="size-4" />
              </Button>
            </div>

            {user && status ? (
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-1">
                <button
                  type="button"
                  onClick={() => changeMode("gaming")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                    mode === "gaming" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground",
                  )}
                >
                  <Gamepad2 className="size-3.5" />
                  Gamer
                </button>
                <button
                  type="button"
                  disabled={!status.isAdmin}
                  onClick={() => changeMode("development")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                    mode === "development" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground",
                    !status.isAdmin && "cursor-not-allowed opacity-40",
                  )}
                  title={!status.isAdmin ? "Admin only" : undefined}
                >
                  <Code2 className="size-3.5" />
                  Desenvolvimento
                </button>
              </div>
            ) : null}
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {authLoading || loadingChat ? (
              <div className="grid h-full place-items-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : !user ? (
              <div className="grid h-full place-items-center text-center">
                <div className="max-w-xs space-y-2">
                  <Bot className="mx-auto size-8 text-gold-strong" />
                  <p className="font-semibold text-foreground">
                    {copy("Entre no MGP para conversar com a NEXUS.", "Sign in to chat with NEXUS.", "Inicia sesión para hablar con NEXUS.")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {copy(
                      "As conversas ficam vinculadas à sua conta.",
                      "Conversations stay linked to your account.",
                      "Las conversaciones quedan vinculadas a tu cuenta.",
                    )}
                  </p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="grid h-full place-items-center text-center">
                <div className="max-w-xs space-y-2">
                  <Sparkles className="mx-auto size-8 text-gold-strong" />
                  <p className="font-semibold text-foreground">
                    {mode === "development"
                      ? copy("O que vamos construir no MGP?", "What are we building in MGP?", "¿Qué vamos a construir en MGP?")
                      : copy("Sobre o que vamos jogar ou conversar?", "What are we playing or discussing?", "¿Sobre qué vamos a jugar o hablar?")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {mode === "development"
                      ? copy(
                          "NEXUS pode discutir arquitetura e coordenar os núcleos especializados.",
                          "NEXUS can discuss architecture and coordinate specialist cores.",
                          "NEXUS puede discutir arquitectura y coordinar núcleos especializados.",
                        )
                      : copy(
                          "Pergunte sobre jogos, builds, mecânicas e o próprio MGP.",
                          "Ask about games, builds, mechanics and MGP itself.",
                          "Pregunta sobre juegos, builds, mecánicas y el propio MGP.",
                        )}
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <article
                  key={message.id ?? `${message.role}-${index}`}
                  className={cn(
                    "max-w-[88%] rounded-2xl px-3.5 py-3 text-sm leading-6",
                    message.role === "user"
                      ? "ml-auto bg-foreground text-background"
                      : "mr-auto border border-border bg-surface text-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.role === "assistant" && (message.model || message.provider) ? (
                    <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {[message.provider, message.model].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </article>
              ))
            )}

            {sending ? (
              <div className="mr-auto flex items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                NEXUS...
              </div>
            ) : null}
          </div>

          <footer className="border-t border-border bg-surface p-3">
            {error ? <p className="mb-2 text-xs text-destructive">{error}</p> : null}
            <form onSubmit={submit} className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                disabled={!user || sending}
                rows={1}
                maxLength={6000}
                placeholder={copy("Fale com a NEXUS...", "Talk to NEXUS...", "Habla con NEXUS...")}
                className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-gold/30 disabled:opacity-50"
              />
              <Button type="submit" size="icon" disabled={!user || sending || !input.trim()} className="size-11 rounded-2xl">
                <Send className="size-4" />
              </Button>
            </form>
            <p className="mt-2 px-1 text-[10px] leading-4 text-muted-foreground">
              {copy(
                "NEXUS usa provedores oficiais configurados no servidor. Ações administrativas exigem autorização própria.",
                "NEXUS uses official providers configured on the server. Administrative actions require their own authorization.",
                "NEXUS usa proveedores oficiales configurados en el servidor. Las acciones administrativas requieren autorización propia.",
              )}
            </p>
          </footer>
        </section>
      ) : null}
    </>
  );
}
