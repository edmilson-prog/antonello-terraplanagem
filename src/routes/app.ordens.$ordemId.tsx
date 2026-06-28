import { useState } from "react";
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Truck,
  Calendar,
  Gauge,
  StickyNote,
  Play,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { StatusOrdemBadge } from "@/features/operador/status-ordem-badge";
import {
  finalizarOrdem,
  iniciarTurno,
  obterOrdem,
  useOrdem,
} from "@/features/operador/ordens-store";

export const Route = createFileRoute("/app/ordens/$ordemId")({
  loader: ({ params }) => {
    if (!obterOrdem(params.ordemId)) throw notFound();
    return null;
  },
  head: ({ params }) => ({
    meta: [{ title: `${obterOrdem(params.ordemId)?.numero ?? "OS"} · Antonello` }],
  }),
  component: OrdemDetalhePage,
  notFoundComponent: OrdemNaoEncontrada,
});

function formatarDataHora(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrdemDetalhePage() {
  const { ordemId } = Route.useParams();
  const router = useRouter();
  const ordem = useOrdem(ordemId);
  const [dialogoIniciar, setDialogoIniciar] = useState(false);
  const [dialogoFinalizar, setDialogoFinalizar] = useState(false);
  const [horimetroInicio, setHorimetroInicio] = useState("");
  const [horimetroFim, setHorimetroFim] = useState("");

  if (!ordem) return <OrdemNaoEncontrada />;

  const horasTrabalhadas =
    ordem.horimetro_inicio != null && ordem.horimetro_fim != null
      ? ordem.horimetro_fim - ordem.horimetro_inicio
      : null;

  const confirmarInicio = () => {
    const valor = Number(horimetroInicio);
    if (!Number.isFinite(valor) || valor < 0) {
      toast.error("Informe o horímetro inicial.");
      return;
    }
    iniciarTurno(ordem.id);
    // Reaplica o horímetro informado, pois iniciarTurno usa o existente.
    const o = obterOrdem(ordem.id);
    if (o) o.horimetro_inicio = valor;
    toast.success("Turno iniciado.", { description: `Horímetro: ${valor} h` });
    setDialogoIniciar(false);
    setHorimetroInicio("");
    router.invalidate();
  };

  const confirmarFim = () => {
    const valor = Number(horimetroFim);
    if (!Number.isFinite(valor) || valor < 0) {
      toast.error("Informe o horímetro final.");
      return;
    }
    if (ordem.horimetro_inicio != null && valor < ordem.horimetro_inicio) {
      toast.error("Horímetro final menor que o inicial.");
      return;
    }
    finalizarOrdem(ordem.id, valor);
    toast.success("OS finalizada.");
    setDialogoFinalizar(false);
    setHorimetroFim("");
    router.invalidate();
  };

  return (
    <div className="space-y-5">
      <div>
        <Link
          to="/app/ordens"
          search={{ q: "", status: "todas" }}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Minhas OS
        </Link>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="font-mono text-sm font-semibold text-foreground">
              {ordem.numero}
            </div>
            <h2 className="font-display text-xl font-bold text-card-foreground">
              {ordem.cliente_nome}
            </h2>
            <p className="text-sm text-muted-foreground">{ordem.obra}</p>
          </div>
          <StatusOrdemBadge status={ordem.status} />
        </div>
      </div>

      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Detalhes
        </h3>
        <Detalhe icone={Building2} rotulo="Cliente" valor={ordem.cliente_nome} />
        <Detalhe icone={MapPin} rotulo="Endereço" valor={ordem.endereco} />
        <Detalhe icone={Truck} rotulo="Equipamento" valor={ordem.equipamento_nome} />
        <Detalhe
          icone={Calendar}
          rotulo="Abertura"
          valor={formatarDataHora(ordem.data_abertura)}
        />
        {ordem.data_fechamento ? (
          <Detalhe
            icone={Calendar}
            rotulo="Fechamento"
            valor={formatarDataHora(ordem.data_fechamento)}
          />
        ) : null}
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Horímetro
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <CampoHorimetro rotulo="Início" valor={ordem.horimetro_inicio} />
          <CampoHorimetro rotulo="Fim" valor={ordem.horimetro_fim} />
        </div>
        {horasTrabalhadas != null ? (
          <div className="flex items-center justify-between rounded-md bg-surface px-3 py-2 text-sm">
            <span className="text-muted-foreground">Horas no equipamento</span>
            <span className="font-mono text-base font-semibold text-foreground">
              {horasTrabalhadas} h
            </span>
          </div>
        ) : null}
      </section>

      {ordem.observacoes ? (
        <section className="space-y-2 rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground-faint">
            <StickyNote className="h-4 w-4" />
            Observações
          </div>
          <p className="text-sm text-card-foreground">{ordem.observacoes}</p>
        </section>
      ) : null}

      {/*
        REGRA RÍGIDA: o app do operador NUNCA exibe preço, valor por hora,
        total a faturar ou qualquer outro dado financeiro.
      */}
      {ordem.status === "aberta" ? (
        <Button
          size="lg"
          onClick={() => {
            setHorimetroInicio(String(ordem.horimetro_inicio ?? ""));
            setDialogoIniciar(true);
          }}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          <Play className="h-4 w-4" />
          Iniciar turno
        </Button>
      ) : null}

      {ordem.status === "em_andamento" ? (
        <Button
          size="lg"
          onClick={() => {
            setHorimetroFim(
              String(ordem.horimetro_fim ?? (ordem.horimetro_inicio ?? 0) + 8),
            );
            setDialogoFinalizar(true);
          }}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          <CheckCircle2 className="h-4 w-4" />
          Finalizar OS
        </Button>
      ) : null}

      <Dialog open={dialogoIniciar} onOpenChange={setDialogoIniciar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar turno</DialogTitle>
            <DialogDescription>
              Confirme o horímetro do equipamento no início do turno.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="horimetro-inicio">Horímetro inicial (h)</Label>
            <Input
              id="horimetro-inicio"
              type="number"
              inputMode="numeric"
              value={horimetroInicio}
              onChange={(e) => setHorimetroInicio(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoIniciar(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarInicio} className="bg-primary text-primary-foreground hover:bg-primary-hover">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogoFinalizar} onOpenChange={setDialogoFinalizar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar OS</DialogTitle>
            <DialogDescription>
              Informe o horímetro do equipamento ao encerrar o turno.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="horimetro-fim">Horímetro final (h)</Label>
            <Input
              id="horimetro-fim"
              type="number"
              inputMode="numeric"
              value={horimetroFim}
              onChange={(e) => setHorimetroFim(e.target.value)}
            />
            {ordem.horimetro_inicio != null ? (
              <p className="text-xs text-muted-foreground">
                Horímetro inicial: {ordem.horimetro_inicio} h
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoFinalizar(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarFim} className="bg-primary text-primary-foreground hover:bg-primary-hover">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detalhe({
  icone: Icone,
  rotulo,
  valor,
}: {
  icone: LucideIcon;
  rotulo: string;
  valor: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface text-muted-foreground">
        <Icone className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-mono uppercase tracking-wide text-foreground-faint">
          {rotulo}
        </div>
        <div className="text-sm font-medium text-card-foreground">{valor}</div>
      </div>
    </div>
  );
}

function CampoHorimetro({ rotulo, valor }: { rotulo: string; valor: number | null }) {
  return (
    <div className="rounded-md border bg-surface/50 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-foreground-faint">
        <Gauge className="h-3 w-3" />
        {rotulo}
      </div>
      <div className="mt-1 font-mono text-lg font-semibold text-foreground">
        {valor != null ? `${valor} h` : "—"}
      </div>
    </div>
  );
}

function OrdemNaoEncontrada() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="font-display text-xl font-bold text-foreground">OS não encontrada</h2>
      <p className="text-sm text-muted-foreground">
        Esta ordem pode ter sido removida ou ainda não foi atribuída a você.
      </p>
      <Link
        to="/app/ordens"
        search={{ q: "", status: "todas" }}
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Minhas OS
      </Link>
    </div>
  );
}
