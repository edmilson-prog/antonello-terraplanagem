import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TileOperacionalProps {
  rotulo: string;
  valor: ReactNode;
  unidade?: string;
  mono?: boolean; // valores em R$ usam mono menor, contagens usam display grande
  children?: ReactNode;
  className?: string;
}

// Casca dos tiles do Painel Operacional (`rtg-optile` no UI kit): rótulo
// pequeno, número grande e um corpo livre (barras, lista ou sparkline).
export function TileOperacional({
  rotulo,
  valor,
  unidade,
  mono,
  children,
  className,
}: TileOperacionalProps) {
  return (
    <div
      className={cn("min-w-0 overflow-hidden rounded-xl border bg-card p-4 shadow-sm", className)}
    >
      <div className="font-display text-[10px] font-semibold uppercase leading-tight tracking-widest text-foreground-faint">
        {rotulo}
      </div>
      <div
        className={cn(
          "mt-2.5 font-bold text-foreground",
          mono ? "whitespace-nowrap font-mono text-lg" : "font-display text-2xl",
        )}
      >
        {valor}
        {unidade ? (
          <span className="ml-1 text-sm font-semibold text-muted-foreground">{unidade}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function TileRodape({ children }: { children: ReactNode }) {
  return <div className="mt-1.5 text-[11.5px] text-foreground-faint">{children}</div>;
}

// Barras finas de série curta (novas OS por dia). Alturas em 0..100.
export function MiniBarras({ valores }: { valores: number[] }) {
  const maximo = Math.max(...valores, 0);
  return (
    <div className="mt-3 flex h-[34px] items-end gap-1">
      {valores.map((v, i) => {
        const altura = maximo > 0 ? (v / maximo) * 100 : 0;
        return (
          <span
            key={i}
            className={cn("flex-1 rounded-t-sm", v > 0 ? "bg-primary" : "bg-surface")}
            style={{ height: `${Math.max(altura, 9)}%` }}
          />
        );
      })}
    </div>
  );
}

export interface StatListItem {
  rotulo: string;
  valor: number;
  cor: string; // classe utilitária de background do marcador
}

export function TileStatList({ itens }: { itens: StatListItem[] }) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      {itens.map((item) => (
        <div key={item.rotulo} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", item.cor)} />
          <span className="truncate">{item.rotulo}</span>
          <b className="ml-auto font-mono text-xs font-semibold text-foreground">{item.valor}</b>
        </div>
      ))}
    </div>
  );
}
