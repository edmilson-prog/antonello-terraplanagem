import { createFileRoute } from "@tanstack/react-router";
import { NovaManutencaoPage } from "@/features/manutencao/components/nova-manutencao-page";

export const Route = createFileRoute("/admin/manutencao/nova")({
  // `?solicitacao=<id>` chega do card "Chamados do campo": abre o formulário
  // já preenchido com o que o operador relatou, e carimba a origem na ordem.
  validateSearch: (search: Record<string, unknown>): { solicitacao?: string } => ({
    solicitacao: typeof search.solicitacao === "string" ? search.solicitacao : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Nova manutenção · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovaManutencaoPage,
});
