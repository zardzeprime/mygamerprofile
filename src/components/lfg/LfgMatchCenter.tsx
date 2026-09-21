import { Link } from "@tanstack/react-router";
import { Check, Clock3, MessageCircle, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  listLfgMessages,
  listMyLfgApplications,
  respondLfgApplication,
  sendLfgMessage,
} from "@/lib/lfg.functions";

type ProfileSummary = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

type MatchPost = {
  id: string;
  user_id: string;
  title: string | null;
  platform: string;
  region: string | null;
  language: string | null;
  mode: string | null;
  description: string;
  scheduled_for: string | null;
  min_age: number;
  max_age: number;
  slots_total: number;
  slots_open: number;
  status: string;
  external_game_name: string | null;
  external_game_image_url: string | null;
  game: { id: string; name: string; slug: string } | null;
  author: ProfileSummary | null;
};

type MatchApplication = {
  id: string;
  applicant_user_id: string;
  lfg_post_id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  note: string | null;
  created_at: string;
  updated_at: string;
  applicant: ProfileSummary | null;
  post: MatchPost | null;
};

type MatchMessage = {
  id: string;
  application_id: string;
  sender_user_id: string;
  recipient_user_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export function LfgMatchCenter({
  userId,
  verified,
  refreshToken = 0,
}: {
  userId: string;
  verified: boolean;
  refreshToken?: number;
}) {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const doList = useServerFn(listMyLfgApplications);
  const doRespond = useServerFn(respondLfgApplication);
  const [incoming, setIncoming] = useState<MatchApplication[]>([]);
  const [outgoing, setOutgoing] = useState<MatchApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await doList();
      setIncoming(result.incoming as unknown as MatchApplication[]);
      setOutgoing(result.outgoing as unknown as MatchApplication[]);
    } catch (error) {
      console.warn("[LFG] Could not load match activity", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [userId, refreshToken]);

  const respond = async (applicationId: string, status: "accepted" | "rejected") => {
    setBusyId(applicationId);
    try {
      await doRespond({ data: { applicationId, status } });
      await load();
    } catch (error) {
      console.warn("[LFG] Could not update match", error);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-kicker">MGP / MATCHES</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">
            {copy("Seus matches do LFG", "Your LFG matches", "Tus matches del LFG")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {copy(
              "A DM só abre depois que um pedido de grupo é aceito. A conversa é exclusivamente por texto nesta fase.",
              "DMs only open after a group request is accepted. Conversations are text-only at this stage.",
              "Los mensajes directos solo se abren después de aceptar una solicitud de grupo. Por ahora, la conversación es solo por texto.",
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs text-muted-foreground">
          <ShieldCheck className={verified ? "size-4 text-emerald-400" : "size-4 text-amber-300"} />
          {verified
            ? copy("Idade verificada", "Age verified", "Edad verificada")
            : copy("Verificação necessária", "Verification required", "Verificación necesaria")}
        </div>
      </div>

      {!verified ? (
        <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.05] p-4 text-sm leading-6 text-muted-foreground">
          {copy(
            "Para criar grupo, pedir match, aceitar pessoas ou mandar DM, sua idade precisa ser verificada por um provedor externo.",
            "To create a group, request a match, accept people or send DMs, your age must be verified by an external provider.",
            "Para crear un grupo, pedir match, aceptar personas o enviar mensajes directos, tu edad debe verificarse mediante un proveedor externo.",
          )}{" "}
          <Link to="/settings/connections" className="font-semibold text-gold-strong hover:underline">
            {copy("Ir para Conexões", "Go to Connections", "Ir a Conexiones")}
          </Link>
        </div>
      ) : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="surface-panel p-4 sm:p-5">
          <h3 className="font-display text-lg font-semibold">
            {copy("Pedidos recebidos", "Incoming requests", "Solicitudes recibidas")}
          </h3>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">
                {copy("Carregando…", "Loading…", "Cargando…")}
              </p>
            ) : incoming.length ? (
              incoming.map((application) => (
                <MatchRow
                  key={application.id}
                  application={application}
                  direction="incoming"
                  userId={userId}
                  locale={locale}
                  busy={busyId === application.id}
                  onAccept={() => void respond(application.id, "accepted")}
                  onReject={() => void respond(application.id, "rejected")}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {copy("Nenhum pedido recebido ainda.", "No incoming requests yet.", "Todavía no hay solicitudes recibidas.")}
              </p>
            )}
          </div>
        </div>

        <div className="surface-panel p-4 sm:p-5">
          <h3 className="font-display text-lg font-semibold">
            {copy("Pedidos enviados", "Outgoing requests", "Solicitudes enviadas")}
          </h3>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">
                {copy("Carregando…", "Loading…", "Cargando…")}
              </p>
            ) : outgoing.length ? (
              outgoing.map((application) => (
                <MatchRow
                  key={application.id}
                  application={application}
                  direction="outgoing"
                  userId={userId}
                  locale={locale}
                  busy={false}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {copy("Você ainda não pediu match em nenhum grupo.", "You have not requested a match yet.", "Todavía no has pedido match en ningún grupo.")}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MatchRow({
  application,
  direction,
  userId,
  locale,
  busy,
  onAccept,
  onReject,
}: {
  application: MatchApplication;
  direction: "incoming" | "outgoing";
  userId: string;
  locale: "pt-BR" | "en" | "es";
  busy: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const post = application.post;
  if (!post) return null;
  const otherUser = direction === "incoming" ? application.applicant : post.author;
  const gameName = post.game?.name ?? post.external_game_name ?? copy("Jogo", "Game", "Juego");

  return (
    <article className="rounded-xl border border-border bg-background/45 p-3">
      <div className="flex items-start gap-3">
        <UserAvatar
          src={otherUser?.avatar_url}
          name={otherUser?.display_name}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {otherUser?.display_name ?? copy("Jogador", "Player", "Jugador")}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {gameName} · {post.title ?? copy("Grupo", "Group", "Grupo")}
          </p>
        </div>
        <StatusPill status={application.status} locale={locale} />
      </div>

      {application.note ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{application.note}</p>
      ) : null}

      {direction === "incoming" && application.status === "pending" ? (
        <div className="mt-3 flex gap-2">
          <Button size="sm" disabled={busy} onClick={onAccept}>
            <Check className="mr-1 size-3.5" />
            {copy("Aceitar", "Accept", "Aceptar")}
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={onReject}>
            <X className="mr-1 size-3.5" />
            {copy("Recusar", "Reject", "Rechazar")}
          </Button>
        </div>
      ) : null}

      {application.status === "accepted" && otherUser ? (
        <div className="mt-3">
          <LfgTextChatDialog application={application} userId={userId} otherUser={otherUser} />
        </div>
      ) : null}
    </article>
  );
}

function StatusPill({
  status,
  locale,
}: {
  status: MatchApplication["status"];
  locale: "pt-BR" | "en" | "es";
}) {
  const label =
    status === "accepted"
      ? localeCopy(locale, "Match", "Matched", "Match")
      : status === "rejected"
        ? localeCopy(locale, "Recusado", "Rejected", "Rechazado")
        : status === "cancelled"
          ? localeCopy(locale, "Cancelado", "Cancelled", "Cancelado")
          : localeCopy(locale, "Pendente", "Pending", "Pendiente");

  return (
    <span className="rounded-full border border-border px-2 py-1 text-[0.62rem] font-bold text-muted-foreground">
      {label}
    </span>
  );
}

function LfgTextChatDialog({
  application,
  userId,
  otherUser,
}: {
  application: MatchApplication;
  userId: string;
  otherUser: ProfileSummary;
}) {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const doListMessages = useServerFn(listLfgMessages);
  const doSendMessage = useServerFn(sendLfgMessage);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<MatchMessage[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = async () => {
    try {
      const rows = await doListMessages({ data: { applicationId: application.id } });
      setMessages(rows as MatchMessage[]);
    } catch (error) {
      console.warn("[LFG] Could not load DM", error);
    }
  };

  useEffect(() => {
    if (!open) return;
    void loadMessages();
    const timer = window.setInterval(() => void loadMessages(), 5000);
    return () => window.clearInterval(timer);
  }, [open, application.id]);

  const send = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clean = body.trim();
    if (!clean || sending) return;

    setSending(true);
    try {
      const message = await doSendMessage({
        data: { applicationId: application.id, body: clean },
      });
      setMessages((current) => [...current, message as MatchMessage]);
      setBody("");
    } catch (error) {
      console.warn("[LFG] Could not send DM", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MessageCircle className="mr-1 size-3.5" />
          {copy("Abrir DM", "Open DM", "Abrir DM")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {copy("Conversa com ", "Chat with ", "Chat con ")}
            {otherUser.display_name}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[22rem] space-y-2 overflow-y-auto rounded-xl border border-border bg-background/50 p-3">
          {messages.length ? (
            messages.map((message) => {
              const own = message.sender_user_id === userId;
              return (
                <div
                  key={message.id}
                  className={own ? "ml-auto max-w-[82%] rounded-xl bg-gold-soft px-3 py-2 text-sm" : "mr-auto max-w-[82%] rounded-xl bg-muted px-3 py-2 text-sm"}
                >
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <p className="mt-1 text-[0.6rem] text-muted-foreground">
                    {new Date(message.created_at).toLocaleTimeString(locale, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {copy("Comece a conversa por texto.", "Start the text conversation.", "Empieza la conversación por texto.")}
            </p>
          )}
        </div>

        <form onSubmit={send} className="flex gap-2">
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value.slice(0, 2000))}
            rows={2}
            maxLength={2000}
            placeholder={copy("Digite uma mensagem…", "Type a message…", "Escribe un mensaje…")}
          />
          <Button type="submit" disabled={sending || !body.trim()} className="self-end">
            {sending ? <Clock3 className="size-4 animate-pulse" /> : <MessageCircle className="size-4" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
