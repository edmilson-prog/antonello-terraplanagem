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
import { TIPOS, TIPO_LABEL } from "@/features/equipamentos/labels";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { notificarManutencaoAgendada } from "@/features/notificacoes/eventos";
import { VINCULOS_PLANO, VINCULO_PLANO_LABEL } from "@/features/manutencao/labels";
import {
  planoManutencaoSchema,
  type PlanoManutencaoFormValues,
} from "@/features/manutencao/planos-manutencao-schema";
import type { PlanoManutencao } from "@/shared/types";

interface Props {
  inicial: PlanoManutencao | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PlanoManutencaoForm({ inicial, onSuccess, onCancel }: Props) {
  const equipamentos = equipamentosStore.useAll().filter((e) => e.ativo);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PlanoManutencaoFormValues>({
    resolver: zodResolver(planoManutencaoSchema),
    defaultValues: {
      vinculo: inicial?.tipo_equipamento ? "tipo" : "equipamento",
      equipamento_id: inicial?.equipamento_id ?? undefined,
      tipo_equipamento: inicial?.tipo_equipamento ?? undefined,
      descricao: inicial?.descricao ?? "",
      intervalo_horas: inicial?.intervalo_horas ?? 0,
      ativo: inicial?.ativo ?? true,
    },
  });

  const vinculo = watch("vinculo");

  const onSubmit = async (values: PlanoManutencaoFormValues) => {
    const payload = {
      equipamento_id: values.vinculo === "equipamento" ? (values.equipamento_id ?? null) : null,
      tipo_equipamento: values.vinculo === "tipo" ? (values.tipo_equipamento ?? null) : null,
      descricao: values.descricao,
      intervalo_horas: values.intervalo_horas,
      ativo: values.ativo,
    };
    try {
      if (inicial) {
        await planosManutencaoStore.update(inicial.id, payload);
        toast.success("Plano atualizado.");
      } else {
        const plano = await planosManutencaoStore.create(payload);
        // Materializa o 1º ciclo "prevista" para cada equipamento já afetado,
        // usando o horímetro atual dele — sem isso o plano não teria status.
        const alvos = equipamentos.filter(
          (e) => e.id === plano.equipamento_id || e.tipo === plano.tipo_equipamento,
        );
        for (const equipamento of alvos) {
          const registro = await registrosManutencaoStore.criarPrevista({
            equipamento_id: equipamento.id,
            plano_id: plano.id,
            horimetro_previsto: equipamento.horimetro_atual + plano.intervalo_horas,
          });

          // Avisa quem opera a máquina (PRD-020). Não aguardado de propósito: o
          // plano já está cadastrado e a retaguarda não deve esperar o envio.
          void notificarManutencaoAgendada({
            registroId: registro.id,
            equipamentoId: equipamento.id,
            equipamentoNome: equipamento.nome,
            descricaoPlano: plano.descricao,
            horimetroPrevisto: registro.horimetro_previsto ?? 0,
          });
        }
        toast.success("Plano cadastrado.");
      }
      onSuccess();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar o plano.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="descricao">Descrição *</Label>
        <Input
          id="descricao"
          placeholder="ex.: Troca de óleo e filtros"
          {...register("descricao")}
          aria-invalid={!!errors.descricao}
        />
        {errors.descricao ? (
          <p className="text-xs text-destructive">{errors.descricao.message}</p>
        ) : null}
      </div>

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
                {VINCULOS_PLANO.map((v) => (
                  <SelectItem key={v} value={v}>
                    {VINCULO_PLANO_LABEL[v]}
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
                <SelectTrigger id="tipo_equipamento" aria-invalid={!!errors.tipo_equipamento}>
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

      <div className="space-y-1.5">
        <Label htmlFor="intervalo_horas">Intervalo (horas) *</Label>
        <Input
          id="intervalo_horas"
          type="number"
          step="1"
          min="1"
          className="font-mono"
          {...register("intervalo_horas", { valueAsNumber: true })}
          aria-invalid={!!errors.intervalo_horas}
        />
        {errors.intervalo_horas ? (
          <p className="text-xs text-destructive">{errors.intervalo_horas.message}</p>
        ) : null}
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Plano ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não geram alertas, mas ficam no histórico.
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
