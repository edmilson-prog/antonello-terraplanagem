import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { OperadorForm } from "@/features/operadores/components/operador-form";

export function NovoOperadorPage() {
  const navigate = useNavigate();
  const voltar = () => navigate({ to: "/admin/operadores" });

  return (
    <PaginaCadastroDedicada
      backLabel="Operadores"
      backTo="/admin/operadores"
      title="Novo operador"
      tag="cadastro"
    >
      <OperadorForm inicial={null} onSuccess={voltar} onCancel={voltar} />
    </PaginaCadastroDedicada>
  );
}
