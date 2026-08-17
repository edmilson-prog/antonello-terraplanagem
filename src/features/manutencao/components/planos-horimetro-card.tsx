import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { formatHorimetro } from "@/shared/lib/format";
import type { LinhaManutencaoPreditiva } from "@/features/dashboard-operacional/derivacoes";
import { cn } from "@/lib/utils";

// Card "Planos por horímetro" do UI kit: o que cada plano ativo tem pela frente,
// do mais urgente ao mais folgado. É a agenda da manutenção preventiva — a
// tabela ao lado mostra o que já aconteceu, este card o que vai acontecer.
//
// Cada linha leva direto ao registro daquele ciclo, que é a ação que o alerta
// pede. Reaproveita `manutencaoPreditiva` do Painel Operacional para as duas
// telas nunca divergirem sobre a mesma máquina.

export function PlanosHorimetroCard({ linhas }: { linhas: LinhaManutencaoPreditiva[] }) {
  return (
    <CardSecao
      titulo="Planos por horímetro"
      icone="lucide:gauge"
      acessorio={<CardPill>{linhas.length} planos</CardPill>}
      bodyClassName="p-2"
    >
      {linhas.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          Nenhum plano ativo com ciclo aberto.
        </p>
      ) : (
        <ul>
          {linhas.map((linha) => (
            <li key={`${linha.equipamento.id}-${linha.plano.id}`}>
              <Link
                to="/admin/manutencao/registrar/$registroId"
                params={{ registroId: linha.registro.id }}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface/60"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                  <Icon icon={TIPO_ICONE[linha.equipamento.tipo]} className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {linha.equipamento.nome}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {linha.plano.descricao} · plano {formatHorimetro(linha.plano.intervalo_horas)}
                  </span>
                </span>
                {linha.status === "vencida" ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive">
                    <Icon icon="lucide:circle-alert" className="h-3.5 w-3.5" />
                    Vencida
                  </span>
                ) : (
                  <span
                    className={cn(
                      "shrink-0 font-mono text-xs font-semibold",
                      linha.status === "proxima" ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    em {formatHorimetro(linha.restantes)}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CardSecao>
  );
}
