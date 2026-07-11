import { Icon } from "@iconify/react";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { precoHoraDoEquipamento } from "@/features/faturamento/calculo";
import { formatBRL } from "@/features/retaguarda/format";
import { CardSecao } from "@/shared/components/card-secao";
import type { Equipamento } from "@/shared/types";

export function CustoHoraCard({ equipamento }: { equipamento: Equipamento }) {
  const precos = precoHoraMaquinaStore.useAll();
  const preco = precoHoraDoEquipamento(equipamento, precos);

  return (
    <CardSecao titulo="Custo-hora" icone="lucide:coins" bodyClassName="p-4">
      {preco ? (
        <div className="grid grid-cols-2 gap-3">
          <Celula
            rotulo="Máquina seca"
            valor={formatBRL(preco.valor_hora_seca)}
            legenda="depreciação + manutenção"
          />
          <Celula
            rotulo="Máquina operada"
            valor={formatBRL(preco.valor_hora_operada)}
            legenda="+ operador + diesel"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
          <Icon icon="lucide:tag" className="h-6 w-6 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">Preço-hora não configurado</p>
        </div>
      )}
    </CardSecao>
  );
}

function Celula({ rotulo, valor, legenda }: { rotulo: string; valor: string; legenda: string }) {
  return (
    <div className="rounded-lg border bg-surface/50 p-3.5">
      <div className="font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
        {rotulo}
      </div>
      <div className="mt-1 font-mono text-xl font-bold text-foreground">
        {valor}
        <span className="ml-0.5 text-xs font-semibold text-muted-foreground">/h</span>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{legenda}</div>
    </div>
  );
}
