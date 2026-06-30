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
import { clientesStore } from "@/features/clientes/clientes-store";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { orcamentoSchema, type OrcamentoFormValues } from "@/features/orcamentos/orcamento-schema";

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
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OrcamentoFormValues>({
    resolver: zodResolver(orcamentoSchema),
    defaultValues: { cliente_id: "", descricao_obra: "", validade: validadePadrao() },
  });

  const onSubmit = (values: OrcamentoFormValues) => {
    const novo = orcamentosStore.criar({
      cliente_id: values.cliente_id,
      descricao_obra: values.descricao_obra.trim(),
      validade: values.validade?.trim() ? values.validade : null,
    });
    toast.success(`Orçamento criado — ${novo.numero}.`);
    navigate({ to: "/admin/orcamentos/$orcamentoId", params: { orcamentoId: novo.id } });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Input id="descricao_obra" {...register("descricao_obra")} aria-invalid={!!errors.descricao_obra} />
        {errors.descricao_obra ? (
          <p className="text-xs text-destructive">{errors.descricao_obra.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="validade">Validade</Label>
        <Input id="validade" type="date" className="font-mono" {...register("validade")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
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
    </form>
  );
}
