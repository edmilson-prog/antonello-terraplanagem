import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { NovaManutencaoForm } from "@/features/manutencao/components/nova-manutencao-form";
import { registrosCampoRetaguardaStore } from "@/features/registros-campo/registros-campo-retaguarda-store";
import { ehSolicitacaoManutencao } from "@/features/registros-campo/retaguarda-derivacoes";
import { Route } from "@/routes/admin.manutencao.nova";

export function NovaManutencaoPage() {
  const navigate = useNavigate();
  const { solicitacao: solicitacaoId } = Route.useSearch();
  const registros = registrosCampoRetaguardaStore.useTodos();

  // Chamado do campo que originou esta abertura, quando veio de lá. Resolve
  // pelo id da URL para que recarregar a página não perca o vínculo.
  const solicitacao = solicitacaoId
    ? (registros.find((r) => r.id === solicitacaoId && ehSolicitacaoManutencao(r)) ?? null)
    : null;

  const voltar = () => navigate({ to: "/admin/manutencao" });

  return (
    <PaginaCadastroDedicada
      backLabel="Manutenção"
      backTo="/admin/manutencao"
      title="Nova manutenção"
      tag={solicitacao ? "MNT · chamado do campo" : "MNT · rascunho"}
    >
      <NovaManutencaoForm
        solicitacao={solicitacao && ehSolicitacaoManutencao(solicitacao) ? solicitacao : null}
        onCancel={voltar}
        onSuccess={() => {}}
      />
    </PaginaCadastroDedicada>
  );
}
