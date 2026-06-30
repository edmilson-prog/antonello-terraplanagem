import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { resumoCaixa } from "@/features/financeiro/derivacoes";
import { formatBRL } from "@/features/retaguarda/format";
import { cn } from "@/lib/utils";
import type { ContaReceber, ContaPagar } from "@/shared/types";

interface CaixaTabProps {
  contasReceber: ContaReceber[];
  contasPagar: ContaPagar[];
}

export function CaixaTab({ contasReceber, contasPagar }: CaixaTabProps) {
  const caixa = useMemo(
    () => resumoCaixa(contasReceber, contasPagar),
    [contasReceber, contasPagar],
  );

  const temMovimentacao = contasReceber.length > 0 || contasPagar.length > 0;

  if (!temMovimentacao) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Icon icon="lucide:wallet" className="mb-3 h-10 w-10 text-foreground-faint" />
        <p className="text-sm font-medium text-foreground">Sem movimentações</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Contas a receber e a pagar aparecerão aqui
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <CaixaCard
        icone="lucide:trending-up"
        rotulo="Total a Receber"
        valor={formatBRL(caixa.totalReceber)}
        descricao="em aberto"
        variante="receber"
      />
      <CaixaCard
        icone="lucide:trending-down"
        rotulo="Total a Pagar"
        valor={formatBRL(caixa.totalPagar)}
        descricao="em aberto"
        variante="pagar"
      />
      <CaixaCard
        icone="lucide:scale"
        rotulo="Saldo Previsto"
        valor={formatBRL(caixa.saldoPrevisto)}
        descricao="a receber − a pagar"
        variante={caixa.saldoPrevisto >= 0 ? "positivo" : "negativo"}
      />
    </div>
  );
}

function CaixaCard({
  icone,
  rotulo,
  valor,
  descricao,
  variante,
}: {
  icone: string;
  rotulo: string;
  valor: string;
  descricao: string;
  variante: "receber" | "pagar" | "positivo" | "negativo";
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
          {rotulo}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icon icon={icone} className="h-4 w-4" />
        </span>
      </div>
      <div
        className={cn(
          "mt-2 font-mono text-2xl font-bold",
          variante === "negativo" ? "text-destructive" : "text-card-foreground",
        )}
      >
        {valor}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{descricao}</div>
    </div>
  );
}
