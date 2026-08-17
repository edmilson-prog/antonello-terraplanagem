import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardPill } from "@/shared/components/card-secao";
import { SeletorMes } from "@/shared/components/seletor-mes";
import { baixarCsv } from "@/shared/lib/exportar-csv";
import { mesReferencia, mesAnterior, rotuloMes } from "@/shared/lib/periodo-mensal";
import { RankingEquipamentos } from "@/features/rentabilidade/components/ranking-equipamentos";
import { RankingObras } from "@/features/rentabilidade/components/ranking-obras";
import {
  montarCsvEquipamentos,
  montarCsvObras,
  nomeArquivoRentabilidade,
} from "@/features/rentabilidade/exportar-csv";
import {
  rentabilidadePorTodasAsObras,
  rentabilidadePorTodosEquipamentos,
} from "@/features/rentabilidade/derivacoes";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { clientesStore } from "@/features/clientes/clientes-store";

const MES_ATUAL = mesReferencia(new Date());
const MES_PADRAO = mesAnterior(MES_ATUAL);

type Aba = "equipamentos" | "obras";

export function RentabilidadePage() {
  const [periodo, setPeriodo] = useState(MES_PADRAO);
  const [aba, setAba] = useState<Aba>("equipamentos");

  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();
  const abastecimentos = abastecimentosStore.useTodos();
  const registrosManutencao = registrosManutencaoStore.useCompletos();
  const precosHoraMaquina = precoHoraMaquinaStore.useAll();
  const componentesCusto = componentesCustoStore.useAll();
  const faturamentos = faturamentosStore.useTodos();
  const ordens = ordensStore.useTodas();
  const clientes = clientesStore.useAll();

  // O export acompanha a aba aberta: as colunas das duas visões são diferentes,
  // então não faria sentido um CSV único.
  const csvDaAba = useMemo(
    () => () => {
      if (aba === "obras") {
        const obras = rentabilidadePorTodasAsObras(
          ordens,
          faturamentos,
          periodo,
          equipamentos,
          componentesCusto,
          abastecimentos,
          registrosManutencao,
          apontamentos,
          precosHoraMaquina,
        ).sort((a, b) => b.margem - a.margem);
        return {
          vazio: obras.length === 0,
          conteudo: montarCsvObras(
            obras,
            (id) => clientes.find((c) => c.id === id)?.nome ?? "Cliente",
          ),
        };
      }
      const porEquipamento = rentabilidadePorTodosEquipamentos(
        equipamentos,
        periodo,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
        faturamentos,
      ).sort((a, b) => b.margem - a.margem);
      return {
        vazio: porEquipamento.length === 0,
        conteudo: montarCsvEquipamentos(
          porEquipamento,
          (id) => equipamentos.find((e) => e.id === id)?.nome ?? "Equipamento",
        ),
      };
    },
    [
      aba,
      periodo,
      ordens,
      faturamentos,
      equipamentos,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
      clientes,
    ],
  );

  const exportar = () => {
    const { vazio, conteudo } = csvDaAba();
    if (vazio) {
      toast.error("Nada para exportar neste mês.");
      return;
    }
    baixarCsv(nomeArquivoRentabilidade(aba, periodo), conteudo);
    toast.success(`Planilha de ${rotuloMes(periodo)} baixada.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Rentabilidade
        </h1>
        <CardPill>{rotuloMes(periodo)}</CardPill>
        <div className="ml-auto">
          <Button variant="ghost" className="gap-2" onClick={exportar}>
            <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground md:text-base">
        Receita (faturamento) menos custo (custo/hora) no período — o painel de decisão do dono.
        Visível apenas na retaguarda.
      </p>

      <Tabs value={aba} onValueChange={(v) => setAba(v as Aba)} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="equipamentos">Por Equipamento</TabsTrigger>
            <TabsTrigger value="obras">Por Obra</TabsTrigger>
          </TabsList>
          <SeletorMes periodo={periodo} onChange={setPeriodo} maximo={MES_ATUAL} />
        </div>

        <TabsContent value="equipamentos">
          <RankingEquipamentos periodo={periodo} />
        </TabsContent>
        <TabsContent value="obras">
          <RankingObras periodo={periodo} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
