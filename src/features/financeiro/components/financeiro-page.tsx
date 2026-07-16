import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/shared/components/page-header";
import { ContasReceberTab } from "@/features/financeiro/components/contas-receber-tab";
import { ContasPagarTab } from "@/features/financeiro/components/contas-pagar-tab";
import { CaixaTab } from "@/features/financeiro/components/caixa-tab";
import { DarBaixaReceberDialog } from "@/features/financeiro/components/dar-baixa-receber-dialog";
import { DarBaixaPagarDialog } from "@/features/financeiro/components/dar-baixa-pagar-dialog";
import { EmitirCobrancaDialog } from "@/features/cobranca-gateway/components/emitir-cobranca-dialog";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";
import { cobrancasStore } from "@/features/cobranca-gateway/cobrancas-store";
import { PrevisaoCaixaCard } from "@/features/ia/components/previsao-caixa-card";
import { clientesStore } from "@/features/clientes/clientes-store";
import type { ContaReceber, ContaPagar, CobrancaGateway } from "@/shared/types";

export function FinanceiroPage() {
  const contasReceber = contasReceberStore.useTodas();
  const contasPagar = contasPagarStore.useTodas();
  const clientes = clientesStore.useAll();

  const [contaReceberSelecionada, setContaReceberSelecionada] = useState<ContaReceber | null>(null);
  const [contaPagarSelecionada, setContaPagarSelecionada] = useState<ContaPagar | null>(null);
  const [contaParaEmitirCobranca, setContaParaEmitirCobranca] = useState<ContaReceber | null>(null);

  function handleSimularPagamento(cobranca: CobrancaGateway) {
    const r = cobrancasStore.simularWebhookPago(cobranca.id);
    if (r.ok) {
      toast.success("Pagamento confirmado (simulado) — conta liquidada automaticamente.");
    } else {
      toast.error(r.motivo);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader titulo="Financeiro" descricao="Contas a receber, a pagar e visão de caixa" />

      <PrevisaoCaixaCard contasReceber={contasReceber} clientes={clientes} />

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
            onEmitirCobranca={setContaParaEmitirCobranca}
            onSimularPagamento={handleSimularPagamento}
          />
        </TabsContent>
        <TabsContent value="pagar" className="mt-4">
          <ContasPagarTab contasPagar={contasPagar} onDarBaixa={setContaPagarSelecionada} />
        </TabsContent>
        <TabsContent value="caixa" className="mt-4">
          <CaixaTab contasReceber={contasReceber} contasPagar={contasPagar} />
        </TabsContent>
      </Tabs>

      <DarBaixaReceberDialog
        conta={contaReceberSelecionada}
        onOpenChange={(open) => {
          if (!open) setContaReceberSelecionada(null);
        }}
      />
      <DarBaixaPagarDialog
        conta={contaPagarSelecionada}
        onOpenChange={(open) => {
          if (!open) setContaPagarSelecionada(null);
        }}
      />
      <EmitirCobrancaDialog
        conta={contaParaEmitirCobranca}
        onOpenChange={(open) => {
          if (!open) setContaParaEmitirCobranca(null);
        }}
      />
    </div>
  );
}
