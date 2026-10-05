import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { requestNoctisOpen } from "@/lib/noctis-dialog";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/noctis")({
  head: () =>
    buildSeo({
      title: "Noctis — ÍMPAR",
      description: "Converse com Noctis, mascote e assistente do ÍMPAR.",
      path: "/noctis",
      robots: "noindex, nofollow",
    }),
  component: NoctisRoute,
});

// Preserve old links without rendering a separate Noctis page.
function NoctisRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    window.setTimeout(requestNoctisOpen, 0);
    void navigate({ to: "/" });
  }, [navigate]);

  return null;
}
