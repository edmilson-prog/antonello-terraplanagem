import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CardPill } from "@/shared/components/card-secao";
import { SeletorMes } from "@/shared/components/seletor-mes";
import { PainelCustoHora } from "@/features/custo-hora/components/painel-custo-hora";
import { ComponenteCustoList } from "@/features/custo-hora/components/componente-custo-list";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import { custoHoraPorEquipamento } from "@/features/custo-hora/derivacoes";
import {
  baixarCsv,
  montarCsvCustoHora,
  nomeArquivoCustoHora,
} from "@/features/custo-hora/exportar-csv";
import { mesReferencia, mesAnterior, rotuloMes } from "@/shared/lib/periodo-mensal";

const MES_ATUAL = mesReferencia(new Date());
const MES_PADRAO = mesAnterior(MES_ATUAL);

// O kit desenha um botão "Recalcular custos". Não existe o que recalcular: o
// custo/hora é sempre derivado na leitura, nunca persistido (contrato em
// shared/types). Fica visível e desabilitado, com a explicação no hover —
// decisão do usuário, para não ensinar um gesto que não faz nada.
const EXPLICACAO_RECALCULAR =
  "Não é necessário: o custo da hora é sempre calculado na hora da leitura, a partir dos apontamentos, abastecimentos e componentes de custo do mês. Nunca fica guardado desatualizado.";

export function CustoHoraPage() {
  const [periodo, setPeriodo] = useState(MES_PADRAO);

  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();
  const abastecimentos = abastecimentosStore.useTodos();
  const registrosManutencao = registrosManutencaoStore.useTodos();
  const precosHoraMaquina = precoHoraMaquinaStore.useAll();
  const componentesCusto = componentesCustoStore.useAll();

  const resultados = useMemo(
    () =>
      custoHoraPorEquipamento(
        equipamentos,
        periodo,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      ).sort((a, b) => (b.custo_por_hora ?? -1) - (a.custo_por_hora ?? -1)),
    [
      equipamentos,
      periodo,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
    ],
  );

  const exportar = () => {
    if (resultados.length === 0) {
      toast.error("Nada para exportar neste mês.");
      return;
    }
    const csv = montarCsvCustoHora(
      resultados,
      (id) => equipamentos.find((e) => e.id === id)?.nome ?? "Equipamento",
    );
    baixarCsv(nomeArquivoCustoHora(periodo), csv);
    toast.success(`Planilha de ${rotuloMes(periodo)} baixada.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Custo da Hora
        </h1>
        <CardPill>{rotuloMes(periodo)}</CardPill>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="ghost" className="gap-2" onClick={exportar}>
            <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
            Exportar
          </Button>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                {/* span porque um <button disabled> não dispara os eventos do tooltip */}
                <span tabIndex={0} title={EXPLICACAO_RECALCULAR}>
                  <Button variant="ghost" className="gap-2" disabled>
                    <Icon icon="lucide:calculator" className="h-4 w-4" />
                    Recalcular custos
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-72">{EXPLICACAO_RECALCULAR}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button asChild className="gap-2">
            <Link to="/admin/custo-hora/novo">
              <Icon icon="lucide:file-plus" className="h-4 w-4" />
              Novo lançamento
            </Link>
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground md:text-base">
        Custo por equipamento no mês, comparado ao preço praticado. Visível apenas na retaguarda.
      </p>

      <Tabs defaultValue="painel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="painel">Custo por Equipamento</TabsTrigger>
          <TabsTrigger value="componentes">Componentes de Custo</TabsTrigger>
        </TabsList>

        {/* O seletor de mês vive dentro desta aba: a de Componentes de Custo
            cadastra valores vigentes, sem recorte de período. */}
        <TabsContent value="painel" className="space-y-4">
          <div className="flex justify-end">
            <SeletorMes periodo={periodo} onChange={setPeriodo} maximo={MES_ATUAL} />
          </div>
          <PainelCustoHora periodo={periodo} />
        </TabsContent>
        <TabsContent value="componentes">
          <ComponenteCustoList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
