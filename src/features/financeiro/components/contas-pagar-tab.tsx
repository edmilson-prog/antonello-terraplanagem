import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { contaVencida } from "@/features/financeiro/derivacoes";
import { StatusContaBadge, CATEGORIA_LABEL } from "@/features/financeiro/labels";
import { formatBRL } from "@/features/retaguarda/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ContaPagar } from "@/shared/types";

interface ContasPagarTabProps {
  contasPagar: ContaPagar[];
  onDarBaixa?: (conta: ContaPagar) => void;
}

export function ContasPagarTab({ contasPagar, onDarBaixa }: ContasPagarTabProps) {
  const agoraISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link to="/admin/financeiro/contas-pagar/novo">
            <Icon icon="lucide:plus" className="mr-1.5 h-4 w-4" />
            Nova Conta a Pagar
          </Link>
        </Button>
      </div>

      {contasPagar.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Icon icon="lucide:credit-card" className="mb-3 h-10 w-10 text-foreground-faint" />
          <p className="text-sm font-medium text-foreground">Nenhuma conta a pagar</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Registre despesas como diesel, manutenção, folha, fornecedores
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Fornecedor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Categoria
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
              {contasPagar.map((conta) => {
                const vencida = contaVencida(conta, agoraISO);
                const [ano, mes, dia] = conta.vencimento.split("-");
                return (
                  <tr key={conta.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{conta.descricao}</td>
                    <td className="px-4 py-3 text-muted-foreground">{conta.fornecedor ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {CATEGORIA_LABEL[conta.categoria]}
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
      )}
    </div>
  );
}
