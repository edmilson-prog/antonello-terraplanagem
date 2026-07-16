import { Icon } from "@iconify/react";
import { CardSecao } from "@/shared/components/card-secao";
import { formatBRL } from "@/features/retaguarda/format";
import { FORMA_RECEBIMENTO_LABEL, FORMA_RECEBIMENTO_ICONE } from "@/features/financeiro/labels";
import type { RecebimentoPorForma } from "@/features/financeiro/derivacoes";

interface Props {
  itens: RecebimentoPorForma[];
}

export function RecebimentosPorFormaCard({ itens }: Props) {
  return (
    <CardSecao titulo="Recebimentos por forma" icone="lucide:credit-card" bodyClassName="p-4">
      {itens.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhum recebimento registrado ainda.
        </p>
      ) : (
        <ul className="space-y-3">
          {itens.map((item) => (
            <li key={item.forma} className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-primary">
                <Icon icon={FORMA_RECEBIMENTO_ICONE[item.forma]} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">
                  {FORMA_RECEBIMENTO_LABEL[item.forma]}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.quantidade} recebimento{item.quantidade > 1 ? "s" : ""}
                </div>
              </div>
              <div className="font-mono text-sm text-foreground">{formatBRL(item.valor)}</div>
            </li>
          ))}
        </ul>
      )}
    </CardSecao>
  );
}
