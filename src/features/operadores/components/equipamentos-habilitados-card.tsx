import { Icon } from "@iconify/react";
import { CardSecao } from "@/features/operadores/components/card-secao";
import type { ShowcaseEquip } from "@/features/operadores/operador-showcase-data";

export function EquipamentosHabilitadosCard({ equipamentos }: { equipamentos: ShowcaseEquip[] }) {
  return (
    <CardSecao
      titulo="Equipamentos habilitados"
      icone="lucide:wrench"
      bodyClassName="flex flex-wrap gap-2 p-4"
    >
      {equipamentos.map((eq) => (
        <span
          key={eq.nome}
          className="inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-2 text-sm font-medium text-foreground"
        >
          <Icon icon={eq.icone} className="h-4 w-4 text-primary" />
          {eq.nome}
        </span>
      ))}
    </CardSecao>
  );
}
