import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Switch } from "@/components/ui/switch";
import { CurrencyInput } from "@/features/precos/components/currency-input";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import {
  componenteCustoSchema,
  type ComponenteCustoFormValues,
} from "@/features/custo-hora/custo-hora-schema";
import { TIPOS_CONFIGURAVEIS, TIPO_COMPONENTE_LABEL } from "@/features/custo-hora/labels";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import type { ComponenteCusto } from "@/shared/types";

interface Props {
  inicial: ComponenteCusto | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ComponenteCustoForm({ inicial, onSuccess, onCancel }: Props) {
  const equipamentos = equipamentosStore.useAll().filter((e) => e.ativo);
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
      ativo: inicial?.ativo ?? true,
    },
  });

  const onSubmit = (values: ComponenteCustoFormValues) => {
    if (inicial) {
      componentesCustoStore.update(inicial.id, values);
      toast.success("Componente atualizado.");
    } else {
      componentesCustoStore.create(values);
      toast.success("Componente cadastrado.");
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Label htmlFor="descricao">Descrição *</Label>
        <Input id="descricao" {...register("descricao")} aria-invalid={!!errors.descricao} />
        {errors.descricao ? (
          <p className="text-xs text-destructive">{errors.descricao.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tipo">Tipo *</Label>
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
}
