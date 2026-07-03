import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/shared/components/page-header";
import { SeletorMes } from "@/shared/components/seletor-mes";
import { mesReferencia, mesAnterior } from "@/shared/lib/periodo-mensal";
import { RankingEquipamentos } from "@/features/rentabilidade/components/ranking-equipamentos";
import { RankingObras } from "@/features/rentabilidade/components/ranking-obras";

const MES_ATUAL = mesReferencia(new Date());
const MES_PADRAO = mesAnterior(MES_ATUAL);

export function RentabilidadePage() {
  const [periodo, setPeriodo] = useState(MES_PADRAO);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Rentabilidade por Equipamento e Obra"
        descricao="Receita (faturamento) menos custo (custo/hora) no período — o painel de decisão do dono. Visível apenas na retaguarda."
      />

      <div className="flex justify-end">
        <SeletorMes periodo={periodo} onChange={setPeriodo} maximo={MES_ATUAL} />
      </div>

      <Tabs defaultValue="equipamentos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="equipamentos">Por Equipamento</TabsTrigger>
          <TabsTrigger value="obras">Por Obra</TabsTrigger>
        </TabsList>

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
