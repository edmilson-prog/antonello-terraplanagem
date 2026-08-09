import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataList, type Column } from "@/shared/components/data-list";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { StatusAtivo } from "@/shared/components/status-ativo";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { PlanoManutencaoForm } from "@/features/manutencao/components/plano-manutencao-form";
import { descreverVinculoPlano } from "@/features/manutencao/labels";
import type { Equipamento, PlanoManutencao } from "@/shared/types";
import { cn } from "@/lib/utils";

interface PlanosTabProps {
  planos: PlanoManutencao[];
  equipamentos: Equipamento[];
}

export function PlanosTab({ planos, equipamentos }: PlanosTabProps) {
  const { isLoading, error, retry } = useMockResource(planos);

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<PlanoManutencao | null>(null);
  const [inativando, setInativando] = useState<PlanoManutencao | null>(null);

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (p: PlanoManutencao) => {
    setEditando(p);
    setFormAberto(true);
  };

  const confirmarInativar = () => {
    if (!inativando) return;
    planosManutencaoStore.setAtivo(inativando.id, false);
    toast.success("Plano inativado.");
    setInativando(null);
  };
  const reativar = (p: PlanoManutencao) => {
    planosManutencaoStore.setAtivo(p.id, true);
    toast.success("Plano reativado.");
  };

  const columns: Column<PlanoManutencao>[] = [
    {
      header: "Descrição",
      cell: (p) => (
        <div className={cn("min-w-0 max-w-[22rem]", !p.ativo && "opacity-60")}>
          <div className="truncate font-medium text-foreground">{p.descricao}</div>
          <div className="truncate text-xs text-foreground-faint">
            {descreverVinculoPlano(p, equipamentos)}
          </div>
        </div>
      ),
    },
    { header: "Intervalo", className: "font-mono", cell: (p) => `${p.intervalo_horas} h` },
    { header: "Status", cell: (p) => <StatusAtivo ativo={p.ativo} /> },
  ];

  const rowActions = (p: PlanoManutencao) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(p)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {p.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(p)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(p)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (p: PlanoManutencao) => (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !p.ativo && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display font-bold text-card-foreground">{p.descricao}</div>
          <div className="text-xs text-foreground-faint">
            {descreverVinculoPlano(p, equipamentos)}
          </div>
        </div>
        <StatusAtivo ativo={p.ativo} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-foreground-faint">Intervalo</dt>
          <dd className="font-mono text-foreground">{p.intervalo_horas} h</dd>
        </div>
      </dl>
      <div className="mt-3 flex justify-end">{rowActions(p)}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={abrirNovo}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          <Icon icon="lucide:plus" className="h-4 w-4" />
          Novo plano
        </Button>
      </div>

      <DataList
        data={planos}
        columns={columns}
        getRowKey={(p) => p.id}
        gridKey="admin-manutencao-planos"
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        rowActions={rowActions}
        empty={{
          icon: "lucide:wrench",
          titulo: "Nenhum plano cadastrado",
          descricao: "Cadastre o primeiro plano de manutenção preventiva.",
          cta: (
            <Button
              onClick={abrirNovo}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              <Icon icon="lucide:plus" className="h-4 w-4" />
              Novo plano
            </Button>
          ),
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo={editando ? "Editar plano" : "Novo plano de manutenção"}
        descricao="Os campos com * são obrigatórios."
      >
        <PlanoManutencaoForm
          inicial={editando}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!inativando}
        onOpenChange={(o) => !o && setInativando(null)}
        titulo="Inativar plano?"
        descricao={`"${inativando?.descricao ?? ""}" deixará de gerar alertas, mas permanece no histórico.`}
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
