import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { ComponenteCustoForm } from "@/features/custo-hora/components/componente-custo-form";

export function NovoCustoPage() {
  const navigate = useNavigate();
  const voltar = () => navigate({ to: "/admin/custo-hora" });

  return (
    <PaginaCadastroDedicada
      backLabel="Custo da Hora"
      backTo="/admin/custo-hora"
      title="Novo lançamento de custo"
      tag="custo da hora"
    >
      <ComponenteCustoForm inicial={null} onSuccess={voltar} onCancel={voltar} />
    </PaginaCadastroDedicada>
  );
}
