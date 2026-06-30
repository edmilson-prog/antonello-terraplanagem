import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { OrcamentoItemRow } from "@/features/orcamentos/components/orcamento-item-row";
import { AdicionarItemOrcamento } from "@/features/orcamentos/components/adicionar-item-orcamento";
import { StatusOrcamentoBadge } from "@/features/orcamentos/labels";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { aplicarHoraTipo, temPendencia } from "@/features/orcamentos/calculo";
import { validadeVencida } from "@/features/orcamentos/derivacoes";
import { valorItem } from "@/features/faturamento/calculo";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { proximoNumeroOS } from "@/features/ordem-servico/numero-os";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import { formatBRL } from "@/features/retaguarda/format";
import { formatDataHora } from "@/shared/lib/format";
import type { ModeloCobranca, OrcamentoItem } from "@/shared/types";

// Modelo de cobrança da OS gerada: o primeiro item não-mobilização decide (default hora_maquina).
function inferirModelo(itens: OrcamentoItem[]): ModeloCobranca {
  const naoMob = itens.find((i) => i.tipo !== "mobilizacao");
  return naoMob?.tipo === "por_metro" ? "por_metro" : "hora_maquina";
}

export function OrcamentoDetalhe({ orcamentoId }: { orcamentoId: string }) {
  const orc = orcamentosStore.useOrcamento(orcamentoId);
  const equipamentos = equipamentosStore.useAll();
  const precosHM = precoHoraMaquinaStore.useAll();
  const [enviar, setEnviar] = useState(false);
  const [decisao, setDecisao] = useState<null | "aprovar" | "recusar">(null);

  if (!orc) return <OrcamentoNaoEncontrado />;

  const editavel = orc.status === "rascunho";
  const cliente = clientesStore.getById(orc.cliente_id);
  const pendente = temPendencia(orc);
  const vencida = validadeVencida(orc, new Date().toISOString());

  const navigate = useNavigate();

  const gerarOS = () => {
    const modelo = inferirModelo(orc.itens);
    const ehPorMetro = modelo === "por_metro";
    const itemMetro = ehPorMetro ? orc.itens.find((i) => i.tipo === "por_metro") : undefined;
    const diametro =
      itemMetro?.origem_id != null
        ? (precoFundacaoStore.getById(itemMetro.origem_id)?.diametro_broca_mm ?? null)
        : null;
    const numero = proximoNumeroOS(ordensStore.listar(), new Date().getFullYear());
    const nova = ordensStore.criar({
      numero,
      cliente_id: orc.cliente_id,
      obra_nome: orc.descricao_obra,
      endereco: null,
      modelo_cobranca: modelo,
      responsavel_id: null,
      observacao: `Gerado do orçamento ${orc.numero}`,
      metragem_executada: ehPorMetro && itemMetro ? itemMetro.quantidade_estimada : null,
      diametro_broca_mm: ehPorMetro ? diametro : null,
    });
    orcamentosStore.vincularOS(orc.id, nova.id);
    toast.success(`OS ${nova.numero} criada a partir do orçamento.`);
    navigate({ to: "/admin/ordens/$ordemId", params: { ordemId: nova.id } });
  };

  const setItens = (next: OrcamentoItem[]) => orcamentosStore.atualizar(orc.id, { itens: next });

  const handleQuantidade = (itemId: string, q: number) => {
    setItens(
      orc.itens.map((i) => {
        if (i.id !== itemId) return i;
        const qtd = Number.isFinite(q) && q > 0 ? q : 0;
        return {
          ...i,
          quantidade_estimada: qtd,
          valor_total: i.valor_unitario != null ? valorItem(qtd, i.valor_unitario) : 0,
        };
      }),
    );
  };

  const handleValorUnitario = (itemId: string, v: number) => {
    setItens(
      orc.itens.map((i) => {
        if (i.id !== itemId) return i;
        const valor = Number.isFinite(v) && v > 0 ? v : null;
        return {
          ...i,
          valor_unitario: valor,
          valor_total: valor != null ? valorItem(i.quantidade_estimada, valor) : 0,
          sem_preco: valor === null,
        };
      }),
    );
  };

  const handleHoraTipo = (itemId: string, tipo: "seca" | "operada") => {
    setItens(
      orc.itens.map((i) => {
        if (i.id !== itemId) return i;
        const equipamento = i.origem_id ? equipamentos.find((e) => e.id === i.origem_id) : undefined;
        return aplicarHoraTipo(i, equipamento, precosHM, tipo);
      }),
    );
  };

  const handleRemover = (itemId: string) => setItens(orc.itens.filter((i) => i.id !== itemId));

  const onEnviar = () => {
    const r = orcamentosStore.enviar(orc.id);
    setEnviar(false);
    if (!r.ok) {
      toast.error(r.motivo);
      return;
    }
    toast.success(`Orçamento ${r.orcamento.numero} enviado.`);
  };

  const onDecidir = () => {
    if (!decisao) return;
    const r = decisao === "aprovar" ? orcamentosStore.aprovar(orc.id) : orcamentosStore.recusar(orc.id);
    setDecisao(null);
    if (!r.ok) {
      toast.error(r.motivo);
      return;
    }
    toast.success(decisao === "aprovar" ? "Orçamento aprovado." : "Orçamento recusado.");
  };

  return (
    <div className="space-y-5">
      <Link
        to="/admin/orcamentos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Orçamentos
      </Link>

      <header className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-xl font-bold text-foreground">{orc.numero}</h1>
          <StatusOrcamentoBadge status={orc.status} />
        </div>
        <p className="mt-1 font-display font-bold text-card-foreground">{cliente?.nome ?? "—"}</p>
        <p className="text-sm text-muted-foreground">{orc.descricao_obra}</p>
        <p className="mt-2 text-xs text-foreground-faint">
          Validade:{" "}
          <span className={vencida ? "font-medium text-destructive" : ""}>
            {orc.validade ? orc.validade.split("-").reverse().join("/") : "—"}
          </span>
          {orc.enviado_em ? ` · Enviado em ${formatDataHora(orc.enviado_em)}` : ""}
          {orc.decidido_em ? ` · Decidido em ${formatDataHora(orc.decidido_em)}` : ""}
        </p>
      </header>

      <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">Itens ({orc.itens.length})</h2>
          {pendente ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
              <Icon icon="lucide:triangle-alert" className="h-3.5 w-3.5" />
              Há itens sem preço
            </span>
          ) : null}
        </div>

        {orc.itens.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-surface/40 p-6 text-center text-sm text-muted-foreground">
            Nenhum item ainda.{editavel ? " Adicione itens abaixo." : ""}
          </p>
        ) : (
          <div className="space-y-2">
            {orc.itens.map((item) => (
              <OrcamentoItemRow
                key={item.id}
                item={item}
                editavel={editavel}
                onQuantidade={(q) => handleQuantidade(item.id, q)}
                onValorUnitario={(v) => handleValorUnitario(item.id, v)}
                onHoraTipo={(t) => handleHoraTipo(item.id, t)}
                onRemover={() => handleRemover(item.id)}
              />
            ))}
          </div>
        )}

        {editavel ? <AdicionarItemOrcamento onAdicionar={(item) => setItens([...orc.itens, item])} /> : null}
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        {editavel ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                  Desconto (R$)
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={orc.desconto || ""}
                  placeholder="0,00"
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    orcamentosStore.atualizar(orc.id, { desconto: Number.isFinite(v) && v > 0 ? v : 0 });
                  }}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                Observação
              </label>
              <Textarea
                value={orc.observacao ?? ""}
                placeholder="Notas internas sobre este orçamento"
                onChange={(e) =>
                  orcamentosStore.atualizar(orc.id, {
                    observacao: e.target.value.trim() ? e.target.value : null,
                  })
                }
              />
            </div>
          </>
        ) : orc.observacao ? (
          <p className="text-sm text-muted-foreground">{orc.observacao}</p>
        ) : null}

        <div className="flex items-center justify-between border-t pt-4">
          <span className="font-mono text-sm uppercase tracking-wide text-foreground-faint">Total</span>
          <span className="font-mono text-2xl font-bold text-foreground">{formatBRL(orc.valor_total)}</span>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-end gap-2">
        {orc.status === "rascunho" ? (
          <Button
            onClick={() => setEnviar(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:send" className="h-4 w-4" />
            Enviar ao cliente
          </Button>
        ) : null}
        {orc.status === "enviado" ? (
          <>
            <Button
              variant="outline"
              onClick={() => setDecisao("recusar")}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Icon icon="lucide:x" className="h-4 w-4" />
              Recusar
            </Button>
            <Button
              onClick={() => setDecisao("aprovar")}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              <Icon icon="lucide:check" className="h-4 w-4" />
              Aprovar
            </Button>
          </>
        ) : null}
        {orc.status === "aprovado" && !orc.os_id ? (
          <Button
            onClick={gerarOS}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:file-plus-2" className="h-4 w-4" />
            Gerar OS
          </Button>
        ) : null}
        {orc.status === "aprovado" && orc.os_id ? (
          <Link
            to="/admin/ordens/$ordemId"
            params={{ ordemId: orc.os_id }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Icon icon="lucide:external-link" className="h-4 w-4" />
            Ver OS vinculada
          </Link>
        ) : null}
      </section>

      <ConfirmDialog
        open={enviar}
        onOpenChange={setEnviar}
        titulo="Enviar orçamento?"
        descricao={
          pendente
            ? "Há itens sem preço cadastrado. Você ainda pode enviar, mas revise os valores."
            : "O orçamento será marcado como enviado ao cliente."
        }
        confirmLabel="Enviar"
        onConfirm={onEnviar}
      />

      <ConfirmDialog
        open={!!decisao}
        onOpenChange={(o) => !o && setDecisao(null)}
        titulo={decisao === "recusar" ? "Recusar orçamento?" : "Aprovar orçamento?"}
        descricao={
          decisao === "recusar"
            ? "Registra o desfecho como recusado."
            : "Registra o desfecho como aprovado. Depois você poderá gerar a OS."
        }
        confirmLabel={decisao === "recusar" ? "Recusar" : "Aprovar"}
        destrutivo={decisao === "recusar"}
        onConfirm={onDecidir}
      />
    </div>
  );
}

function OrcamentoNaoEncontrado() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="font-display text-xl font-bold text-foreground">Orçamento não encontrado</h2>
      <Link
        to="/admin/orcamentos"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Voltar para Orçamentos
      </Link>
    </div>
  );
}
