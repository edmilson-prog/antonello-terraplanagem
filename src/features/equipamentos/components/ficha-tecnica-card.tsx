import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { CardSecao } from "@/shared/components/card-secao";
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
      <Drow icone="lucide:factory" rotulo="Marca/Modelo">
        {ficha.marcaModelo}
      </Drow>
      <Drow icone="lucide:calendar" rotulo="Ano">
        <span className="font-mono">{ficha.ano}</span>
      </Drow>
      <Drow icone="lucide:weight" rotulo="Capacidade">
        {equipamento.capacidade} ·{" "}
        <small className="text-muted-foreground">{ficha.descricao}</small>
      </Drow>
      <Drow icone="lucide:hash" rotulo="Placa / patrimônio">
        <span className="font-mono">{equipamento.identificador ?? "—"}</span>
      </Drow>
      <Drow icone="lucide:landmark" rotulo="Aquisição">
        {ficha.aquisicao}
      </Drow>
    </CardSecao>
  );
}

function Drow({ icone, rotulo, children }: { icone: string; rotulo: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-muted-foreground">
        <Icon icon={icone} className="h-4 w-4" />
      </span>
      <div>
        <div className="font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
          {rotulo}
        </div>
        <div className="mt-0.5 text-[13.5px] font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}
