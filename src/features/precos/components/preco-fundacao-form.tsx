import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CurrencyInput } from "@/features/precos/components/currency-input";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import { precoFundacaoSchema, type PrecoFundacaoFormValues } from "@/features/precos/precos-schema";
import { historicoPrecosStore } from "@/features/precos/historico-precos-store";
import type { PrecoFundacao } from "@/shared/types";

interface Props {
  inicial: PrecoFundacao | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PrecoFundacaoForm({ inicial, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PrecoFundacaoFormValues>({
    resolver: zodResolver(precoFundacaoSchema),
    defaultValues: {
      diametro_broca_mm: inicial?.diametro_broca_mm ?? 0,
      valor_metro: inicial?.valor_metro ?? 0,
      descricao: inicial?.descricao ?? "",
      ativo: inicial?.ativo ?? true,
    },
  });

  const onSubmit = (values: PrecoFundacaoFormValues) => {
    const payload = {
      diametro_broca_mm: values.diametro_broca_mm,
      valor_metro: values.valor_metro,
      descricao: values.descricao?.trim() ? values.descricao.trim() : null,
      ativo: values.ativo,
    };
    if (inicial) {
      historicoPrecosStore.registrar("fundacao", inicial);
      precoFundacaoStore.update(inicial.id, payload);
      toast.success("Preço atualizado.");
    } else {
      precoFundacaoStore.create(payload);
      toast.success("Preço cadastrado.");
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="diametro_broca_mm">Diâmetro da broca (mm) *</Label>
          <Input
            id="diametro_broca_mm"
            type="number"
            step="1"
            min="0"
            className="font-mono"
            placeholder="ex.: 300"
            {...register("diametro_broca_mm", { valueAsNumber: true })}
            aria-invalid={!!errors.diametro_broca_mm}
          />
          {errors.diametro_broca_mm ? (
            <p className="text-xs text-destructive">{errors.diametro_broca_mm.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="valor_metro">Valor por metro *</Label>
          <Controller
            control={control}
            name="valor_metro"
            render={({ field }) => (
              <CurrencyInput
                id="valor_metro"
                value={field.value}
                onChange={field.onChange}
                error={!!errors.valor_metro}
              />
            )}
          />
          {errors.valor_metro ? (
            <p className="text-xs text-destructive">{errors.valor_metro.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descricao">Descrição</Label>
        <Input
          id="descricao"
          placeholder="opcional — ex.: Estaca escavada Ø300mm"
          {...register("descricao")}
        />
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Preço ativo</Label>
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
