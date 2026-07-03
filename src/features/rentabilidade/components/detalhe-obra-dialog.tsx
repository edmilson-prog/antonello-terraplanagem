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
import { formatPercentual } from "@/features/rentabilidade/format";
import type { RentabilidadeObra } from "@/features/rentabilidade/derivacoes";

interface Props {
  osNumero: string | null;
  obraNome: string | null;
  resultado: RentabilidadeObra | null;
  nomeDoEquipamento: (equipamentoId: string) => string;
  onOpenChange: (open: boolean) => void;
}

export function DetalheObraDialog({
  osNumero,
  obraNome,
  resultado,
  nomeDoEquipamento,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={!!resultado} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            {osNumero ?? "Obra"} {obraNome ? `— ${obraNome}` : ""}
          </DialogTitle>
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
              <ul className="divide-y divide-border rounded-lg border">
                {resultado.composicao_receita.map((item) => (
                  <li
                    key={item.faturamento_id}
                    className="flex items-center justify-between gap-2 px-3 py-2.5"
                  >
                    <span className="text-sm text-foreground">{item.faturamento_numero}</span>
                    <span className="font-mono text-sm text-foreground">
                      {formatBRL(item.valor)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-mono uppercase tracking-wide text-foreground-faint">
                Custo por equipamento ({formatBRL(resultado.custo)})
              </h3>
              <ul className="divide-y divide-border rounded-lg border">
                {resultado.composicao_custo.map((item) => (
                  <li
                    key={item.equipamento_id}
                    className="flex items-center justify-between gap-2 px-3 py-2.5"
                  >
                    <span className="text-sm text-foreground">
                      {nomeDoEquipamento(item.equipamento_id)} — {formatHorimetro(item.horas)}
                    </span>
                    <span className="font-mono text-sm text-foreground">
                      {formatBRL(item.custo)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="grid grid-cols-1 gap-3 rounded-lg border bg-surface/40 p-3 text-sm">
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
              {resultado.margem < 0 ? " — obra com prejuízo" : null}
            </div>

            {resultado.custo_incompleto ? (
              <p className="text-xs text-foreground-faint">
                Um ou mais equipamentos usados nesta obra têm configuração de custo incompleta: a
                margem acima pode não ser confiável.
              </p>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
