import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { PageHeader } from "@/shared/components/page-header";
import { EmptyState } from "@/shared/components/empty-state";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Dashboard"
        descricao="Visão geral da operação — equipamentos, ordens e faturamento."
      />
      <EmptyState
        icone={LayoutDashboard}
        titulo="Indicadores em construção"
        descricao="Em breve: horas faturadas no mês, rentabilidade por máquina e OS pendentes de fechamento."
      />
    </div>
  );
}
