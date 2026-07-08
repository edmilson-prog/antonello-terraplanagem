import { useId, useRef, useState, type ChangeEvent } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OCR_HABILITADO, lerHorimetroDaFoto } from "@/shared/lib/ocr";
import { cn } from "@/lib/utils";

interface HorimetroCaptureProps {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  /** valor base p/ o OCR simulado (ex.: horímetro atual do equipamento) */
  ocrBase?: number;
  onFotoCapturada?: (url: string) => void;
  error?: string;
  inputId?: string;
}

export function HorimetroCapture({
  label,
  value,
  onChange,
  ocrBase,
  onFotoCapturada,
  error,
  inputId,
}: HorimetroCaptureProps) {
  const gerado = useId();
  const id = inputId ?? gerado;
  const fileRef = useRef<HTMLInputElement>(null);
  const [lendo, setLendo] = useState(false);
  const [ocrErro, setOcrErro] = useState<string | null>(null);
  const [ocrAviso, setOcrAviso] = useState<string | null>(null);

  async function aoSelecionarFoto(ev: ChangeEvent<HTMLInputElement>) {
    const arquivo = ev.target.files?.[0];
    ev.target.value = ""; // permite recapturar o mesmo arquivo
    if (!arquivo) return;
    setLendo(true);
    setOcrErro(null);
    setOcrAviso(null);
    try {
      const valorLido = await lerHorimetroDaFoto(arquivo, { base: ocrBase });
      if (ocrBase != null && valorLido < ocrBase) {
        setOcrAviso(
          `O valor lido (${valorLido}) é menor que o horímetro atual do equipamento (${ocrBase}) — confira antes de confirmar.`,
        );
      }
      onChange(String(valorLido));
      onFotoCapturada?.(URL.createObjectURL(arquivo));
    } catch {
      setOcrErro("Não foi possível ler — digite manualmente.");
    } finally {
      setLendo(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-stretch gap-2">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          placeholder="0,0"
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
          aria-invalid={!!error}
          className="h-14 flex-1 font-mono text-2xl"
        />
        {OCR_HABILITADO ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={aoSelecionarFoto}
              aria-hidden="true"
              tabIndex={-1}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={lendo}
              className="h-14 min-w-[56px] gap-2 px-4"
              aria-label="Capturar horímetro por foto"
            >
              <Icon
                icon={lendo ? "lucide:loader-circle" : "lucide:camera"}
                className={cn("h-5 w-5", lendo && "animate-spin")}
              />
            </Button>
          </>
        ) : null}
      </div>
      {ocrErro ? <p className="text-xs text-destructive">{ocrErro}</p> : null}
      {ocrAviso ? <p className="text-xs text-secondary">{ocrAviso}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
