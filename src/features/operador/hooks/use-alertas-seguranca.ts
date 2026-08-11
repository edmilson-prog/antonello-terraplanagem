import { useMemo } from "react";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { registrosCampoStore } from "@/features/registros-campo/registros-campo-store";
import { cienciasConfirmadas } from "@/features/registros-campo/derivacoes";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import { derivarAlertasSeguranca } from "@/features/operador/alertas-seguranca";
import type { AlertaSeguranca } from "@/features/operador/alertas-seguranca";

export interface AlertasSegurancaCampo {
  alertas: AlertaSeguranca[];
  pendentes: number;
}

export function useAlertasSeguranca(): AlertasSegurancaCampo {
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const equipamentos = equipamentosStore.useAll();
  const planos = planosManutencaoStore.useAll();
  const registrosManutencao = registrosManutencaoStore.useTodos();
  const registrosCampo = registrosCampoStore.useTodos();

  const operadorId = getOperadorLogadoId();

  return useMemo(() => {
    const alertas = derivarAlertasSeguranca({
      operadorId,
      ordens,
      apontamentos,
      equipamentos,
      planos,
      registrosManutencao,
      registrosCampo,
    });
    const confirmados = cienciasConfirmadas(registrosCampo);
    return { alertas, pendentes: alertas.filter((a) => !confirmados.has(a.id)).length };
  }, [operadorId, ordens, apontamentos, equipamentos, planos, registrosManutencao, registrosCampo]);
}
