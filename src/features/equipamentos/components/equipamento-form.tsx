import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPOS, TIPO_LABEL, STATUS, STATUS_LABEL } from "@/features/equipamentos/labels";
import {
  equipamentoSchema,
  type EquipamentoFormValues,
} from "@/features/equipamentos/equipamento-schema";
import { ResumoNovoEquipamento } from "@/features/equipamentos/components/resumo-novo-equipamento";
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
    setError,
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
      propriedade: inicial?.propriedade ?? "propria",
      marca: inicial?.marca ?? "",
      ano: inicial?.ano ?? "",
    },
  });

  const onSubmit = async (values: EquipamentoFormValues) => {
    if (!inicial && !values.marca?.trim()) {
      setError("marca", { message: "Informe a marca/modelo" });
      return;
    }

    let planoIntervaloHoras: number | undefined;
    if (!inicial && values.plano_intervalo_horas?.trim()) {
      const n = Number(values.plano_intervalo_horas.trim());
      if (!Number.isFinite(n) || n <= 0) {
        setError("plano_intervalo_horas", { message: "Informe um número válido" });
        return;
      }
      planoIntervaloHoras = n;
    }

    try {
      if (inicial) {
        await equipamentosStore.update(inicial.id, {
          nome: values.nome,
          tipo: values.tipo,
          capacidade: values.capacidade,
          horimetro_atual: values.horimetro_atual,
          identificador: values.identificador?.trim() ? values.identificador.trim() : null,
          status: values.status,
          ativo: values.ativo,
        });
        toast.success("Equipamento atualizado.");
      } else {
        await equipamentosStore.create(
          {
            nome: values.nome,
            tipo: values.tipo,
            capacidade: values.capacidade,
            horimetro_atual: values.horimetro_atual,
            identificador: values.identificador?.trim() ? values.identificador.trim() : null,
            status: "disponivel",
            ativo: values.ativo,
            marca: values.marca?.trim() ? values.marca.trim() : null,
            ano: values.ano?.trim() ? values.ano.trim() : null,
            propriedade: values.propriedade ?? null,
          },
          { planoIntervaloHoras },
        );
        toast.success("Equipamento cadastrado.");
      }
      onSuccess();
    } catch (err) {
      const detalhe = err instanceof Error ? `: ${err.message}` : "";
      toast.error(
        (inicial ? "Falha ao atualizar o equipamento" : "Falha ao cadastrar o equipamento") +
          detalhe,
      );
    }
  };

  const formulario = (
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

      {!inicial ? (
        <div className="space-y-1.5">
          <Label>Propriedade</Label>
          <Controller
            control={control}
            name="propriedade"
            render={({ field }) => (
              <ToggleGroup
                type="single"
                variant="outline"
                className="justify-stretch"
                value={field.value ?? "propria"}
                onValueChange={(v) => v && field.onChange(v)}
              >
                <ToggleGroupItem
                  value="propria"
                  className="flex-1 gap-1.5 data-[state=on]:border-primary/50 data-[state=on]:bg-primary/20 data-[state=on]:text-foreground"
                >
                  <Icon icon="lucide:badge-check" className="h-4 w-4" />
                  Própria
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="locada"
                  className="flex-1 gap-1.5 data-[state=on]:border-primary/50 data-[state=on]:bg-primary/20 data-[state=on]:text-foreground"
                >
                  <Icon icon="lucide:link" className="h-4 w-4" />
                  Locada
                </ToggleGroupItem>
              </ToggleGroup>
            )}
          />
        </div>
      ) : null}

      {!inicial ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="marca">Marca / modelo *</Label>
            <Input
              id="marca"
              placeholder="Ex.: Caterpillar 320"
              {...register("marca")}
              aria-invalid={!!errors.marca}
            />
            {errors.marca ? (
              <p className="text-xs text-destructive">{errors.marca.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ano">Ano</Label>
            <Input
              id="ano"
              inputMode="numeric"
              placeholder="2019"
              className="font-mono"
              {...register("ano")}
            />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="horimetro_atual">
            {inicial ? "Horímetro atual" : "Horímetro inicial"} *
          </Label>
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
          <Label htmlFor="identificador">
            {inicial ? "Identificador / patrimônio" : "Placa / patrimônio"}
          </Label>
          <Input id="identificador" placeholder="opcional" {...register("identificador")} />
        </div>
      </div>

      {!inicial ? (
        <div className="space-y-1.5">
          <Label htmlFor="plano_intervalo_horas">Intervalo do plano preventivo (horas)</Label>
          <Input
            id="plano_intervalo_horas"
            inputMode="numeric"
            placeholder="Ex.: 250"
            className="font-mono"
            {...register("plano_intervalo_horas")}
            aria-invalid={!!errors.plano_intervalo_horas}
          />
          {errors.plano_intervalo_horas ? (
            <p className="text-xs text-destructive">{errors.plano_intervalo_horas.message}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Opcional. Se preenchido, cria um plano de manutenção preventiva vinculado a este
              equipamento.
            </p>
          )}
        </div>
      ) : null}

      {inicial ? (
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
      ) : null}

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

  if (inicial) return formulario;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Dados do equipamento</CardTitle>
        </CardHeader>
        <CardContent>{formulario}</CardContent>
      </Card>
      <ResumoNovoEquipamento control={control} />
    </div>
  );
}
