import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { operadoresStore } from "@/features/operadores/operadores-store";
import {
  operadorSchema,
  type OperadorFormValues,
} from "@/features/operadores/operador-schema";
import type { Operador } from "@/shared/types";

interface Props {
  inicial: Operador | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OperadorForm({ inicial, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OperadorFormValues>({
    resolver: zodResolver(operadorSchema),
    defaultValues: {
      nome: inicial?.nome ?? "",
      telefone: inicial?.telefone ?? "",
      ativo: inicial?.ativo ?? true,
    },
  });

  const onSubmit = (values: OperadorFormValues) => {
    const payload = {
      nome: values.nome,
      telefone: values.telefone?.trim() ? values.telefone.trim() : null,
      ativo: values.ativo,
    };
    if (inicial) {
      operadoresStore.update(inicial.id, payload);
      toast.success("Operador atualizado.");
    } else {
      operadoresStore.create(payload);
      toast.success("Operador cadastrado.");
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

      <div className="space-y-1.5">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          inputMode="tel"
          placeholder="opcional — ex.: 44999990001"
          className="font-mono"
          {...register("telefone")}
        />
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Operador ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não podem ser atribuídos a novas ordens.
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
