import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { NovaNotificacaoForm } from "@/features/notificacoes/components/nova-notificacao-form";

export function NovaNotificacaoPage() {
  const navigate = useNavigate();
  const voltar = () => navigate({ to: "/admin/notificacoes" });

  return (
    <PaginaCadastroDedicada
      backLabel="Notificações"
      backTo="/admin/notificacoes"
      title="Nova notificação"
      tag="aviso manual"
    >
      <NovaNotificacaoForm onCancel={voltar} onSuccess={voltar} />
    </PaginaCadastroDedicada>
  );
}
