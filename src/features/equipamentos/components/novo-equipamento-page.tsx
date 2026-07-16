import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { EquipamentoForm } from "@/features/equipamentos/components/equipamento-form";

export function NovoEquipamentoPage() {
  const navigate = useNavigate();
  const voltar = () => navigate({ to: "/admin/equipamentos" });

  return (
    <PaginaCadastroDedicada
      backLabel="Equipamentos"
      backTo="/admin/equipamentos"
      title="Novo equipamento"
      tag="frota"
    >
      <EquipamentoForm inicial={null} onSuccess={voltar} onCancel={voltar} />
    </PaginaCadastroDedicada>
  );
}
