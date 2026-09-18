import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/nexus")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "MG Profile" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => null,
});
