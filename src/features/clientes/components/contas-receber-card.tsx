import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { StatusContaBadge } from "@/features/financeiro/labels";
import { contaVencida } from "@/features/financeiro/derivacoes";
import { formatBRL } from "@/features/retaguarda/format";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ContaReceber } from "@/shared/types";

export function ContasReceberCard({ contas }: { contas: ContaReceber[] }) {
  const agoraISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const emAberto = contas.filter((c) => c.status === "aberta").reduce((s, c) => s + c.valor, 0);

  return (
    <CardSecao
      titulo="Contas a receber"
      icone="lucide:receipt"
      acessorio={<CardPill>{formatBRL(emAberto)} em aberto</CardPill>}
    >
      {contas.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <Icon icon="lucide:inbox" className="h-6 w-6 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">Nenhuma conta a receber</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Situação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contas.map((c) => {
              const fat = faturamentosStore.obter(c.faturamento_id);
              const vencida = contaVencida(c, agoraISO);
              const [ano, mes, dia] = c.vencimento.split("-");
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {fat?.numero ?? c.faturamento_id}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "font-mono text-xs",
                      vencida ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {`${dia}/${mes}/${ano}`}
                  </TableCell>
                  <TableCell className="text-right font-mono">{formatBRL(c.valor)}</TableCell>
                  <TableCell className="text-right">
                    {vencida ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        Vencida
                      </span>
                    ) : (
                      <StatusContaBadge status={c.status} />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </CardSecao>
  );
}
