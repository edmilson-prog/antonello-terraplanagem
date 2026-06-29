import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CurrencyInput } from "@/features/precos/components/currency-input";
import { precoMobilizacaoStore } from "@/features/precos/precos-mobilizacao-store";
import {
  precoMobilizacaoSchema,
  type PrecoMobilizacaoFormValues,
} from "@/features/precos/precos-schema";
import type { PrecoMobilizacao } from "@/shared/types";

interface Props {
  inicial: PrecoMobilizacao | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PrecoMobilizacaoForm({ inicial, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PrecoMobilizacaoFormValues>({
    resolver: zodResolver(precoMobilizacaoSchema),
    defaultValues: {
      descricao: inicial?.descricao ?? "",
      valor: inicial?.valor ?? 0,
      ativo: inicial?.ativo ?? true,
    },
  });

  const onSubmit = (values: PrecoMobilizacaoFormValues) => {
    const payload = {
      descricao: values.descricao.trim(),
      valor: values.valor,
      ativo: values.ativo,
    };
    if (inicial) {
      precoMobilizacaoStore.update(inicial.id, payload);
      toast.success("Mobilização atualizada.");
    } else {
      precoMobilizacaoStore.create(payload);
      toast.success("Mobilização cadastrada.");
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="descricao">Descrição *</Label>
        <Input
          id="descricao"
          placeholder="ex.: Mobilização escavadeira até 50km"
          {...register("descricao")}
          aria-invalid={!!errors.descricao}
        />
        {errors.descricao ? (
          <p className="text-xs text-destructive">{errors.descricao.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="valor">Valor *</Label>
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
        {errors.valor ? (
          <p className="text-xs text-destructive">{errors.valor.message}</p>
        ) : null}
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Item ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não são oferecidos a novos faturamentos, mas ficam no histórico.
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
