import { supabase } from "@/integrations/supabase/client";
import { getAuthRedirectUrl } from "@/lib/siteUrl";

export const GOOGLE_OAUTH_CALLBACK_URL =
  "https://gudvdgpjfapshzqyfcpj.supabase.co/auth/v1/callback";

export async function signInWithGoogle(nextPath = "/onboarding") {
  if (typeof window === "undefined") {
    throw new Error("GOOGLE_OAUTH_BROWSER_REQUIRED");
  }

  const safeNext = nextPath.startsWith("/") ? nextPath : "/onboarding";
  const redirectTo = getAuthRedirectUrl(safeNext);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      scopes: "openid email profile",
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) throw error;
  return data;
}
