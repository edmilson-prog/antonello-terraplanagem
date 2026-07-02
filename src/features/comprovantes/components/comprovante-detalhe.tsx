import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/shared/components/form-dialog";
import { SignaturePad } from "@/features/comprovantes/components/signature-pad";
import { StatusComprovanteBadge } from "@/features/comprovantes/labels";
import { comprovantesStore } from "@/features/comprovantes/comprovantes-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { formatDataHora } from "@/shared/lib/format";

export function ComprovanteDetalhe({ comprovanteId }: { comprovanteId: string }) {
  const comprovante = comprovantesStore.useComprovante(comprovanteId);
  const [assinanteNome, setAssinanteNome] = useState("");
  const [assinaturaUrl, setAssinaturaUrl] = useState<string | null>(null);
  const [recusando, setRecusando] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState("");

  if (!comprovante) return <ComprovanteNaoEncontrado />;

  const cliente = clientesStore.getById(comprovante.cliente_id);
  const os = ordensStore.obter(comprovante.os_id);
  const pendente = comprovante.status === "pendente";
  const podeConfirmar = assinanteNome.trim().length >= 3 && !!assinaturaUrl;

  const onAssinar = () => {
    const r = comprovantesStore.assinar(comprovante.id, {
      assinante_nome: assinanteNome,
      assinatura_url: assinaturaUrl ?? "",
    });
    if (!r.ok) {
      toast.error(r.motivo);
      return;
    }
    toast.success(`Comprovante ${r.comprovante.numero} assinado.`);
  };

  const onRecusar = () => {
    const r = comprovantesStore.recusar(comprovante.id, motivoRecusa.trim() ? motivoRecusa.trim() : null);
    if (!r.ok) {
      toast.error(r.motivo);
      return;
    }
    setRecusando(false);
    toast.success("Comprovante recusado.");
  };

  return (
    <div className="space-y-5">
      <Link
        to="/admin/comprovantes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Comprovantes
      </Link>

      <header className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-xl font-bold text-foreground">{comprovante.numero}</h1>
          <StatusComprovanteBadge status={comprovante.status} />
        </div>
        <p className="mt-1 font-display font-bold text-card-foreground">{cliente?.nome ?? "—"}</p>
        {os ? (
          <Link
            to="/admin/ordens/$ordemId"
            params={{ ordemId: os.id }}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Icon icon="lucide:external-link" className="h-3.5 w-3.5" />
            Ver OS {os.numero}
          </Link>
        ) : null}
        <p className="mt-2 text-xs text-foreground-faint">
          Gerado em {formatDataHora(comprovante.gerado_em)}
          {comprovante.assinado_em ? ` · Assinado em ${formatDataHora(comprovante.assinado_em)}` : ""}
        </p>
      </header>

      <section className="space-y-2 rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Resumo do serviço
        </h2>
        <pre className="whitespace-pre-wrap font-sans text-sm text-card-foreground">
          {comprovante.resumo_servico}
        </pre>
      </section>

      {pendente ? (
        <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Assinatura do cliente
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="assinante_nome">Nome do assinante *</Label>
            <Input
              id="assinante_nome"
              value={assinanteNome}
              onChange={(e) => setAssinanteNome(e.target.value)}
              placeholder="Nome completo"
            />
          </div>
          <SignaturePad onChange={setAssinaturaUrl} />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRecusando(true)}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Icon icon="lucide:x" className="h-4 w-4" />
              Recusar
            </Button>
            <Button
              type="button"
              onClick={onAssinar}
              disabled={!podeConfirmar}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              <Icon icon="lucide:pen-line" className="h-4 w-4" />
              Confirmar assinatura
            </Button>
          </div>
        </section>
      ) : null}

      {comprovante.status === "assinado" ? (
        <section className="space-y-2 rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Assinatura registrada
          </h2>
          <p className="text-sm text-card-foreground">Assinante: {comprovante.assinante_nome}</p>
          {comprovante.assinatura_url ? (
            <img
              src={comprovante.assinatura_url}
              alt="Assinatura do cliente"
              className="max-w-xs rounded-lg border bg-white p-2"
            />
          ) : null}
        </section>
      ) : null}

      {comprovante.status === "recusado" ? (
        <section className="space-y-2 rounded-xl border border-destructive/40 bg-destructive/5 p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-destructive">
            Recusado pelo cliente
          </h2>
          <p className="text-sm text-card-foreground">{comprovante.motivo_recusa ?? "Sem motivo informado."}</p>
        </section>
      ) : null}

      <FormDialog
        open={recusando}
        onOpenChange={setRecusando}
        titulo="Recusar comprovante?"
        descricao="Registra que o cliente não confirmou o serviço executado."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="motivo_recusa">Motivo (opcional)</Label>
            <Textarea
              id="motivo_recusa"
              value={motivoRecusa}
              onChange={(e) => setMotivoRecusa(e.target.value)}
              placeholder="Por que o cliente recusou?"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setRecusando(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onRecusar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Recusar comprovante
            </Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}

function ComprovanteNaoEncontrado() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="font-display text-xl font-bold text-foreground">Comprovante não encontrado</h2>
      <Link
        to="/admin/comprovantes"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Voltar para Comprovantes
      </Link>
    </div>
  );
}
