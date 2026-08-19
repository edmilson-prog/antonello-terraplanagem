import { CardSecao } from "@/shared/components/card-secao";
import { DataRow } from "@/shared/components/data-row";
import type { Equipamento } from "@/shared/types";
import type { FichaTecnica } from "@/features/equipamentos/derivacoes";

/*
 * Marca, ano, aquisição e descrição são opcionais no cadastro — e a forma de
 * aquisição importa de verdade (a parcela do FINAME entra no custo fixo do
 * PRD-013). Ausência vira travessão; antes vinha sorteada de um pool.
 */
export function FichaTecnicaCard({
  equipamento,
  ficha,
}: {
  equipamento: Equipamento;
  ficha: FichaTecnica;
}) {
  return (
    <CardSecao titulo="Ficha técnica" icone="lucide:clipboard-list" bodyClassName="px-4 py-1.5">
      <DataRow icone="lucide:factory" rotulo="Marca/Modelo">
        {ficha.marcaModelo ?? <Vazio />}
      </DataRow>
      <DataRow icone="lucide:calendar" rotulo="Ano">
        {ficha.ano ? <span className="font-mono">{ficha.ano}</span> : <Vazio />}
      </DataRow>
      <DataRow icone="lucide:weight" rotulo="Capacidade">
        {equipamento.capacidade}
        {ficha.descricao ? (
          <>
            {" · "}
            <small className="text-muted-foreground">{ficha.descricao}</small>
          </>
        ) : null}
      </DataRow>
      <DataRow icone="lucide:hash" rotulo="Placa / patrimônio">
        {equipamento.identificador ? (
          <span className="font-mono">{equipamento.identificador}</span>
        ) : (
          <Vazio />
        )}
      </DataRow>
      <DataRow icone="lucide:landmark" rotulo="Aquisição">
        {ficha.aquisicao ?? <Vazio />}
      </DataRow>
    </CardSecao>
  );
}

function Vazio() {
  return <span className="text-muted-foreground">—</span>;
}
