import { MapaCanteiro } from "@/features/dashboard-operacional/components/mapa-canteiro";
import { TilesOrdensHoras } from "@/features/dashboard-operacional/components/tiles-ordens-horas";
import { CardsFinanceiroOperacional } from "@/features/dashboard-operacional/components/cards-financeiro-operacional";
import { GraficoContasReceberCliente } from "@/features/dashboard-operacional/components/grafico-contas-receber-cliente";
import { TabelaManutencaoPreditiva } from "@/features/dashboard-operacional/components/tabela-manutencao-preditiva";
import { AtalhosOperacional } from "@/features/dashboard-operacional/components/atalhos-operacional";

// Layout do UI kit (`rtg-opgrid`): à esquerda o que é "chão de obra" (mapa e
// saúde da frota); à direita a leitura de gestão (ordens, financeiro, contas) e
// as ações rápidas.
export function PainelOperacional() {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_1.06fr]">
      <div className="space-y-4">
        <MapaCanteiro />
        <TabelaManutencaoPreditiva />
      </div>

      <div className="space-y-4">
        <section className="space-y-2.5">
          <Eyebrow>Ordens e horas</Eyebrow>
          <TilesOrdensHoras />
        </section>

        <section className="space-y-2.5">
          <Eyebrow>Financeiro</Eyebrow>
          <CardsFinanceiroOperacional />
        </section>

        <GraficoContasReceberCliente />

        <section className="space-y-2.5">
          <Eyebrow>Atalhos e ações rápidas</Eyebrow>
          <AtalhosOperacional />
        </section>
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
      {children}
    </h2>
  );
}
