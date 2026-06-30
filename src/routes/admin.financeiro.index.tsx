import { createFileRoute } from "@tanstack/react-router";
import { FinanceiroPage } from "@/features/financeiro";

export const Route = createFileRoute("/admin/financeiro/")({
  head: () => ({
    meta: [{ title: "Financeiro · Antonello" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: FinanceiroPage,
});
