import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { NovaManutencaoForm } from "@/features/manutencao/components/nova-manutencao-form";

export function NovaManutencaoPage() {
  const navigate = useNavigate();
  const voltar = () => navigate({ to: "/admin/manutencao" });

  return (
    <PaginaCadastroDedicada
      backLabel="Manutenção"
      backTo="/admin/manutencao"
      title="Nova manutenção"
      tag="MNT · rascunho"
    >
      <NovaManutencaoForm onCancel={voltar} onSuccess={() => {}} />
    </PaginaCadastroDedicada>
  );
}
