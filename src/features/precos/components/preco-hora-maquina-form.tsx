import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import {
  precoHoraMaquinaSchema,
  type PrecoHoraMaquinaFormValues,
} from "@/features/precos/precos-schema";
import { VINCULOS, VINCULO_LABEL } from "@/features/precos/labels";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPOS, TIPO_LABEL } from "@/features/equipamentos/labels";
import type { PrecoHoraMaquina } from "@/shared/types";

interface Props {
  inicial: PrecoHoraMaquina | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PrecoHoraMaquinaForm({ inicial, onSuccess, onCancel }: Props) {
  const equipamentos = equipamentosStore.useAll().filter((e) => e.ativo);
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PrecoHoraMaquinaFormValues>({
    resolver: zodResolver(precoHoraMaquinaSchema),
    defaultValues: {
      vinculo: inicial?.tipo_equipamento ? "tipo" : "equipamento",
      equipamento_id: inicial?.equipamento_id ?? undefined,
      tipo_equipamento: inicial?.tipo_equipamento ?? undefined,
      valor_hora_seca: inicial?.valor_hora_seca ?? 0,
      valor_hora_operada: inicial?.valor_hora_operada ?? 0,
      ativo: inicial?.ativo ?? true,
    },
  });

  const vinculo = watch("vinculo");

  const onSubmit = (values: PrecoHoraMaquinaFormValues) => {
    const payload = {
      equipamento_id:
        values.vinculo === "equipamento" ? (values.equipamento_id ?? null) : null,
      tipo_equipamento:
        values.vinculo === "tipo" ? (values.tipo_equipamento ?? null) : null,
      valor_hora_seca: values.valor_hora_seca,
      valor_hora_operada: values.valor_hora_operada,
      ativo: values.ativo,
    };
    if (inicial) {
      precoHoraMaquinaStore.update(inicial.id, payload);
      toast.success("Preço atualizado.");
    } else {
      precoHoraMaquinaStore.create(payload);
      toast.success("Preço cadastrado.");
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="vinculo">Vincular a *</Label>
        <Controller
          control={control}
          name="vinculo"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="vinculo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VINCULOS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {VINCULO_LABEL[v]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {vinculo === "equipamento" ? (
        <div className="space-y-1.5">
          <Label htmlFor="equipamento_id">Equipamento *</Label>
          <Controller
            control={control}
            name="equipamento_id"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
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
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="tipo_equipamento">Tipo de equipamento *</Label>
          <Controller
            control={control}
            name="tipo_equipamento"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  id="tipo_equipamento"
                  aria-invalid={!!errors.tipo_equipamento}
                >
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.tipo_equipamento ? (
            <p className="text-xs text-destructive">{errors.tipo_equipamento.message}</p>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="valor_hora_seca">Valor hora seca *</Label>
          <Controller
            control={control}
            name="valor_hora_seca"
            render={({ field }) => (
              <CurrencyInput
                id="valor_hora_seca"
                value={field.value}
                onChange={field.onChange}
                error={!!errors.valor_hora_seca}
              />
            )}
          />
          {errors.valor_hora_seca ? (
            <p className="text-xs text-destructive">{errors.valor_hora_seca.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="valor_hora_operada">Valor hora operada *</Label>
          <Controller
            control={control}
            name="valor_hora_operada"
            render={({ field }) => (
              <CurrencyInput
                id="valor_hora_operada"
                value={field.value}
                onChange={field.onChange}
                error={!!errors.valor_hora_operada}
              />
            )}
          />
          {errors.valor_hora_operada ? (
            <p className="text-xs text-destructive">{errors.valor_hora_operada.message}</p>
          ) : null}
        </div>
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
