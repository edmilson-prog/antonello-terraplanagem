import { Icon } from "@iconify/react";
import { preverCaixa, avaliarRiscoClientes } from "@/features/ia/mock/analitico";
import { formatBRL } from "@/features/retaguarda/format";
import { cn } from "@/lib/utils";
import type { Cliente, ContaReceber } from "@/shared/types";

interface PrevisaoCaixaCardProps {
  contasReceber: ContaReceber[];
  clientes: Cliente[];
}

export function PrevisaoCaixaCard({ contasReceber, clientes }: PrevisaoCaixaCardProps) {
  if (contasReceber.length === 0) return null;
  const previsoes = preverCaixa(contasReceber);
  const riscos = avaliarRiscoClientes(contasReceber, clientes);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
        <Icon icon="lucide:sparkles" className="h-3.5 w-3.5 text-primary" />
        Previsão de caixa (IA)
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {previsoes.map((p) => (
          <div key={p.dias} className="rounded-md bg-surface/50 p-3 text-center">
            <div className="font-mono text-[10px] uppercase text-foreground-faint">{p.dias} dias</div>
            <div className="mt-1 font-mono text-sm font-semibold text-foreground">{formatBRL(p.valor_previsto)}</div>
          </div>
        ))}
      </div>
      {riscos.length > 0 ? (
        <div className="mt-4 space-y-1.5">
          <p className="text-xs font-semibold text-foreground">Risco de inadimplência</p>
          {riscos.map((r) => (
            <div key={r.cliente_id} className="flex items-center justify-between gap-2 text-xs">
              <span className="min-w-0 truncate text-muted-foreground">{r.motivo}</span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 font-semibold",
                  r.nivel === "alto" ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary",
                )}
              >
                {r.nivel === "alto" ? "Alto risco" : "Risco médio"}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <p className="mt-3 text-[10px] text-foreground-faint">
        Estimativa — base histórica limitada. Não substitui análise de crédito.
      </p>
    </div>
  );
}
