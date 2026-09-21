type Envelope<T = unknown> = { data: T };

type Locale = "pt-BR" | "en" | "es";
type Mode = "gaming" | "development";

const SUPABASE_URL =
  import.meta.env["VITE_SUPABASE_URL"] || "https://gudvdgpjfapshzqyfcpj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
  "sb_publishable_JXVaM-rr7Yu59l3x7WyHEg_qlR-uDMX";
const NEXUS_EDGE_URL = `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/nexus-inference`;

// Read/bootstrap calls should fail fast; inference calls get a larger budget so
// the Edge runtime can perform bounded provider failover without the browser
// killing a healthy fallback attempt.
const NEXUS_READ_TIMEOUT_MS = 15_000;
const NEXUS_SEND_TIMEOUT_MS = 52_000;

function timeoutForBody(body: Record<string, unknown>) {
  const action = typeof body["action"] === "string" ? body["action"] : "";
  return action === "guest.send" || action === "member.send" || action === "translate.souls"
    ? NEXUS_SEND_TIMEOUT_MS
    : NEXUS_READ_TIMEOUT_MS;
}

async function invokeNexus(body: Record<string, unknown>, accessToken?: string): Promise<any> {
  const controller = new AbortController();
  const timeout =
    typeof window !== "undefined"
      ? window.setTimeout(() => controller.abort(), timeoutForBody(body))
      : undefined;

  try {
    const response = await fetch(NEXUS_EDGE_URL, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const raw = await response.text();
    let payload: Record<string, unknown> = {};
    try {
      payload = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    } catch {
      throw new Error(`NEXUS_EDGE_INVALID_RESPONSE_${response.status}`);
    }

    if (!response.ok) {
      const code =
        typeof payload["error"] === "string" ? payload["error"] : `NEXUS_EDGE_${response.status}`;
      throw new Error(code);
    }

    return payload;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("NEXUS_LOAD_TIMEOUT");
    }
    throw error;
  } finally {
    if (timeout !== undefined && typeof window !== "undefined") window.clearTimeout(timeout);
  }
}

export async function getNexusGuestStatus({ data }: Envelope<{ guestId?: string }>) {
  return invokeNexus({ action: "guest.status", guestId: data.guestId ?? null });
}

export async function sendNexusGuestMessage({
  data,
}: Envelope<{ guestId?: string; locale: Locale; message: string }>) {
  return invokeNexus({
    action: "guest.send",
    guestId: data.guestId ?? null,
    locale: data.locale,
    message: data.message,
  });
}

export async function getNexusStatus({ data }: Envelope<{ accessToken: string }>) {
  return invokeNexus({ action: "member.status" }, data.accessToken);
}

export async function getNexusMemberBootstrap({ data }: Envelope<{ accessToken: string }>) {
  return invokeNexus({ action: "member.bootstrap" }, data.accessToken);
}

export async function listNexusThreads({ data }: Envelope<{ accessToken: string }>) {
  return invokeNexus({ action: "member.threads" }, data.accessToken);
}

export async function listNexusMessages({
  data,
}: Envelope<{ threadId: string; accessToken: string }>) {
  return invokeNexus({ action: "member.messages", threadId: data.threadId }, data.accessToken);
}

export async function deleteNexusThread({
  data,
}: Envelope<{ threadId: string; accessToken: string }>) {
  return invokeNexus({ action: "member.delete-thread", threadId: data.threadId }, data.accessToken);
}

export async function sendNexusMessage({
  data,
}: Envelope<{
  accessToken: string;
  threadId?: string;
  mode: Mode;
  locale: Locale;
  message: string;
}>) {
  return invokeNexus(
    {
      action: "member.send",
      threadId: data.threadId ?? null,
      mode: data.mode,
      locale: data.locale,
      message: data.message,
    },
    data.accessToken,
  );
}


export async function translateNexusSoulsCopy({
  data,
}: Envelope<{ locale: Locale; text: string }>) {
  return invokeNexus({
    action: "translate.souls",
    scope: "souls-compendium",
    locale: data.locale,
    text: data.text,
  }) as Promise<{
    text: string;
    locale: Locale;
    cached?: boolean;
    provider?: string;
    model?: string;
    latencyMs?: number;
  }>;
}
