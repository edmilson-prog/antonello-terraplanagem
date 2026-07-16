import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CurrencyInput } from "@/features/precos/components/currency-input";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import {
  componenteCustoSchema,
  type ComponenteCustoFormValues,
} from "@/features/custo-hora/custo-hora-schema";
import {
  TIPOS_CONFIGURAVEIS,
  TIPO_COMPONENTE_LABEL,
  CATEGORIAS_COMPONENTE,
  CATEGORIA_COMPONENTE_LABEL,
} from "@/features/custo-hora/labels";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { ResumoNovoCusto } from "@/features/custo-hora/components/resumo-novo-custo";
import type { ComponenteCusto } from "@/shared/types";

interface Props {
  inicial: ComponenteCusto | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ComponenteCustoForm({ inicial, onSuccess, onCancel }: Props) {
  const equipamentos = equipamentosStore.useAll().filter((e) => e.ativo);
  // Horas/mês de referência é só um auxílio de cálculo do "impacto no custo/h"
  // do resumo — não persiste em ComponenteCusto (não há coluna pra isso).
  const [horasReferencia, setHorasReferencia] = useState("160");
  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isSubmitting },
  } = useForm<ComponenteCustoFormValues>({
    resolver: zodResolver(componenteCustoSchema),
    defaultValues: {
      equipamento_id: inicial?.equipamento_id ?? "",
      descricao: inicial?.descricao ?? "",
      tipo: (inicial?.tipo as "fixo_mensal" | "variavel_hora") ?? "fixo_mensal",
      valor: inicial?.valor ?? 0,
      categoria: inicial?.categoria ?? undefined,
      competencia: inicial?.competencia ?? "",
      observacao: inicial?.observacao ?? "",
      ativo: inicial?.ativo ?? true,
    },
  });

  const equipamentoId = useWatch({ control, name: "equipamento_id" });
  const tipo = useWatch({ control, name: "tipo" });
  const valor = useWatch({ control, name: "valor" });
  const equipamentoNome =
    equipamentos.find((e) => e.id === equipamentoId)?.nome ?? "Selecione o equipamento";
  const horas = Number(horasReferencia) || 0;
  const impactoPorHora = tipo === "variavel_hora" ? (valor ?? 0) : horas ? (valor ?? 0) / horas : 0;

  const onSubmit = (values: ComponenteCustoFormValues) => {
    const payload = {
      equipamento_id: values.equipamento_id,
      descricao: values.descricao,
      tipo: values.tipo,
      valor: values.valor,
      categoria: values.categoria ?? null,
      competencia: values.competencia?.trim() ? values.competencia.trim() : null,
      observacao: values.observacao?.trim() ? values.observacao.trim() : null,
      ativo: values.ativo,
    };
    if (inicial) {
      componentesCustoStore.update(inicial.id, payload);
      toast.success("Componente atualizado.");
    } else {
      componentesCustoStore.create(payload);
      toast.success("Componente cadastrado.");
    }
    onSuccess();
  };

  const formulario = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="equipamento_id">Equipamento *</Label>
          <Controller
            control={control}
            name="equipamento_id"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="equipamento_id" aria-invalid={!!errors.equipamento_id}>
                  <SelectValue placeholder="Selecione o equipamento" />
                </SelectTrigger>
                <SelectContent>
                  {equipamentos.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.equipamento_id ? (
            <p className="text-xs text-destructive">{errors.equipamento_id.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="categoria">Categoria</Label>
          <Controller
            control={control}
            name="categoria"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_COMPONENTE.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORIA_COMPONENTE_LABEL[c]}
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
        <Input id="descricao" {...register("descricao")} aria-invalid={!!errors.descricao} />
        {errors.descricao ? (
          <p className="text-xs text-destructive">{errors.descricao.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tipo">Base do valor *</Label>
        <Controller
          control={control}
          name="tipo"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_CONFIGURAVEIS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TIPO_COMPONENTE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="valor">Valor (R$) *</Label>
          <Controller
            control={control}
            name="valor"
            render={({ field }) => (
              <CurrencyInput
                id="valor"
                value={field.value}
                onChange={field.onChange}
                error={!!errors.valor}
              />
            )}
          />
          {errors.valor ? <p className="text-xs text-destructive">{errors.valor.message}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="horas_referencia">Horas/mês de referência</Label>
          <Input
            id="horas_referencia"
            type="number"
            min="0"
            inputMode="numeric"
            className="font-mono"
            disabled={tipo === "variavel_hora"}
            value={horasReferencia}
            onChange={(e) => setHorasReferencia(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="competencia">Competência</Label>
          <Input id="competencia" placeholder="mm/aaaa" {...register("competencia")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observacao">Observações</Label>
        <Textarea
          id="observacao"
          placeholder="Critério de rateio, referência do contrato, memória de cálculo…"
          {...register("observacao")}
        />
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Componente ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não entram no cálculo do custo/hora, mas ficam no histórico.
              </p>
            </div>
            <Switch id="ativo" checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          {inicial ? "Salvar alterações" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );

  if (inicial) return formulario;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Dados do custo</CardTitle>
        </CardHeader>
        <CardContent>{formulario}</CardContent>
      </Card>
      <ResumoNovoCusto
        control={control}
        equipamentoNome={equipamentoNome}
        impactoPorHora={impactoPorHora}
      />
    </div>
  );
}
