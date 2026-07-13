import { Link } from "@tanstack/react-router";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { contaDoFaturamento } from "@/features/faturamento/derivacoes";
import { formatBRL } from "@/features/retaguarda/format";
import { formatDataHora } from "@/shared/lib/format";
import type { ContaReceber, Faturamento } from "@/shared/types";

function situacao(fat: Faturamento, contas: ContaReceber[], hojeISO: string) {
  const conta = contaDoFaturamento(fat.id, contas);
  if (!conta) return "—";
  if (conta.status === "liquidada") return "Paga";
  return conta.vencimento < hojeISO.slice(0, 10) ? "Vencida" : "A vencer";
}

export function NotasFiscaisCard({
  faturados,
  contas,
}: {
  faturados: Faturamento[];
  contas: ContaReceber[];
}) {
  const hojeISO = new Date().toISOString();
  return (
    <CardSecao
      titulo="Notas fiscais emitidas"
      icone="lucide:file-check"
      acessorio={<CardPill>{faturados.length} no mês</CardPill>}
      bodyClassName="overflow-x-auto"
    >
      {faturados.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          Nenhuma NF emitida neste mês.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
              <th className="px-4 py-3 font-medium">NF</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">OS</th>
              <th className="px-4 py-3 font-medium">Emissão</th>
              <th className="px-4 py-3 text-right font-medium">Valor</th>
              <th className="px-4 py-3 text-right font-medium">Situação</th>
            </tr>
          </thead>
          <tbody>
            {faturados.map((f) => {
              const sit = situacao(f, contas, hojeISO);
              return (
                <tr key={f.id} className="border-b last:border-b-0 hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/faturamento/$faturamentoId"
                      params={{ faturamentoId: f.id }}
                      className="font-mono text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {f.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{clientesStore.getById(f.cliente_id)?.nome ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/ordens/$ordemId"
                      params={{ ordemId: f.os_id }}
                      className="font-mono text-xs text-muted-foreground hover:text-primary"
                    >
                      {ordensStore.obter(f.os_id)?.numero ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{formatDataHora(f.faturado_em)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">
                    {formatBRL(f.valor_total)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-medium">
                    <span
                      className={sit === "Vencida" ? "text-destructive" : "text-muted-foreground"}
                    >
                      {sit}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </CardSecao>
  );
}
