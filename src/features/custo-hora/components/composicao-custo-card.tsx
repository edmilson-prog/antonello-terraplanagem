import { Icon } from "@iconify/react";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { formatBRL } from "@/features/retaguarda/format";
import { formatHorimetro } from "@/shared/lib/format";
import type { CustoHoraEquipamento, DetalheItemCusto } from "@/features/custo-hora/derivacoes";
import type { TipoComponenteCusto } from "@/shared/types";

// Composição do custo do equipamento selecionado — o card "Composição" do UI
// kit (barra de proporção por item). Diferença deliberada em relação ao mock:
// o kit desenha 4 categorias fixas (Diesel/Manutenção/Operador/Depreciação),
// enquanto aqui saem os componentes realmente cadastrados, pelo nome que o
// usuário deu ("Parcela FINAME", "Material rodante"), mais Diesel e Manutenção,
// que são derivados. Decisão do usuário: mostrar onde o dinheiro vai de fato.

const ICONE_POR_TIPO: Record<TipoComponenteCusto, string> = {
  diesel: "lucide:fuel",
  manutencao: "lucide:wrench",
  fixo_mensal: "lucide:history",
  variavel_hora: "lucide:hard-hat",
};

interface Props {
  equipamentoNome: string | null;
  resultado: CustoHoraEquipamento | null;
}

export function ComposicaoCustoCard({ equipamentoNome, resultado }: Props) {
  if (!resultado) {
    return (
      <CardSecao titulo="Composição" icone="lucide:chart-pie" bodyClassName="p-4">
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Icon icon="lucide:mouse-pointer-click" className="h-6 w-6 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">
            Escolha um equipamento na tabela para ver a composição do custo.
          </p>
        </div>
      </CardSecao>
    );
  }

  // Itens com valor zero poluem a lista sem informar nada — o total continua
  // sendo o do cálculo, então esconder não distorce as proporções.
  const itens = resultado.detalhamento.filter((i) => i.valor > 0);
  const total = resultado.custo_total;
  const horas = resultado.horas_trabalhadas;

  return (
    <CardSecao
      titulo={`Composição — ${equipamentoNome ?? "Equipamento"}`}
      icone="lucide:chart-pie"
      acessorio={
        resultado.custo_por_hora != null ? (
          <CardPill>{formatBRL(resultado.custo_por_hora)}/h</CardPill>
        ) : undefined
      }
      bodyClassName="p-4"
    >
      {itens.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {resultado.configuracao_incompleta
            ? "Nenhum componente de custo cadastrado para este equipamento."
            : "Sem custo apurado neste mês."}
        </p>
      ) : (
        <ul className="space-y-3.5">
          {itens.map((item, i) => (
            <LinhaComposicao
              key={`${item.tipo}-${item.descricao}-${i}`}
              item={item}
              total={total}
              horas={horas}
            />
          ))}
        </ul>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg border bg-surface/40 p-3 text-sm">
        <div>
          <dt className="text-xs text-foreground-faint">Horas no mês</dt>
          <dd className="font-mono font-semibold text-foreground">{formatHorimetro(horas)}</dd>
        </div>
        <div>
          <dt className="text-xs text-foreground-faint">Custo total</dt>
          <dd className="font-mono font-semibold text-foreground">{formatBRL(total)}</dd>
        </div>
      </dl>

      {resultado.configuracao_incompleta ? (
        <p className="mt-3 text-xs text-foreground-faint">
          Configuração incompleta: nenhum componente de custo ativo cadastrado para este
          equipamento.
        </p>
      ) : null}
    </CardSecao>
  );
}

function LinhaComposicao({
  item,
  total,
  horas,
}: {
  item: DetalheItemCusto;
  total: number;
  horas: number;
}) {
  const pct = total > 0 ? Math.round((item.valor / total) * 100) : 0;
  // O kit mostra R$/h; o cálculo guarda o total do mês. Sem horas apontadas não
  // há como dividir, então cai para o valor do período.
  const porHora = horas > 0 ? item.valor / horas : null;

  return (
    <li>
      <div className="flex items-center gap-2.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface text-primary">
          <Icon icon={ICONE_POR_TIPO[item.tipo]} className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-foreground">
          {item.descricao}
        </span>
        <span className="shrink-0 font-mono text-xs text-foreground">
          {porHora != null ? `${formatBRL(porHora)}/h` : formatBRL(item.valor)}
        </span>
        <span className="w-9 shrink-0 text-right font-mono text-[11px] font-semibold text-muted-foreground">
          {pct}%
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-deep"
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}
