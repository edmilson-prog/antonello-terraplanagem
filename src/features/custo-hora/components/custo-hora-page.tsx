import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/shared/components/page-header";
import { SeletorMes } from "@/shared/components/seletor-mes";
import { PainelCustoHora } from "@/features/custo-hora/components/painel-custo-hora";
import { ComponenteCustoList } from "@/features/custo-hora/components/componente-custo-list";
import { mesReferencia, mesAnterior } from "@/shared/lib/periodo-mensal";

const MES_ATUAL = mesReferencia(new Date());
const MES_PADRAO = mesAnterior(MES_ATUAL);

export function CustoHoraPage() {
  const [periodo, setPeriodo] = useState(MES_PADRAO);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Custo Real da Hora-Máquina"
        descricao="Custo por equipamento no mês, comparado ao preço praticado. Visível apenas na retaguarda."
      />

      <Tabs defaultValue="painel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="painel">Custo por Equipamento</TabsTrigger>
          <TabsTrigger value="componentes">Componentes de Custo</TabsTrigger>
        </TabsList>

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
