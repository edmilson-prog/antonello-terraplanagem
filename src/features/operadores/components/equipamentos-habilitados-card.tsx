import { Icon } from "@iconify/react";
import { CardSecao } from "@/shared/components/card-secao";
import type { EquipHabilitado } from "@/features/operadores/derivacoes";

export function EquipamentosHabilitadosCard({ equipamentos }: { equipamentos: EquipHabilitado[] }) {
  if (equipamentos.length === 0) {
    return (
      <CardSecao titulo="Equipamentos habilitados" icone="lucide:wrench" bodyClassName="p-6">
        <p className="text-center text-sm text-muted-foreground">
          Nenhum equipamento habilitado. Defina em <b className="text-foreground">Editar</b>.
        </p>
      </CardSecao>
    );
  }

  return (
    <CardSecao
      titulo="Equipamentos habilitados"
      icone="lucide:wrench"
      bodyClassName="flex flex-wrap gap-2 p-4"
    >
      {equipamentos.map((eq) => (
        <span
          key={eq.id}
          className="inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-2 text-sm font-medium text-foreground"
        >
          <Icon icon={eq.icone} className="h-4 w-4 text-primary" />
          {eq.nome}
        </span>
      ))}
    </CardSecao>
  );
}
