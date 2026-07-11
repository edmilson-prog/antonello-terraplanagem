import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { formatHorimetro } from "@/shared/lib/format";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { EquipamentoForm } from "@/features/equipamentos/components/equipamento-form";
import { EquipamentoHero } from "@/features/equipamentos/components/equipamento-hero";
import { EquipamentoKpis } from "@/features/equipamentos/components/equipamento-kpis";
import { LeiturasHorimetroCard } from "@/features/equipamentos/components/leituras-horimetro-card";
import { ManutencoesCard } from "@/features/equipamentos/components/manutencoes-card";
import { FichaTecnicaCard } from "@/features/equipamentos/components/ficha-tecnica-card";
import { CustoHoraCard } from "@/features/equipamentos/components/custo-hora-card";
import { ProximaManutencaoCard } from "@/features/equipamentos/components/proxima-manutencao-card";
import { UtilizacaoSemanaCard } from "@/features/equipamentos/components/utilizacao-semana-card";
import { showcaseDoEquipamento } from "@/features/equipamentos/equipamento-showcase-data";

export function EquipamentoDetalhe({ equipamentoId }: { equipamentoId: string }) {
  const equipamento = equipamentosStore.useEquipamento(equipamentoId);
  const { isLoading, error } = equipamentosStore.useEstado();
  const [editando, setEditando] = useState(false);
  const [inativando, setInativando] = useState(false);

  const showcase = useMemo(() => showcaseDoEquipamento(equipamentoId), [equipamentoId]);

  const voltar = (
    <Link
      to="/admin/equipamentos"
      className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <Icon icon="lucide:arrow-left" className="h-4 w-4" />
      Equipamentos
    </Link>
  );

  if (isLoading) {
    return (
      <div className="space-y-5">
        {voltar}
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        {voltar}
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center"
        >
          <Icon icon="lucide:triangle-alert" className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" onClick={equipamentosStore.retry} className="gap-2">
            <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!equipamento) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="font-display text-xl font-bold text-foreground">
          Equipamento não encontrado
        </h2>
        <Link
          to="/admin/equipamentos"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          <Icon icon="lucide:arrow-left" className="h-4 w-4" />
          Voltar para Equipamentos
        </Link>
      </div>
    );
  }

  const reativar = async () => {
    try {
      await equipamentosStore.setAtivo(equipamento.id, true);
      toast.success("Equipamento reativado.");
    } catch (err) {
      toast.error(
        `Falha ao reativar o equipamento${err instanceof Error ? `: ${err.message}` : ""}`,
      );
    }
  };

  const confirmarInativar = async () => {
    try {
      await equipamentosStore.setAtivo(equipamento.id, false);
      toast.success("Equipamento inativado.");
    } catch (err) {
      toast.error(
        `Falha ao inativar o equipamento${err instanceof Error ? `: ${err.message}` : ""}`,
      );
    }
    setInativando(false);
  };

  const kpis = {
    ...showcase.kpis,
    horimetro: { ...showcase.kpis.horimetro, valor: formatHorimetro(equipamento.horimetro_atual) },
  };

  return (
    <div className="space-y-6">
      {voltar}

      {editando ? (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Editar dados básicos
          </h3>
          <EquipamentoForm
            inicial={equipamento}
            onSuccess={() => setEditando(false)}
            onCancel={() => setEditando(false)}
          />
        </section>
      ) : (
        <div className="space-y-4">
          <EquipamentoHero
            equipamento={equipamento}
            marcaModelo={showcase.fichaTecnica.marcaModelo}
            ano={showcase.fichaTecnica.ano}
            onEditar={() => setEditando(true)}
            onInativar={() => setInativando(true)}
            onReativar={reativar}
          />
          <EquipamentoKpis kpis={kpis} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              <LeiturasHorimetroCard leituras={showcase.leiturasHorimetro} />
              <ManutencoesCard equipamento={equipamento} />
            </div>
            <div className="space-y-4">
              <FichaTecnicaCard equipamento={equipamento} ficha={showcase.fichaTecnica} />
              <CustoHoraCard equipamento={equipamento} />
              <ProximaManutencaoCard equipamento={equipamento} />
              <UtilizacaoSemanaCard semana={showcase.utilizacaoSemana} />
            </div>
          </div>
          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-dashed px-4 py-3 text-[12.5px] text-foreground-faint">
            <Icon icon="lucide:building-2" className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
            <span>
              Custo-hora, receita e custos de manutenção aparecem por ser a <b>retaguarda</b>. No
              app de campo o equipamento nunca exibe valores.
            </span>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={inativando}
        onOpenChange={setInativando}
        titulo="Inativar equipamento?"
        descricao={`"${equipamento.nome}" deixará de aparecer para novas ordens, mas permanece no histórico. Você pode reativá-lo depois.`}
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
