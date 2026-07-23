import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { RegistrarManutencaoForm } from "@/features/manutencao/components/registrar-manutencao-form";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { calcularStatusManutencao } from "@/features/manutencao/derivacoes";
import type { AlertaManutencao } from "@/features/manutencao/derivacoes";

export function RegistrarManutencaoPage({ registroId }: { registroId: string }) {
  const navigate = useNavigate();
  const registro = registrosManutencaoStore.useTodos().find((r) => r.id === registroId);
  const equipamento = equipamentosStore.useAll().find((e) => e.id === registro?.equipamento_id);
  const plano = planosManutencaoStore.useAll().find((p) => p.id === registro?.plano_id);

  if (!registro || !equipamento || !plano || registro.status === "realizada") {
    return <AlertaNaoEncontrado />;
  }

  const status = calcularStatusManutencao(equipamento.horimetro_atual, registro.horimetro_previsto);
  if (status === "em_dia") {
    return <AlertaNaoEncontrado />;
  }

  const alerta: AlertaManutencao = {
    equipamento,
    plano,
    registro,
    status,
  };

  return (
    <PaginaCadastroDedicada
      backLabel="Manutenção"
      backTo="/admin/manutencao"
      title="Registrar manutenção"
      tag="manutenção"
    >
      <RegistrarManutencaoForm
        alerta={alerta}
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
        Este alerta já foi resolvido ou não existe mais.
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
