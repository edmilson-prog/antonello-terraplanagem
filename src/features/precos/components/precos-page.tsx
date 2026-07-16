import { useState } from "react";
import { Icon } from "@iconify/react";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrecoHoraMaquinaList } from "@/features/precos/components/preco-hora-maquina-list";
import { PrecoFundacaoList } from "@/features/precos/components/preco-fundacao-list";
import { PrecoMobilizacaoList } from "@/features/precos/components/preco-mobilizacao-list";
import { TabelasAnterioresDialog } from "@/features/precos/components/tabelas-anteriores-dialog";

export function PrecosPage() {
  const [historicoAberto, setHistoricoAberto] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Preços"
        descricao="Valores que alimentam orçamento e faturamento. Visível apenas na retaguarda."
        acoes={
          <Button variant="ghost" onClick={() => setHistoricoAberto(true)} className="gap-1.5">
            <Icon icon="lucide:history" className="h-4 w-4" />
            Tabelas anteriores
          </Button>
        }
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

      <TabelasAnterioresDialog open={historicoAberto} onOpenChange={setHistoricoAberto} />
    </div>
  );
}
