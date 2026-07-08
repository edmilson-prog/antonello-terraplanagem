import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/shared/components/page-header";
import { AlertasTab } from "@/features/manutencao/components/alertas-tab";
import { PlanosTab } from "@/features/manutencao/components/planos-tab";
import { ConsumoAnomaloTab } from "@/features/manutencao/components/consumo-anomalo-tab";
import { RegistrarManutencaoDialog } from "@/features/manutencao/components/registrar-manutencao-dialog";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { indicadoresPorEquipamento } from "@/features/diesel/derivacoes";
import { alertasManutencao, type AlertaManutencao } from "@/features/manutencao/derivacoes";
import { alertasConsumoAnomalo } from "@/features/ia/mock/analitico";

export function ManutencaoPage() {
  const equipamentos = equipamentosStore.useAll();
  const planos = planosManutencaoStore.useAll();
  const registros = registrosManutencaoStore.useTodos();
  const abastecimentos = abastecimentosStore.useTodos();
  const apontamentos = apontamentosStore.useTodos();
  const alertas = alertasManutencao(equipamentos, planos, registros);
  const indicadores = indicadoresPorEquipamento(equipamentos, abastecimentos, apontamentos);
  const alertasConsumo = alertasConsumoAnomalo(indicadores);

  const [alertaSelecionado, setAlertaSelecionado] = useState<AlertaManutencao | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Manutenção Preventiva"
        descricao="Planos de manutenção por horímetro e alertas da frota."
      />

      <Tabs defaultValue="alertas">
        <TabsList>
          <TabsTrigger value="alertas">
            Alertas{alertas.length > 0 ? ` (${alertas.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="consumo">
            Consumo (IA){alertasConsumo.length > 0 ? ` (${alertasConsumo.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="planos">Planos</TabsTrigger>
        </TabsList>
        <TabsContent value="alertas" className="mt-4">
          <AlertasTab alertas={alertas} onRegistrar={setAlertaSelecionado} />
        </TabsContent>
        <TabsContent value="consumo" className="mt-4">
          <ConsumoAnomaloTab alertas={alertasConsumo} equipamentos={equipamentos} />
        </TabsContent>
        <TabsContent value="planos" className="mt-4">
          <PlanosTab planos={planos} equipamentos={equipamentos} />
        </TabsContent>
      </Tabs>

      <RegistrarManutencaoDialog
        alerta={alertaSelecionado}
        onOpenChange={(open) => {
          if (!open) setAlertaSelecionado(null);
        }}
      />
    </div>
  );
}
