import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Superfícies do UI kit do App de Campo (ui_kits/app-campo, DesignSync).
 * Traduz as classes `ac-card`, `ac-osrow`, `ac-sec`, `ac-tile`, `atp-tile`,
 * `atp-avatar` e `atp-status` do protótipo para componentes tipados. As telas
 * do operador compõem estas peças — nenhuma delas repete medidas do kit.
 */

export function CartaoCampo({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("overflow-hidden rounded-[14px] border bg-surface", className)}>
      {children}
    </div>
  );
}

/*
 * Cartão em destaque (`.ac-active`) — o que está acontecendo agora. O kit usa
 * um degradê âmbar por cima da superfície; aqui ele é uma camada própria para
 * não hardcodar cor no background.
 */
export function CartaoDestaque({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[14px] border border-primary/35 bg-surface",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-3/5 bg-gradient-to-b from-primary/[0.07] to-transparent"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/*
 * Classe da linha de lista (`.ac-osrow`). Exportada como string para que a
 * linha possa ser um <div>, <button> ou <Link> conforme a tela — a divisória
 * `border-t` só funciona se o elemento clicável for filho direto do cartão.
 */
export const LINHA_CAMPO =
  "flex min-h-16 w-full items-center gap-3 border-t border-border-soft px-3.5 py-3 text-left first:border-t-0";

export const LINHA_CAMPO_CLICAVEL = cn(
  LINHA_CAMPO,
  "transition-colors hover:bg-surface-2 active:bg-surface-2",
);

export function LinhaCampo({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn(LINHA_CAMPO, className)}>{children}</div>;
}

export function LinhaCorpo({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("min-w-0 flex-1", className)}>{children}</div>;
}

export function LinhaTitulo({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("truncate text-[13.5px] font-semibold text-foreground", className)}>
      {children}
    </div>
  );
}

export function LinhaMeta({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("mt-[3px] truncate text-[11.5px] text-foreground-faint", className)}>
      {children}
    </div>
  );
}

/* Etiqueta monoespaçada do número da OS (`.osn`). */
export function TagOS({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "shrink-0 whitespace-nowrap rounded-[7px] border bg-surface-2 px-[7px] py-[5px] font-mono text-xs font-bold text-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* Rótulo de seção (`.ac-sec`). */
export function SecaoCampo({
  className,
  acao,
  children,
}: {
  className?: string;
  acao?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-0.5 mb-2.5 mt-[18px] flex items-center font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-faint",
        className,
      )}
    >
      {children}
      {acao ? <span className="ml-auto">{acao}</span> : null}
    </div>
  );
}

export function TilesCampo({
  className,
  colunas = 2,
  children,
}: {
  className?: string;
  colunas?: 2 | 3;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid gap-2.5", colunas === 3 ? "grid-cols-3" : "grid-cols-2", className)}>
      {children}
    </div>
  );
}

export function TileCampo({
  rotulo,
  valor,
  unidade,
  className,
}: {
  rotulo: string;
  valor: ReactNode;
  unidade?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[14px] border bg-surface px-3.5 py-3.5", className)}>
      <div className="font-display text-[9.5px] font-semibold uppercase leading-[1.3] tracking-[0.12em] text-foreground-faint">
        {rotulo}
      </div>
      <div className="mt-2 font-mono text-[22px] font-semibold leading-none text-foreground">
        {valor}
        {unidade ? <small className="text-xs text-muted-foreground"> {unidade}</small> : null}
      </div>
    </div>
  );
}

export type TomIcone = "amber" | "muted" | "brand" | "danger";

const TOM_ICONE: Record<TomIcone, string> = {
  amber: "bg-surface-2 text-primary",
  muted: "bg-surface-2 text-muted-foreground",
  brand:
    "bg-gradient-to-br from-primary to-primary-deep text-primary-foreground shadow-[0_6px_20px_rgba(255,179,0,0.18)]",
  danger: "bg-destructive/15 text-destructive",
};

/* Ladrilho de ícone (`.atp-tile`). */
export function IconeTile({
  tom = "amber",
  tamanho = 34,
  className,
  children,
}: {
  tom?: TomIcone;
  tamanho?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden
      style={{ width: tamanho, height: tamanho }}
      className={cn("grid shrink-0 place-items-center rounded-[9px]", TOM_ICONE[tom], className)}
    >
      {children}
    </span>
  );
}

/* Avatar de iniciais (`.atp-avatar`). */
export function AvatarCampo({
  iniciais,
  tamanho = 38,
  raio = "50%",
  marca = false,
  className,
}: {
  iniciais: string;
  tamanho?: number;
  raio?: CSSProperties["borderRadius"];
  marca?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      style={{ width: tamanho, height: tamanho, borderRadius: raio, fontSize: tamanho * 0.39 }}
      className={cn(
        "grid shrink-0 place-items-center font-display font-extrabold leading-none",
        marca
          ? "bg-gradient-to-br from-primary to-primary-deep text-primary-foreground shadow-[0_6px_20px_rgba(255,179,0,0.18)]"
          : "bg-primary text-primary-foreground",
        className,
      )}
    >
      {iniciais}
    </span>
  );
}

export type TomStatus = "amber" | "info" | "success" | "danger" | "neutral";

const TOM_STATUS: Record<TomStatus, string> = {
  amber: "border-primary/30 bg-primary/15 text-primary",
  info: "border-info/30 bg-info/15 text-info-foreground",
  success: "border-success/30 bg-success/15 text-success-foreground",
  danger: "border-destructive/30 bg-destructive/15 text-destructive",
  neutral: "border-border bg-surface-2 text-foreground-faint",
};

/* Chip de status (`.atp-status`), com LED opcional. */
export function StatusCampo({
  tom = "neutral",
  led = false,
  className,
  children,
}: {
  tom?: TomStatus;
  led?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-[9px] py-1 text-[11px] font-semibold",
        TOM_STATUS[tom],
        className,
      )}
    >
      {led ? <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

/* Progresso da OS / da manutenção (`.ac-prog`). */
export function BarraProgresso({
  valor,
  legenda,
  percentual,
  alerta = false,
  className,
}: {
  valor: ReactNode;
  legenda: ReactNode;
  percentual: number;
  alerta?: boolean;
  className?: string;
}) {
  const largura = Math.max(0, Math.min(100, percentual));
  return (
    <div className={cn("rounded-[10px] border bg-surface px-3.5 py-3.5", className)}>
      <div className="mb-2.5 flex items-baseline gap-2">
        <b
          className={cn(
            "font-mono text-[17px] font-semibold leading-none",
            alerta ? "text-destructive" : "text-foreground",
          )}
        >
          {valor}
        </b>
        <span
          className={cn("text-[11.5px]", alerta ? "text-destructive" : "text-foreground-faint")}
        >
          {legenda}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[3px] bg-surface-2">
        <i
          style={{ width: `${largura}%` }}
          className={cn(
            "block h-full rounded-[3px]",
            alerta ? "bg-destructive" : "bg-gradient-to-r from-primary to-primary-deep",
          )}
        />
      </div>
    </div>
  );
}
