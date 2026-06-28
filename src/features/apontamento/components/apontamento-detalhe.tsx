import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HorimetroCapture } from "@/shared/components/horimetro-capture";
import { SyncBadge } from "@/shared/components/sync-badge";
import { StatusApontamentoBadge } from "@/features/apontamento/components/status-apontamento-badge";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { ordensOperador } from "@/mocks/ordens-operador";
import { formatHorimetro, formatDataHora } from "@/shared/lib/format";

interface Props {
  apontamentoId: string;
}

export function ApontamentoDetalhe({ apontamentoId }: Props) {
  const apontamento = apontamentosStore.useApontamento(apontamentoId);
  const [horimetroFinal, setHorimetroFinal] = useState("");
  const [fotoFinalUrl, setFotoFinalUrl] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  if (!apontamento) return <ApontamentoNaoEncontrado />;

  const equipamento = equipamentosStore.getById(apontamento.equipamento_id);
  const os = apontamento.os_id
    ? ordensOperador.find((o) => o.id === apontamento.os_id)
    : null;

  function confirmarFinalizacao() {
    if (!apontamento) return;
    const valor = Number(horimetroFinal);
    if (horimetroFinal.trim() === "" || !Number.isFinite(valor) || valor < 0) {
      setErro("Informe o horímetro final.");
      return;
    }
    const r = apontamentosStore.finalizar(apontamento.id, {
      horimetro_final: valor,
      foto_final_url: fotoFinalUrl,
    });
    if (!r.ok) {
      setErro(
        r.erro === "final_menor_que_inicial"
          ? `O horímetro final não pode ser menor que o inicial (${apontamento.horimetro_inicial}).`
          : "Não foi possível finalizar este apontamento.",
      );
      return;
    }
    setErro(null);
    toast.success(`Apontamento finalizado — ${r.apontamento.horas_trabalhadas} h.`);
  }

  return (
    <div className="space-y-5">
      <Link
        to="/app/apontamento"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Meus apontamentos
      </Link>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 className="font-display text-xl font-bold text-card-foreground">
              {equipamento?.nome ?? "Equipamento"}
            </h2>
            {os ? (
              <p className="text-sm text-muted-foreground">
                {os.numero} — {os.obra}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Sem OS vinculada</p>
            )}
          </div>
          <StatusApontamentoBadge status={apontamento.status} />
        </div>
        {apontamento.pendente_sync ? (
          <div className="mt-3">
            <SyncBadge />
          </div>
        ) : null}
      </div>

      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Horímetro
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <CampoHorimetro rotulo="Inicial" valor={apontamento.horimetro_inicial} />
          <CampoHorimetro rotulo="Final" valor={apontamento.horimetro_final} />
        </div>
        {apontamento.horas_trabalhadas != null ? (
          <div className="flex items-center justify-between rounded-md bg-surface px-3 py-2 text-sm">
            <span className="text-muted-foreground">Horas trabalhadas</span>
            <span className="font-mono text-base font-semibold text-foreground">
              {apontamento.horas_trabalhadas} h
            </span>
          </div>
        ) : null}
      </section>

      {apontamento.observacao ? (
        <section className="space-y-2 rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground-faint">
            <Icon icon="lucide:sticky-note" className="h-4 w-4" />
            Observação
          </div>
          <p className="text-sm text-card-foreground">{apontamento.observacao}</p>
        </section>
      ) : null}

      <section className="space-y-2 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Registro
        </h3>
        <LinhaInfo rotulo="Iniciado em" valor={formatDataHora(apontamento.iniciado_em)} />
        <LinhaInfo rotulo="Finalizado em" valor={formatDataHora(apontamento.finalizado_em)} />
      </section>

      {apontamento.status === "em_andamento" ? (
        <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Finalizar apontamento
          </h3>
          <HorimetroCapture
            label="Horímetro final *"
            value={horimetroFinal}
            onChange={(v) => {
              setHorimetroFinal(v);
              setErro(null);
            }}
            ocrBase={apontamento.horimetro_inicial}
            onFotoCapturada={setFotoFinalUrl}
            error={erro ?? undefined}
          />
          <Button
            type="button"
            size="lg"
            onClick={confirmarFinalizacao}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:check-circle-2" className="h-4 w-4" />
            Finalizar e calcular horas
          </Button>
        </section>
      ) : null}
    </div>
  );
}

function CampoHorimetro({ rotulo, valor }: { rotulo: string; valor: number | null }) {
  return (
    <div className="rounded-md border bg-surface/50 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-foreground-faint">
        <Icon icon="lucide:gauge" className="h-3 w-3" />
        {rotulo}
      </div>
      <div className="mt-1 font-mono text-lg font-semibold text-foreground">
        {valor != null ? formatHorimetro(valor) : "—"}
      </div>
    </div>
  );
}

function LinhaInfo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className="font-mono text-foreground">{valor}</span>
    </div>
  );
}

export function ApontamentoNaoEncontrado() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="font-display text-xl font-bold text-foreground">Apontamento não encontrado</h2>
      <p className="text-sm text-muted-foreground">
        Este apontamento pode ter sido removido ou não pertence a você.
      </p>
      <Link
        to="/app/apontamento"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Voltar para Meus apontamentos
      </Link>
    </div>
  );
}
