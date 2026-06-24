import { createFileRoute } from "@tanstack/react-router";
import { HardHat } from "lucide-react";
import { PageHeader } from "@/shared/components/page-header";
import { EmptyState } from "@/shared/components/empty-state";

export const Route = createFileRoute("/admin/operadores")({
  component: () => (
    <div className="space-y-6">
      <PageHeader titulo="Operadores" descricao="Equipe de campo habilitada a operar os equipamentos." />
      <EmptyState
        icone={HardHat}
        descricao="Em breve: cadastro de operadores, habilitações e equipamentos autorizados."
      />
    </div>
  ),
});
