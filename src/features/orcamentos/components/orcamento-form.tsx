import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { clientesStore } from "@/features/clientes/clientes-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { orcamentoSchema, type OrcamentoFormValues } from "@/features/orcamentos/orcamento-schema";
import { aplicarHoraTipo } from "@/features/orcamentos/calculo";
import { AdicionarItemOrcamento } from "@/features/orcamentos/components/adicionar-item-orcamento";
import { OrcamentoItemRow } from "@/features/orcamentos/components/orcamento-item-row";
import { ResumoNovoOrcamento } from "@/features/orcamentos/components/resumo-novo-orcamento";
import type { OrcamentoItem } from "@/shared/types";

// Validade padrão = hoje + 30 dias (YYYY-MM-DD).
function validadePadrao(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

interface Props {
  onCancel: () => void;
}

export function OrcamentoForm({ onCancel }: Props) {
  const clientes = clientesStore.useAll().filter((c) => c.ativo);
  const equipamentos = equipamentosStore.useAll();
  const precosHM = precoHoraMaquinaStore.useAll();
  const navigate = useNavigate();
  const [itens, setItens] = useState<OrcamentoItem[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OrcamentoFormValues>({
    resolver: zodResolver(orcamentoSchema),
    defaultValues: { cliente_id: "", descricao_obra: "", validade: validadePadrao() },
  });

  const handleQuantidade = (itemId: string, q: number) => {
    setItens((atual) =>
      atual.map((i) => {
        if (i.id !== itemId) return i;
        const qtd = Number.isFinite(q) && q > 0 ? q : 0;
        return {
          ...i,
          quantidade_estimada: qtd,
          valor_total: i.valor_unitario != null ? qtd * i.valor_unitario : 0,
        };
      }),
    );
  };

  const handleValorUnitario = (itemId: string, v: number) => {
    setItens((atual) =>
      atual.map((i) => {
        if (i.id !== itemId) return i;
        const valor = Number.isFinite(v) && v > 0 ? v : null;
        return {
          ...i,
          valor_unitario: valor,
          valor_total: valor != null ? i.quantidade_estimada * valor : 0,
          sem_preco: valor === null,
        };
      }),
    );
  };

  const handleHoraTipo = (itemId: string, tipo: "seca" | "operada") => {
    setItens((atual) =>
      atual.map((i) => {
        if (i.id !== itemId) return i;
        const equipamento = i.origem_id
          ? equipamentos.find((e) => e.id === i.origem_id)
          : undefined;
        return aplicarHoraTipo(i, equipamento, precosHM, tipo);
      }),
    );
  };

  const handleRemover = (itemId: string) =>
    setItens((atual) => atual.filter((i) => i.id !== itemId));

  const onSubmit = async (values: OrcamentoFormValues) => {
    try {
      const novo = await orcamentosStore.criar({
        cliente_id: values.cliente_id,
        descricao_obra: values.descricao_obra.trim(),
        validade: values.validade?.trim() ? values.validade : null,
      });
      if (itens.length > 0) {
        await orcamentosStore.atualizar(novo.id, { itens });
      }
      toast.success(`Orçamento criado — ${novo.numero}.`);
      navigate({ to: "/admin/orcamentos/$orcamentoId", params: { orcamentoId: novo.id } });
    } catch (err) {
      toast.error(`Falha ao criar o orçamento${err instanceof Error ? `: ${err.message}` : ""}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados do orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cliente_id">Cliente *</Label>
                <Controller
                  control={control}
                  name="cliente_id"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="cliente_id" aria-invalid={!!errors.cliente_id}>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.cliente_id ? (
                  <p className="text-xs text-destructive">{errors.cliente_id.message}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="descricao_obra">Obra *</Label>
                <Input
                  id="descricao_obra"
                  {...register("descricao_obra")}
                  aria-invalid={!!errors.descricao_obra}
                />
                {errors.descricao_obra ? (
                  <p className="text-xs text-destructive">{errors.descricao_obra.message}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="validade">Validade</Label>
                <Input id="validade" type="date" className="font-mono" {...register("validade")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Itens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {itens.length === 0 ? (
                <p className="rounded-lg border border-dashed bg-surface/40 p-6 text-center text-sm text-muted-foreground">
                  Nenhum item ainda. Adicione abaixo (opcional — dá para adicionar depois também).
                </p>
              ) : (
                <div className="space-y-2">
                  {itens.map((item) => (
                    <OrcamentoItemRow
                      key={item.id}
                      item={item}
                      editavel
                      onQuantidade={(q) => handleQuantidade(item.id, q)}
                      onValorUnitario={(v) => handleValorUnitario(item.id, v)}
                      onHoraTipo={(t) => handleHoraTipo(item.id, t)}
                      onRemover={() => handleRemover(item.id)}
                    />
                  ))}
                </div>
              )}
              <AdicionarItemOrcamento
                onAdicionar={(item) => setItens((atual) => [...atual, item])}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              Criar orçamento
            </Button>
          </div>
        </div>

        <ResumoNovoOrcamento control={control} itens={itens} />
      </div>
    </form>
  );
}
