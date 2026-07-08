import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { transcreverVoz } from "@/features/ia/mock/captura";
import { cn } from "@/lib/utils";

interface MicrofoneIABotaoProps {
  campo: "observacao" | "horimetro";
  horimetroBase?: number;
  onResultado: (valor: string) => void;
  disabled?: boolean;
}

export function MicrofoneIABotao({
  campo,
  horimetroBase,
  onResultado,
  disabled,
}: MicrofoneIABotaoProps) {
  const [gravando, setGravando] = useState(false);

  async function gravar() {
    setGravando(true);
    try {
      const texto = await transcreverVoz(campo, { horimetroBase });
      onResultado(texto);
    } finally {
      setGravando(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      disabled={disabled || gravando}
      onClick={gravar}
      aria-label={gravando ? "Gravando…" : "Ditar por voz"}
      className="h-14 w-14 shrink-0"
    >
      <Icon
        icon={gravando ? "lucide:loader-circle" : "lucide:mic"}
        className={cn("h-5 w-5", gravando && "animate-spin")}
      />
    </Button>
  );
}
