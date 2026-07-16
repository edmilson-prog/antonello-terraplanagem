import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";
import {
  contaPagarSchema,
  type ContaPagarFormValues,
} from "@/features/financeiro/conta-pagar-schema";
import { CATEGORIA_LABEL, FORMA_PAGAMENTO_LABEL } from "@/features/financeiro/labels";
import { ResumoNovoPagamento } from "@/features/financeiro/components/resumo-novo-pagamento";
import type { CategoriaDespesa, FormaPagamento } from "@/shared/types";

const CATEGORIAS: CategoriaDespesa[] = ["diesel", "manutencao", "folha", "fornecedor", "outro"];
const FORMAS: FormaPagamento[] = ["dinheiro", "pix", "transferencia", "boleto", "cheque", "outro"];

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

// Conta a Pagar não tem fluxo de edição (só criação e "dar baixa", via
// dar-baixa-pagar-dialog.tsx) — por isso este formulário, ao contrário de
// ClienteForm/EquipamentoForm/OperadorForm/ComponenteCustoForm, não recebe
// `inicial` e sempre renderiza o layout de 2 colunas com resumo.
export function ContaPagarForm({ onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContaPagarFormValues>({
    resolver: zodResolver(contaPagarSchema),
    defaultValues: { categoria: "diesel" },
  });

  const onSubmit = (values: ContaPagarFormValues) => {
    contasPagarStore.criar({
      descricao: values.descricao,
      fornecedor: values.fornecedor?.trim() || null,
      categoria: values.categoria,
      valor: values.valor,
      vencimento: values.vencimento,
      documento: values.documento?.trim() || null,
      forma_pagamento: values.forma_pagamento ?? null,
      observacao: values.observacao?.trim() || null,
    });
    toast.success("Conta a pagar registrada.");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Dados do título</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="categoria">Categoria *</Label>
              <Controller
                control={control}
                name="categoria"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="categoria">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {CATEGORIA_LABEL[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoria ? (
                <p className="text-xs text-destructive">{errors.categoria.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="forma_pagamento">Forma de pagamento</Label>
              <Controller
                control={control}
                name="forma_pagamento"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger id="forma_pagamento">
                      <SelectValue placeholder="Selecione…" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {FORMA_PAGAMENTO_LABEL[f]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              placeholder="Ex: Abastecimento Julho"
              {...register("descricao")}
              aria-invalid={!!errors.descricao}
            />
            {errors.descricao ? (
              <p className="text-xs text-destructive">{errors.descricao.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fornecedor">Fornecedor / beneficiário *</Label>
            <Input
              id="fornecedor"
              placeholder="Ex.: Posto Missões"
              {...register("fornecedor")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="documento">Documento</Label>
              <Input
                id="documento"
                className="font-mono"
                placeholder="BOL 8821 / NF 5540"
                {...register("documento")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vencimento">Vencimento *</Label>
              <Input
                id="vencimento"
                type="date"
                className="font-mono"
                {...register("vencimento")}
                aria-invalid={!!errors.vencimento}
              />
              {errors.vencimento ? (
                <p className="text-xs text-destructive">{errors.vencimento.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="valor">Valor (R$) *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              {...register("valor")}
              aria-invalid={!!errors.valor}
            />
            {errors.valor ? <p className="text-xs text-destructive">{errors.valor.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacao">Observações</Label>
            <Textarea
              id="observacao"
              placeholder="Rateio por equipamento, centro de custo, referência…"
              {...register("observacao")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              {isSubmitting ? "Salvando…" : "Lançar pagamento"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ResumoNovoPagamento control={control} />
    </form>
  );
}
