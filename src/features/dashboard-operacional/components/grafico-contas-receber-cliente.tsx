import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { EmptyState } from "@/shared/components/empty-state";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import {
  contasReceberPorClienteFaixas,
  dataReferenciaOperacional,
  type FaixasContaCliente,
} from "@/features/dashboard-operacional/derivacoes";
import { formatBRL } from "@/features/retaguarda/format";

// Faixas na ordem em que aparecem na barra: da mais urgente à mais folgada.
const FAIXAS: { chave: keyof FaixasContaCliente; rotulo: string; cor: string }[] = [
  { chave: "vencida", rotulo: "Vencida", cor: "bg-destructive" },
  { chave: "ate15", rotulo: "A vencer · 0–15 dias", cor: "bg-primary" },
  { chave: "ate30", rotulo: "A vencer · 16–30 dias", cor: "bg-secondary" },
  { chave: "acima30", rotulo: "A vencer · +30 dias", cor: "bg-steel" },
];

export function GraficoContasReceberCliente() {
  const contasReceber = contasReceberStore.useTodas();
  const clientes = clientesStore.useAll();
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const faturamentos = faturamentosStore.useTodos();
  const { isLoading, error, retry } = useMockResource(contasReceber);

  const dados = useMemo(() => {
    const referencia = dataReferenciaOperacional(ordens, apontamentos, faturamentos, contasReceber);
    return contasReceberPorClienteFaixas(
      contasReceber,
      clientes,
      referencia.toISOString().slice(0, 10),
      6,
    );
  }, [contasReceber, clientes, ordens, apontamentos, faturamentos]);

  const maximo = Math.max(...dados.map((d) => d.total), 0);
  const emAberto = dados.reduce((soma, d) => soma + d.total, 0);
  // Só entra na legenda a faixa que existe nos dados — evita legenda morta.
  const faixasPresentes = FAIXAS.filter((f) => dados.some((d) => (d[f.chave] as number) > 0));

  return (
    <CardSecao
      titulo="Contas a receber por cliente"
      icone="lucide:hand-coins"
      acessorio={dados.length > 0 ? <CardPill>{formatBRL(emAberto)} em aberto</CardPill> : null}
      bodyClassName="p-4"
    >
      {isLoading ? (
        <Skeleton className="h-[200px] w-full" />
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <button
            type="button"
            onClick={retry}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : dados.length === 0 ? (
        <EmptyState
          icon="lucide:receipt"
          titulo="Nenhuma conta em aberto"
          descricao="Não há contas a receber pendentes no momento."
          className="border-0"
        />
      ) : (
        <>
          <div className="space-y-1.5">
            {dados.map((linha) => (
              <div
                key={linha.cliente_id}
                className="grid grid-cols-[minmax(0,1fr)_2fr_auto] items-center gap-3 py-1"
              >
                <span className="truncate text-xs font-semibold text-foreground">
                  {linha.cliente_nome}
                </span>
                <span className="flex h-4 overflow-hidden rounded bg-surface">
                  {FAIXAS.map((faixa) => {
                    const valor = linha[faixa.chave] as number;
                    if (valor <= 0) return null;
                    return (
                      <span
                        key={faixa.chave}
                        className={faixa.cor}
                        style={{ width: `${maximo > 0 ? (valor / maximo) * 100 : 0}%` }}
                        title={`${faixa.rotulo}: ${formatBRL(valor)}`}
                      />
                    );
                  })}
                </span>
                <span className="text-right font-mono text-xs font-semibold text-foreground">
                  {formatBRL(linha.total)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t pt-3 text-[11px] text-foreground-faint">
            {faixasPresentes.map((faixa) => (
              <span key={faixa.chave} className="inline-flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-sm ${faixa.cor}`} />
                {faixa.rotulo}
              </span>
            ))}
          </div>
        </>
      )}
    </CardSecao>
  );
}
