import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { DataRow } from "@/shared/components/data-row";
import {
  preferenciasNotificacaoStore,
  type PatchPreferencias,
} from "@/features/notificacoes/preferencias-store";
import {
  CANAIS,
  CANAL_ICONE,
  CANAL_LABEL,
  CATEGORIAS,
  CATEGORIA_LABEL,
  EVENTOS_POR_CATEGORIA,
  EVENTO_LABEL,
} from "@/features/notificacoes/retaguarda-labels";
import { formatDataHora } from "@/shared/lib/format";
import type {
  CanalNotificacao,
  PreferenciaEventoNotificacao,
  TipoNotificacao,
} from "@/shared/types";
import { cn } from "@/lib/utils";

type LinhaMatriz = Omit<PreferenciaEventoNotificacao, "tipo" | "created_at" | "updated_at">;
type Matriz = Record<TipoNotificacao, LinhaMatriz>;

const CAMPO_DO_CANAL: Record<CanalNotificacao, keyof LinhaMatriz> = {
  app: "canal_app",
  push: "canal_push",
  email: "canal_email",
  whatsapp: "canal_whatsapp",
};

// WhatsApp fica desabilitado até um número de envio ser homologado — o próprio
// kit já desenha assim, e o WAHA do projeto atende cliente, não operador.
const CANAL_INDISPONIVEL: Partial<Record<CanalNotificacao, string>> = {
  whatsapp: "Depende de um número de envio homologado em Parâmetros.",
};

const TODOS_OS_EVENTOS = CATEGORIAS.flatMap((c) => EVENTOS_POR_CATEGORIA[c]);

function horaCurta(valor: string | undefined): string {
  return (valor ?? "").slice(0, 5);
}

export function PreferenciasNotificacaoPage() {
  const navigate = useNavigate();
  const preferencias = preferenciasNotificacaoStore.usePreferencias();
  const eventos = preferenciasNotificacaoStore.useEventos();
  const aparelhos = preferenciasNotificacaoStore.useAparelhos();
  const { isLoading, error } = preferenciasNotificacaoStore.useEstado();

  const [matriz, setMatriz] = useState<Matriz | null>(null);
  const [form, setForm] = useState<PatchPreferencias | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Semeia o estado local a partir do banco; eventos que ainda não têm linha
  // entram desligados, menos in-app (todo aviso precisa existir em algum lugar).
  useEffect(() => {
    if (eventos.length === 0 && !preferencias) return;
    const base = {} as Matriz;
    for (const tipo of TODOS_OS_EVENTOS) {
      const linha = eventos.find((e) => e.tipo === tipo);
      base[tipo] = {
        canal_app: linha?.canal_app ?? true,
        canal_push: linha?.canal_push ?? false,
        canal_email: linha?.canal_email ?? false,
        canal_whatsapp: linha?.canal_whatsapp ?? false,
        critico: linha?.critico ?? false,
      };
    }
    setMatriz(base);
    if (preferencias) {
      setForm({
        silencio_inicio: preferencias.silencio_inicio,
        silencio_fim: preferencias.silencio_fim,
        fim_de_semana_so_criticos: preferencias.fim_de_semana_so_criticos,
        resumo_email_ativo: preferencias.resumo_email_ativo,
        resumo_email_hora: preferencias.resumo_email_hora,
        max_push_por_hora: preferencias.max_push_por_hora,
        retencao_dias: preferencias.retencao_dias,
      });
    }
  }, [eventos, preferencias]);

  const totalEventos = useMemo(() => TODOS_OS_EVENTOS.length, []);

  const alternar = (tipo: TipoNotificacao, canal: CanalNotificacao) => {
    setMatriz((m) => {
      if (!m) return m;
      const campo = CAMPO_DO_CANAL[canal];
      return { ...m, [tipo]: { ...m[tipo], [campo]: !m[tipo][campo] } };
    });
  };

  const salvar = async () => {
    if (!matriz || !form) return;
    setSalvando(true);
    try {
      await preferenciasNotificacaoStore.salvar(form, matriz);
      toast.success("Preferências salvas.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-4 text-center">
        <Icon icon="lucide:circle-alert" className="mx-auto h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" onClick={() => void preferenciasNotificacaoStore.retry()}>
          Tentar de novo
        </Button>
      </div>
    );
  }

  if (isLoading && !matriz) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Carregando…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Preferências de notificação
        </h1>
        <CardPill>toda a empresa</CardPill>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/admin/notificacoes">
              <Icon icon="lucide:arrow-left" className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button className="gap-2" onClick={() => void salvar()} disabled={salvando || !matriz}>
            <Icon icon="lucide:check" className="h-4 w-4" />
            {salvando ? "Salvando…" : "Salvar preferências"}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[1.9fr_1fr]">
        <div className="space-y-4">
          <CardSecao
            titulo="Eventos e canais"
            icone="lucide:sliders-horizontal"
            acessorio={<CardPill>{totalEventos} eventos</CardPill>}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left font-mono text-xs uppercase tracking-wide text-foreground-faint">
                    <th className="px-4 py-3 font-medium">Evento</th>
                    {CANAIS.map((c) => (
                      <th key={c} className="px-3 py-3 text-center font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon icon={CANAL_ICONE[c]} className="h-3.5 w-3.5" aria-hidden />
                          {CANAL_LABEL[c]}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIAS.map((categoria) => (
                    <>
                      <tr key={categoria} className="border-b bg-surface/60">
                        <td colSpan={CANAIS.length + 1} className="px-4 py-2">
                          <span className="font-display text-[11px] font-bold uppercase tracking-wider text-foreground">
                            {CATEGORIA_LABEL[categoria]}
                          </span>
                          <span className="ml-2 text-[11px] text-foreground-faint">
                            {EVENTOS_POR_CATEGORIA[categoria].length} eventos
                          </span>
                        </td>
                      </tr>
                      {EVENTOS_POR_CATEGORIA[categoria].map((tipo) => {
                        const linha = matriz?.[tipo];
                        return (
                          <tr key={tipo} className="border-b last:border-b-0">
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-foreground">
                                  {EVENTO_LABEL[tipo].nome}
                                </span>
                                {linha?.critico ? (
                                  <span className="inline-flex items-center rounded-full border border-destructive/40 bg-destructive/15 px-2 py-0.5 text-[10.5px] font-semibold text-destructive">
                                    Crítico
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                                {EVENTO_LABEL[tipo].detalhe}
                              </div>
                            </td>
                            {CANAIS.map((canal) => {
                              const indisponivel = CANAL_INDISPONIVEL[canal];
                              return (
                                <td key={canal} className="px-3 py-3 text-center">
                                  <Switch
                                    checked={Boolean(linha?.[CAMPO_DO_CANAL[canal]])}
                                    disabled={Boolean(indisponivel)}
                                    onCheckedChange={() => alternar(tipo, canal)}
                                    aria-label={`${EVENTO_LABEL[tipo].nome} — ${CANAL_LABEL[canal]}`}
                                    title={indisponivel}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </CardSecao>

          <div className="flex items-start gap-3 rounded-xl border border-dashed bg-surface/60 p-4 text-sm text-muted-foreground">
            <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Eventos marcados como <strong className="text-foreground">críticos</strong> ignoram o
              horário silencioso e o limite por hora. O canal{" "}
              <strong className="text-foreground">WhatsApp</strong> fica desabilitado até um número
              de envio ser homologado — o WAHA que já existe no projeto atende o cliente, não o
              operador.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <CardSecao titulo="Horário silencioso" icone="lucide:moon" bodyClassName="p-4">
            <DataRow icone="lucide:clock" rotulo="Início">
              <Input
                type="time"
                className="h-8 w-28 font-mono"
                value={horaCurta(form?.silencio_inicio)}
                onChange={(e) => setForm((f) => f && { ...f, silencio_inicio: e.target.value })}
              />
            </DataRow>
            <DataRow icone="lucide:clock" rotulo="Fim">
              <Input
                type="time"
                className="h-8 w-28 font-mono"
                value={horaCurta(form?.silencio_fim)}
                onChange={(e) => setForm((f) => f && { ...f, silencio_fim: e.target.value })}
              />
            </DataRow>
            <DataRow icone="lucide:calendar" rotulo="Fim de semana">
              <div className="flex items-center gap-2">
                <Switch
                  checked={Boolean(form?.fim_de_semana_so_criticos)}
                  onCheckedChange={(v) =>
                    setForm((f) => f && { ...f, fim_de_semana_so_criticos: v })
                  }
                  aria-label="No fim de semana, somente críticos"
                />
                <span className="text-xs text-muted-foreground">somente críticos</span>
              </div>
            </DataRow>
          </CardSecao>

          <CardSecao titulo="Agrupamento & ritmo" icone="lucide:clock" bodyClassName="p-4">
            <DataRow icone="lucide:mail" rotulo="Resumo por e-mail">
              <div className="flex items-center gap-2">
                <Switch
                  checked={Boolean(form?.resumo_email_ativo)}
                  onCheckedChange={(v) => setForm((f) => f && { ...f, resumo_email_ativo: v })}
                  aria-label="Resumo diário por e-mail"
                />
                <Input
                  type="time"
                  className="h-8 w-24 font-mono"
                  value={horaCurta(form?.resumo_email_hora)}
                  onChange={(e) => setForm((f) => f && { ...f, resumo_email_hora: e.target.value })}
                />
              </div>
            </DataRow>
            <DataRow icone="lucide:arrow-up-right" rotulo="Máx. push por hora">
              <Input
                type="number"
                min={1}
                className="h-8 w-20 font-mono"
                value={form?.max_push_por_hora ?? 6}
                onChange={(e) =>
                  setForm((f) => f && { ...f, max_push_por_hora: Number(e.target.value) || 1 })
                }
              />
            </DataRow>
            <DataRow icone="lucide:history" rotulo="Retenção no histórico">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  className="h-8 w-20 font-mono"
                  value={form?.retencao_dias ?? 90}
                  onChange={(e) =>
                    setForm((f) => f && { ...f, retencao_dias: Number(e.target.value) || 1 })
                  }
                />
                <span className="text-xs text-muted-foreground">dias</span>
              </div>
            </DataRow>
          </CardSecao>

          <CardSecao
            titulo="Aparelhos com push"
            icone="lucide:smartphone"
            acessorio={<CardPill>{aparelhos.length} ativos</CardPill>}
            bodyClassName="p-2"
          >
            {aparelhos.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Nenhum operador instalou o app de campo ainda.
              </p>
            ) : (
              <ul>
                {aparelhos.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                      <Icon icon="lucide:smartphone" className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {a.operador_nome}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {a.user_agent ?? "aparelho não identificado"}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-foreground-faint">
                      {formatDataHora(a.updated_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardSecao>

          <Button
            variant="outline"
            className={cn("w-full gap-2")}
            onClick={() => navigate({ to: "/admin/notificacoes/nova" })}
          >
            <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
            Enviar um aviso de teste
          </Button>
        </div>
      </div>
    </div>
  );
}
