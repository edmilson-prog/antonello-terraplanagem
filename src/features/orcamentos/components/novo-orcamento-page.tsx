import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { OrcamentoForm } from "@/features/orcamentos/components/orcamento-form";

export function NovoOrcamentoPage() {
  const navigate = useNavigate();
  const voltar = () => navigate({ to: "/admin/orcamentos" });

  return (
    <PaginaCadastroDedicada
      backLabel="Orçamentos"
      backTo="/admin/orcamentos"
      title="Novo orçamento"
      tag="comercial"
    >
      <OrcamentoForm onCancel={voltar} />
    </PaginaCadastroDedicada>
  );
}
