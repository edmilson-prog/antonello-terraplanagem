import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { PageHeader } from "@/shared/components/page-header";
import { EmptyState } from "@/shared/components/empty-state";

export const Route = createFileRoute("/admin/equipamentos")({
  component: () => (
    <div className="space-y-6">
      <PageHeader
        titulo="Equipamentos"
        descricao="Cadastro da frota: escavadeiras, carregadeiras, caçambas e tratores."
      />
      <EmptyState
        icone={Truck}
        descricao="Em breve: cadastro completo, horímetro atual, status e histórico de manutenção."
      />
    </div>
  ),
});
