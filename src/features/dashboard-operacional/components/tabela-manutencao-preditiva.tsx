import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Skeleton } from "@/components/ui/skeleton";
import { CardSecao } from "@/shared/components/card-secao";
import { EmptyState } from "@/shared/components/empty-state";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { manutencaoPreditiva } from "@/features/dashboard-operacional/derivacoes";
import { numero } from "@/features/retaguarda/format";
import { cn } from "@/lib/utils";
import type { StatusManutencao } from "@/shared/types";

const BARRA_POR_STATUS: Record<StatusManutencao, string> = {
  vencida: "bg-destructive",
  proxima: "bg-primary",
  em_dia: "bg-secondary",
};

export function TabelaManutencaoPreditiva() {
  const equipamentos = equipamentosStore.useAll();
  const planos = planosManutencaoStore.useAll();
  const registros = registrosManutencaoStore.useTodos();
  const { isLoading, error, retry } = useMockResource(equipamentos);

  const linhas = useMemo(
    () => manutencaoPreditiva(equipamentos, planos, registros, 6),
    [equipamentos, planos, registros],
  );

  return (
    <CardSecao
      titulo="Manutenção preditiva"
      icone="lucide:wrench"
      acessorio={
        <Link
          to="/admin/manutencao"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Ver todas
          <Icon icon="lucide:chevron-right" className="h-3.5 w-3.5" />
        </Link>
      }
      bodyClassName="p-0"
    >
      {isLoading ? (
        <Skeleton className="m-4 h-[200px]" />
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <button
            type="button"
            onClick={retry}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : linhas.length === 0 ? (
        <EmptyState
          icon="lucide:circle-check"
          titulo="Sem planos ativos"
          descricao="Nenhum equipamento tem plano de manutenção com marca prevista."
          className="border-0"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b">
                <Th>Equipamento</Th>
                <Th>Alerta</Th>
                <Th alinharDireita>Vence</Th>
                <Th alinharDireita>Saúde</Th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha) => (
                <tr
                  key={`${linha.equipamento.id}-${linha.plano.id}`}
                  className="border-b last:border-b-0 hover:bg-surface"
                >
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/equipamentos/$equipamentoId"
                      params={{ equipamentoId: linha.equipamento.id }}
                      className="flex items-center gap-2.5"
                    >
                      <span
                        aria-hidden
                        className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-lg bg-primary/15 text-primary"
                      >
                        <Icon icon={TIPO_ICONE[linha.equipamento.tipo]} className="h-4 w-4" />
                      </span>
                      <span className="truncate text-[13.5px] text-foreground">
                        {linha.equipamento.nome}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">
                    {linha.plano.descricao}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "whitespace-nowrap font-mono text-[13px] font-semibold",
                        linha.status === "vencida" ? "text-destructive" : "text-foreground",
                      )}
                    >
                      {linha.restantes <= 0
                        ? `vencida · −${numero.format(Math.abs(linha.restantes))} h`
                        : `em ${numero.format(linha.restantes)} h`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="inline-block h-1.5 w-[90px] overflow-hidden rounded-full bg-surface align-middle"
                      role="img"
                      aria-label={`${linha.percentualCiclo}% do intervalo consumido`}
                    >
                      <span
                        className={cn("block h-full rounded-full", BARRA_POR_STATUS[linha.status])}
                        style={{ width: `${linha.percentualCiclo}%` }}
                      />
                    </span>
                  </td>
                </tr>
              ))}
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
      className={cn(
        "px-4 py-3 font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint",
        alinharDireita && "text-right",
      )}
    >
      {children}
    </th>
  );
}
