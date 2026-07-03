import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBRL } from "@/features/retaguarda/format";
import { formatHorimetro } from "@/shared/lib/format";
import { TipoComponenteCustoBadge } from "@/features/custo-hora/labels";
import { rotuloMes } from "@/shared/lib/periodo-mensal";
import type { CustoHoraEquipamento } from "@/features/custo-hora/derivacoes";

interface Props {
  equipamentoNome: string | null;
  resultado: CustoHoraEquipamento | null;
  onOpenChange: (open: boolean) => void;
}

export function DetalhamentoCustoDialog({ equipamentoNome, resultado, onOpenChange }: Props) {
  return (
    <Dialog open={!!resultado} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{equipamentoNome ?? "Equipamento"}</DialogTitle>
          <DialogDescription>
            {resultado ? `Detalhamento do custo — ${rotuloMes(resultado.periodo)}` : ""}
          </DialogDescription>
        </DialogHeader>

        {resultado ? (
          <div className="space-y-4">
            <ul className="divide-y divide-border rounded-lg border">
              {resultado.detalhamento.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <TipoComponenteCustoBadge tipo={item.tipo} />
                    <span className="text-sm text-foreground">{item.descricao}</span>
                  </div>
                  <span className="font-mono text-sm text-foreground">{formatBRL(item.valor)}</span>
                </li>
              ))}
            </ul>

            <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-surface/40 p-3 text-sm">
              <div>
                <dt className="text-xs text-foreground-faint">Horas no período</dt>
                <dd className="font-mono font-semibold text-foreground">
                  {formatHorimetro(resultado.horas_trabalhadas)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-foreground-faint">Custo total</dt>
                <dd className="font-mono font-semibold text-foreground">
                  {formatBRL(resultado.custo_total)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-foreground-faint">Custo por hora</dt>
                <dd className="font-mono font-semibold text-foreground">
                  {resultado.custo_por_hora != null
                    ? formatBRL(resultado.custo_por_hora)
                    : "Sem horas no período"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-foreground-faint">Preço praticado (operada)</dt>
                <dd className="font-mono font-semibold text-foreground">
                  {resultado.preco_hora != null ? formatBRL(resultado.preco_hora) : "Sem preço ativo"}
                </dd>
              </div>
            </dl>

            {resultado.margem_hora != null ? (
              <div
                className={
                  resultado.margem_hora < 0
                    ? "rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    : "rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm text-foreground"
                }
              >
                Margem: <span className="font-mono font-bold">{formatBRL(resultado.margem_hora)}</span>{" "}
                por hora
                {resultado.margem_hora < 0 ? " — operando abaixo do custo" : null}
              </div>
            ) : null}

            {resultado.configuracao_incompleta ? (
              <p className="text-xs text-foreground-faint">
                Configuração incompleta: nenhum componente de custo ativo cadastrado para este
                equipamento.
              </p>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
