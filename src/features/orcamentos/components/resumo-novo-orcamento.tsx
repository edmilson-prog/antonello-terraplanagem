import { useWatch, type Control } from "react-hook-form";
import { Icon } from "@iconify/react";
import { Linha } from "@/shared/components/linha-resumo";
import { StatusOrcamentoBadge } from "@/features/orcamentos/labels";
import { clientesStore } from "@/features/clientes/clientes-store";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { proximoNumeroORC } from "@/features/orcamentos/numero-orcamento";
import { formatBRL } from "@/features/retaguarda/format";
import { formatData } from "@/shared/lib/format";
import type { OrcamentoFormValues } from "@/features/orcamentos/orcamento-schema";
import type { OrcamentoItem } from "@/shared/types";

interface Props {
  control: Control<OrcamentoFormValues>;
  itens: OrcamentoItem[];
}

export function ResumoNovoOrcamento({ control, itens }: Props) {
  const valores = useWatch({ control });
  const cliente = valores.cliente_id ? clientesStore.getById(valores.cliente_id) : undefined;
  const numero = proximoNumeroORC(orcamentosStore.listar(), new Date().getFullYear());
  const total = itens.reduce((s, i) => s + i.valor_total, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon icon="lucide:file-text" className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-xs font-bold text-primary">{numero}</div>
            <div className="truncate text-sm font-semibold text-foreground">
              {valores.descricao_obra?.trim() || "Nova proposta"}
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Linha rotulo="Cliente" valor={cliente?.nome ?? "a definir"} vazio={!cliente} />
          <Linha
            rotulo="Itens"
            valor={`${itens.length} ${itens.length === 1 ? "item" : "itens"}`}
          />
          <Linha
            rotulo="Validade"
            valor={valores.validade ? formatData(valores.validade) : "a definir"}
            vazio={!valores.validade}
          />
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Situação</span>
          <StatusOrcamentoBadge status="rascunho" />
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Total da proposta</span>
          <span className="font-mono text-lg font-bold text-primary">{formatBRL(total)}</span>
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Preços vêm da <strong className="text-foreground">tabela vigente</strong>; a margem é
          conferida contra o <strong className="text-foreground">Custo da Hora</strong>. Ao aprovar,
          o orçamento vira uma <strong className="text-foreground">OS</strong> com um toque.
        </p>
      </div>
    </div>
  );
}
