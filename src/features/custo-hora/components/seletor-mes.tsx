import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mesAnterior, proximoMes, rotuloMes } from "@/features/custo-hora/periodo-mensal";

interface Props {
  periodo: string;
  onChange: (periodo: string) => void;
  maximo: string; // não permite navegar além deste mês (mês atual)
}

export function SeletorMes({ periodo, onChange, maximo }: Props) {
  const podeAvancar = periodo < maximo;
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(mesAnterior(periodo))}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-32 text-center font-display text-sm font-bold text-foreground">
        {rotuloMes(periodo)}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(proximoMes(periodo))}
        disabled={!podeAvancar}
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
