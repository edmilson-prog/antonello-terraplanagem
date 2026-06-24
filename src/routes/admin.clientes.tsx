import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/shared/components/page-header";
import { EmptyState } from "@/shared/components/empty-state";

export const Route = createFileRoute("/admin/clientes")({
  component: () => (
    <div className="space-y-6">
      <PageHeader titulo="Clientes" descricao="Construtoras, incorporadoras e órgãos atendidos." />
      <EmptyState
        icone={Building2}
        descricao="Em breve: cadastro de clientes com obras associadas e histórico de faturamento."
      />
    </div>
  ),
});
