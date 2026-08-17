import { Icon } from "@iconify/react";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { formatBRL } from "@/features/retaguarda/format";
import { formatPercentual } from "@/features/rentabilidade/format";
import type { MargemCliente } from "@/features/rentabilidade/derivacoes";

// Card "Margem por cliente" do UI kit: barra de proporção por cliente,
// ordenada da maior margem para a menor.
//
// O recorte é o ANO até o mês selecionado, não o mês — é o que o mock indica
// ("período: 2025") e é o que faz a leitura ter sentido: um cliente costuma ter
// uma ou duas obras faturadas por mês, e a margem de um mês isolado diz pouco.

interface Props {
  linhas: MargemCliente[];
  nomeDoCliente: (clienteId: string) => string;
  rotuloPeriodo: string;
}

export function MargemClienteCard({ linhas, nomeDoCliente, rotuloPeriodo }: Props) {
  // A barra é proporcional à maior margem da lista, não a 100% — com margens
  // entre 30% e 40%, barras absolutas ficariam todas iguais.
  const maior = Math.max(...linhas.map((l) => l.margemPercentual ?? 0), 0);

  return (
    <CardSecao
      titulo="Margem por cliente"
      icone="lucide:users"
      acessorio={<CardPill>{rotuloPeriodo}</CardPill>}
      bodyClassName="p-4"
    >
      {linhas.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhum cliente com obra faturada no período.
        </p>
      ) : (
        <ul className="space-y-3.5">
          {linhas.map((linha) => {
            const pct = linha.margemPercentual;
            const largura = maior > 0 && pct != null ? Math.max(0, (pct / maior) * 100) : 0;
            const negativa = pct != null && pct < 0;

            return (
              <li key={linha.cliente_id}>
                <div className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface text-primary">
                    <Icon icon="lucide:building-2" className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-foreground">
                    {nomeDoCliente(linha.cliente_id)}
                  </span>
                  <span
                    className={
                      negativa
                        ? "shrink-0 font-mono text-xs font-semibold text-destructive"
                        : "shrink-0 font-mono text-xs text-foreground"
                    }
                  >
                    {formatPercentual(pct)}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                  <div
                    className={
                      negativa
                        ? "h-full rounded-full bg-destructive"
                        : "h-full rounded-full bg-gradient-to-r from-primary to-primary-deep"
                    }
                    style={{ width: `${negativa ? 100 : largura}%` }}
                  />
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {formatBRL(linha.margem)} em {linha.obras} {linha.obras === 1 ? "obra" : "obras"}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </CardSecao>
  );
}
