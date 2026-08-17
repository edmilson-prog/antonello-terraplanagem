import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

// Linha com rótulo, valor e barra de proporção — o padrão que o UI kit usa nos
// cards de composição (Custo da Hora), margem por cliente (Rentabilidade) e
// curva ABC / utilização da frota (Painel Gerencial).
//
// Os dois primeiros ainda têm a sua versão local; este componente nasceu na
// Onda 16, quando o padrão apareceu pela quarta vez.

interface LinhaBarraProps {
  /** Ícone à esquerda; quando ausente, `prefixo` ocupa o lugar. */
  icone?: string;
  /** Alternativa ao ícone — ex.: o rótulo "Curva A" do card ABC. */
  prefixo?: ReactNode;
  titulo: ReactNode;
  valor: ReactNode;
  /** 0..1 — quanto da barra preencher. Acima de 1 é truncado visualmente. */
  proporcao: number;
  /** Pinta a barra de vermelho (valor negativo, meta não atingida…). */
  alerta?: boolean;
  rodape?: ReactNode;
  className?: string;
}

export function LinhaBarra({
  icone,
  prefixo,
  titulo,
  valor,
  proporcao,
  alerta,
  rodape,
  className,
}: LinhaBarraProps) {
  const largura = Math.max(0, Math.min(1, proporcao)) * 100;

  return (
    <li className={className}>
      <div className="flex items-center gap-2.5">
        {prefixo ?? (
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface text-primary">
            <Icon icon={icone ?? "lucide:circle"} className="h-3.5 w-3.5" aria-hidden />
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-foreground">
          {titulo}
        </span>
        <span
          className={cn(
            "shrink-0 font-mono text-xs",
            alerta ? "font-semibold text-destructive" : "text-foreground",
          )}
        >
          {valor}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className={cn(
            "h-full rounded-full",
            alerta ? "bg-destructive" : "bg-gradient-to-r from-primary to-primary-deep",
          )}
          style={{ width: `${largura}%` }}
        />
      </div>
      {rodape ? <div className="mt-1 text-[11px] text-muted-foreground">{rodape}</div> : null}
    </li>
  );
}
