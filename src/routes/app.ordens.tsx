import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { EmptyState } from "@/shared/components/empty-state";

export const Route = createFileRoute("/app/ordens")({
  component: () => (
    <EmptyState
      icone={FileText}
      titulo="Minhas OS em construção"
      descricao="Em breve: ordens de serviço abertas no seu nome, com cliente, obra e ações de abertura e fechamento."
    />
  ),
});
