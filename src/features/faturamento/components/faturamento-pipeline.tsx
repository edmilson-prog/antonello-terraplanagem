import { Icon } from "@iconify/react";
import { formatBRL } from "@/features/retaguarda/format";
import { cn } from "@/lib/utils";

interface FaturamentoPipelineProps {
  executado: number;
  faturado: { qtd: number; total: number };
}

export function FaturamentoPipeline({ executado, faturado }: FaturamentoPipelineProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Coluna
        icone="lucide:clipboard-check"
        rotulo="Executado"
        principal={`${executado}`}
        secundario="OS a faturar"
      />
      <Coluna
        icone="lucide:receipt"
        rotulo="Faturado"
        principal={formatBRL(faturado.total)}
        secundario={`${faturado.qtd} ${faturado.qtd === 1 ? "fatura" : "faturas"}`}
        destaque
      />
      <Coluna
        icone="lucide:hand-coins"
        rotulo="Recebido"
        principal="—"
        secundario="Em breve (PRD-007)"
        esmaecido
      />
    </div>
  );
}

function Coluna({
  icone,
  rotulo,
  principal,
  secundario,
  destaque = false,
  esmaecido = false,
}: {
  icone: string;
  rotulo: string;
  principal: string;
  secundario: string;
  destaque?: boolean;
  esmaecido?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm",
        destaque && "border-primary/40",
        esmaecido && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">{rotulo}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icon icon={icone} className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-2 font-mono text-xl font-bold text-card-foreground">{principal}</div>
      <div className="text-xs text-muted-foreground">{secundario}</div>
    </div>
  );
}
