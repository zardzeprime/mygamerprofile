import { useSession } from "@tanstack/react-start/server";

type NexusGuestSessionData = {
  guestId?: string;
};

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

function getGuestSessionPassword() {
  const dedicated = process.env["NEXUS_GUEST_SESSION_SECRET"]?.trim();
  const fallback = process.env["SUPABASE_SERVICE_ROLE_KEY"]?.trim();
  const secret = dedicated || fallback;

  if (!secret || secret.length < 32) {
    throw new Error(
      "NEXUS guest sessions require NEXUS_GUEST_SESSION_SECRET (32+ chars) or a server service-role key.",
    );
  }

  // Prefixing the fallback gives this cookie a distinct cryptographic purpose.
  return `mgp-nexus-guest-session::${secret}`;
}

export function useNexusGuestSession() {
  return useSession<NexusGuestSessionData>({
    name: "mgp-nexus-guest",
    password: getGuestSessionPassword(),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env["NODE_ENV"] === "production",
      maxAge: THIRTY_DAYS_SECONDS,
      path: "/",
    },
  });
}
