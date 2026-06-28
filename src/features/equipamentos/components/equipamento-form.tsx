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
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPOS, TIPO_LABEL, STATUS, STATUS_LABEL } from "@/features/equipamentos/labels";
import {
  equipamentoSchema,
  type EquipamentoFormValues,
} from "@/features/equipamentos/equipamento-schema";
import type { Equipamento } from "@/shared/types";

interface Props {
  inicial: Equipamento | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EquipamentoForm({ inicial, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EquipamentoFormValues>({
    resolver: zodResolver(equipamentoSchema),
    defaultValues: {
      nome: inicial?.nome ?? "",
      tipo: inicial?.tipo ?? "escavadeira",
      capacidade: inicial?.capacidade ?? "",
      horimetro_atual: inicial?.horimetro_atual ?? 0,
      identificador: inicial?.identificador ?? "",
      status: inicial?.status ?? "disponivel",
      ativo: inicial?.ativo ?? true,
    },
  });

  const onSubmit = (values: EquipamentoFormValues) => {
    const payload = {
      nome: values.nome,
      tipo: values.tipo,
      capacidade: values.capacidade,
      horimetro_atual: values.horimetro_atual,
      identificador: values.identificador?.trim() ? values.identificador.trim() : null,
      status: values.status,
      ativo: values.ativo,
    };
    if (inicial) {
      equipamentosStore.update(inicial.id, payload);
      toast.success("Equipamento atualizado.");
    } else {
      equipamentosStore.create(payload);
      toast.success("Equipamento cadastrado.");
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" {...register("nome")} aria-invalid={!!errors.nome} />
        {errors.nome ? <p className="text-xs text-destructive">{errors.nome.message}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="capacidade">Capacidade *</Label>
          <Input
            id="capacidade"
            placeholder="ex.: 18 toneladas"
            {...register("capacidade")}
            aria-invalid={!!errors.capacidade}
          />
          {errors.capacidade ? (
            <p className="text-xs text-destructive">{errors.capacidade.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="horimetro_atual">Horímetro atual *</Label>
          <Input
            id="horimetro_atual"
            type="number"
            step="0.1"
            min="0"
            className="font-mono"
            {...register("horimetro_atual", { valueAsNumber: true })}
            aria-invalid={!!errors.horimetro_atual}
          />
          {errors.horimetro_atual ? (
            <p className="text-xs text-destructive">{errors.horimetro_atual.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="identificador">Identificador / patrimônio</Label>
          <Input id="identificador" placeholder="opcional" {...register("identificador")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">Status operacional *</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Equipamento ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não aparecem para novas ordens, mas ficam no histórico.
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
