type Envelope<T = unknown> = { data: T };

type Locale = "pt-BR" | "en" | "es";
type Mode = "gaming" | "development";

const SUPABASE_URL =
  import.meta.env["VITE_SUPABASE_URL"] || "https://gudvdgpjfapshzqyfcpj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
  "sb_publishable_JXVaM-rr7Yu59l3x7WyHEg_qlR-uDMX";
const NEXUS_EDGE_URL = `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/nexus-inference`;

async function invokeNexus<T>(body: Record<string, unknown>, accessToken?: string): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);

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

    return payload as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("NEXUS_LOAD_TIMEOUT");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
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

export async function listNexusThreads({ data }: Envelope<{ accessToken: string }>) {
  return invokeNexus({ action: "member.threads" }, data.accessToken);
}

export async function listNexusMessages({
  data,
}: Envelope<{ threadId: string; accessToken: string }>) {
  return invokeNexus({ action: "member.messages", threadId: data.threadId }, data.accessToken);
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
