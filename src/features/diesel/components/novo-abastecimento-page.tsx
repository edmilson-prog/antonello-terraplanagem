import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { AbastecimentoForm } from "@/features/diesel/components/abastecimento-form";

export function NovoAbastecimentoPage() {
  const navigate = useNavigate();
  const voltar = () => navigate({ to: "/admin/diesel" });

  return (
    <PaginaCadastroDedicada
      backLabel="Diesel"
      backTo="/admin/diesel"
      title="Novo abastecimento"
      tag="diesel"
    >
      <AbastecimentoForm onCancel={voltar} />
    </PaginaCadastroDedicada>
  );
}
