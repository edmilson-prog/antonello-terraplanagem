import { Icon } from "@iconify/react";
import { CardSecao } from "@/shared/components/card-secao";
import { formatBRL } from "@/features/retaguarda/format";
import { FORMA_RECEBIMENTO_LABEL, FORMA_RECEBIMENTO_ICONE } from "@/features/financeiro/labels";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import type { ContaReceber } from "@/shared/types";

interface Props {
  itens: ContaReceber[]; // já filtrados/ordenados por comprovantesRecentes()
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function ComprovantesRecentesCard({ itens }: Props) {
  return (
    <CardSecao titulo="Comprovantes recentes" icone="lucide:receipt" bodyClassName="p-4">
      {itens.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhum comprovante recente.
        </p>
      ) : (
        <ul className="space-y-3">
          {itens.map((conta) => {
            const forma = conta.forma_recebimento ?? "outro";
            const fat = faturamentosStore.obter(conta.faturamento_id);
            return (
              <li key={conta.id} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-primary">
                  <Icon icon={FORMA_RECEBIMENTO_ICONE[forma]} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {FORMA_RECEBIMENTO_LABEL[forma]} recebido — {fat?.numero ?? conta.faturamento_id}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {conta.recebido_em ? formatarData(conta.recebido_em) : "—"}
                  </div>
                </div>
                <div className="font-mono text-sm text-foreground">{formatBRL(conta.valor)}</div>
              </li>
            );
          })}
        </ul>
      )}
    </CardSecao>
  );
}
