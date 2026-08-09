import { useMemo } from "react";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import { contarNaoLidas, derivarNotificacoes } from "@/features/operador/notificacoes";
import { useMarcaLeitura } from "@/features/operador/notificacoes-lidas";
import type { NotificacaoCampo } from "@/features/operador/notificacoes";

export interface NotificacoesCampo {
  itens: NotificacaoCampo[];
  naoLidas: number;
  lidasAte: string | null;
}

export function useNotificacoesCampo(): NotificacoesCampo {
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const equipamentos = equipamentosStore.useAll();
  const planos = planosManutencaoStore.useAll();
  const registros = registrosManutencaoStore.useTodos();
  const abastecimentos = abastecimentosStore.useTodos();
  const lidasAte = useMarcaLeitura();

  const itens = useMemo(
    () =>
      derivarNotificacoes({
        operadorId: getOperadorLogadoId(),
        ordens,
        apontamentos,
        equipamentos,
        planos,
        registros,
        abastecimentos,
        agora: new Date(),
      }),
    [ordens, apontamentos, equipamentos, planos, registros, abastecimentos],
  );

  return { itens, naoLidas: contarNaoLidas(itens, lidasAte), lidasAte };
}
