import { useWatch, type Control } from "react-hook-form";
import { Icon } from "@iconify/react";
import { Linha } from "@/shared/components/linha-resumo";
import { formatBRL } from "@/features/retaguarda/format";
import { CATEGORIA_LABEL, FORMA_PAGAMENTO_LABEL } from "@/features/financeiro/labels";
import type { ContaPagarFormValues } from "@/features/financeiro/conta-pagar-schema";

export function ResumoNovoPagamento({ control }: { control: Control<ContaPagarFormValues> }) {
  const valores = useWatch({ control });
  const categoria = valores.categoria ?? "diesel";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon icon="lucide:wallet" className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {valores.fornecedor?.trim() || "Novo pagamento"}
            </div>
            <div className="text-xs text-muted-foreground">{CATEGORIA_LABEL[categoria]}</div>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Linha
            rotulo="Documento"
            valor={valores.documento?.trim() || "sem documento"}
            vazio={!valores.documento?.trim()}
          />
          <Linha
            rotulo="Vencimento"
            valor={valores.vencimento || "a definir"}
            vazio={!valores.vencimento}
          />
          <Linha
            rotulo="Forma"
            valor={
              valores.forma_pagamento ? FORMA_PAGAMENTO_LABEL[valores.forma_pagamento] : "a definir"
            }
            vazio={!valores.forma_pagamento}
          />
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Valor a pagar</span>
          <span className="font-mono text-lg font-bold text-primary">
            {formatBRL(valores.valor ?? 0)}
          </span>
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Entra em <strong className="text-foreground">Financeiro › Contas a pagar</strong>. Pagamentos
          de <strong className="text-foreground">diesel</strong> e{" "}
          <strong className="text-foreground">manutenção</strong> são rateados no{" "}
          <strong className="text-foreground">Custo da Hora</strong> do equipamento.
        </p>
      </div>
    </div>
  );
}
