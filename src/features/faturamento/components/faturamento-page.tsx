import { PageHeader } from "@/shared/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaturasTab } from "@/features/faturamento/components/faturas-tab";
import { AnaliseTab } from "@/features/faturamento/components/analise-tab";

export function FaturamentoPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Faturamento"
        descricao="Gere e confirme as faturas das OS fechadas e acompanhe o consolidado."
      />
      <Tabs defaultValue="faturas">
        <TabsList>
          <TabsTrigger value="faturas">Faturas</TabsTrigger>
          <TabsTrigger value="analise">Análise</TabsTrigger>
        </TabsList>
        <TabsContent value="faturas" className="mt-6">
          <FaturasTab />
        </TabsContent>
        <TabsContent value="analise" className="mt-6">
          <AnaliseTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
