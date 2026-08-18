import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { KpiHeroi } from "@/shared/components/kpi-heroi";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { DataRow } from "@/shared/components/data-row";
import { EmptyState } from "@/shared/components/empty-state";
import { notificacoesRetaguardaStore } from "@/features/notificacoes/retaguarda-store";
import { preferenciasNotificacaoStore } from "@/features/notificacoes/preferencias-store";
import { CaixaNotificacoesCard } from "@/features/notificacoes/components/caixa-notificacoes-card";
import {
  filtrarNotificacoes,
  maisDisparadas,
  resumoDisparos,
  resumoPush,
  falhasPorCanal,
  type FiltroCentral,
} from "@/features/notificacoes/retaguarda-derivacoes";
import {
  CANAL_LABEL,
  CATEGORIAS,
  CATEGORIA_LABEL,
  EVENTO_LABEL,
} from "@/features/notificacoes/retaguarda-labels";
import type { TipoNotificacao } from "@/shared/types";
import { cn } from "@/lib/utils";

/*
 * Central de notificações da RETAGUARDA (Onda 19) — a caixa de entrada do
 * escritório. Não confundir com `notificacoes-page.tsx`, que é a central do
 * OPERADOR no app de campo (PRD-020): telas diferentes, stores diferentes, e
 * até destinatário diferente na mesma tabela (`usuario_id` aqui,
 * `operador_id` lá).
 */

const FILTROS: { id: FiltroCentral; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "nao_lidas", label: "Não lidas" },
  ...CATEGORIAS.map((c) => ({ id: c as FiltroCentral, label: CATEGORIA_LABEL[c] })),
];

const percentual = (v: number | null) =>
  v == null ? "—" : `${(v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

export function CentralNotificacoesPage() {
  const itens = notificacoesRetaguardaStore.useNotificacoes();
  const entregas = notificacoesRetaguardaStore.useEntregas();
  const entregas7d = notificacoesRetaguardaStore.useEntregas7d();
  const doMes = notificacoesRetaguardaStore.useDoMes();
  const { isLoading, error } = notificacoesRetaguardaStore.useEstado();
  const aparelhos = preferenciasNotificacaoStore.useAparelhos();
  const [filtro, setFiltro] = useState<FiltroCentral>("todas");

  const naoLidas = itens.filter((n) => n.lida_em === null);
  const lista = useMemo(() => filtrarNotificacoes(itens, filtro), [itens, filtro]);
  const disparos = useMemo(() => resumoDisparos(doMes, entregas7d), [doMes, entregas7d]);
  const push = useMemo(() => resumoPush(entregas7d), [entregas7d]);
  const falhas = useMemo(() => falhasPorCanal(entregas7d), [entregas7d]);
  const topTipos = useMemo(() => maisDisparadas(doMes), [doMes]);

  const criticasNaoLidas = naoLidas.filter((n) => n.prioridade === "critico").length;

  const marcarLida = (id: string) => {
    void notificacoesRetaguardaStore.marcarLidas([id]);
  };

  const marcarTodas = async () => {
    if (naoLidas.length === 0) {
      toast.info("Nenhuma notificação não lida.");
      return;
    }
    try {
      await notificacoesRetaguardaStore.marcarTodasLidas();
      toast.success("Tudo marcado como lido.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível marcar como lidas.");
    }
  };

  if (error) {
    return (
      <EmptyState
        icon="lucide:circle-alert"
        titulo="Não foi possível carregar as notificações"
        descricao={error.message}
        acao={
          <Button variant="outline" onClick={() => void notificacoesRetaguardaStore.retry()}>
            Tentar de novo
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Notificações
        </h1>
        <CardPill>{naoLidas.length > 0 ? `${naoLidas.length} não lidas` : "tudo lido"}</CardPill>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="ghost" className="gap-2" onClick={() => void marcarTodas()}>
            <Icon icon="lucide:check" className="h-4 w-4" />
            Marcar todas como lidas
          </Button>
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/admin/notificacoes/preferencias">
              <Icon icon="lucide:sliders-horizontal" className="h-4 w-4" />
              Preferências
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link to="/admin/notificacoes/nova">
              <Icon icon="lucide:bell" className="h-4 w-4" />
              Nova notificação
            </Link>
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiHeroi
          rotulo="Não lidas"
          valor={String(naoLidas.length)}
          icone="lucide:bell"
          alerta={criticasNaoLidas > 0}
          rodape={
            naoLidas.length === 0
              ? "caixa em dia"
              : criticasNaoLidas > 0
                ? `${criticasNaoLidas} ${criticasNaoLidas === 1 ? "crítica" : "críticas"}`
                : "nenhuma crítica"
          }
        />
        <KpiHeroi
          rotulo="Disparos hoje"
          valor={String(disparos.hoje)}
          icone="lucide:arrow-up-right"
          rodape={`${disparos.porCanalHoje.app} in-app · ${disparos.porCanalHoje.push} push · ${disparos.porCanalHoje.email} e-mail`}
          spark={push.serie}
        />
        <KpiHeroi
          rotulo="Push entregues (7 d)"
          valor={percentual(push.taxaEntrega)}
          icone="lucide:smartphone"
          rodape={
            push.enviados === 0
              ? "nenhum push no período"
              : `${push.entregues} de ${push.enviados} · ${push.aparelhos} ${push.aparelhos === 1 ? "aparelho" : "aparelhos"}`
          }
        />
        <KpiHeroi
          rotulo="Falhas de entrega"
          valor={String(
            push.falhas + falhas.reduce((s, f) => (f.canal === "push" ? 0 : s + f.total), 0),
          )}
          icone="lucide:circle-alert"
          alerta={falhas.length > 0}
          rodape={
            falhas.length === 0
              ? "nenhuma falha em 7 dias"
              : falhas.map((f) => `${f.total} ${CANAL_LABEL[f.canal].toLowerCase()}`).join(" · ")
          }
        />
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {FILTROS.map((f) => {
              const ativo = filtro === f.id;
              const contador = f.id === "nao_lidas" ? naoLidas.length : null;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFiltro(f.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    ativo
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {f.label}
                  {contador != null && contador > 0 ? (
                    <span className="rounded-full bg-primary px-1.5 font-mono text-[10px] text-primary-foreground">
                      {contador}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {isLoading && itens.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground">
              Carregando…
            </div>
          ) : (
            <CaixaNotificacoesCard itens={lista} entregas={entregas} onMarcarLida={marcarLida} />
          )}

          <div className="flex items-start gap-3 rounded-xl border border-dashed bg-surface/60 p-4 text-sm text-muted-foreground">
            <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Cada pessoa da retaguarda tem a própria caixa — marcar como lida aqui não apaga o
              aviso dos colegas. Eventos <strong className="text-foreground">críticos</strong>{" "}
              ignoram o horário silencioso e o limite por hora, definidos em{" "}
              <Link to="/admin/notificacoes/preferencias" className="font-semibold text-primary">
                Preferências
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <CardSecao titulo="Canais" icone="lucide:link" bodyClassName="p-4">
            <DataRow icone="lucide:bell" rotulo="In-app · Retaguarda">
              <SeloCanal ativo>Ativo</SeloCanal>
            </DataRow>
            <DataRow icone="lucide:smartphone" rotulo="Push · App de campo">
              <SeloCanal ativo>
                {aparelhos.length} {aparelhos.length === 1 ? "aparelho" : "aparelhos"}
              </SeloCanal>
            </DataRow>
            <DataRow icone="lucide:mail" rotulo="E-mail">
              <SeloCanal ativo={push.enviados >= 0}>Resend</SeloCanal>
            </DataRow>
            <DataRow icone="lucide:message-circle" rotulo="WhatsApp">
              <SeloCanal>Não configurado</SeloCanal>
            </DataRow>
          </CardSecao>

          <CardSecao
            titulo="Push — últimos 7 dias"
            icone="lucide:smartphone"
            acessorio={<CardPill>{push.enviados} envios</CardPill>}
            bodyClassName="p-4"
          >
            <DataRow icone="lucide:check" rotulo="Entregues">
              <span className="font-mono text-sm text-foreground">{push.entregues}</span>
              <span className="ml-1 text-xs text-muted-foreground">
                {percentual(push.taxaEntrega)}
              </span>
            </DataRow>
            <DataRow icone="lucide:eye" rotulo="Abertos">
              <span className="font-mono text-sm text-foreground">{push.abertos}</span>
              <span className="ml-1 text-xs text-muted-foreground">
                {percentual(push.taxaAbertura)}
              </span>
            </DataRow>
            <DataRow icone="lucide:clock" rotulo="Tempo médio até abrir">
              <span className="font-mono text-sm text-foreground">
                {push.minutosAteAbrir != null ? `${push.minutosAteAbrir} min` : "—"}
              </span>
            </DataRow>
            <DataRow icone="lucide:circle-alert" rotulo="Falhas">
              <span className="font-mono text-sm text-foreground">{push.falhas}</span>
            </DataRow>
          </CardSecao>

          <CardSecao titulo="Mais disparadas no mês" icone="lucide:bar-chart-3" bodyClassName="p-4">
            {topTipos.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum disparo nos últimos 30 dias.
              </p>
            ) : (
              topTipos.map((t) => (
                <DataRow
                  key={t.tipo}
                  icone="lucide:bell"
                  rotulo={EVENTO_LABEL[t.tipo as TipoNotificacao]?.nome ?? t.tipo}
                >
                  <span className="font-mono text-sm text-foreground">{t.total}</span>
                </DataRow>
              ))
            )}
          </CardSecao>
        </div>
      </div>
    </div>
  );
}

function SeloCanal({ ativo, children }: { ativo?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        ativo
          ? "border-success/35 bg-success/15 text-success-foreground"
          : "border-steel/40 bg-steel/15 text-muted-foreground",
      )}
    >
      {ativo ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
