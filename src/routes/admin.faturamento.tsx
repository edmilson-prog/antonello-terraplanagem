import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { PageHeader } from "@/shared/components/page-header";
import { EmptyState } from "@/shared/components/empty-state";

export const Route = createFileRoute("/admin/faturamento")({
  component: () => (
    <div className="space-y-6">
      <PageHeader
        titulo="Faturamento"
        descricao="Conversão das horas apontadas em cobrança para o cliente."
      />
      <EmptyState
        icone={Receipt}
        descricao="Em breve: geração de faturas a partir das OS fechadas, com valores por hora-equipamento."
      />
    </div>
  ),
});
