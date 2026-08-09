import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { formatHorimetro } from "@/shared/lib/format";
import { rotuloDia } from "@/features/dashboard/format";
import type { ApontamentosDoDia } from "@/features/dashboard/derivacoes";
import type { Equipamento, Operador, OrdemServico } from "@/shared/types";

export interface CardApontamentosDiaProps {
  dia: ApontamentosDoDia;
  operadores: Operador[];
  equipamentos: Equipamento[];
  ordens: OrdemServico[];
  agora: Date;
}

const horimetroFmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

// Apontamentos finalizados do último dia com movimento. Quando esse dia não é
// hoje (base sem apontamento recente), o título e a pílula dizem isso em vez de
// mostrar um card vazio rotulado "de hoje".
export function CardApontamentosDia({
  dia,
  operadores,
  equipamentos,
  ordens,
  agora,
}: CardApontamentosDiaProps) {
  const rotulo = rotuloDia(dia.data, agora);
  const ehHoje = rotulo === "hoje";

  return (
    <CardSecao
      titulo={ehHoje ? "Apontamentos de hoje" : "Últimos apontamentos"}
      icone="lucide:gauge"
      acessorio={dia.data ? <CardPill>{rotulo}</CardPill> : null}
      bodyClassName="p-0"
    >
      {dia.itens.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum apontamento finalizado ainda.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <Th>Operador</Th>
                <Th>Equipamento</Th>
                <Th>Horímetro</Th>
                <Th alinharDireita>Horas</Th>
                <Th alinharDireita>OS</Th>
              </tr>
            </thead>
            <tbody>
              {dia.itens.map((a) => {
                const equipamento = equipamentos.find((e) => e.id === a.equipamento_id);
                const os = ordens.find((o) => o.id === a.os_id);
                return (
                  <tr key={a.id} className="border-b last:border-b-0 hover:bg-surface">
                    <Td className="font-semibold">
                      {operadores.find((o) => o.id === a.operador_id)?.nome ?? "—"}
                    </Td>
                    <Td>
                      <span className="flex items-center gap-2.5">
                        <span
                          aria-hidden
                          className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-lg bg-primary/15 text-primary"
                        >
                          <Icon
                            icon={equipamento ? TIPO_ICONE[equipamento.tipo] : "lucide:truck"}
                            className="h-4 w-4"
                          />
                        </span>
                        <span className="truncate">{equipamento?.nome ?? "—"}</span>
                      </span>
                    </Td>
                    <Td>
                      <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                        <b className="font-semibold text-foreground">
                          {horimetroFmt.format(a.horimetro_inicial)}
                        </b>
                        {" → "}
                        <b className="font-semibold text-foreground">
                          {a.horimetro_final === null
                            ? "—"
                            : horimetroFmt.format(a.horimetro_final)}
                        </b>
                      </span>
                    </Td>
                    <Td alinharDireita className="font-semibold">
                      {formatHorimetro(a.horas_trabalhadas ?? 0)}
                    </Td>
                    <Td alinharDireita>
                      {os ? (
                        <Link
                          to="/admin/ordens/$ordemId"
                          params={{ ordemId: os.id }}
                          className="inline-block rounded-md border border-primary/25 bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary"
                        >
                          {os.numero}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </CardSecao>
  );
}

function Th({ children, alinharDireita }: { children: React.ReactNode; alinharDireita?: boolean }) {
  return (
    <th
      className={`px-4 py-3 font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint ${
        alinharDireita ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  alinharDireita,
  className,
}: {
  children: React.ReactNode;
  alinharDireita?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`px-4 py-3 text-[13px] text-foreground ${alinharDireita ? "text-right" : ""} ${
        className ?? ""
      }`}
    >
      {children}
    </td>
  );
}
