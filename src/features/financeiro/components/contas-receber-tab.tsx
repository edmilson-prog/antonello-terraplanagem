import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { contaVencida } from "@/features/financeiro/derivacoes";
import { StatusContaBadge } from "@/features/financeiro/labels";
import { clientesStore } from "@/features/clientes/clientes-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { formatBRL } from "@/features/retaguarda/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ContaReceber } from "@/shared/types";

interface ContasReceberTabProps {
  contasReceber: ContaReceber[];
  onDarBaixa?: (conta: ContaReceber) => void;
}

export function ContasReceberTab({ contasReceber, onDarBaixa }: ContasReceberTabProps) {
  const agoraISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  if (contasReceber.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Icon icon="lucide:inbox" className="mb-3 h-10 w-10 text-foreground-faint" />
        <p className="text-sm font-medium text-foreground">Nenhuma conta a receber</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Contas a receber são geradas automaticamente a partir dos faturamentos confirmados
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Cliente
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Faturamento
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Valor
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Vencimento
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {contasReceber.map((conta) => {
            const cliente = clientesStore.getById(conta.cliente_id);
            const fat = faturamentosStore.obter(conta.faturamento_id);
            const vencida = contaVencida(conta, agoraISO);
            const [ano, mes, dia] = conta.vencimento.split("-");
            return (
              <tr key={conta.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{cliente?.nome ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {fat?.numero ?? conta.faturamento_id}
                </td>
                <td className="px-4 py-3 text-right font-mono">{formatBRL(conta.valor)}</td>
                <td className="px-4 py-3">
                  <span className={cn(vencida && "font-medium text-destructive")}>
                    {`${dia}/${mes}/${ano}`}
                  </span>
                  {vencida && (
                    <span className="ml-2 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                      Vencida
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusContaBadge status={conta.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {conta.status === "aberta" && (
                    <Button size="sm" variant="outline" onClick={() => onDarBaixa?.(conta)}>
                      Dar Baixa
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
