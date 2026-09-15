import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    const onboardingPath = "/onboarding";
    if (!profile && location.pathname !== onboardingPath) {
      throw redirect({ to: onboardingPath });
    }
    if (profile && location.pathname === onboardingPath) {
      throw redirect({ to: "/u/$username", params: { username: profile.username } });
    }

    return { user: data.user, profile };
  },
  component: () => <Outlet />,
});
