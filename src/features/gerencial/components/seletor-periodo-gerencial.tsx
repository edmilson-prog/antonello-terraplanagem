import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { rotuloMes } from "@/shared/lib/periodo-mensal";
import {
  periodoTerminandoEm,
  type PeriodoGerencial,
  type TipoPeriodoGerencial,
} from "@/features/gerencial/periodo-gerencial";

interface Props {
  periodo: PeriodoGerencial;
  mesMaisRecente: string;
  onChange: (periodo: PeriodoGerencial) => void;
}

const OPCOES: { tipo: TipoPeriodoGerencial; label: string }[] = [
  { tipo: "mes", label: "Mês atual" },
  { tipo: "trimestre", label: "Trimestre" },
  { tipo: "ano", label: "Ano (12 meses)" },
];

export function SeletorPeriodoGerencial({ periodo, mesMaisRecente, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {OPCOES.map((opcao) => (
        <button
          key={opcao.tipo}
          type="button"
          onClick={() => onChange(periodoTerminandoEm(opcao.tipo, mesMaisRecente))}
          className={
            periodo.tipo === opcao.tipo
              ? "rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
              : "rounded-full border border-border bg-surface/50 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          }
        >
          {opcao.label}
        </button>
      ))}
      <div className="flex items-center gap-1.5 opacity-60">
        <span className="rounded-full border border-border bg-surface/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
          Personalizado (em breve)
        </span>
        <Select
          disabled
          value={periodo.mesInicio}
          onValueChange={(mesInicio) =>
            onChange({ tipo: "personalizado", mesInicio, mesFim: periodo.mesFim })
          }
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="De" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={periodo.mesInicio}>{rotuloMes(periodo.mesInicio)}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
