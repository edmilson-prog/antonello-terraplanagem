import { useRef, useState, type ChangeEvent } from "react";
import { Icon } from "@iconify/react";
import { OCR_HABILITADO, lerHorimetroDaFoto } from "@/shared/lib/ocr";
import { cn } from "@/lib/utils";

/*
 * Botão isolado de leitura do horímetro por foto — para telas que já têm o
 * próprio controle de valor (o stepper do App de Campo) e por isso não podem
 * usar o HorimetroCapture inteiro, que traz o campo numérico junto.
 */

export function BotaoFotoHorimetro({
  base,
  onLeitura,
  className,
}: {
  base?: number;
  onLeitura: (valor: number) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [lendo, setLendo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  if (!OCR_HABILITADO) return null;

  async function aoSelecionar(ev: ChangeEvent<HTMLInputElement>) {
    const arquivo = ev.target.files?.[0];
    ev.target.value = "";
    if (!arquivo) return;
    setLendo(true);
    setErro(null);
    setAviso(null);
    try {
      const valor = await lerHorimetroDaFoto(arquivo, { base });
      if (base != null && valor < base) {
        setAviso(
          `O valor lido (${valor}) é menor que o horímetro inicial — confira antes de confirmar.`,
        );
      }
      onLeitura(valor);
    } catch {
      setErro("Não foi possível ler — ajuste no botão + / −.");
    } finally {
      setLendo(false);
    }
  }

  return (
    <div className={className}>
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
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={lendo}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-border-strong text-[12.5px] font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/12 disabled:opacity-60"
      >
        <Icon
          icon={lendo ? "lucide:loader-circle" : "lucide:camera"}
          className={cn("h-4 w-4", lendo && "animate-spin")}
        />
        {lendo ? "Lendo o horímetro…" : "Ler horímetro por foto"}
      </button>
      {erro ? <p className="mt-1.5 text-xs text-destructive">{erro}</p> : null}
      {aviso ? <p className="mt-1.5 text-xs text-secondary">{aviso}</p> : null}
    </div>
  );
}
