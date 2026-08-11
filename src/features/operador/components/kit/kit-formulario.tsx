import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

/*
 * Estrutura de tela e campos do UI kit do App de Campo: `ac-app`, `ac-scroll`,
 * `ac-form-head`, `ac-field`, `ac-eq`, `ac-obs`, `ac-input` e `ac-chk-warn`.
 */

/* Raiz de uma tela do operador — ocupa a altura restante do shell. */
export function TelaCampo({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex min-h-0 flex-1 flex-col", className)}>{children}</div>;
}

/* Corpo rolável (`.ac-scroll`). */
export function AreaRolagem({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("scrollbar-hide flex-1 overflow-y-auto px-4 pb-5 pt-[18px]", className)}>
      {children}
    </div>
  );
}

/* Botão/link de voltar do cabeçalho de sub-tela. */
export const BOTAO_VOLTAR =
  "grid h-11 w-11 shrink-0 place-items-center rounded-xl border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground";

/* Cabeçalho de sub-tela (`.ac-form-head`). */
export function CabecalhoCampo({
  voltar,
  titulo,
  tag,
}: {
  voltar: ReactNode;
  titulo: string;
  tag?: ReactNode;
}) {
  return (
    <header className="flex items-center gap-2.5 border-b px-4 py-3">
      {voltar}
      <h1 className="font-display text-[15px] font-bold uppercase tracking-[0.03em] text-foreground">
        {titulo}
      </h1>
      {tag ? <div className="ml-auto flex shrink-0 items-center">{tag}</div> : null}
    </header>
  );
}

/* Etiqueta âmbar do cabeçalho (`.ac-form-head .osn`). */
export function TagCabecalho({
  tom = "amber",
  children,
}: {
  tom?: "amber" | "success" | "neutral";
  children: ReactNode;
}) {
  const tons = {
    amber: "border-primary/25 bg-primary/12 text-primary",
    success: "border-success/30 bg-success/15 text-success-foreground",
    neutral: "border-border bg-surface-2 text-foreground-faint",
  } as const;
  return (
    <span
      className={cn(
        "whitespace-nowrap rounded-[7px] border px-2 py-[5px] font-mono text-xs font-bold",
        tons[tom],
      )}
    >
      {children}
    </span>
  );
}

/* Bloco rotulado (`.ac-field`). */
export function BlocoCampo({
  rotulo,
  className,
  children,
}: {
  rotulo?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mb-3.5", className)}>
      {rotulo ? (
        <div className="mb-2 flex items-center font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-faint">
          {rotulo}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/* Caixa de destaque de uma linha (`.ac-eq`) — equipamento, local, trajeto. */
export function CaixaCampo({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-center gap-[11px] rounded-[10px] border bg-surface px-3.5 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* Valor monoespaçado alinhado à direita dentro da CaixaCampo (`.ac-eq .hm`). */
export function ValorCaixa({ children }: { children: ReactNode }) {
  return (
    <span className="ml-auto shrink-0 font-mono text-[11.5px] font-semibold text-foreground-faint">
      {children}
    </span>
  );
}

export function TextareaCampo({
  value,
  onChange,
  placeholder,
  id,
  rows = 3,
}: {
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  id?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-16 w-full resize-none rounded-[10px] border bg-surface px-3.5 py-2.5 text-[13.5px] font-medium leading-[1.5] text-foreground outline-none placeholder:text-foreground-faint focus:border-primary focus:ring-[3px] focus:ring-primary/15"
    />
  );
}

export function InputCampo({
  value,
  onChange,
  placeholder,
  id,
  type = "text",
}: {
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  id?: string;
  type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="h-[46px] w-full rounded-[10px] border bg-surface px-3.5 text-sm font-medium text-foreground outline-none placeholder:text-foreground-faint focus:border-primary focus:ring-[3px] focus:ring-primary/15"
    />
  );
}

/* Aviso em faixa (`.ac-chk-warn`). */
export function AvisoCampo({
  tom = "info",
  icone,
  className,
  children,
}: {
  tom?: "info" | "perigo";
  icone?: string;
  className?: string;
  children: ReactNode;
}) {
  const perigo = tom === "perigo";
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-[10px] border px-3.5 py-2.5 text-xs leading-[1.55]",
        perigo
          ? "border-destructive/30 bg-destructive/15 text-destructive"
          : "border-primary/25 bg-primary/12 text-muted-foreground",
        className,
      )}
    >
      <Icon
        icon={icone ?? (perigo ? "lucide:circle-alert" : "lucide:info")}
        className={cn("mt-px h-[15px] w-[15px] shrink-0", perigo ? "" : "text-primary-dim")}
      />
      <span className="min-w-0">{children}</span>
    </div>
  );
}

/* Confirmação já registrada (`.ac-ackok`). */
export function CienciaConfirmada({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-11 items-center justify-center gap-2 rounded-[11px] border border-success/30 bg-success/15 text-[12.5px] font-semibold text-success-foreground">
      <Icon icon="lucide:circle-check-big" className="h-4 w-4" />
      {children}
    </div>
  );
}

/*
 * Campo de foto (`<image-slot>` do protótipo). Guarda apenas uma object URL
 * local — o upload para o Storage entra quando a fila offline do ADR-001 for
 * implementada; até lá a foto é evidência que fica no aparelho.
 */
export function FotoCampo({
  valor,
  onChange,
  placeholder,
  altura = 150,
}: {
  valor: string | null;
  onChange: (url: string | null) => void;
  placeholder: string;
  altura?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlLocal, setUrlLocal] = useState<string | null>(null);

  // Object URLs vazam se não forem revogadas ao trocar/desmontar.
  useEffect(() => {
    return () => {
      if (urlLocal) URL.revokeObjectURL(urlLocal);
    };
  }, [urlLocal]);

  function aoSelecionar(ev: ChangeEvent<HTMLInputElement>) {
    const arquivo = ev.target.files?.[0];
    ev.target.value = "";
    if (!arquivo) return;
    if (urlLocal) URL.revokeObjectURL(urlLocal);
    const url = URL.createObjectURL(arquivo);
    setUrlLocal(url);
    onChange(url);
  }

  return (
    <div
      style={{ height: altura }}
      className="relative overflow-hidden rounded-[10px] border bg-surface"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={aoSelecionar}
        aria-hidden="true"
        tabIndex={-1}
      />
      {valor ? (
        <>
          <img src={valor} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => {
              if (urlLocal) URL.revokeObjectURL(urlLocal);
              setUrlLocal(null);
              onChange(null);
            }}
            className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-[10px] border border-border-strong bg-background/85 text-muted-foreground backdrop-blur"
            aria-label="Remover foto"
          >
            <Icon icon="lucide:x" className="h-4 w-4" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-full w-full flex-col items-center justify-center gap-2 text-[12.5px] text-foreground-faint transition-colors hover:text-muted-foreground"
        >
          <Icon icon="lucide:camera" className="h-6 w-6 text-primary-dim" />
          {placeholder}
        </button>
      )}
    </div>
  );
}
