import { useWatch, type Control } from "react-hook-form";
import { Icon } from "@iconify/react";
import { Linha } from "@/shared/components/linha-resumo";
import { formatBRL } from "@/features/retaguarda/format";
import {
  CATEGORIA_COMPONENTE_LABEL,
  CATEGORIA_COMPONENTE_ICONE,
  unidadeComponente,
} from "@/features/custo-hora/labels";
import type { ComponenteCustoFormValues } from "@/features/custo-hora/custo-hora-schema";

interface Props {
  control: Control<ComponenteCustoFormValues>;
  equipamentoNome: string;
  impactoPorHora: number;
}

export function ResumoNovoCusto({ control, equipamentoNome, impactoPorHora }: Props) {
  const valores = useWatch({ control });
  const categoria = valores.categoria ?? "outros";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon icon={CATEGORIA_COMPONENTE_ICONE[categoria]} className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {CATEGORIA_COMPONENTE_LABEL[categoria]}
            </div>
            <div className="text-xs text-muted-foreground">{equipamentoNome}</div>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Linha
            rotulo="Valor"
            valor={valores.valor ? `${formatBRL(valores.valor)}${unidadeComponente(valores.tipo ?? "fixo_mensal")}` : "a definir"}
            vazio={!valores.valor}
          />
          <Linha
            rotulo="Competência"
            valor={valores.competencia?.trim() || "atual"}
            vazio={!valores.competencia?.trim()}
          />
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Impacto no custo/h</span>
          <span className="font-mono text-lg font-bold text-primary">
            {formatBRL(Math.round(impactoPorHora * 100) / 100)}
            <span className="text-xs font-normal text-muted-foreground">/h</span>
          </span>
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Entra na composição do <strong className="text-foreground">Custo da Hora</strong> do
          equipamento (ao lado de diesel e manutenção).
        </p>
      </div>
    </div>
  );
}
