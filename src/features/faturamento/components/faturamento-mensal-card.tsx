import { CardSecao } from "@/shared/components/card-secao";
import { formatBRL } from "@/features/retaguarda/format";
import type { AgregadoMensalFaturamento } from "@/features/faturamento/derivacoes";

export function FaturamentoMensalCard({ meses }: { meses: AgregadoMensalFaturamento[] }) {
  const valores = meses.map((m) => m.valor);
  const pico = Math.max(...valores, 0);
  const media = valores.length > 0 ? valores.reduce((s, v) => s + v, 0) / valores.length : 0;
  const mesPico = meses.find((m) => m.valor === pico);
  return (
    <CardSecao titulo="Faturamento por mês" icone="lucide:bar-chart" bodyClassName="p-4">
      <div className="flex h-24 items-end gap-2">
        {meses.map((m) => (
          <div key={m.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <div
              className={
                m.valor === pico && pico > 0
                  ? "w-full max-w-[26px] rounded-t bg-primary"
                  : "w-full max-w-[26px] rounded-t bg-primary/60"
              }
              style={{
                height:
                  pico > 0 ? `${Math.max((m.valor / pico) * 100, m.valor > 0 ? 4 : 0)}%` : "0%",
              }}
            />
            <span className="font-mono text-[10px] text-foreground-faint">{m.rotulo}</span>
          </div>
        ))}
      </div>
      <div className="mt-3.5 flex justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>
          Média <b className="text-foreground">{formatBRL(media)}</b>/mês
        </span>
        <span>
          Pico <b className="text-foreground">{formatBRL(pico)}</b>{" "}
          {mesPico ? `(${mesPico.rotulo})` : ""}
        </span>
      </div>
    </CardSecao>
  );
}
