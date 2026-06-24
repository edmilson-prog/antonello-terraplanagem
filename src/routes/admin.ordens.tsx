import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/shared/components/page-header";
import { EmptyState } from "@/shared/components/empty-state";

export const Route = createFileRoute("/admin/ordens")({
  component: () => (
    <div className="space-y-6">
      <PageHeader
        titulo="Ordens de Serviço"
        descricao="Abertura, acompanhamento e fechamento das OS de campo."
      />
      <EmptyState descricao="Em breve: lista de OS com filtros por cliente, equipamento, operador e período." />
    </div>
  ),
});
