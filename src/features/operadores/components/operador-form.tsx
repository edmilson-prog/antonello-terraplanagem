import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { operadorSchema, type OperadorFormValues } from "@/features/operadores/operador-schema";
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
      cpf: inicial?.cpf ?? "",
      telefone: inicial?.telefone ?? "",
      ativo: inicial?.ativo ?? true,
    },
  });

  const onSubmit = async (values: OperadorFormValues) => {
    const payload = {
      nome: values.nome,
      cpf: values.cpf.replace(/\D/g, ""),
      telefone: values.telefone?.trim() ? values.telefone.trim() : null,
      ativo: values.ativo,
    };
    try {
      if (inicial) {
        await operadoresStore.update(inicial.id, payload);
        toast.success("Operador atualizado.");
      } else {
        await operadoresStore.create(payload);
        toast.success("Operador cadastrado.");
      }
      onSuccess();
    } catch (err) {
      const detalhe = err instanceof Error ? `: ${err.message}` : "";
      toast.error(
        (inicial ? "Falha ao atualizar o operador" : "Falha ao cadastrar o operador") + detalhe,
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          className="uppercase"
          {...register("nome", {
            onChange: (e) => {
              e.target.value = e.target.value.toUpperCase();
            },
          })}
          aria-invalid={!!errors.nome}
        />
        {errors.nome ? <p className="text-xs text-destructive">{errors.nome.message}</p> : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cpf">CPF *</Label>
        <Input
          id="cpf"
          inputMode="numeric"
          placeholder="somente números"
          className="font-mono"
          {...register("cpf")}
          aria-invalid={!!errors.cpf}
        />
        {errors.cpf ? (
          <p className="text-xs text-destructive">{errors.cpf.message}</p>
        ) : !inicial ? (
          <p className="text-xs text-muted-foreground">
            O PIN inicial de acesso ao app de campo será os últimos 4 dígitos do CPF.
          </p>
        ) : null}
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
