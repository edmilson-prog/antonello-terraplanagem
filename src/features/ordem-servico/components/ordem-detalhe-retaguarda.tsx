import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { GerarTextoBotao } from "@/features/ia/components/gerar-texto-botao";
import { OrdemResumoCard } from "@/features/ordem-servico/components/ordem-resumo-card";
import { ApontamentosDaOS } from "@/features/ordem-servico/components/apontamentos-da-os";
import { OrdemForm } from "@/features/ordem-servico/components/ordem-form";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import {
  apontamentosDaOS,
  podeFecharOS,
  statusEfetivoOS,
} from "@/features/ordem-servico/derivacoes";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { comprovantesStore } from "@/features/comprovantes/comprovantes-store";
import { montarResumoServico } from "@/features/comprovantes/derivacoes";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { avisosWhatsAppStore } from "@/features/aviso-whatsapp/avisos-whatsapp-store";
import { avisoDaOS } from "@/features/aviso-whatsapp/derivacoes";
import { PROVEDOR_WHATSAPP_LABEL, StatusAvisoBadge } from "@/features/aviso-whatsapp/labels";
import { useProvedorWhatsAppAtivo } from "@/features/integracoes/use-provedor-whatsapp";

export function OrdemDetalheRetaguarda({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const { isLoading, error } = ordensStore.useEstado();
  const apontamentos = apontamentosStore.useTodos();
  const [editando, setEditando] = useState(false);
  const [confirmarFechar, setConfirmarFechar] = useState(false);
  const [resumoParaComprovante, setResumoParaComprovante] = useState<string | null>(null);
  const navigate = useNavigate();
  const { provedor: provedorWhatsAppAtivo } = useProvedorWhatsAppAtivo();

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

  const fechar = async () => {
    const r = await ordensStore.fechar(ordem.id, apontamentos);
    if (!r.ok) {
      toast.error(r.motivo);
      setConfirmarFechar(false);
      return;
    }
    toast.success(`OS ${r.ordem.numero} fechada.`);
    setConfirmarFechar(false);

    const cliente = clientesStore.getById(r.ordem.cliente_id);
    if (cliente) {
      const disparo = avisosWhatsAppStore.dispararAviso(r.ordem, cliente, provedorWhatsAppAtivo);
      if (disparo.ok) {
        toast.success(
          `Aviso enviado ao cliente via ${PROVEDOR_WHATSAPP_LABEL[disparo.aviso.provedor]}.`,
        );
      } else if (disparo.aviso) {
        toast.warning(disparo.motivo);
      }
    }
  };

  const comprovante = comprovantesStore.useTodos().find((c) => c.os_id === ordemId);
  const aviso = avisoDaOS(ordem.id, avisosWhatsAppStore.useTodas());

  const abrirRevisaoComprovante = () => {
    if (!ordem) return;
    setResumoParaComprovante(montarResumoServico(ordem, apontamentos, equipamentosStore.getAll()));
  };

  const confirmarGeracaoComprovante = () => {
    if (!ordem || resumoParaComprovante == null) return;
    const r = comprovantesStore.gerar({
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

      <OrdemResumoCard ordem={ordem} apontamentos={apontamentos} />

      {ordem.observacao ? (
        <section className="space-y-2 rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground-faint">
            <Icon icon="lucide:sticky-note" className="h-4 w-4" />
            Observação
          </div>
          <p className="text-sm text-card-foreground">{ordem.observacao}</p>
        </section>
      ) : null}

      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Apontamentos ({daOS.length})
        </h3>
        <ApontamentosDaOS apontamentos={daOS} />
      </section>

      {!fechada ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditando(true)} className="gap-1.5">
            <Icon icon="lucide:pencil" className="h-4 w-4" />
            Editar
          </Button>
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
        <div className="flex flex-wrap gap-2">
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
      ) : null}

      {fechada && aviso ? (
        <section className="space-y-2 rounded-xl border bg-card p-4 text-sm">
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
        </section>
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
