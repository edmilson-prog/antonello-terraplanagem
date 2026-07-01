import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/shared/components/page-header";
import { ContasReceberTab } from "@/features/financeiro/components/contas-receber-tab";
import { ContasPagarTab } from "@/features/financeiro/components/contas-pagar-tab";
import { CaixaTab } from "@/features/financeiro/components/caixa-tab";
import { DarBaixaReceberDialog } from "@/features/financeiro/components/dar-baixa-receber-dialog";
import { DarBaixaPagarDialog } from "@/features/financeiro/components/dar-baixa-pagar-dialog";
import { NovaContaPagarDialog } from "@/features/financeiro/components/nova-conta-pagar-dialog";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";
import type { ContaReceber, ContaPagar } from "@/shared/types";

export function FinanceiroPage() {
  const contasReceber = contasReceberStore.useTodas();
  const contasPagar = contasPagarStore.useTodas();

  const [contaReceberSelecionada, setContaReceberSelecionada] = useState<ContaReceber | null>(null);
  const [contaPagarSelecionada, setContaPagarSelecionada] = useState<ContaPagar | null>(null);
  const [novaContaAberta, setNovaContaAberta] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Financeiro"
        descricao="Contas a receber, a pagar e visão de caixa"
      />

      <Tabs defaultValue="receber">
        <TabsList>
          <TabsTrigger value="receber">A Receber</TabsTrigger>
          <TabsTrigger value="pagar">A Pagar</TabsTrigger>
          <TabsTrigger value="caixa">Caixa</TabsTrigger>
        </TabsList>
        <TabsContent value="receber" className="mt-4">
          <ContasReceberTab
            contasReceber={contasReceber}
            onDarBaixa={setContaReceberSelecionada}
          />
        </TabsContent>
        <TabsContent value="pagar" className="mt-4">
          <ContasPagarTab
            contasPagar={contasPagar}
            onDarBaixa={setContaPagarSelecionada}
            onNovaConta={() => setNovaContaAberta(true)}
          />
        </TabsContent>
        <TabsContent value="caixa" className="mt-4">
          <CaixaTab contasReceber={contasReceber} contasPagar={contasPagar} />
        </TabsContent>
      </Tabs>

      <DarBaixaReceberDialog
        conta={contaReceberSelecionada}
        onOpenChange={(open) => { if (!open) setContaReceberSelecionada(null); }}
      />
      <DarBaixaPagarDialog
        conta={contaPagarSelecionada}
        onOpenChange={(open) => { if (!open) setContaPagarSelecionada(null); }}
      />
      <NovaContaPagarDialog
        open={novaContaAberta}
        onOpenChange={setNovaContaAberta}
      />
    </div>
  );
}
