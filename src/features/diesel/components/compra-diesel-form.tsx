import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { comprasDieselStore } from "@/features/diesel/compras-diesel-store";
import { parametrosStore } from "@/features/parametros/parametros-store";
import { estadoDoTanque } from "@/features/diesel/tanque";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { formatBRL } from "@/features/retaguarda/format";
import { textoParaNumero } from "@/features/parametros/derivacoes";

// Entrada de diesel no tanque interno. Cada compra gera a conta a pagar
// correspondente — o formulário avisa isso antes de salvar, para o lançamento
// não aparecer no Financeiro como surpresa.

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

export function CompraDieselForm({ onCancel, onSuccess }: Props) {
  const parametros = parametrosStore.useParametros();
  const compras = comprasDieselStore.useTodas();
  const abastecimentos = abastecimentosStore.useCompletos();

  const [litros, setLitros] = useState("");
  const [precoLitro, setPrecoLitro] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [documento, setDocumento] = useState("");
  const [observacao, setObservacao] = useState("");
  const [compradoEm, setCompradoEm] = useState(() => new Date().toISOString().slice(0, 10));
  const [salvando, setSalvando] = useState(false);

  const litrosNum = textoParaNumero(litros);
  const precoNum = textoParaNumero(precoLitro);
  const valorTotal = litrosNum != null && precoNum != null ? litrosNum * precoNum : null;

  const capacidade = parametros?.tanque_capacidade_litros ?? 0;
  const tanque = estadoDoTanque(compras, abastecimentos, capacidade);
  const saldoDepois = tanque.saldoLitros + (litrosNum ?? 0);
  const excedeCapacidade = capacidade > 0 && saldoDepois > capacidade;

  const invalido = litrosNum == null || litrosNum <= 0 || precoNum == null || precoNum < 0;

  const salvar = async () => {
    if (invalido) {
      toast.error("Informe litros e preço por litro.");
      return;
    }
    setSalvando(true);
    try {
      await comprasDieselStore.criar({
        litros: litrosNum,
        preco_litro: precoNum,
        fornecedor: fornecedor.trim() || null,
        documento: documento.trim() || null,
        observacao: observacao.trim() || null,
        comprado_em: new Date(`${compradoEm}T12:00:00`).toISOString(),
      });
      toast.success("Compra registrada e conta a pagar gerada.");
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível registrar a compra.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="litros">Litros comprados *</Label>
          <Input
            id="litros"
            inputMode="decimal"
            className="font-mono"
            placeholder="4000"
            value={litros}
            onChange={(e) => setLitros(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="preco_litro">Preço por litro (R$) *</Label>
          <Input
            id="preco_litro"
            inputMode="decimal"
            className="font-mono"
            placeholder="5,84"
            value={precoLitro}
            onChange={(e) => setPrecoLitro(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fornecedor">Fornecedor</Label>
          <Input
            id="fornecedor"
            placeholder="Posto Missões"
            value={fornecedor}
            onChange={(e) => setFornecedor(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="documento">Nota / cupom</Label>
          <Input
            id="documento"
            placeholder="NF 5540"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="comprado_em">Data da compra *</Label>
          <Input
            id="comprado_em"
            type="date"
            className="font-mono"
            value={compradoEm}
            onChange={(e) => setCompradoEm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observacao">Observação</Label>
        <Textarea
          id="observacao"
          rows={2}
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
      </div>

      {/* Resumo ao vivo: o que entra no tanque e o que sai no Financeiro. */}
      <div className="space-y-3 rounded-xl border bg-surface/50 p-4">
        <dl className="grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-foreground-faint">Valor total</dt>
            <dd className="font-mono text-lg font-bold text-foreground">
              {valorTotal != null ? formatBRL(valorTotal) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-foreground-faint">Saldo do tanque depois</dt>
            <dd className="font-mono text-lg font-bold text-foreground">
              {litrosNum != null
                ? `${saldoDepois.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} L`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-foreground-faint">Vencimento da conta</dt>
            <dd className="font-mono text-lg font-bold text-foreground">
              {parametros ? `${parametros.vencimento_dias} dias` : "—"}
            </dd>
          </div>
        </dl>

        <p className="flex items-start gap-2 border-t pt-3 text-xs text-muted-foreground">
          <Icon icon="lucide:info" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          Ao salvar, uma <strong className="text-foreground">conta a pagar</strong> é criada no
          Financeiro com este valor, na categoria Diesel.
        </p>

        {excedeCapacidade ? (
          <p className="flex items-start gap-2 text-xs text-destructive">
            <Icon icon="lucide:triangle-alert" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Esta compra deixaria o tanque acima da capacidade de{" "}
            {capacidade.toLocaleString("pt-BR")} L. Confira os litros ou ajuste a capacidade em
            Parâmetros.
          </p>
        ) : null}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={salvando}>
          Cancelar
        </Button>
        <Button onClick={salvar} disabled={invalido || salvando} className="gap-2">
          <Icon
            icon={salvando ? "lucide:loader-circle" : "lucide:check"}
            className={salvando ? "h-4 w-4 animate-spin" : "h-4 w-4"}
          />
          Registrar compra
        </Button>
      </div>
    </div>
  );
}
