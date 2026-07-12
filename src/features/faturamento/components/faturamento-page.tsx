import { PageHeader } from "@/shared/components/page-header";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { osFechadasSemFaturamento, agregadoMensal } from "@/features/faturamento/derivacoes";
import { FaturamentoKpis } from "@/features/faturamento/components/faturamento-kpis";
import { NotasFiscaisCard } from "@/features/faturamento/components/notas-fiscais-card";
import { AFaturarCard } from "@/features/faturamento/components/a-faturar-card";
import { FaturamentoMensalCard } from "@/features/faturamento/components/faturamento-mensal-card";
import { AguardandoFaturamento } from "@/features/faturamento/components/aguardando-faturamento";

const MESES_EXTENSO = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function FaturamentoPage() {
  const faturamentos = faturamentosStore.useTodos();
  const contas = contasReceberStore.useTodas();
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();

  const agora = new Date();
  const agoraISO = agora.toISOString();
  const meses = agregadoMensal(faturamentos, agoraISO, 6);
  const mesAtual = meses[meses.length - 1];

  const rascunhos = faturamentos.filter((f) => f.status === "rascunho");
  const faturadosNoMes = faturamentos.filter(
    (f) => f.status === "faturado" && f.faturado_em?.slice(0, 7) === mesAtual.mes,
  );
  const aguardando = osFechadasSemFaturamento(ordens, faturamentos);

  const ticketMedio = mesAtual.qtd > 0 ? mesAtual.valor / mesAtual.qtd : 0;
  const rotuloMes = `${MESES_EXTENSO[agora.getMonth()]}/${agora.getFullYear()}`;

  return (
    <div className="space-y-5">
      <PageHeader titulo="Faturamento" descricao={rotuloMes} />

      <FaturamentoKpis
        faturadoNoMes={mesAtual.valor}
        nfsNoMes={mesAtual.qtd}
        aFaturarValor={rascunhos.reduce((s, f) => s + f.valor_total, 0)}
        aFaturarRodape={
          rascunhos.length === 0
            ? "nenhum rascunho"
            : `${rascunhos.length} rascunho${rascunhos.length > 1 ? "s" : ""} sem confirmar`
        }
        ticketMedio={ticketMedio}
        series={meses.map((m) => m.valor)}
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <NotasFiscaisCard faturados={faturadosNoMes} contas={contas} />
        </div>
        <div className="space-y-4">
          <AFaturarCard rascunhos={rascunhos} />
          <FaturamentoMensalCard meses={meses} />
        </div>
      </div>

      <AguardandoFaturamento ordens={aguardando} apontamentos={apontamentos} />
    </div>
  );
}
