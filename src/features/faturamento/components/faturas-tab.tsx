import { useMemo } from "react";
import { FaturamentoPipeline } from "@/features/faturamento/components/faturamento-pipeline";
import { AguardandoFaturamento } from "@/features/faturamento/components/aguardando-faturamento";
import { FaturasList } from "@/features/faturamento/components/faturas-list";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { osFechadasSemFaturamento, resumoPipeline } from "@/features/faturamento/derivacoes";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";

export function FaturasTab() {
  const faturamentos = faturamentosStore.useTodos();
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const contasReceber = contasReceberStore.useTodas();

  const pipeline = useMemo(
    () => resumoPipeline(ordens, faturamentos, contasReceber),
    [ordens, faturamentos, contasReceber],
  );
  const aguardando = useMemo(
    () => osFechadasSemFaturamento(ordens, faturamentos),
    [ordens, faturamentos],
  );

  return (
    <div className="space-y-6">
      <FaturamentoPipeline
        executado={pipeline.executado}
        faturado={pipeline.faturado}
        recebido={pipeline.recebido}
      />
      <AguardandoFaturamento ordens={aguardando} apontamentos={apontamentos} />
      <FaturasList faturamentos={faturamentos} />
    </div>
  );
}
