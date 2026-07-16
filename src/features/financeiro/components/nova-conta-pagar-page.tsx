import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { ContaPagarForm } from "@/features/financeiro/components/conta-pagar-form";

export function NovaContaPagarPage() {
  const navigate = useNavigate();
  const voltar = () => navigate({ to: "/admin/financeiro" });

  return (
    <PaginaCadastroDedicada
      backLabel="Financeiro"
      backTo="/admin/financeiro"
      title="Novo pagamento"
      tag="conta a pagar"
    >
      <ContaPagarForm onSuccess={voltar} onCancel={voltar} />
    </PaginaCadastroDedicada>
  );
}
