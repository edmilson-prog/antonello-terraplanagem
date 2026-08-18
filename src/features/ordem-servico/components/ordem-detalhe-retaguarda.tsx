import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { DocumentoHero } from "@/shared/components/documento-hero";
import { StatStrip, type StatItem } from "@/shared/components/stat-strip";
import { CardSecao } from "@/shared/components/card-secao";
import { GerarTextoBotao } from "@/features/ia/components/gerar-texto-botao";
import { ApontamentosOSTabela } from "@/features/ordem-servico/components/apontamentos-os-tabela";
import {
  HistoricoOS,
  type EventoHistoricoOS,
} from "@/features/ordem-servico/components/historico-os";
import { OrdemForm } from "@/features/ordem-servico/components/ordem-form";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import {
  apontamentosDaOS,
  podeFecharOS,
  statusEfetivoOS,
  totalHorasOS,
  totalMetragemOS,
} from "@/features/ordem-servico/derivacoes";
import { StatusOSBadge, MODELO_LABEL, STATUS_OS_LABEL } from "@/features/ordem-servico/labels";
import { formatDataHora, formatHorimetro } from "@/shared/lib/format";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { notificarHorasConfirmadas } from "@/features/notificacoes/eventos";
import { comprovantesStore } from "@/features/comprovantes/comprovantes-store";
import { montarResumoServico } from "@/features/comprovantes/derivacoes";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import { rentabilidadePorObra, periodoDoFaturamento } from "@/features/rentabilidade/derivacoes";
import { formatPercentual } from "@/features/rentabilidade/format";
import { formatBRL } from "@/features/retaguarda/format";
import { mesReferencia } from "@/shared/lib/periodo-mensal";
import { avisosWhatsAppStore } from "@/features/aviso-whatsapp/avisos-whatsapp-store";
import { avisoDaOS } from "@/features/aviso-whatsapp/derivacoes";
import { PROVEDOR_WHATSAPP_LABEL, StatusAvisoBadge } from "@/features/aviso-whatsapp/labels";
import { RegistrosCampoDaOS } from "@/features/ordem-servico/components/registros-campo-da-os";
import { registrosCampoRetaguardaStore } from "@/features/registros-campo/registros-campo-retaguarda-store";
import { registrosDaOS } from "@/features/registros-campo/retaguarda-derivacoes";
import { operadoresStore } from "@/features/operadores/operadores-store";

export function OrdemDetalheRetaguarda({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const { isLoading, error } = ordensStore.useEstado();
  const apontamentos = apontamentosStore.useTodos();
  const [editando, setEditando] = useState(false);
  const [confirmarFechar, setConfirmarFechar] = useState(false);
  const [resumoParaComprovante, setResumoParaComprovante] = useState<string | null>(null);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center"
        >
          <Icon icon="lucide:triangle-alert" className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" onClick={ordensStore.retry} className="gap-2">
            <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!ordem) return <OrdemNaoEncontradaAdmin />;

  const daOS = apontamentosDaOS(ordem.id, apontamentos);
  const fechada = statusEfetivoOS(ordem, apontamentos) === "fechada";
  const podeFechar = podeFecharOS(ordem, apontamentos);

  const cliente = clientesStore.getById(ordem.cliente_id);
  const statusEfetivo = statusEfetivoOS(ordem, apontamentos);
  const horas = totalHorasOS(ordem.id, apontamentos);
  const metragem = totalMetragemOS(ordem.id, apontamentos);
  const operadoresDistintos = new Set(daOS.map((a) => a.operador_id)).size;
  const wa = (() => {
    const d = cliente?.telefone?.replace(/\D/g, "") ?? "";
    return d.length >= 10 ? `https://wa.me/55${d}` : null;
  })();
  const stats: StatItem[] = [
    { rotulo: "Apontamentos", valor: String(daOS.length), icone: "lucide:timer" },
    ordem.modelo_cobranca === "por_metro"
      ? {
          rotulo: "Metragem",
          valor: metragem > 0 ? `${metragem.toLocaleString("pt-BR")} m` : "metragem pendente",
          icone: "lucide:ruler",
        }
      : { rotulo: "Horas totais", valor: formatHorimetro(horas), icone: "lucide:clock" },
    { rotulo: "Operadores", valor: String(operadoresDistintos), icone: "lucide:users" },
    {
      rotulo: "Status",
      valor: STATUS_OS_LABEL[statusEfetivo],
      icone: "lucide:activity",
      mono: false,
    },
  ];

  const orcamentoOrigem = orcamentosStore.useTodos().find((o) => o.os_id === ordem.id);
  const faturamentoVinculado = faturamentosStore.useTodos().find((f) => f.os_id === ordem.id);

  const periodoRentabilidade = faturamentoVinculado
    ? periodoDoFaturamento(faturamentoVinculado)
    : mesReferencia(new Date());
  const rentabilidade = rentabilidadePorObra(
    ordem,
    faturamentoVinculado ? [faturamentoVinculado] : [],
    periodoRentabilidade,
    equipamentosStore.getAll(),
    componentesCustoStore.useAll(),
    abastecimentosStore.useCompletos(),
    registrosManutencaoStore.useCompletos(),
    apontamentos,
    precoHoraMaquinaStore.useAll(),
  );

  const statsFinanceiro: StatItem[] = [
    {
      rotulo: "Valor previsto",
      valor: orcamentoOrigem ? formatBRL(orcamentoOrigem.valor_total) : "—",
      icone: "lucide:file-text",
      rodape: orcamentoOrigem?.numero ?? "sem orçamento vinculado",
    },
    {
      rotulo: "Custo estimado",
      valor: formatBRL(rentabilidade.custo),
      icone: "lucide:calculator",
      rodape: rentabilidade.custo_incompleto ? "config. de custo incompleta" : undefined,
    },
    {
      rotulo: "Faturado",
      valor: faturamentoVinculado ? formatBRL(faturamentoVinculado.valor_total) : "—",
      icone: "lucide:file-check",
      rodape: faturamentoVinculado?.numero ?? "ainda não gerado",
    },
    {
      rotulo: "Margem estimada",
      valor: formatPercentual(rentabilidade.margem_percentual),
      icone: "lucide:trending-up",
      alerta: rentabilidade.margem < 0,
      rodape: formatBRL(rentabilidade.margem),
    },
  ];

  const fechar = async () => {
    const r = await ordensStore.fechar(ordem.id, apontamentos);
    if (!r.ok) {
      toast.error(r.motivo);
      setConfirmarFechar(false);
      return;
    }
    toast.success(`OS ${r.ordem.numero} fechada.`);
    setConfirmarFechar(false);

    // Fechar a OS é o que confirma as horas de campo (PRD-020) — cada operador
    // que apontou nela recebe o aviso com o próprio total.
    void notificarHorasConfirmadas({
      osId: r.ordem.id,
      osNumero: r.ordem.numero,
      apontamentos: daOS,
    });

    const cliente = clientesStore.getById(r.ordem.cliente_id);
    if (cliente) {
      const disparo = await avisosWhatsAppStore.dispararAviso(r.ordem, cliente);
      if (disparo.ok) {
        toast.success(
          `Aviso enviado ao cliente via ${PROVEDOR_WHATSAPP_LABEL[disparo.aviso.provedor]}.`,
        );
      } else if (disparo.aviso) {
        toast.warning(disparo.motivo);
      }
    }
  };

  const gerarFaturamento = async () => {
    const fat = await faturamentosStore.gerarDeOS(
      ordem,
      apontamentos,
      equipamentosStore.getAll(),
      precoHoraMaquinaStore.getAll(),
      precoFundacaoStore.getAll(),
    );
    toast.success(`Rascunho ${fat.numero} gerado.`);
    navigate({ to: "/admin/faturamento/$faturamentoId", params: { faturamentoId: fat.id } });
  };

  const comprovante = comprovantesStore.useTodos().find((c) => c.os_id === ordemId);
  const operadores = operadoresStore.useAll();
  const registrosCampo = registrosDaOS(registrosCampoRetaguardaStore.useTodos(), ordemId);
  const aviso = avisoDaOS(ordem.id, avisosWhatsAppStore.useTodas());

  const eventosHistorico: EventoHistoricoOS[] = [
    ...(orcamentoOrigem?.decidido_em
      ? [
          {
            data: orcamentoOrigem.decidido_em,
            titulo: `Orçamento ${orcamentoOrigem.numero} ${orcamentoOrigem.status === "aprovado" ? "aprovado" : "recusado"}`,
            subtitulo: cliente?.nome ?? "—",
            icone: "lucide:file-text",
          },
        ]
      : []),
    {
      data: ordem.aberta_em,
      titulo: "OS aberta",
      subtitulo: ordem.obra_nome,
      icone: "lucide:clipboard-list",
    },
    ...(ordem.fechada_em
      ? [
          {
            data: ordem.fechada_em,
            titulo: "OS fechada",
            subtitulo: `${daOS.length} ${daOS.length === 1 ? "apontamento" : "apontamentos"}`,
            icone: "lucide:lock",
          },
        ]
      : []),
    ...(faturamentoVinculado
      ? [
          {
            data: faturamentoVinculado.gerado_em,
            titulo: `Faturamento ${faturamentoVinculado.numero} gerado`,
            subtitulo: formatBRL(faturamentoVinculado.valor_total),
            icone: "lucide:file-check",
          },
        ]
      : []),
    ...(faturamentoVinculado?.faturado_em
      ? [
          {
            data: faturamentoVinculado.faturado_em,
            titulo: `Faturamento ${faturamentoVinculado.numero} confirmado`,
            subtitulo: formatBRL(faturamentoVinculado.valor_total),
            icone: "lucide:check",
          },
        ]
      : []),
    ...(comprovante
      ? [
          {
            data: comprovante.gerado_em,
            titulo: `Comprovante ${comprovante.numero} gerado`,
            subtitulo: cliente?.nome ?? "—",
            icone: "lucide:file-check-2",
          },
        ]
      : []),
    ...(comprovante?.assinado_em
      ? [
          {
            data: comprovante.assinado_em,
            titulo: `Comprovante ${comprovante.numero} assinado`,
            subtitulo: comprovante.assinante_nome ?? "—",
            icone: "lucide:signature",
          },
        ]
      : []),
  ];

  const abrirRevisaoComprovante = () => {
    if (!ordem) return;
    setResumoParaComprovante(montarResumoServico(ordem, apontamentos, equipamentosStore.getAll()));
  };

  const confirmarGeracaoComprovante = async () => {
    if (!ordem || resumoParaComprovante == null) return;
    const r = await comprovantesStore.gerar({
      os_id: ordem.id,
      cliente_id: ordem.cliente_id,
      resumo_servico: resumoParaComprovante,
    });
    if (!r.ok) {
      toast.error(r.motivo);
      return;
    }
    setResumoParaComprovante(null);
    toast.success(`Comprovante ${r.comprovante.numero} gerado.`);
    navigate({
      to: "/admin/comprovantes/$comprovanteId",
      params: { comprovanteId: r.comprovante.id },
    });
  };

  return (
    <div className="space-y-5">
      <Link
        to="/admin/ordens"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Ordens de Serviço
      </Link>

      <DocumentoHero
        icone="lucide:clipboard-list"
        numero={ordem.numero}
        titulo={cliente?.nome ? `${cliente.nome} · ${ordem.obra_nome}` : ordem.obra_nome}
        badges={
          <>
            <StatusOSBadge status={statusEfetivo} />
            <span className="rounded-full border bg-surface px-2.5 py-1 font-mono text-[11px] font-semibold text-muted-foreground">
              {MODELO_LABEL[ordem.modelo_cobranca]}
            </span>
            {ordem.pendente_sync ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-steel/40 bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                <Icon icon="lucide:refresh-cw" className="h-3 w-3" />
                Sync pendente
              </span>
            ) : null}
          </>
        }
        quickfacts={[
          { rotulo: "Aberta em", valor: formatDataHora(ordem.aberta_em) },
          ...(ordem.modelo_cobranca === "por_metro" && ordem.diametro_broca_mm != null
            ? [{ rotulo: "Diâmetro da broca", valor: `Ø${ordem.diametro_broca_mm} mm`, mono: true }]
            : []),
          ...(ordem.endereco ? [{ rotulo: "Endereço", valor: ordem.endereco }] : []),
          ...(ordem.fechada_em
            ? [{ rotulo: "Fechada em", valor: formatDataHora(ordem.fechada_em) }]
            : []),
          ...(orcamentoOrigem
            ? [
                {
                  rotulo: "Orçamento de origem",
                  valor: (
                    <Link
                      to="/admin/orcamentos/$orcamentoId"
                      params={{ orcamentoId: orcamentoOrigem.id }}
                      className="text-primary hover:underline"
                    >
                      {orcamentoOrigem.numero}
                    </Link>
                  ),
                  mono: true,
                },
              ]
            : []),
        ]}
        acoes={
          <>
            {!fechada ? (
              <Button variant="outline" onClick={() => setEditando(true)} className="gap-1.5">
                <Icon icon="lucide:pencil" className="h-4 w-4" />
                Editar
              </Button>
            ) : null}
            {wa ? (
              <Button asChild variant="outline" className="gap-1.5">
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  <Icon icon="lucide:message-circle" className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            ) : null}
          </>
        }
      />

      <StatStrip itens={stats} />
      <StatStrip itens={statsFinanceiro} />

      {ordem.observacao ? (
        <CardSecao titulo="Observação" icone="lucide:sticky-note">
          <p className="px-4 py-4 text-sm text-card-foreground">{ordem.observacao}</p>
        </CardSecao>
      ) : null}

      <CardSecao titulo={`Apontamentos (${daOS.length})`} icone="lucide:timer">
        <ApontamentosOSTabela apontamentos={daOS} />
      </CardSecao>

      {!fechada ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setConfirmarFechar(true)}
            disabled={!podeFechar.pode}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:lock" className="h-4 w-4" />
            Fechar OS
          </Button>
          {!podeFechar.pode ? (
            <p className="w-full text-xs text-destructive">{podeFechar.motivo}</p>
          ) : null}
        </div>
      ) : null}

      {fechada ? (
        <CardSecao titulo="Faturamento" icone="lucide:file-check">
          <div className="p-4">
            {faturamentoVinculado ? (
              <Link
                to="/admin/faturamento/$faturamentoId"
                params={{ faturamentoId: faturamentoVinculado.id }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <Icon icon="lucide:external-link" className="h-4 w-4" />
                Ver faturamento {faturamentoVinculado.numero} ·{" "}
                {formatBRL(faturamentoVinculado.valor_total)}
              </Link>
            ) : (
              <Button
                onClick={gerarFaturamento}
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:file-plus-2" className="h-4 w-4" />
                Gerar faturamento
              </Button>
            )}
          </div>
        </CardSecao>
      ) : null}

      <RegistrosCampoDaOS registros={registrosCampo} operadores={operadores} />

      <CardSecao titulo="Histórico" icone="lucide:history">
        <HistoricoOS eventos={eventosHistorico} />
      </CardSecao>

      {fechada ? (
        <CardSecao titulo="Comprovante" icone="lucide:file-check-2">
          <div className="p-4">
            {comprovante ? (
              <Link
                to="/admin/comprovantes/$comprovanteId"
                params={{ comprovanteId: comprovante.id }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <Icon icon="lucide:external-link" className="h-4 w-4" />
                Ver comprovante {comprovante.numero}
              </Link>
            ) : (
              <Button
                onClick={abrirRevisaoComprovante}
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:file-check-2" className="h-4 w-4" />
                Gerar comprovante
              </Button>
            )}
          </div>
        </CardSecao>
      ) : null}

      {fechada && aviso ? (
        <CardSecao titulo="Aviso ao cliente" icone="lucide:message-circle">
          <div className="space-y-2 p-4 text-sm">
            <div className="flex items-center gap-2">
              <StatusAvisoBadge status={aviso.status} />
              <span className="text-xs text-muted-foreground">
                via {PROVEDOR_WHATSAPP_LABEL[aviso.provedor]}
              </span>
            </div>
            {aviso.status === "enviado" ? (
              <p className="text-muted-foreground">{aviso.mensagem_preview}</p>
            ) : (
              <p className="text-destructive">
                Cliente sem telefone válido cadastrado — atualize o cadastro para reenviar.
              </p>
            )}
          </div>
        </CardSecao>
      ) : null}

      <FormDialog
        open={editando}
        onOpenChange={setEditando}
        titulo="Editar OS"
        descricao="Os campos com * são obrigatórios."
      >
        <OrdemForm
          inicial={ordem}
          onSuccess={() => setEditando(false)}
          onCancel={() => setEditando(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={confirmarFechar}
        onOpenChange={setConfirmarFechar}
        titulo="Fechar esta OS?"
        descricao={`A OS ${ordem.numero} será marcada como fechada. Esta ação encerra os apontamentos da obra.`}
        confirmLabel="Fechar OS"
        onConfirm={fechar}
      />

      <FormDialog
        open={resumoParaComprovante != null}
        onOpenChange={(open) => {
          if (!open) setResumoParaComprovante(null);
        }}
        titulo="Revisar comprovante antes de gerar"
        descricao="O resumo abaixo vem dos apontamentos reais desta OS — edite se precisar."
      >
        <div className="space-y-3">
          <div className="flex justify-end">
            <GerarTextoBotao
              os={ordem}
              apontamentos={daOS}
              equipamentos={equipamentosStore.getAll()}
              onGerado={setResumoParaComprovante}
            />
          </div>
          <Textarea
            rows={6}
            value={resumoParaComprovante ?? ""}
            onChange={(e) => setResumoParaComprovante(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setResumoParaComprovante(null)}>
              Cancelar
            </Button>
            <Button type="button" onClick={confirmarGeracaoComprovante}>
              Confirmar e gerar comprovante
            </Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}

function OrdemNaoEncontradaAdmin() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="font-display text-xl font-bold text-foreground">OS não encontrada</h2>
      <Link
        to="/admin/ordens"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Voltar para Ordens de Serviço
      </Link>
    </div>
  );
}
