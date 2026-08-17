import { CardSecao } from "@/shared/components/card-secao";
import { DataRow } from "@/shared/components/data-row";
import type { Equipamento } from "@/shared/types";
import type { EquipamentoFichaTecnica } from "@/features/equipamentos/equipamento-showcase-data";

export function FichaTecnicaCard({
  equipamento,
  ficha,
}: {
  equipamento: Equipamento;
  ficha: EquipamentoFichaTecnica;
}) {
  return (
    <CardSecao titulo="Ficha técnica" icone="lucide:clipboard-list" bodyClassName="px-4 py-1.5">
      <DataRow icone="lucide:factory" rotulo="Marca/Modelo">
        {ficha.marcaModelo}
      </DataRow>
      <DataRow icone="lucide:calendar" rotulo="Ano">
        <span className="font-mono">{ficha.ano}</span>
      </DataRow>
      <DataRow icone="lucide:weight" rotulo="Capacidade">
        {equipamento.capacidade} ·{" "}
        <small className="text-muted-foreground">{ficha.descricao}</small>
      </DataRow>
      <DataRow icone="lucide:hash" rotulo="Placa / patrimônio">
        <span className="font-mono">{equipamento.identificador ?? "—"}</span>
      </DataRow>
      <DataRow icone="lucide:landmark" rotulo="Aquisição">
        {ficha.aquisicao}
      </DataRow>
    </CardSecao>
  );
}
