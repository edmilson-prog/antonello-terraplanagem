import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/features/retaguarda/format";
import { cn } from "@/lib/utils";
import type { FaturamentoItem } from "@/shared/types";

interface FaturamentoItemRowProps {
  item: FaturamentoItem;
  editavel: boolean;
  onQuantidade: (q: number) => void;
  onHoraTipo: (tipo: "seca" | "operada") => void;
  onValorUnitario: (v: number) => void;
  onRemover: () => void;
}

export function FaturamentoItemRow({
  item,
  editavel,
  onQuantidade,
  onHoraTipo,
  onValorUnitario,
  onRemover,
}: FaturamentoItemRowProps) {
  const unidade = item.tipo === "por_metro" ? "m" : item.tipo === "mobilizacao" ? "un" : "h";

  return (
    <div className="rounded-lg border bg-surface/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{item.descricao}</p>
          {item.sem_preco ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
              <Icon icon="lucide:triangle-alert" className="h-3 w-3" />
              Sem preço cadastrado
            </span>
          ) : null}
        </div>
        {editavel ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemover}
            aria-label="Remover item"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Icon icon="lucide:trash-2" className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Campo rotulo="Quantidade">
          {editavel ? (
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={item.quantidade}
              onChange={(e) => onQuantidade(Number(e.target.value))}
              className="h-8 font-mono"
            />
          ) : (
            <span className="font-mono text-sm">{`${item.quantidade} ${unidade}`}</span>
          )}
        </Campo>

        <Campo rotulo="Valor unit.">
          {editavel ? (
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={item.valor_unitario ?? ""}
              placeholder="—"
              onChange={(e) => onValorUnitario(Number(e.target.value))}
              className="h-8 font-mono"
            />
          ) : (
            <span className="font-mono text-sm">
              {item.valor_unitario != null ? formatBRL(item.valor_unitario) : "—"}
            </span>
          )}
        </Campo>

        <Campo rotulo="Tipo">
          {item.tipo === "hora_maquina" && item.hora_tipo ? (
            editavel ? (
              <div className="flex h-8 items-center gap-1">
                {(["operada", "seca"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onHoraTipo(t)}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs font-medium capitalize transition-colors",
                      item.hora_tipo === t
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-sm capitalize">{item.hora_tipo}</span>
            )
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </Campo>

        <Campo rotulo="Total">
          <span className="font-mono text-sm font-semibold">{formatBRL(item.valor_total)}</span>
        </Campo>
      </div>
    </div>
  );
}

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="font-mono text-[10px] uppercase tracking-wide text-foreground-faint">{rotulo}</div>
      {children}
    </div>
  );
}
