import { MapaCanteiro } from "@/features/dashboard-operacional/components/mapa-canteiro";
import { CardOsAbertas } from "@/features/dashboard-operacional/components/card-os-abertas";
import { CardHorasApontadas } from "@/features/dashboard-operacional/components/card-horas-apontadas";
import { CardsFinanceiroOperacional } from "@/features/dashboard-operacional/components/cards-financeiro-operacional";
import { GraficoContasReceberCliente } from "@/features/dashboard-operacional/components/grafico-contas-receber-cliente";
import { TabelaManutencaoPreditiva } from "@/features/dashboard-operacional/components/tabela-manutencao-preditiva";
import { AtalhosOperacional } from "@/features/dashboard-operacional/components/atalhos-operacional";

export function PainelOperacional() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Operacional em tempo real
          </h2>
          <MapaCanteiro />
        </div>
        <div className="space-y-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Ordens e horas
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <CardOsAbertas />
            <CardHorasApontadas />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Financeiro
        </h2>
        <CardsFinanceiroOperacional />
      </section>

      <section className="space-y-3">
        <GraficoContasReceberCliente />
      </section>

      <section className="space-y-3">
        <TabelaManutencaoPreditiva />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Atalhos e ações rápidas
        </h2>
        <AtalhosOperacional />
      </section>
    </div>
  );
}
