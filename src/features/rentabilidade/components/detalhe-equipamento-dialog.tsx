import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBRL } from "@/features/retaguarda/format";
import { formatHorimetro } from "@/shared/lib/format";
import { rotuloMes } from "@/shared/lib/periodo-mensal";
import { TipoComponenteCustoBadge } from "@/features/custo-hora/labels";
import { formatPercentual } from "@/features/rentabilidade/format";
import type { RentabilidadeEquipamento } from "@/features/rentabilidade/derivacoes";

interface Props {
  equipamentoNome: string | null;
  resultado: RentabilidadeEquipamento | null;
  numeroDaOS: (osId: string) => string;
  onOpenChange: (open: boolean) => void;
}

export function DetalheEquipamentoDialog({
  equipamentoNome,
  resultado,
  numeroDaOS,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={!!resultado} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{equipamentoNome ?? "Equipamento"}</DialogTitle>
          <DialogDescription>
            {resultado ? `Rentabilidade — ${rotuloMes(resultado.periodo)}` : ""}
          </DialogDescription>
        </DialogHeader>

        {resultado ? (
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-xs font-mono uppercase tracking-wide text-foreground-faint">
                Receita ({formatBRL(resultado.receita)})
              </h3>
              {resultado.composicao_receita.length > 0 ? (
                <ul className="divide-y divide-border rounded-lg border">
                  {resultado.composicao_receita.map((item) => (
                    <li
                      key={item.faturamento_id}
                      className="flex items-center justify-between gap-2 px-3 py-2.5"
                    >
                      <span className="text-sm text-foreground">
                        {item.faturamento_numero} — {numeroDaOS(item.os_id)}
                      </span>
                      <span className="font-mono text-sm text-foreground">
                        {formatBRL(item.valor)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma receita faturada neste período.
                </p>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-mono uppercase tracking-wide text-foreground-faint">
                Custo ({formatBRL(resultado.custo)})
              </h3>
              <ul className="divide-y divide-border rounded-lg border">
                {resultado.detalhamento_custo.map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <TipoComponenteCustoBadge tipo={item.tipo} />
                      <span className="text-sm text-foreground">{item.descricao}</span>
                    </div>
                    <span className="font-mono text-sm text-foreground">
                      {formatBRL(item.valor)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-surface/40 p-3 text-sm">
              <div>
                <dt className="text-xs text-foreground-faint">Horas no período</dt>
                <dd className="font-mono font-semibold text-foreground">
                  {formatHorimetro(resultado.horas_trabalhadas)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-foreground-faint">Margem %</dt>
                <dd className="font-mono font-semibold text-foreground">
                  {formatPercentual(resultado.margem_percentual)}
                </dd>
              </div>
            </dl>

            <div
              className={
                resultado.margem < 0
                  ? "rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                  : "rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm text-foreground"
              }
            >
              Margem: <span className="font-mono font-bold">{formatBRL(resultado.margem)}</span>
              {resultado.margem < 0 ? " — prejuízo no período" : null}
            </div>

            {resultado.custo_incompleto ? (
              <p className="text-xs text-foreground-faint">
                Configuração de custo incompleta: a margem acima pode não ser confiável.
              </p>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
