import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Code2, Download, Gamepad2, Loader2, LockKeyhole, Plus, Send, Trash2, X } from "lucide-react";

import { NoctisMark } from "@/components/noctis/NoctisMark";
import { NoctisMarkdown } from "@/components/noctis/NoctisMarkdown";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  deleteNexusThread,
  getNexusGuestStatus,
  getNexusMemberBootstrap,
  listNexusMessages,
  sendNexusGuestMessage,
  sendNexusMessage,
} from "@/lib/nexus.functions";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type NoctisMode = "gaming" | "development";

type NoctisMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  provider?: string | null;
  model?: string | null;
  core_ids?: string[];
};

type NoctisStatus = {
  isAdmin: boolean;
  aiReady: boolean;
  providers: Array<{ id: string; configured: boolean; model: string }>;
  tools: Array<{ id: string; name: string; status: string }>;
};

type NoctisGuestStatus = {
  guestId: string;
  responsesUsed: number;
  maxResponses: number;
  remaining: number;
  locked: boolean;
  aiReady: boolean;
  messages: NoctisMessage[];
};

// Stable technical key retained so existing guest sessions survive the rebrand.
const GUEST_STORAGE_KEY = "mgp:nexus:guest-session";

function readStoredGuestId() {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(GUEST_STORAGE_KEY) || undefined;
}

function persistGuestId(guestId?: string) {
  if (typeof window === "undefined" || !guestId) return;
  window.localStorage.setItem(GUEST_STORAGE_KEY, guestId);
}

export function NoctisChat() {
  const { user, loading: authLoading } = useAuth();
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<NoctisMode>("gaming");
  const [threadId, setThreadId] = useState<string | undefined>();
  const [messages, setMessages] = useState<NoctisMessage[]>([]);
  const [status, setStatus] = useState<NoctisStatus | null>(null);
  const [guestStatus, setGuestStatus] = useState<NoctisGuestStatus | null>(null);
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
        })) as NoctisGuestStatus;
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
      const bootstrap = (await getNexusMemberBootstrap({
        data: { accessToken },
      })) as {
        status: NoctisStatus;
        threads: Array<{ id: string; mode: NoctisMode }>;
      };
      if (!active) return;
      setStatus(bootstrap.status);

      const preferred = bootstrap.threads.find((thread) => thread.mode === mode);
      if (!preferred) return;

      const history = (await listNexusMessages({
        data: { threadId: preferred.id, accessToken },
      })) as NoctisMessage[];
      if (!active) return;
      setThreadId(preferred.id);
      setMessages(history.filter((message) => message.role === "user" || message.role === "assistant"));
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
        if (active) setError(formatNoctisError(reason, Boolean(user), copy));
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

  const changeMode = (nextMode: NoctisMode) => {
    if (!user) return;
    if (nextMode === "development" && !status?.isAdmin) return;
    startNewChat(nextMode);
  };

  const exportCurrentChat = () => {
    if (!user || messages.length === 0 || typeof window === "undefined") return;
    const title = mode === "development" ? "Noctis Development" : "Noctis Gamer";
    const body = [
      `${title} · ÍMPAR`,
      new Date().toLocaleString(locale),
      "",
      ...messages.map((message) =>
        `${message.role === "user" ? copy("Você", "You", "Tú") : "Noctis"}: ${message.content}`,
      ),
    ].join("\n\n");
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `impar-noctis-${mode}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const deleteCurrentChat = async () => {
    if (!user || !threadId || sending) return;
    const confirmed = window.confirm(
      copy(
        "Excluir esta conversa com o Noctis? Essa ação não pode ser desfeita.",
        "Delete this Noctis conversation? This cannot be undone.",
        "¿Eliminar esta conversación con Noctis? Esta acción no se puede deshacer.",
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
      setError(formatNoctisError(reason, true, copy));
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
        let activeGuest = guestStatus;
        if (!activeGuest) {
          const storedGuestId = readStoredGuestId();
          activeGuest = (await getNexusGuestStatus({
            data: storedGuestId ? { guestId: storedGuestId } : {},
          })) as NoctisGuestStatus;
          persistGuestId(activeGuest.guestId);
          setGuestStatus(activeGuest);
        }
        if (activeGuest.locked) throw new Error("NEXUS_GUEST_LIMIT");
        if (!activeGuest.aiReady) throw new Error("NEXUS_NO_PROVIDER");

        const response = await sendNexusGuestMessage({
          data: { guestId: activeGuest.guestId, message, locale },
        });

        persistGuestId(response.guestId);
        if (response.message) setMessages((current) => [...current, response.message as NoctisMessage]);
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
          ...(response.message as NoctisMessage),
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
      setInput((current) => (current.trim() ? current : message));
      setError(formatNoctisError(reason, Boolean(user), copy));
    } finally {
      setSending(false);
    }
  };

  const greeting: NoctisMessage = {
    id: `noctis-greeting-${mode}-${user ? "member" : "guest"}`,
    role: "assistant",
    content:
      mode === "development"
        ? copy(
            "Noctis na área. Manda o que você quer construir, revisar ou consertar no ÍMPAR. Eu organizo o problema e aciono o Conselho quando precisar.",
            "Noctis here. Tell me what you want to build, review or fix in ÍMPAR. I'll organize the problem and call in the Council when needed.",
            "Noctis por aquí. Dime qué quieres construir, revisar o arreglar en ÍMPAR. Organizo el problema y activo al Consejo cuando haga falta.",
          )
        : user
          ? copy(
              "Oi! Eu sou o Noctis, Guardião do ÍMPAR. Pode chegar com boss, build, lore, competitivo, setup ou só pra trocar ideia. Eu tô por aqui pra te ajudar no ÍMPAR. 🎮",
              "Hey! I'm Noctis, Guardian of ÍMPAR. Hit me with bosses, builds, lore, competitive play, setups or just come hang out. I'm here to help around ÍMPAR. 🎮",
              "¡Hey! Soy Noctis, Guardián de ÍMPAR. Puedes venir con bosses, builds, lore, competitivo, setup o simplemente a charlar. Estoy aquí para ayudarte en ÍMPAR. 🎮",
            )
          : copy(
              "Oi! Eu sou o Noctis, Guardião do ÍMPAR. Pode chegar com boss, build, lore, competitivo, setup ou só pra trocar ideia. Eu tô por aqui pra te ajudar no ÍMPAR. 🎮 Sem login, você tem 10 respostas grátis comigo.",
              "Hey! I'm Noctis, Guardian of ÍMPAR. Hit me with bosses, builds, lore, competitive play, setups or just come hang out. I'm here to help around ÍMPAR. 🎮 You get 10 free replies before signing in.",
              "¡Hey! Soy Noctis, Guardián de ÍMPAR. Puedes venir con bosses, builds, lore, competitivo, setup o simplemente a charlar. Estoy aquí para ayudarte en ÍMPAR. 🎮 Tienes 10 respuestas gratis antes de iniciar sesión.",
            ),
  };

  const visibleMessages = [greeting, ...messages];
  const guestLocked = !user && Boolean(guestStatus?.locked);
  const providerStatusKnown = user ? status !== null : guestStatus !== null;
  const aiReady = user ? status?.aiReady === true : guestStatus?.aiReady === true;
  const canSend = Boolean(
    !loadingChat && providerStatusKnown && aiReady && (user || (guestStatus && !guestStatus.locked)),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[70] grid size-14 place-items-center rounded-full border border-[var(--impar-spectral)]/45 bg-foreground text-[var(--impar-spectral)] shadow-lift transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--impar-spectral)]"
        aria-label={copy("Abrir Noctis", "Open Noctis", "Abrir Noctis")}
      >
        {open ? <X className="size-5 text-background" /> : <NoctisMark className="size-7" calmMotion />}
      </button>

      {open ? (
        <section className="fixed bottom-24 right-4 z-[69] flex h-[min(700px,calc(100vh-8rem))] w-[min(440px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-[var(--impar-line)] bg-background shadow-lift">
          <header className="border-b border-[var(--impar-line)] bg-surface px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-[var(--impar-line)] bg-[var(--impar-spectral-soft)] text-[var(--impar-spectral)]">
                  <NoctisMark className="size-6" title="Noctis" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-bold text-foreground">Noctis</h2>
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
                        : copy("Conectando sessão guest...", "Connecting guest session...", "Conectando sesión invitada...")
                      : !status
                        ? copy(
                            "Noctis está acordando o motor do ÍMPAR...",
                            "Noctis is waking up the ÍMPAR engine...",
                            "Noctis está activando el motor de ÍMPAR...",
                          )
                        : configuredProviders.length
                          ? copy(
                              `${configuredProviders.length} provedor(es) disponível(is)`,
                              `${configuredProviders.length} provider(s) available`,
                              `${configuredProviders.length} proveedor(es) disponible(s)`,
                            )
                          : copy(
                              "Motor do ÍMPAR sem provedor conectado",
                              "ÍMPAR engine has no provider connected",
                              "Motor de ÍMPAR sin proveedor conectado",
                            )}
                  </p>
                </div>
              </div>

              {user ? (
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={exportCurrentChat} disabled={messages.length === 0} title={copy("Exportar conversa", "Export chat", "Exportar conversación")}>
                    <Download className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => void deleteCurrentChat()} disabled={!threadId} title={copy("Excluir conversa", "Delete chat", "Eliminar conversación")}>
                    <Trash2 className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => startNewChat()} title={copy("Nova conversa", "New chat", "Nueva conversación")}>
                    <Plus className="size-4" />
                  </Button>
                </div>
              ) : (
                <Link to="/login" className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted">
                  {copy("Entrar", "Sign in", "Entrar")}
                </Link>
              )}
            </div>

            {user && status ? (
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-1">
                <button type="button" onClick={() => changeMode("gaming")} className={cn("flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors", mode === "gaming" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground")}>
                  <Gamepad2 className="size-3.5" /> Gamer
                </button>
                <button type="button" disabled={!status.isAdmin} onClick={() => changeMode("development")} className={cn("flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors", mode === "development" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground", !status.isAdmin && "cursor-not-allowed opacity-40")} title={!status.isAdmin ? "Admin only" : undefined}>
                  <Code2 className="size-3.5" /> {copy("Desenvolvimento", "Development", "Desarrollo")}
                </button>
              </div>
            ) : null}
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {authLoading || loadingChat ? (
              <div className="grid h-full place-items-center text-muted-foreground"><Loader2 className="size-5 animate-spin" /></div>
            ) : (
              <>
                {visibleMessages.map((message, index) => (
                  <article key={message.id ?? `${message.role}-${index}`} className={cn("max-w-[88%] rounded-2xl px-3.5 py-3 text-sm leading-6", message.role === "user" ? "ml-auto bg-foreground text-background" : "mr-auto border border-border bg-surface text-foreground")}>
                    {message.role === "assistant" ? (
                      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--impar-spectral)]">
                        <NoctisMark className="size-3.5" /> Noctis
                      </div>
                    ) : null}
                    {message.role === "assistant" ? <NoctisMarkdown content={message.content} /> : <p className="whitespace-pre-wrap">{message.content}</p>}
                    {message.role === "assistant" && (message.model || message.provider) ? (
                      <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{[message.provider, message.model].filter(Boolean).join(" · ")}</p>
                    ) : null}
                  </article>
                ))}

                {sending ? (
                  <div className="mr-auto flex items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm text-muted-foreground">
                    <NoctisMark className="size-4 text-[var(--impar-spectral)]" />
                    <Loader2 className="size-3.5 animate-spin" />
                    Noctis...
                  </div>
                ) : null}

                {providerStatusKnown && !aiReady ? (
                  <div className="mt-4 rounded-2xl border border-border bg-muted/40 p-4 text-center">
                    <NoctisMark className="mx-auto mb-2 size-8 text-[var(--impar-spectral)]" />
                    <p className="font-semibold text-foreground">
                      {copy(
                        "O Noctis respondeu, mas nenhum provedor de IA ficou disponível nesta verificação.",
                        "Noctis responded, but no AI provider was available in this check.",
                        "Noctis respondió, pero ningún proveedor de IA quedó disponible en esta verificación.",
                      )}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {copy(
                        "Isso pode mudar após uma atualização de segredo ou uma indisponibilidade temporária do provedor.",
                        "This can change after a secret update or a temporary provider outage.",
                        "Esto puede cambiar tras actualizar un secreto o por una indisponibilidad temporal del proveedor.",
                      )}
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={() => setReloadNonce((value) => value + 1)} className="mt-3">
                      {copy("Verificar novamente", "Check again", "Verificar de nuevo")}
                    </Button>
                  </div>
                ) : null}

                {guestLocked ? (
                  <div className="mt-4 rounded-2xl border border-[var(--impar-spectral)]/30 bg-[var(--impar-spectral-soft)] p-4 text-center">
                    <div className="mx-auto mb-2 grid size-9 place-items-center rounded-full bg-[var(--impar-spectral-soft)] text-[var(--impar-spectral)]"><LockKeyhole className="size-4" /></div>
                    <p className="font-semibold text-foreground">
                      {copy(
                        "As 10 respostas grátis acabaram por aqui.",
                        "Your 10 free Noctis replies are used up.",
                        "Tus 10 respuestas gratis de Noctis se terminaron.",
                      )}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {copy(
                        "Entra no ÍMPAR para continuar a conversa e manter seu histórico na conta.",
                        "Sign in to keep chatting and save your Noctis history to your account.",
                        "Inicia sesión para seguir hablando y guardar tu historial con Noctis en tu cuenta.",
                      )}
                    </p>
                    <div className="mt-3 flex justify-center gap-2">
                      <Link to="/login" className="rounded-xl bg-foreground px-3.5 py-2 text-xs font-semibold text-background">{copy("Entrar", "Sign in", "Entrar")}</Link>
                      <Link to="/register" className="rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground">{copy("Criar perfil", "Create profile", "Crear perfil")}</Link>
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
                  <button type="button" onClick={() => setReloadNonce((value) => value + 1)} className="shrink-0 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted">
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
                    ? copy("Verificando conexão com o Noctis...", "Checking Noctis connection...", "Verificando conexión con Noctis...")
                    : !aiReady
                      ? copy("Provedor indisponível — verifique novamente", "Provider unavailable — check again", "Proveedor no disponible — verifica de nuevo")
                      : guestLocked
                        ? copy("Entre para continuar com o Noctis", "Sign in to keep chatting with Noctis", "Inicia sesión para continuar con Noctis")
                        : copy("Fale com o Noctis...", "Talk to Noctis...", "Habla con Noctis...")
                }
                className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--impar-spectral)]/30 disabled:opacity-50"
              />
              <Button type="submit" size="icon" disabled={!canSend || sending || !input.trim()} className="size-11 rounded-2xl">
                <Send className="size-4" />
              </Button>
            </form>
            <div className="mt-2 flex items-start justify-between gap-3 px-1 text-[10px] leading-4 text-muted-foreground">
              <p>
                {user
                  ? copy(
                      "As mensagens podem ser processadas por provedores oficiais de IA configurados pelo ÍMPAR.",
                      "Messages may be processed by official AI providers configured by ÍMPAR.",
                      "Los mensajes pueden ser procesados por proveedores oficiales de IA configurados por ÍMPAR.",
                    )
                  : copy(
                      "Teste guest: até 10 respostas. As mensagens podem ser processadas por provedores oficiais de IA do ÍMPAR.",
                      "Guest trial: up to 10 replies. Messages may be processed by ÍMPAR's configured official AI providers.",
                      "Prueba invitada: hasta 10 respuestas. Los mensajes pueden ser procesados por proveedores oficiales de IA de ÍMPAR.",
                    )}
              </p>
              {!user && guestStatus ? <span className="shrink-0 font-semibold text-[var(--impar-spectral)]">{guestStatus.remaining}/10</span> : null}
            </div>
          </footer>
        </section>
      ) : null}
    </>
  );
}

function formatNoctisError(
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

  if (raw.includes("NEXUS_ALL_PROVIDERS_FAILED") || raw.includes("All configured NEXUS providers failed")) {
    return copy(
      "O Noctis teve uma falha temporária nos provedores do ÍMPAR. Sua mensagem voltou para a caixa — tente enviar de novo em alguns segundos.",
      "Noctis hit a temporary ÍMPAR provider failure. Your message is back in the box — try sending it again in a few seconds.",
      "Noctis tuvo una falla temporal con los proveedores de ÍMPAR. Tu mensaje volvió a la caja — intenta enviarlo otra vez en unos segundos.",
    );
  }

  if (raw.includes("NEXUS_NO_PROVIDER") || raw.includes("no official model API configured")) {
    return copy(
      "O Noctis está pronto, mas ainda falta conectar um provedor de IA ao motor do ÍMPAR.",
      "Noctis is ready, but an AI provider still needs to be connected to the ÍMPAR engine.",
      "Noctis está listo, pero todavía falta conectar un proveedor de IA al motor de ÍMPAR.",
    );
  }

  if (raw.includes("NEXUS_LOAD_TIMEOUT") || raw.includes("NEXUS_EDGE_") || raw.includes("NEXUS_RUNTIME_ERROR")) {
    return copy(
      "Não consegui acordar o Noctis agora. Tente novamente — isso não significa que o motor de IA esteja desconectado.",
      "I couldn't wake Noctis right now. Try again — this does not mean the AI engine is disconnected.",
      "No pude activar a Noctis ahora. Inténtalo de nuevo; esto no significa que el motor de IA esté desconectado.",
    );
  }

  if (raw.includes("NEXUS_AUTH_SESSION_MISSING") || raw.includes("NEXUS_AUTH_INVALID")) {
    return copy(
      "Sua sessão precisa ser renovada para abrir o Noctis. Entre novamente se o problema continuar.",
      "Your session needs to be refreshed to open Noctis. Sign in again if the problem continues.",
      "Tu sesión necesita renovarse para abrir Noctis. Inicia sesión de nuevo si el problema continúa.",
    );
  }

  if (!authenticated) {
    return copy(
      "O Noctis tropeçou nessa mensagem. Tenta de novo em alguns segundos.",
      "Noctis stumbled on that message. Try again in a few seconds.",
      "Noctis tropezó con ese mensaje. Inténtalo de nuevo en unos segundos.",
    );
  }

  return raw;
}
