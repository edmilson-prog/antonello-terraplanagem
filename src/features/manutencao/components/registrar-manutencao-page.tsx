import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { RegistrarManutencaoForm } from "@/features/manutencao/components/registrar-manutencao-form";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { calcularStatusManutencao } from "@/features/manutencao/derivacoes";

// Fecha uma ordem de manutenção. Dois caminhos entram aqui:
//   • ciclo de plano ("Agendada") — o alerta de horímetro venceu e a preventiva
//     foi feita; fechar reinicia o ciclo;
//   • ordem aberta à mão ("Em andamento") — corretiva ou preventiva avulsa;
//     fechar apenas conclui, sem sucessora.
// O que muda entre os dois é só o plano de origem, então a página resolve o
// contexto e o formulário se adapta.
export function RegistrarManutencaoPage({ registroId }: { registroId: string }) {
  const navigate = useNavigate();
  const registro = registrosManutencaoStore.useCompletos().find((r) => r.id === registroId);
  const equipamento = equipamentosStore.useAll().find((e) => e.id === registro?.equipamento_id);
  const plano = planosManutencaoStore.useAll().find((p) => p.id === registro?.plano_id) ?? null;

  if (!registro || !equipamento || registro.status === "realizada") {
    return <AlertaNaoEncontrado />;
  }

  // Ciclo de plano ainda em dia não tem o que registrar — a tela existe a partir
  // de um alerta. Ordem em andamento não passa por esta checagem: ela não tem
  // marca de horímetro e pode ser concluída a qualquer momento.
  if (plano && registro.horimetro_previsto != null) {
    const status = calcularStatusManutencao(
      equipamento.horimetro_atual,
      registro.horimetro_previsto,
    );
    if (status === "em_dia") return <AlertaNaoEncontrado />;
  }

  return (
    <PaginaCadastroDedicada
      backLabel="Manutenção"
      backTo="/admin/manutencao"
      title={plano ? "Registrar manutenção" : "Concluir manutenção"}
      tag="manutenção"
    >
      <RegistrarManutencaoForm
        registro={registro}
        equipamento={equipamento}
        plano={plano}
        onCancel={() => navigate({ to: "/admin/manutencao" })}
      />
    </PaginaCadastroDedicada>
  );
}

function AlertaNaoEncontrado() {
  return (
    <div className="space-y-4 text-center">
      <Icon icon="lucide:circle-check" className="mx-auto h-8 w-8 text-muted-foreground" />
      <h2 className="font-display text-xl font-bold text-foreground">Nada para registrar aqui</h2>
      <p className="text-sm text-muted-foreground">
        Esta manutenção já foi concluída ou não existe mais.
      </p>
      <Link
        to="/admin/manutencao"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Voltar para Manutenção
      </Link>
    </div>
  );
}
