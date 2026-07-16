import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { ClienteForm } from "@/features/clientes/components/cliente-form";

export function NovoClientePage() {
  const navigate = useNavigate();
  const voltar = () => navigate({ to: "/admin/clientes" });

  return (
    <PaginaCadastroDedicada
      backLabel="Clientes"
      backTo="/admin/clientes"
      title="Novo cliente"
      tag="cadastro"
    >
      <ClienteForm inicial={null} onSuccess={voltar} onCancel={voltar} />
    </PaginaCadastroDedicada>
  );
}
