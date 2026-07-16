import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/shared/components/page-header";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { ContasReceberTab } from "@/features/financeiro/components/contas-receber-tab";
import { ContasPagarTab } from "@/features/financeiro/components/contas-pagar-tab";
import { CaixaTab } from "@/features/financeiro/components/caixa-tab";
import { FinanceiroKpis } from "@/features/financeiro/components/financeiro-kpis";
import { RecebimentosPorFormaCard } from "@/features/financeiro/components/recebimentos-por-forma-card";
import { ComprovantesRecentesCard } from "@/features/financeiro/components/comprovantes-recentes-card";
import { DarBaixaReceberDialog } from "@/features/financeiro/components/dar-baixa-receber-dialog";
import { DarBaixaPagarDialog } from "@/features/financeiro/components/dar-baixa-pagar-dialog";
import { EmitirCobrancaDialog } from "@/features/cobranca-gateway/components/emitir-cobranca-dialog";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";
import { cobrancasStore } from "@/features/cobranca-gateway/cobrancas-store";
import {
  contaVencida,
  agregadoMensalPorData,
  recebimentosPorForma,
  comprovantesRecentes,
} from "@/features/financeiro/derivacoes";
import { PrevisaoCaixaCard } from "@/features/ia/components/previsao-caixa-card";
import { clientesStore } from "@/features/clientes/clientes-store";
import { formatBRL } from "@/features/retaguarda/format";
import type { ContaReceber, ContaPagar, CobrancaGateway } from "@/shared/types";

export function FinanceiroPage() {
  const contasReceber = contasReceberStore.useTodas();
  const contasPagar = contasPagarStore.useTodas();
  const clientes = clientesStore.useAll();

  const [contaReceberSelecionada, setContaReceberSelecionada] = useState<ContaReceber | null>(null);
  const [contaPagarSelecionada, setContaPagarSelecionada] = useState<ContaPagar | null>(null);
  const [contaParaEmitirCobranca, setContaParaEmitirCobranca] = useState<ContaReceber | null>(null);

  const agoraISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const aReceberAbertas = useMemo(
    () => contasReceber.filter((c) => c.status === "aberta"),
    [contasReceber],
  );
  const aPagarAbertas = useMemo(
    () => contasPagar.filter((c) => c.status === "aberta"),
    [contasPagar],
  );
  const vencidasReceber = useMemo(
    () => aReceberAbertas.filter((c) => contaVencida(c, agoraISO)).length,
    [aReceberAbertas, agoraISO],
  );

  const seriesRecebido = useMemo(
    () =>
      agregadoMensalPorData(
        contasReceber,
        (c: ContaReceber) => c.recebido_em,
        (c: ContaReceber) => c.valor,
        agoraISO,
        6,
      ),
    [contasReceber, agoraISO],
  );
  const seriesPago = useMemo(
    () =>
      agregadoMensalPorData(
        contasPagar,
        (c: ContaPagar) => c.pago_em,
        (c: ContaPagar) => c.valor,
        agoraISO,
        6,
      ),
    [contasPagar, agoraISO],
  );
  const recebidoNoMes = seriesRecebido[seriesRecebido.length - 1]?.valor ?? 0;
  const pagoNoMes = seriesPago[seriesPago.length - 1]?.valor ?? 0;
  const recebidoMesAnterior = seriesRecebido[seriesRecebido.length - 2]?.valor ?? 0;
  const recebidoRodape =
    recebidoMesAnterior > 0
      ? `${recebidoNoMes >= recebidoMesAnterior ? "↑" : "↓"} vs. mês anterior`
      : "no mês";

  const porForma = useMemo(() => recebimentosPorForma(contasReceber), [contasReceber]);
  const recentes = useMemo(() => comprovantesRecentes(contasReceber, 5), [contasReceber]);

  function handleSimularPagamento(cobranca: CobrancaGateway) {
    const r = cobrancasStore.simularWebhookPago(cobranca.id);
    if (r.ok) {
      toast.success("Pagamento confirmado (simulado) — conta liquidada automaticamente.");
    } else {
      toast.error(r.motivo);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader titulo="Financeiro" descricao="Contas a receber, a pagar e visão de caixa" />

      <FinanceiroKpis
        aReceberValor={aReceberAbertas.reduce((s, c) => s + c.valor, 0)}
        aReceberRodape={
          vencidasReceber > 0
            ? `${aReceberAbertas.length} títulos · ${vencidasReceber} vencidos`
            : `${aReceberAbertas.length} títulos`
        }
        aReceberAlerta={vencidasReceber > 0}
        aPagarValor={aPagarAbertas.reduce((s, c) => s + c.valor, 0)}
        aPagarRodape={`${aPagarAbertas.length} títulos em aberto`}
        recebidoNoMes={recebidoNoMes}
        recebidoRodape={recebidoRodape}
        seriesRecebido={seriesRecebido.map((m) => m.valor)}
        saldoDoMes={recebidoNoMes - pagoNoMes}
        seriesSaldo={seriesRecebido.map((m, i) => m.valor - (seriesPago[i]?.valor ?? 0))}
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <CardSecao
            titulo="Contas a receber"
            icone="lucide:hand-coins"
            acessorio={<CardPill>{formatBRL(aReceberAbertas.reduce((s, c) => s + c.valor, 0))} em aberto</CardPill>}
            bodyClassName="p-4"
          >
            <ContasReceberTab
              contasReceber={contasReceber}
              onDarBaixa={setContaReceberSelecionada}
              onEmitirCobranca={setContaParaEmitirCobranca}
              onSimularPagamento={handleSimularPagamento}
            />
          </CardSecao>
          <CardSecao
            titulo="Contas a pagar"
            icone="lucide:wallet"
            acessorio={<CardPill>{formatBRL(aPagarAbertas.reduce((s, c) => s + c.valor, 0))} em aberto</CardPill>}
            bodyClassName="p-4"
          >
            <ContasPagarTab contasPagar={contasPagar} onDarBaixa={setContaPagarSelecionada} />
          </CardSecao>
        </div>
        <div className="space-y-4">
          <RecebimentosPorFormaCard itens={porForma} />
          <ComprovantesRecentesCard itens={recentes} />
        </div>
      </div>

      <PrevisaoCaixaCard contasReceber={contasReceber} clientes={clientes} />

      <CardSecao titulo="Caixa" icone="lucide:scale" bodyClassName="p-4">
        <CaixaTab contasReceber={contasReceber} contasPagar={contasPagar} />
      </CardSecao>

      <DarBaixaReceberDialog
        conta={contaReceberSelecionada}
        onOpenChange={(open) => {
          if (!open) setContaReceberSelecionada(null);
        }}
      />
      <DarBaixaPagarDialog
        conta={contaPagarSelecionada}
        onOpenChange={(open) => {
          if (!open) setContaPagarSelecionada(null);
        }}
      />
      <EmitirCobrancaDialog
        conta={contaParaEmitirCobranca}
        onOpenChange={(open) => {
          if (!open) setContaParaEmitirCobranca(null);
        }}
      />
    </div>
  );
}
