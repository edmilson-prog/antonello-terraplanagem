/* eslint-disable react-refresh/only-export-components */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

/*
 * Ações do UI kit do App de Campo: botão grande (`ac-big`), atalho tracejado
 * (`ac-chk-open`), stepper (`ac-stepper`) e segmentos (`ac-seg`).
 * Alvos de toque nunca abaixo de 44px — regra do ambiente do operador.
 */

export type VarianteBotaoCampo = "solido" | "ghost" | "flat";

const VARIANTE: Record<VarianteBotaoCampo, string> = {
  solido:
    "border-primary bg-primary text-primary-foreground hover:bg-primary-hover disabled:hover:bg-primary",
  ghost:
    "border-border bg-transparent text-muted-foreground hover:border-border-strong hover:bg-surface-2 hover:text-foreground",
  flat: "rounded-none border-transparent bg-transparent text-primary hover:bg-primary/12",
};

export const BOTAO_CAMPO_BASE =
  "flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl border text-[14.5px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

/* Para quando o alvo precisa ser um <Link> (navegação) em vez de <button>. */
export function classeBotaoCampo(
  variante: VarianteBotaoCampo = "solido",
  className?: string,
): string {
  return cn(BOTAO_CAMPO_BASE, VARIANTE[variante], className);
}

export function BotaoCampo({
  variante = "solido",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: VarianteBotaoCampo }) {
  return (
    <button type="button" {...props} className={classeBotaoCampo(variante, className)}>
      {children}
    </button>
  );
}

/* Atalho tracejado para uma sub-tela (`.ac-chk-open`). */
export const ATALHO_CAMPO =
  "mt-2 flex min-h-[46px] w-full items-center gap-2.5 rounded-[10px] border border-dashed border-border-strong px-3.5 text-left text-[12.5px] font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/12";

export function AtalhoCampo({
  icone,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { icone: string }) {
  return (
    <button type="button" {...props} className={cn(ATALHO_CAMPO, className)}>
      <Icon icon={icone} className="h-4 w-4 shrink-0" />
      {children}
      <Icon icon="lucide:chevron-right" className="ml-auto h-3.5 w-3.5 shrink-0" />
    </button>
  );
}

/* Conteúdo do atalho quando o elemento precisa ser um <Link> (rota interna). */
export function AtalhoConteudo({ icone, children }: { icone: string; children: ReactNode }) {
  return (
    <>
      <Icon icon={icone} className="h-4 w-4 shrink-0" />
      {children}
      <Icon icon="lucide:chevron-right" className="ml-auto h-3.5 w-3.5 shrink-0" />
    </>
  );
}

/* Stepper de valor (`.ac-stepper`) — horímetro, equipe, duração, km. */
export function StepperCampo({
  valor,
  legenda,
  onDiminuir,
  onAumentar,
  diminuirDesabilitado = false,
  rotuloDiminuir = "Diminuir",
  rotuloAumentar = "Aumentar",
}: {
  valor: ReactNode;
  legenda: string;
  onDiminuir: () => void;
  onAumentar: () => void;
  diminuirDesabilitado?: boolean;
  rotuloDiminuir?: string;
  rotuloAumentar?: string;
}) {
  const botao =
    "w-[58px] shrink-0 rounded-[10px] border bg-surface-2 font-mono text-[22px] font-semibold text-primary transition-colors hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex items-stretch gap-2">
      <button
        type="button"
        aria-label={rotuloDiminuir}
        onClick={onDiminuir}
        disabled={diminuirDesabilitado}
        className={botao}
      >
        −
      </button>
      <div className="flex min-h-[58px] flex-1 flex-col items-center justify-center gap-[3px] rounded-[10px] border bg-surface">
        <b className="font-mono text-[21px] font-semibold leading-none text-foreground">{valor}</b>
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-faint">
          {legenda}
        </span>
      </div>
      <button type="button" aria-label={rotuloAumentar} onClick={onAumentar} className={botao}>
        +
      </button>
    </div>
  );
}

export function SegGrupo({
  colunas = 3,
  className,
  children,
}: {
  colunas?: 2 | 3;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid gap-2", colunas === 2 ? "grid-cols-2" : "grid-cols-3", className)}>
      {children}
    </div>
  );
}

/* Segmento selecionável (`.ac-seg button`). */
export function SegOpcao({
  ativo,
  icone,
  perigo = false,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  ativo: boolean;
  icone?: string;
  perigo?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      {...props}
      className={cn(
        "flex min-h-[56px] flex-col items-center justify-center gap-1.5 rounded-[11px] border text-[11.5px] font-semibold transition-colors",
        ativo
          ? perigo
            ? "border-destructive/45 bg-destructive/15 text-destructive"
            : "border-primary/40 bg-primary/15 text-primary"
          : cn(
              "border-border bg-surface text-foreground-faint hover:border-border-strong",
              perigo ? "hover:text-destructive" : "hover:text-muted-foreground",
            ),
        className,
      )}
    >
      {icone ? <Icon icon={icone} className="h-[17px] w-[17px]" /> : null}
      {children}
    </button>
  );
}

/* Selo compacto de sincronização (`.ac-syncmini`). */
export function SyncMini({ sincronizado }: { sincronizado: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-[0.04em]",
        sincronizado ? "text-success-foreground" : "text-primary-dim",
      )}
    >
      <Icon
        icon={sincronizado ? "lucide:check" : "lucide:clock"}
        className="h-2.5 w-2.5"
        strokeWidth={2.4}
      />
      {sincronizado ? "sincronizado" : "no aparelho"}
    </span>
  );
}
