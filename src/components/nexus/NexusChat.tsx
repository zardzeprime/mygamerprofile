import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Code2, Download, Gamepad2, Loader2, LockKeyhole, Plus, Send, Trash2, X } from "lucide-react";

import { NexusMark } from "@/components/nexus/NexusMark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  deleteNexusThread,
  getNexusGuestStatus,
  getNexusStatus,
  listNexusMessages,
  listNexusThreads,
  sendNexusGuestMessage,
  sendNexusMessage,
} from "@/lib/nexus.functions";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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
  aiReady: boolean;
  providers: Array<{ id: string; configured: boolean; model: string }>;
  tools: Array<{ id: string; name: string; status: string }>;
};

type NexusGuestStatus = {
  guestId: string;
  responsesUsed: number;
  maxResponses: number;
  remaining: number;
  locked: boolean;
  aiReady: boolean;
  messages: NexusMessage[];
};

const GUEST_STORAGE_KEY = "mgp:nexus:guest-session";

function readStoredGuestId() {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(GUEST_STORAGE_KEY) || undefined;
}

function persistGuestId(guestId?: string) {
  if (typeof window === "undefined" || !guestId) return;
  window.localStorage.setItem(GUEST_STORAGE_KEY, guestId);
}

export function NexusChat() {
  const { user, loading: authLoading } = useAuth();
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<NexusMode>("gaming");
  const [threadId, setThreadId] = useState<string | undefined>();
  const [messages, setMessages] = useState<NexusMessage[]>([]);
  const [status, setStatus] = useState<NexusStatus | null>(null);
  const [guestStatus, setGuestStatus] = useState<NexusGuestStatus | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState("");
  const [reloadNonce, setReloadNonce] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const configuredProviders = useMemo(
    () => status?.providers.filter((provider) => provider.configured) ?? [],
    [status],
  );

  useEffect(() => {
    setStatus(null);
    setGuestStatus(null);
    setThreadId(undefined);
    setMessages([]);
    setMode("gaming");
    setError("");
  }, [user?.id]);

  useEffect(() => {
    if (!open || authLoading) return;

    let active = true;
    setLoadingChat(true);
    setError("");

    const load = async () => {
      if (!user) {
        const storedGuestId = readStoredGuestId();
        const nextGuest = (await getNexusGuestStatus({
          data: storedGuestId ? { guestId: storedGuestId } : {},
        })) as NexusGuestStatus;
        if (!active) return;
        persistGuestId(nextGuest.guestId);
        setGuestStatus(nextGuest);
        setMessages(
          (nextGuest.messages ?? []).filter(
            (message) => message.role === "user" || message.role === "assistant",
          ),
        );
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("NEXUS_AUTH_SESSION_MISSING");
      const [nextStatus, threads] = await Promise.all([
        getNexusStatus({ data: { accessToken } }),
        listNexusThreads({ data: { accessToken } }),
      ]);
      if (!active) return;
      setStatus(nextStatus as NexusStatus);

      const preferred = (threads as Array<{ id: string; mode: NexusMode }>).find(
        (thread) => thread.mode === mode,
      );
      if (!preferred) return;

      const history = (await listNexusMessages({
        data: { threadId: preferred.id, accessToken },
      })) as NexusMessage[];
      if (!active) return;
      setThreadId(preferred.id);
      setMessages(
        history.filter((message) => message.role === "user" || message.role === "assistant"),
      );
    };

    const LOAD_TIMEOUT_MS = 12_000;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    Promise.race([
      load(),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("NEXUS_LOAD_TIMEOUT")), LOAD_TIMEOUT_MS);
      }),
    ])
      .catch((reason) => {
        if (active) setError(formatNexusError(reason, Boolean(user), copy));
      })
      .finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
        if (active) setLoadingChat(false);
      });

    return () => {
      active = false;
    };
  }, [open, authLoading, user?.id, reloadNonce]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, sending, guestStatus?.locked]);

  const startNewChat = (nextMode = mode) => {
    if (!user) return;
    setMode(nextMode);
    setThreadId(undefined);
    setMessages([]);
    setInput("");
    setError("");
  };

  const changeMode = (nextMode: NexusMode) => {
    if (!user) return;
    if (nextMode === "development" && !status?.isAdmin) return;
    startNewChat(nextMode);
  };

  const exportCurrentChat = () => {
    if (!user || messages.length === 0 || typeof window === "undefined") return;
    const title = mode === "development" ? "NEXUS Development" : "NEXUS Gamer";
    const body = [
      `${title} · MG Profile`,
      new Date().toLocaleString(locale),
      "",
      ...messages.map((message) =>
        `${message.role === "user" ? copy("Você", "You", "Tú") : "NEXUS"}: ${message.content}`,
      ),
    ].join("\n\n");
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mg-profile-nexus-${mode}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const deleteCurrentChat = async () => {
    if (!user || !threadId || sending) return;
    const confirmed = window.confirm(
      copy(
        "Excluir esta conversa da NEXUS? Essa ação não pode ser desfeita.",
        "Delete this NEXUS conversation? This cannot be undone.",
        "¿Eliminar esta conversación de NEXUS? Esta acción no se puede deshacer.",
      ),
    );
    if (!confirmed) return;

    setError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("NEXUS_AUTH_SESSION_MISSING");
      await deleteNexusThread({ data: { threadId, accessToken } });
      startNewChat(mode);
    } catch (reason) {
      setError(formatNexusError(reason, true, copy));
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending || authLoading) return;
    if (!user && guestStatus?.locked) return;
    if (user && status?.aiReady === false) return;

    setInput("");
    setError("");
    setMessages((current) => [...current, { role: "user", content: message }]);
    setSending(true);

    try {
      if (!user) {
        // Enter can submit the form while the guest bootstrap is still in flight.
        // Resolve the session here instead of silently discarding the user's first message.
        let activeGuest = guestStatus;
        if (!activeGuest) {
          const storedGuestId = readStoredGuestId();
          activeGuest = (await getNexusGuestStatus({
            data: storedGuestId ? { guestId: storedGuestId } : {},
          })) as NexusGuestStatus;
          persistGuestId(activeGuest.guestId);
          setGuestStatus(activeGuest);
        }
        if (activeGuest.locked) throw new Error("NEXUS_GUEST_LIMIT");
        if (!activeGuest.aiReady) throw new Error("NEXUS_NO_PROVIDER");

        const response = await sendNexusGuestMessage({
          data: { guestId: activeGuest.guestId, message, locale },
        });

        persistGuestId(response.guestId);
        if (response.message) {
          setMessages((current) => [...current, response.message as NexusMessage]);
        }
        setGuestStatus((current) => ({
          guestId: response.guestId,
          responsesUsed: response.maxResponses - response.remaining,
          maxResponses: response.maxResponses,
          remaining: response.remaining,
          locked: response.locked,
          aiReady: response.aiReady,
          messages: current?.messages ?? [],
        }));
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("NEXUS_AUTH_SESSION_MISSING");
      const response = await sendNexusMessage({
        data: { ...(threadId ? { threadId } : {}), mode, message, locale, accessToken },
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
      setMessages((current) => {
        const last = current.at(-1);
        if (last?.role === "user" && last.content === message) return current.slice(0, -1);
        return current;
      });
      // Do not make the user retype a message after a transient provider failure.
      setInput((current) => (current.trim() ? current : message));
      setError(formatNexusError(reason, Boolean(user), copy));
    } finally {
      setSending(false);
    }
  };

  const greeting: NexusMessage = {
    id: `nexus-greeting-${mode}-${user ? "member" : "guest"}`,
    role: "assistant",
    content:
      mode === "development"
        ? copy(
            "NEXUS online. Manda o que você quer construir, revisar ou consertar no MGP. Eu organizo o problema e puxo os núcleos certos quando precisar.",
            "NEXUS online. Tell me what you want to build, review or fix in MGP. I'll organize the problem and pull in the right cores when needed.",
            "NEXUS en línea. Dime qué quieres construir, revisar o arreglar en MGP. Organizo el problema y activo los núcleos adecuados cuando haga falta.",
          )
        : user
          ? copy(
              "E aí! Eu sou a NEXUS, a IA gamer do MGP. Pode chegar com boss, build, lore, competitivo, setup ou só pra trocar ideia. 🎮",
              "Yo! I'm NEXUS, MGP's gamer AI. Hit me with bosses, builds, lore, competitive play, setups or just come hang out. 🎮",
              "¡Hey! Soy NEXUS, la IA gamer de MGP. Puedes venir con bosses, builds, lore, competitivo, setup o simplemente a charlar. 🎮",
            )
          : copy(
              "E aí! Eu sou a NEXUS, a IA gamer do MGP. Pode chegar com boss, build, lore, competitivo, setup ou só pra trocar ideia. 🎮 Sem login, você tem 10 respostas grátis comigo.",
              "Yo! I'm NEXUS, MGP's gamer AI. Hit me with bosses, builds, lore, competitive play, setups or just come hang out. 🎮 You get 10 free replies before signing in.",
              "¡Hey! Soy NEXUS, la IA gamer de MGP. Puedes venir con bosses, builds, lore, competitivo, setup o simplemente a charlar. 🎮 Tienes 10 respuestas gratis antes de iniciar sesión.",
            ),
  };

  const visibleMessages = [greeting, ...messages];
  const guestLocked = !user && Boolean(guestStatus?.locked);
  const providerStatusKnown = user ? status !== null : guestStatus !== null;
  const aiReady = user ? status?.aiReady === true : guestStatus?.aiReady === true;
  const canSend = Boolean(
    !loadingChat &&
      providerStatusKnown &&
      aiReady &&
      (user || (guestStatus && !guestStatus.locked)),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[70] grid size-14 place-items-center rounded-full border border-gold/45 bg-foreground text-gold shadow-lift transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        aria-label={copy("Abrir NEXUS", "Open NEXUS", "Abrir NEXUS")}
      >
        {open ? <X className="size-5 text-background" /> : <NexusMark className="size-7" />}
      </button>

      {open ? (
        <section className="fixed bottom-24 right-4 z-[69] flex h-[min(700px,calc(100vh-8rem))] w-[min(440px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-lift">
          <header className="border-b border-border bg-surface px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-gold/20 bg-gold/10 text-gold-strong">
                  <NexusMark className="size-6" title="NEXUS" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-bold text-foreground">NEXUS</h2>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {mode === "development" ? "DEV" : "GAMER"}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {!user
                      ? guestStatus
                        ? copy(
                            `${guestStatus.remaining} de ${guestStatus.maxResponses} respostas grátis`,
                            `${guestStatus.remaining} of ${guestStatus.maxResponses} free replies left`,
                            `${guestStatus.remaining} de ${guestStatus.maxResponses} respuestas gratis`,
                          )
                        : copy(
                            "Conectando sessão guest...",
                            "Connecting guest session...",
                            "Conectando sesión invitada...",
                          )
                      : !status
                        ? copy(
                            "Verificando motor da NEXUS...",
                            "Checking NEXUS engine...",
                            "Verificando motor de NEXUS...",
                          )
                        : configuredProviders.length
                          ? copy(
                              `${configuredProviders.length} provedor(es) disponível(is)`,
                              `${configuredProviders.length} provider(s) available`,
                              `${configuredProviders.length} proveedor(es) disponible(s)`,
                            )
                          : copy(
                              "NEXUS sem provedor conectado",
                              "NEXUS has no provider connected",
                              "NEXUS sin proveedor conectado",
                            )}
                  </p>
                </div>
              </div>

              {user ? (
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={exportCurrentChat}
                    disabled={messages.length === 0}
                    title={copy("Exportar conversa", "Export chat", "Exportar conversación")}
                  >
                    <Download className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => void deleteCurrentChat()}
                    disabled={!threadId}
                    title={copy("Excluir conversa", "Delete chat", "Eliminar conversación")}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => startNewChat()}
                    title={copy("Nova conversa", "New chat", "Nueva conversación")}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {copy("Entrar", "Sign in", "Entrar")}
                </Link>
              )}
            </div>

            {user && status ? (
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-1">
                <button
                  type="button"
                  onClick={() => changeMode("gaming")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                    mode === "gaming"
                      ? "bg-background text-foreground shadow-soft"
                      : "text-muted-foreground",
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
                    mode === "development"
                      ? "bg-background text-foreground shadow-soft"
                      : "text-muted-foreground",
                    !status.isAdmin && "cursor-not-allowed opacity-40",
                  )}
                  title={!status.isAdmin ? "Admin only" : undefined}
                >
                  <Code2 className="size-3.5" />
                  {copy("Desenvolvimento", "Development", "Desarrollo")}
                </button>
              </div>
            ) : null}
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {authLoading || loadingChat ? (
              <div className="grid h-full place-items-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : (
              <>
                {visibleMessages.map((message, index) => (
                  <article
                    key={message.id ?? `${message.role}-${index}`}
                    className={cn(
                      "max-w-[88%] rounded-2xl px-3.5 py-3 text-sm leading-6",
                      message.role === "user"
                        ? "ml-auto bg-foreground text-background"
                        : "mr-auto border border-border bg-surface text-foreground",
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-strong">
                        <NexusMark className="size-3.5" />
                        NEXUS
                      </div>
                    ) : null}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.role === "assistant" && (message.model || message.provider) ? (
                      <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {[message.provider, message.model].filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                  </article>
                ))}

                {sending ? (
                  <div className="mr-auto flex items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm text-muted-foreground">
                    <NexusMark className="size-4 text-gold-strong" />
                    <Loader2 className="size-3.5 animate-spin" />
                    NEXUS...
                  </div>
                ) : null}

                {providerStatusKnown && !aiReady ? (
                  <div className="mt-4 rounded-2xl border border-border bg-muted/40 p-4 text-center">
                    <NexusMark className="mx-auto mb-2 size-8 text-gold-strong" />
                    <p className="font-semibold text-foreground">
                      {copy(
                        "A NEXUS está instalada, mas o motor de IA ainda não está conectado.",
                        "NEXUS is installed, but its AI engine is not connected yet.",
                        "NEXUS está instalada, pero su motor de IA aún no está conectado.",
                      )}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {copy(
                        "Precisamos configurar pelo menos um provedor oficial no servidor para ela responder.",
                        "At least one official provider must be configured on the server before she can reply.",
                        "Hay que configurar al menos un proveedor oficial en el servidor para que pueda responder.",
                      )}
                    </p>
                  </div>
                ) : null}

                {guestLocked ? (
                  <div className="mt-4 rounded-2xl border border-gold/30 bg-gold/5 p-4 text-center">
                    <div className="mx-auto mb-2 grid size-9 place-items-center rounded-full bg-gold/10 text-gold-strong">
                      <LockKeyhole className="size-4" />
                    </div>
                    <p className="font-semibold text-foreground">
                      {copy(
                        "As 10 respostas grátis acabaram por aqui.",
                        "Your 10 free NEXUS replies are used up.",
                        "Tus 10 respuestas gratis de NEXUS se terminaron.",
                      )}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {copy(
                        "Entra no MGP para continuar a conversa e manter seu histórico na conta.",
                        "Sign in to keep chatting and save your NEXUS history to your account.",
                        "Inicia sesión para seguir hablando y guardar tu historial de NEXUS en tu cuenta.",
                      )}
                    </p>
                    <div className="mt-3 flex justify-center gap-2">
                      <Link
                        to="/login"
                        className="rounded-xl bg-foreground px-3.5 py-2 text-xs font-semibold text-background"
                      >
                        {copy("Entrar", "Sign in", "Entrar")}
                      </Link>
                      <Link
                        to="/register"
                        className="rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground"
                      >
                        {copy("Criar perfil", "Create profile", "Crear perfil")}
                      </Link>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <footer className="border-t border-border bg-surface p-3">
            {error ? (
              <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2">
                <p className="text-xs text-destructive">{error}</p>
                {!providerStatusKnown ? (
                  <button
                    type="button"
                    onClick={() => setReloadNonce((value) => value + 1)}
                    className="shrink-0 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {copy("Tentar novamente", "Retry", "Reintentar")}
                  </button>
                ) : null}
              </div>
            ) : null}
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
                disabled={!canSend || sending}
                rows={1}
                maxLength={user ? 6000 : 2500}
                placeholder={
                  !providerStatusKnown
                    ? copy(
                        "Verificando conexão com a NEXUS...",
                        "Checking NEXUS connection...",
                        "Verificando conexión con NEXUS...",
                      )
                    : !aiReady
                      ? copy(
                          "Motor de IA ainda não conectado",
                          "AI engine not connected yet",
                          "Motor de IA aún no conectado",
                        )
                    : guestLocked
                      ? copy(
                          "Entre para continuar com a NEXUS",
                          "Sign in to keep chatting",
                          "Inicia sesión para continuar",
                        )
                      : copy("Fale com a NEXUS...", "Talk to NEXUS...", "Habla con NEXUS...")
                }
                className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-gold/30 disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!canSend || sending || !input.trim()}
                className="size-11 rounded-2xl"
              >
                <Send className="size-4" />
              </Button>
            </form>
            <div className="mt-2 flex items-start justify-between gap-3 px-1 text-[10px] leading-4 text-muted-foreground">
              <p>
                {user
                  ? copy(
                      "As mensagens podem ser processadas por provedores oficiais de IA configurados pelo MGP.",
                      "Messages may be processed by official AI providers configured by MGP.",
                      "Los mensajes pueden ser procesados por proveedores oficiales de IA configurados por MGP.",
                    )
                  : copy(
                      "Teste guest: até 10 respostas. As mensagens podem ser processadas por provedores oficiais de IA do MGP.",
                      "Guest trial: up to 10 replies. Messages may be processed by MGP's configured official AI providers.",
                      "Prueba invitada: hasta 10 respuestas. Los mensajes pueden ser procesados por proveedores oficiales de IA de MGP.",
                    )}
              </p>
              {!user && guestStatus ? (
                <span className="shrink-0 font-semibold text-gold-strong">
                  {guestStatus.remaining}/10
                </span>
              ) : null}
            </div>
          </footer>
        </section>
      ) : null}
    </>
  );
}

function formatNexusError(
  reason: unknown,
  authenticated: boolean,
  copy: (pt: string, en: string, es: string) => string,
) {
  const raw = reason instanceof Error ? reason.message : String(reason);

  if (raw.includes("NEXUS_GUEST_RATE_LIMIT") || raw.includes("NEXUS_RATE_LIMIT")) {
    return copy(
      "Mandou rápido demais 😅 espera alguns segundos e tenta de novo.",
      "That was fast 😅 wait a few seconds and try again.",
      "Eso fue rápido 😅 espera unos segundos e inténtalo de nuevo.",
    );
  }

  if (
    raw.includes("NEXUS_ALL_PROVIDERS_FAILED") ||
    raw.includes("All configured NEXUS providers failed")
  ) {
    return copy(
      "A NEXUS teve uma falha temporária nos provedores. Sua mensagem voltou para a caixa — tente enviar de novo em alguns segundos.",
      "NEXUS hit a temporary provider failure. Your message is back in the box — try sending it again in a few seconds.",
      "NEXUS tuvo una falla temporal con los proveedores. Tu mensaje volvió a la caja — intenta enviarlo otra vez en unos segundos.",
    );
  }

  if (
    raw.includes("NEXUS_NO_PROVIDER") ||
    raw.includes("no official model API configured")
  ) {
    return copy(
      "A NEXUS está instalada, mas ainda falta conectar um provedor de IA no servidor.",
      "NEXUS is installed, but an AI provider still needs to be connected on the server.",
      "NEXUS está instalada, pero todavía falta conectar un proveedor de IA en el servidor.",
    );
  }

  if (
    raw.includes("NEXUS_LOAD_TIMEOUT") ||
    raw.includes("NEXUS_EDGE_") ||
    raw.includes("NEXUS_RUNTIME_ERROR")
  ) {
    return copy(
      "Não consegui verificar a NEXUS agora. Tente novamente — isso não significa que o motor de IA esteja desconectado.",
      "I couldn't verify NEXUS right now. Try again — this does not mean the AI engine is disconnected.",
      "No pude verificar NEXUS ahora. Inténtalo de nuevo; esto no significa que el motor de IA esté desconectado.",
    );
  }

  if (raw.includes("NEXUS_AUTH_SESSION_MISSING") || raw.includes("NEXUS_AUTH_INVALID")) {
    return copy(
      "Sua sessão precisa ser renovada para abrir a NEXUS. Entre novamente se o problema continuar.",
      "Your session needs to be refreshed to open NEXUS. Sign in again if the problem continues.",
      "Tu sesión necesita renovarse para abrir NEXUS. Inicia sesión de nuevo si el problema continúa.",
    );
  }

  if (!authenticated) {
    return copy(
      "A NEXUS tropeçou nessa mensagem. Tenta de novo em alguns segundos.",
      "NEXUS stumbled on that message. Try again in a few seconds.",
      "NEXUS tropezó con ese mensaje. Inténtalo de nuevo en unos segundos.",
    );
  }

  return raw;
}
