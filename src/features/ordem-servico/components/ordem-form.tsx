import { Controller, useForm } from "react-hook-form";
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
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { proximoNumeroOS } from "@/features/ordem-servico/numero-os";
import { ordemSchema, type OrdemFormValues } from "@/features/ordem-servico/ordem-schema";
import { MODELO_LABEL } from "@/features/ordem-servico/labels";
import { clientesStore } from "@/features/clientes/clientes-store";
import { operadoresStore } from "@/features/operadores/operadores-store";
import type { ModeloCobranca, OrdemServico } from "@/shared/types";

const SEM_RESPONSAVEL = "sem-responsavel";
const MODELOS: ModeloCobranca[] = ["hora_maquina", "por_metro"];

interface Props {
  inicial: OrdemServico | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OrdemForm({ inicial, onSuccess, onCancel }: Props) {
  const clientes = clientesStore.useAll().filter((c) => c.ativo);
  const operadores = operadoresStore.useAll().filter((o) => o.ativo);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrdemFormValues>({
    resolver: zodResolver(ordemSchema),
    defaultValues: {
      cliente_id: inicial?.cliente_id ?? "",
      obra_nome: inicial?.obra_nome ?? "",
      endereco: inicial?.endereco ?? "",
      modelo_cobranca: inicial?.modelo_cobranca ?? "hora_maquina",
      responsavel_id: inicial?.responsavel_id ?? undefined,
      observacao: inicial?.observacao ?? "",
      metragem_executada: inicial?.metragem_executada ?? undefined,
      diametro_broca_mm: inicial?.diametro_broca_mm ?? undefined,
    },
  });

  const modelo = watch("modelo_cobranca");

  const onSubmit = (values: OrdemFormValues) => {
    const responsavel =
      values.responsavel_id && values.responsavel_id !== SEM_RESPONSAVEL
        ? values.responsavel_id
        : null;
    const ehPorMetro = values.modelo_cobranca === "por_metro";
    const dados = {
      cliente_id: values.cliente_id,
      obra_nome: values.obra_nome,
      endereco: values.endereco?.trim() ? values.endereco.trim() : null,
      modelo_cobranca: values.modelo_cobranca,
      responsavel_id: responsavel,
      observacao: values.observacao?.trim() ? values.observacao.trim() : null,
      metragem_executada: ehPorMetro ? (values.metragem_executada ?? null) : null,
      diametro_broca_mm: ehPorMetro ? (values.diametro_broca_mm ?? null) : null,
    };

    if (inicial) {
      ordensStore.atualizar(inicial.id, dados);
      toast.success("OS atualizada.");
    } else {
      const numero = proximoNumeroOS(ordensStore.listar(), new Date().getFullYear());
      ordensStore.criar({ ...dados, numero });
      toast.success(`OS criada — ${numero}.`);
    }
    onSuccess();
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
        <Label htmlFor="obra_nome">Obra *</Label>
        <Input id="obra_nome" {...register("obra_nome")} aria-invalid={!!errors.obra_nome} />
        {errors.obra_nome ? (
          <p className="text-xs text-destructive">{errors.obra_nome.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="endereco">Endereço</Label>
        <Input id="endereco" placeholder="opcional" {...register("endereco")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="modelo_cobranca">Modelo de cobrança *</Label>
          <Controller
            control={control}
            name="modelo_cobranca"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="modelo_cobranca">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELOS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {MODELO_LABEL[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="responsavel_id">Responsável</Label>
          <Controller
            control={control}
            name="responsavel_id"
            render={({ field }) => (
              <Select
                value={field.value ?? SEM_RESPONSAVEL}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="responsavel_id">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEM_RESPONSAVEL}>Sem responsável</SelectItem>
                  {operadores.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {modelo === "por_metro" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="diametro_broca_mm">Diâmetro da broca (mm) *</Label>
            <Input
              id="diametro_broca_mm"
              type="number"
              step="1"
              min="0"
              className="font-mono"
              placeholder="ex.: 400"
              {...register("diametro_broca_mm", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
              aria-invalid={!!errors.diametro_broca_mm}
            />
            {errors.diametro_broca_mm ? (
              <p className="text-xs text-destructive">{errors.diametro_broca_mm.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="metragem_executada">Metragem executada (m)</Label>
            <Input
              id="metragem_executada"
              type="number"
              step="0.1"
              min="0"
              className="font-mono"
              placeholder="opcional"
              {...register("metragem_executada", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
              aria-invalid={!!errors.metragem_executada}
            />
            {errors.metragem_executada ? (
              <p className="text-xs text-destructive">{errors.metragem_executada.message}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="observacao">Observação</Label>
        <Textarea id="observacao" rows={3} placeholder="opcional" {...register("observacao")} />
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
          {inicial ? "Salvar alterações" : "Criar OS"}
        </Button>
      </div>
    </form>
  );
}
