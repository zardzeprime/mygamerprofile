import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/nexus")({
  beforeLoad: () => {
    throw redirect({ to: "/noctis", replace: true });
  },
});
