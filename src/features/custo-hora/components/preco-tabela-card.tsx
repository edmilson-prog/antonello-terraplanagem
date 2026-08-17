import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { CardSecao } from "@/shared/components/card-secao";
import { formatBRL } from "@/features/retaguarda/format";
import { useParametroNumero } from "@/features/parametros/uso";
import { MARGEM_MINIMA_PADRAO } from "@/features/precos/labels";
import type { CustoHoraEquipamento } from "@/features/custo-hora/derivacoes";

// Card "Preço de tabela" do UI kit: o preço praticado do equipamento
// selecionado e um selo dizendo se a margem está saudável ou apertada. O
// limiar vem de Parâmetros (o mesmo que colore a coluna Margem em Preços),
// não de um número solto nesta tela.

interface Props {
  equipamentoNome: string | null;
  resultado: CustoHoraEquipamento | null;
}

export function PrecoTabelaCard({ equipamentoNome, resultado }: Props) {
  const margemMinima = useParametroNumero("margem_minima_pct", MARGEM_MINIMA_PADRAO * 100) / 100;

  if (!resultado) return null;

  const preco = resultado.preco_hora;
  const custo = resultado.custo_por_hora;
  const margemPct = preco != null && preco > 0 && custo != null ? (preco - custo) / preco : null;

  return (
    <CardSecao titulo="Preço de tabela" icone="lucide:tag" bodyClassName="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
            {equipamentoNome ?? "Equipamento"}
          </div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-foreground">
            {preco != null ? (
              <>
                {formatBRL(preco)}
                <span className="text-sm font-normal text-muted-foreground">/h</span>
              </>
            ) : (
              <span className="text-base font-normal text-muted-foreground">Sem preço ativo</span>
            )}
          </div>
        </div>
        <SeloMargem margemPct={margemPct} minima={margemMinima} />
      </div>

      {margemPct != null ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Margem de{" "}
          <span className="font-mono font-semibold text-foreground">
            {Math.round(margemPct * 100)}%
          </span>{" "}
          sobre o preço — mínimo de {Math.round(margemMinima * 100)}% definido em{" "}
          <Link to="/admin/parametros" className="font-medium text-primary hover:underline">
            Parâmetros
          </Link>
          .
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          {preco == null
            ? "Cadastre um preço de hora-máquina para este equipamento para acompanhar a margem."
            : "Sem horas apontadas no mês — não há custo por hora para comparar."}
        </p>
      )}
    </CardSecao>
  );
}

function SeloMargem({ margemPct, minima }: { margemPct: number | null; minima: number }) {
  if (margemPct === null) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">
        Sem comparação
      </span>
    );
  }

  const saudavel = margemPct >= minima;
  return (
    <span
      className={
        saudavel
          ? "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success"
          : "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive"
      }
    >
      <Icon
        icon={saudavel ? "lucide:circle-check" : "lucide:circle-alert"}
        className="h-3.5 w-3.5"
      />
      {saudavel ? "Margem saudável" : "Margem apertada"}
    </span>
  );
}
