import { Icon } from "@iconify/react";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { resumoRegistro } from "@/features/registros-campo/derivacoes";
import { ICONE_REGISTRO, ROTULO_REGISTRO } from "@/features/registros-campo/tipos";
import { formatDataHora } from "@/shared/lib/format";
import type { RegistroCampoRecebido } from "@/features/registros-campo/tipos";
import type { Operador } from "@/shared/types";

/*
 * O que o campo registrou nesta ordem (Onda 22).
 *
 * Antes desta onda a retaguarda não via nada disto: checklist de pré-uso,
 * diário de obra, paralisação, viagens de basculante e a medição assinada
 * ficavam no celular de quem preencheu. Aqui eles viram o histórico factual
 * da obra — e a assinatura do cliente deixa de ser um traço que só existiu
 * naquele aparelho.
 *
 * A assinatura é renderizada em tamanho contido: serve para conferir que
 * existe e de quem é, não para ser examinada em detalhe.
 */

interface Props {
  registros: RegistroCampoRecebido[];
  operadores: Operador[];
}

export function RegistrosCampoDaOS({ registros, operadores }: Props) {
  if (registros.length === 0) {
    return (
      <CardSecao titulo="Registros de campo" icone="lucide:clipboard-list">
        <p className="p-6 text-center text-sm text-muted-foreground">
          Nenhum registro do app de campo nesta ordem.
        </p>
      </CardSecao>
    );
  }

  return (
    <CardSecao
      titulo="Registros de campo"
      icone="lucide:clipboard-list"
      acessorio={<CardPill>{registros.length}</CardPill>}
      bodyClassName="p-2"
    >
      <ul className="divide-y divide-border/60">
        {registros.map((registro) => {
          const operador = operadores.find((o) => o.id === registro.operador_id);
          return (
            <li key={registro.id} className="flex items-start gap-3 px-2 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                <Icon icon={ICONE_REGISTRO[registro.tipo]} className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {ROTULO_REGISTRO[registro.tipo]}
                </p>
                <p className="text-xs text-muted-foreground">{resumoRegistro(registro)}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  {operador?.nome ?? "Operador"} · {formatDataHora(registro.registrado_em)}
                </p>
                {registro.assinatura ? (
                  <img
                    src={registro.assinatura}
                    alt={`Assinatura de ${
                      registro.tipo === "medicao_assinada"
                        ? registro.dados.responsavel
                        : "responsável"
                    }`}
                    className="mt-2 h-16 rounded-md border bg-white p-1"
                  />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </CardSecao>
  );
}
