import { createFileRoute } from "@tanstack/react-router";
import { OrdensOperadorPage } from "@/features/ordem-servico";

export const Route = createFileRoute("/app/ordens/")({
  head: () => ({ meta: [{ title: "Minhas OS · Antonello" }] }),
  component: OrdensOperadorPage,
});
