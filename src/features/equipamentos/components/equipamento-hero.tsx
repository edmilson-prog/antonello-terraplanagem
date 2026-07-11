import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { EquipamentoStatusBadge, InativoBadge, TIPO_LABEL } from "@/features/equipamentos/labels";
import { formatDataHora, formatHorimetro } from "@/shared/lib/format";
import type { Equipamento } from "@/shared/types";

export interface EquipamentoHeroProps {
  equipamento: Equipamento;
  marcaModelo: string;
  ano: string;
  onEditar: () => void;
  onInativar: () => void;
  onReativar: () => void;
}

export function EquipamentoHero({
  equipamento,
  marcaModelo,
  ano,
  onEditar,
  onInativar,
  onReativar,
}: EquipamentoHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-card to-surface p-6 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-primary/10 blur-2xl"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
        <div
          aria-hidden
          className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover font-display text-3xl font-extrabold text-primary-foreground shadow-lg"
        >
          <Icon icon="lucide:truck" className="h-9 w-9" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide text-foreground sm:text-3xl">
            {equipamento.nome}
          </h1>
          {equipamento.identificador ? (
            <p className="mt-1 font-mono text-xs text-foreground-faint">
              {equipamento.identificador}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {equipamento.ativo ? (
              <EquipamentoStatusBadge status={equipamento.status} />
            ) : (
              <InativoBadge />
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              <Icon icon="lucide:tag" className="h-3.5 w-3.5" />
              {TIPO_LABEL[equipamento.tipo]}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-steel/40 bg-steel/15 px-2.5 py-1 text-xs font-semibold text-foreground">
              <Icon icon="lucide:weight" className="h-3.5 w-3.5" />
              {equipamento.capacidade}
            </span>
          </div>

          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            <Quickfact
              rotulo="Horímetro atual"
              valor={formatHorimetro(equipamento.horimetro_atual)}
              mono
            />
            <Quickfact rotulo="Marca/Modelo" valor={marcaModelo} />
            <Quickfact rotulo="Ano" valor={ano} mono />
            <Quickfact rotulo="Na frota desde" valor={formatDataHora(equipamento.created_at)} />
          </dl>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" onClick={onEditar} className="gap-1.5">
            <Icon icon="lucide:pencil" className="h-4 w-4" />
            Editar
          </Button>
          <Button
            asChild
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Link to="/admin/manutencao">
              <Icon icon="lucide:wrench" className="h-4 w-4" />
              Registrar manutenção
            </Link>
          </Button>
          {equipamento.ativo ? (
            <Button
              variant="outline"
              onClick={onInativar}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Icon icon="lucide:ban" className="h-4 w-4" />
              Inativar
            </Button>
          ) : (
            <Button variant="outline" onClick={onReativar} className="gap-1.5">
              <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
              Reativar
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function Quickfact({ rotulo, valor, mono }: { rotulo: string; valor: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
        {rotulo}
      </dt>
      <dd className={mono ? "font-mono text-sm text-foreground" : "text-sm text-foreground"}>
        {valor}
      </dd>
    </div>
  );
}
