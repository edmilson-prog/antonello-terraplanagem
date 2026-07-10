import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { clientesStore } from "@/features/clientes/clientes-store";
import { clienteSchema, type ClienteFormValues } from "@/features/clientes/cliente-schema";
import type { Cliente } from "@/shared/types";

interface Props {
  inicial: Cliente | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClienteForm({ inicial, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: inicial?.nome ?? "",
      documento: inicial?.documento ?? "",
      telefone: inicial?.telefone ?? "",
      ativo: inicial?.ativo ?? true,
    },
  });

  const onSubmit = async (values: ClienteFormValues) => {
    const payload = {
      nome: values.nome,
      documento: values.documento?.trim() ? values.documento.replace(/\D/g, "") : null,
      telefone: values.telefone?.trim() ? values.telefone.trim() : null,
      ativo: values.ativo,
    };
    try {
      if (inicial) {
        await clientesStore.update(inicial.id, payload);
        toast.success("Cliente atualizado.");
      } else {
        await clientesStore.create(payload);
        toast.success("Cliente cadastrado.");
      }
      onSuccess();
    } catch (err) {
      const detalhe = err instanceof Error ? `: ${err.message}` : "";
      toast.error(
        (inicial ? "Falha ao atualizar o cliente" : "Falha ao cadastrar o cliente") + detalhe,
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome / razão social *</Label>
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
        <Label htmlFor="documento">CPF / CNPJ</Label>
        <Input
          id="documento"
          inputMode="numeric"
          placeholder="opcional"
          className="font-mono"
          {...register("documento")}
          aria-invalid={!!errors.documento}
        />
        {errors.documento ? (
          <p className="text-xs text-destructive">{errors.documento.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          inputMode="tel"
          placeholder="opcional"
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
              <Label htmlFor="ativo">Cliente ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não aparecem para novas ordens.
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
