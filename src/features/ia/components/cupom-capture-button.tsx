import { useRef, useState, type ChangeEvent } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { lerCupomAbastecimento } from "@/features/ia/mock/captura";
import { cn } from "@/lib/utils";

interface CupomCaptureButtonProps {
  onLeitura: (litros: number, valor: number | null) => void;
}

export function CupomCaptureButton({ onLeitura }: CupomCaptureButtonProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [lendo, setLendo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoSelecionar(ev: ChangeEvent<HTMLInputElement>) {
    const arquivo = ev.target.files?.[0];
    ev.target.value = "";
    if (!arquivo) return;
    setLendo(true);
    setErro(null);
    try {
      const leitura = await lerCupomAbastecimento(arquivo);
      onLeitura(leitura.litros, leitura.valor);
    } catch {
      setErro("Não foi possível ler o cupom — preencha manualmente.");
    } finally {
      setLendo(false);
    }
  }

  return (
    <div className="space-y-1">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={aoSelecionar}
        aria-hidden="true"
        tabIndex={-1}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileRef.current?.click()}
        disabled={lendo}
        className="gap-2"
      >
        <Icon
          icon={lendo ? "lucide:loader-circle" : "lucide:camera"}
          className={cn("h-4 w-4", lendo && "animate-spin")}
        />
        {lendo ? "Lendo cupom…" : "Ler cupom por foto"}
      </Button>
      {erro ? <p className="text-xs text-destructive">{erro}</p> : null}
    </div>
  );
}
