import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { formatAcessoRelativo } from "@/shared/lib/format";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { AcessoAppCard } from "@/features/operadores/components/acesso-app-card";
import { ApontamentosRecentesCard } from "@/features/operadores/components/apontamentos-recentes-card";
import { DadosCadastraisCard } from "@/features/operadores/components/dados-cadastrais-card";
import { EquipamentosHabilitadosCard } from "@/features/operadores/components/equipamentos-habilitados-card";
import { HorasSemanaCard } from "@/features/operadores/components/horas-semana-card";
import { OperadorForm } from "@/features/operadores/components/operador-form";
import { OperadorHero } from "@/features/operadores/components/operador-hero";
import { OperadorKpis } from "@/features/operadores/components/operador-kpis";
import { OrdensVinculadasCard } from "@/features/operadores/components/ordens-vinculadas-card";
import { montarPainelOperador } from "@/features/operadores/derivacoes";
import { acessoAppStore } from "@/features/operadores/acesso-app-store";
import { habilitacoesStore } from "@/features/operadores/habilitacoes-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { clientesStore } from "@/features/clientes/clientes-store";

export function OperadorDetalhe({ operadorId }: { operadorId: string }) {
  const operador = operadoresStore.useOperador(operadorId);
  const { isLoading, error } = operadoresStore.useEstado();
  const [editando, setEditando] = useState(false);
  const [inativando, setInativando] = useState(false);

  // Tudo que o painel mostra vem destas listas — a retaguarda já as lê por RLS,
  // então derivar aqui evita uma RPC de agregação por card.
  const apontamentos = apontamentosStore.useTodos();
  const ordens = ordensStore.useTodas();
  const equipamentos = equipamentosStore.useAll();
  const clientes = clientesStore.useAll();
  const habilitadosIds = habilitacoesStore.useDoOperador(operadorId);
  const acesso = acessoAppStore.useDoOperador(operadorId);
  const { isLoading: carregandoAcesso } = acessoAppStore.useEstado();

  const painel = useMemo(
    () =>
      operador
        ? montarPainelOperador({
            operador,
            apontamentos,
            ordens,
            equipamentos,
            clientes,
            equipamentosHabilitadosIds: habilitadosIds,
          })
        : null,
    [operador, apontamentos, ordens, equipamentos, clientes, habilitadosIds],
  );

  const voltar = (
    <Link
      to="/admin/operadores"
      className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <Icon icon="lucide:arrow-left" className="h-4 w-4" />
      Operadores
    </Link>
  );

  if (isLoading) {
    return (
      <div>
        {voltar}
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {voltar}
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center"
        >
          <Icon icon="lucide:triangle-alert" className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" onClick={operadoresStore.retry} className="gap-2">
            <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!operador || !painel) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="font-display text-xl font-bold text-foreground">Operador não encontrado</h2>
        <Link
          to="/admin/operadores"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          <Icon icon="lucide:arrow-left" className="h-4 w-4" />
          Voltar para Operadores
        </Link>
      </div>
    );
  }

  const reativar = async () => {
    try {
      await operadoresStore.setAtivo(operador.id, true);
      toast.success("Operador reativado.");
    } catch (err) {
      toast.error(`Falha ao reativar o operador${err instanceof Error ? `: ${err.message}` : ""}`);
    }
  };

  const confirmarInativar = async () => {
    try {
      await operadoresStore.setAtivo(operador.id, false);
      toast.success("Operador inativado.");
    } catch (err) {
      toast.error(`Falha ao inativar o operador${err instanceof Error ? `: ${err.message}` : ""}`);
    }
    setInativando(false);
  };

  return (
    <div>
      {voltar}

      {editando ? (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Editar dados básicos
          </h3>
          <OperadorForm
            inicial={operador}
            onSuccess={() => setEditando(false)}
            onCancel={() => setEditando(false)}
          />
        </section>
      ) : (
        <div className="space-y-4">
          <OperadorHero
            operador={operador}
            ultimaAtividade={acesso ? formatAcessoRelativo(acesso.ultimoAcesso) : null}
            onEditar={() => setEditando(true)}
            onInativar={() => setInativando(true)}
            onReativar={reativar}
          />
          <OperadorKpis kpis={painel.kpis} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              <ApontamentosRecentesCard apontamentos={painel.apontamentos} />
              <OrdensVinculadasCard ordens={painel.ordens} />
            </div>
            <div className="space-y-4">
              <DadosCadastraisCard cadastrais={painel.cadastrais} telefone={operador.telefone} />
              <HorasSemanaCard semana={painel.horasSemana} />
              <EquipamentosHabilitadosCard equipamentos={painel.equipamentos} />
              <AcessoAppCard
                acesso={acesso}
                isLoading={carregandoAcesso}
                temApontamentos={painel.totalApontamentos > 0}
              />
            </div>
          </div>
          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-dashed px-4 py-3 text-[12.5px] text-foreground-faint">
            <Icon icon="lucide:lock" className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
            <span>
              Perfil operacional — sem dados financeiros. Custo-hora e valores ficam restritos às
              telas de <b>Custo da Hora</b>, <b>Financeiro</b> e <b>Rentabilidade</b>, conforme o
              particionamento de acesso.
            </span>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={inativando}
        onOpenChange={setInativando}
        titulo="Inativar operador?"
        descricao={`"${operador.nome}" não poderá ser atribuído a novas ordens. Você pode reativá-lo depois.`}
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
