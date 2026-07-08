import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { FaturamentoItemRow } from "@/features/faturamento/components/faturamento-item-row";
import { StatusFaturamentoBadge } from "@/features/faturamento/labels";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { aplicarHoraTipo, temPendencia, valorItem } from "@/features/faturamento/calculo";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { precoMobilizacaoStore } from "@/features/precos/precos-mobilizacao-store";
import { GerarTextoBotao } from "@/features/ia/components/gerar-texto-botao";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { formatBRL } from "@/features/retaguarda/format";
import { formatDataHora } from "@/shared/lib/format";
import type { FaturamentoItem } from "@/shared/types";

export function FaturamentoDetalhe({ faturamentoId }: { faturamentoId: string }) {
  const fat = faturamentosStore.useFaturamento(faturamentoId);
  const equipamentos = equipamentosStore.useAll();
  const precosHM = precoHoraMaquinaStore.useAll();
  const mobilizacoes = precoMobilizacaoStore.useAll().filter((m) => m.ativo);
  const apontamentos = apontamentosStore.useTodos();
  const [confirmar, setConfirmar] = useState(false);
  const [mobSelecionada, setMobSelecionada] = useState("");

  if (!fat) return <FaturamentoNaoEncontrado />;

  const cliente = clientesStore.getById(fat.cliente_id);
  const os = ordensStore.obter(fat.os_id);
  const editavel = fat.status === "rascunho";
  const pendente = temPendencia(fat);

  const setItens = (itens: FaturamentoItem[]) => faturamentosStore.atualizar(fat.id, { itens });

  const handleQuantidade = (itemId: string, q: number) => {
    const quantidade = Number.isFinite(q) && q >= 0 ? q : 0;
    setItens(
      fat.itens.map((i) =>
        i.id === itemId
          ? {
              ...i,
              quantidade,
              valor_total: i.valor_unitario != null ? valorItem(quantidade, i.valor_unitario) : 0,
            }
          : i,
      ),
    );
  };

  const handleValorUnitario = (itemId: string, v: number) => {
    const valor = Number.isFinite(v) && v > 0 ? v : null;
    setItens(
      fat.itens.map((i) =>
        i.id === itemId
          ? {
              ...i,
              valor_unitario: valor,
              valor_total: valor != null ? valorItem(i.quantidade, valor) : 0,
              sem_preco: valor === null,
            }
          : i,
      ),
    );
  };

  const handleHoraTipo = (itemId: string, tipo: "seca" | "operada") => {
    setItens(
      fat.itens.map((i) => {
        if (i.id !== itemId) return i;
        const equipamento = i.origem_id ? equipamentos.find((e) => e.id === i.origem_id) : undefined;
        return aplicarHoraTipo(i, equipamento, precosHM, tipo);
      }),
    );
  };

  const handleRemover = (itemId: string) => setItens(fat.itens.filter((i) => i.id !== itemId));

  const adicionarMobilizacao = (precoId: string) => {
    const preco = mobilizacoes.find((m) => m.id === precoId);
    if (!preco) return;
    const item: FaturamentoItem = {
      id: crypto.randomUUID(),
      tipo: "mobilizacao",
      descricao: preco.descricao,
      origem_id: preco.id,
      hora_tipo: null,
      quantidade: 1,
      valor_unitario: preco.valor,
      valor_total: valorItem(1, preco.valor),
      sem_preco: false,
    };
    setItens([...fat.itens, item]);
    setMobSelecionada("");
  };

  const onConfirmar = () => {
    const r = faturamentosStore.confirmar(fat.id);
    setConfirmar(false);
    if (!r.ok) {
      toast.error(r.motivo);
      return;
    }
    toast.success(`Faturamento ${r.faturamento.numero} confirmado.`);
  };

  return (
    <div className="space-y-5">
      <Link
        to="/admin/faturamento"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Faturamento
      </Link>

      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-mono text-lg font-bold text-card-foreground">{fat.numero}</div>
            <div className="mt-1 font-display font-bold text-foreground">{cliente?.nome ?? "—"}</div>
            <div className="text-sm text-muted-foreground">
              {os ? (
                <Link to="/admin/ordens/$ordemId" params={{ ordemId: os.id }} className="hover:text-primary">
                  {os.numero} · {os.obra_nome}
                </Link>
              ) : (
                "OS de origem removida"
              )}
            </div>
          </div>
          <StatusFaturamentoBadge status={fat.status} />
        </div>
        {fat.faturado_em ? (
          <p className="font-mono text-xs text-foreground-faint">
            Faturado em {formatDataHora(fat.faturado_em)}
          </p>
        ) : null}
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Itens ({fat.itens.length})
        </h3>
        {fat.itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum item neste faturamento.</p>
        ) : (
          <div className="space-y-2">
            {fat.itens.map((item) => (
              <FaturamentoItemRow
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

        {editavel && mobilizacoes.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Select value={mobSelecionada} onValueChange={adicionarMobilizacao}>
              <SelectTrigger className="w-auto min-w-[220px] gap-2">
                <Icon icon="lucide:plus" className="h-4 w-4" />
                <SelectValue placeholder="Adicionar mobilização" />
              </SelectTrigger>
              <SelectContent>
                {mobilizacoes.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.descricao} · {formatBRL(m.valor)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
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
                  value={fat.desconto || ""}
                  placeholder="0,00"
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    faturamentosStore.atualizar(fat.id, { desconto: Number.isFinite(v) && v > 0 ? v : 0 });
                  }}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                  Observação
                </label>
                {os ? (
                  <GerarTextoBotao
                    os={os}
                    apontamentos={apontamentos.filter((a) => a.os_id === os.id)}
                    equipamentos={equipamentos}
                    onGerado={(texto) => faturamentosStore.atualizar(fat.id, { observacao: texto })}
                  />
                ) : null}
              </div>
              <Textarea
                value={fat.observacao ?? ""}
                placeholder="Notas internas sobre este faturamento"
                onChange={(e) =>
                  faturamentosStore.atualizar(fat.id, {
                    observacao: e.target.value.trim() ? e.target.value : null,
                  })
                }
              />
            </div>
          </>
        ) : fat.observacao ? (
          <p className="text-sm text-card-foreground">{fat.observacao}</p>
        ) : null}

        <div className="flex items-end justify-between border-t pt-4">
          <span className="text-sm font-medium text-muted-foreground">Total</span>
          <span className="font-mono text-2xl font-bold text-foreground">{formatBRL(fat.valor_total)}</span>
        </div>
      </section>

      {pendente ? (
        <p className="flex items-center gap-2 text-xs text-destructive">
          <Icon icon="lucide:triangle-alert" className="h-4 w-4" />
          Há item sem preço cadastrado; o total não inclui esse serviço.
        </p>
      ) : null}

      {editavel ? (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setConfirmar(true)}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:check-circle-2" className="h-4 w-4" />
            Confirmar faturamento
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmar}
        onOpenChange={setConfirmar}
        titulo="Confirmar faturamento?"
        descricao={
          pendente
            ? `A fatura ${fat.numero} será marcada como faturada. Atenção: há item sem preço — o total (${formatBRL(fat.valor_total)}) não inclui esse serviço.`
            : `A fatura ${fat.numero} no valor de ${formatBRL(fat.valor_total)} será marcada como faturada.`
        }
        confirmLabel="Confirmar"
        onConfirm={onConfirmar}
      />
    </div>
  );
}

export function FaturamentoNaoEncontrado() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="font-display text-xl font-bold text-foreground">Faturamento não encontrado</h2>
      <Link
        to="/admin/faturamento"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Voltar para Faturamento
      </Link>
    </div>
  );
}
