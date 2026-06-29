import { PageHeader } from "@/shared/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrecoHoraMaquinaList } from "@/features/precos/components/preco-hora-maquina-list";
import { PrecoFundacaoList } from "@/features/precos/components/preco-fundacao-list";
import { PrecoMobilizacaoList } from "@/features/precos/components/preco-mobilizacao-list";

export function PrecosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Tabela de Preços"
        descricao="Valores que alimentam orçamento e faturamento. Visível apenas na retaguarda."
      />

      <Tabs defaultValue="hora-maquina" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="hora-maquina">Hora-Máquina</TabsTrigger>
          <TabsTrigger value="por-metro">Por Metro</TabsTrigger>
          <TabsTrigger value="mobilizacao">Mobilização</TabsTrigger>
        </TabsList>

        <TabsContent value="hora-maquina">
          <PrecoHoraMaquinaList />
        </TabsContent>
        <TabsContent value="por-metro">
          <PrecoFundacaoList />
        </TabsContent>
        <TabsContent value="mobilizacao">
          <PrecoMobilizacaoList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
