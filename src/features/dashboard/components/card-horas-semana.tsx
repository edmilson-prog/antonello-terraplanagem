import { CardSecao } from "@/shared/components/card-secao";
import { formatHorimetro } from "@/shared/lib/format";
import { cn } from "@/lib/utils";
import type { ResumoSemanal, SemanaHoras } from "@/features/dashboard/derivacoes";

export interface CardHorasSemanaProps {
  semanas: SemanaHoras[]; // da mais antiga para a mais recente
  resumo: ResumoSemanal;
}

// Barras de horas apontadas por janela de 7 dias. Independe do filtro de
// período — é a leitura de tendência das últimas 8 semanas.
export function CardHorasSemana({ semanas, resumo }: CardHorasSemanaProps) {
  const maximo = Math.max(...semanas.map((s) => s.horas), 0);

  return (
    <CardSecao titulo="Horas por semana" icone="lucide:bar-chart-3" bodyClassName="p-4">
      {maximo === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Sem horas apontadas nas últimas {semanas.length} semanas.
        </p>
      ) : (
        <>
          <div className="flex h-24 items-end gap-2">
            {semanas.map((s, i) => (
              <div
                key={s.rotulo}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                title={`${s.rotulo}: ${formatHorimetro(s.horas)}`}
              >
                <div
                  className={cn(
                    "w-full max-w-[26px] rounded-t-[5px]",
                    i === semanas.length - 1 ? "bg-primary" : "bg-primary/60",
                  )}
                  style={{ height: `${Math.max((s.horas / maximo) * 100, s.horas > 0 ? 4 : 2)}%` }}
                />
                <span className="font-mono text-[10px] text-foreground-faint">{s.rotulo}</span>
              </div>
            ))}
          </div>
          <div className="mt-3.5 flex justify-between border-t pt-3 text-xs text-muted-foreground">
            <span>
              Média <b className="font-semibold text-foreground">{formatHorimetro(resumo.media)}</b>
              /semana
            </span>
            <span>
              Pico <b className="font-semibold text-foreground">{formatHorimetro(resumo.pico)}</b>
              {resumo.picoRotulo ? ` (${resumo.picoRotulo})` : ""}
            </span>
          </div>
        </>
      )}
    </CardSecao>
  );
}
