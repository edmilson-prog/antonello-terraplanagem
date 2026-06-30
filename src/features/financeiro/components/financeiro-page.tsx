import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/shared/components/page-header";
import { ContasReceberTab } from "@/features/financeiro/components/contas-receber-tab";
import { ContasPagarTab } from "@/features/financeiro/components/contas-pagar-tab";
import { CaixaTab } from "@/features/financeiro/components/caixa-tab";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";

export function FinanceiroPage() {
  const contasReceber = contasReceberStore.useTodas();
  const contasPagar = contasPagarStore.useTodas();

  return (
    <div className="space-y-6">
      <PageHeader titulo="Financeiro" descricao="Contas a receber, a pagar e visão de caixa" />

      <Tabs defaultValue="receber">
        <TabsList>
          <TabsTrigger value="receber">A Receber</TabsTrigger>
          <TabsTrigger value="pagar">A Pagar</TabsTrigger>
          <TabsTrigger value="caixa">Caixa</TabsTrigger>
        </TabsList>
        <TabsContent value="receber" className="mt-4">
          <ContasReceberTab contasReceber={contasReceber} />
        </TabsContent>
        <TabsContent value="pagar" className="mt-4">
          <ContasPagarTab contasPagar={contasPagar} />
        </TabsContent>
        <TabsContent value="caixa" className="mt-4">
          <CaixaTab contasReceber={contasReceber} contasPagar={contasPagar} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
