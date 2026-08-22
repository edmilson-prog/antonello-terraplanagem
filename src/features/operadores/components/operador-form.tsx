import { Controller, useForm, useWatch, type Control } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { operadorSchema, type OperadorFormValues } from "@/features/operadores/operador-schema";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { habilitacoesStore } from "@/features/operadores/habilitacoes-store";
import { ResumoNovoOperador } from "@/features/operadores/components/resumo-novo-operador";
import type { Operador, Equipamento } from "@/shared/types";

const CNH_CATEGORIAS = ["A", "B", "C", "D", "E"];

/** Campo de texto vazio é ausência de dado, não string vazia no banco. */
const textoOuNulo = (v: string | undefined): string | null => (v?.trim() ? v.trim() : null);

interface Props {
  inicial: Operador | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OperadorForm({ inicial, onSuccess, onCancel }: Props) {
  const equipamentosAtivos = equipamentosStore.useAll().filter((e) => e.ativo);
  // Habilitações atuais do operador em edição — sem isso os checkboxes abririam
  // desmarcados e "salvar" apagaria silenciosamente o que já estava lá.
  const habilitadosAtuais = habilitacoesStore.useDoOperador(inicial?.id ?? "");
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
      vinculo: inicial?.vinculo ?? "CLT",
      data_nascimento: inicial?.data_nascimento ?? "",
      cnh_categoria: inicial?.cnh_categoria ?? "",
      cnh_validade: inicial?.cnh_validade ?? "",
      base: inicial?.base ?? "",
      admissao: inicial?.admissao ?? "",
      equipamentos_ids: habilitadosAtuais,
    },
  });

  const onSubmit = async (values: OperadorFormValues) => {
    try {
      if (inicial) {
        // Até a Onda 22 a edição gravava só nome/CPF/telefone/ativo: vínculo,
        // nascimento, CNH, base e habilitações eram coletados no cadastro e
        // depois viravam campos somente-leitura para sempre. Um erro de
        // digitação na validade da CNH não tinha conserto pela tela.
        await operadoresStore.update(inicial.id, {
          nome: values.nome,
          cpf: values.cpf.replace(/\D/g, ""),
          telefone: values.telefone?.trim() ? values.telefone.trim() : null,
          ativo: values.ativo,
          vinculo: values.vinculo ?? null,
          data_nascimento: textoOuNulo(values.data_nascimento),
          cnh_categoria: textoOuNulo(values.cnh_categoria),
          cnh_validade: textoOuNulo(values.cnh_validade),
          base: textoOuNulo(values.base),
          admissao: textoOuNulo(values.admissao),
        });
        await habilitacoesStore.definir(inicial.id, values.equipamentos_ids ?? []);
        toast.success("Operador atualizado.");
      } else {
        await operadoresStore.create({
          nome: values.nome,
          cpf: values.cpf.replace(/\D/g, ""),
          telefone: values.telefone?.trim() ? values.telefone.trim() : null,
          ativo: values.ativo,
          vinculo: values.vinculo ?? null,
          data_nascimento: textoOuNulo(values.data_nascimento),
          cnh_categoria: textoOuNulo(values.cnh_categoria),
          cnh_validade: textoOuNulo(values.cnh_validade),
          base: textoOuNulo(values.base),
          admissao: textoOuNulo(values.admissao),
          equipamentos_ids: values.equipamentos_ids,
        });
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

      <div className="space-y-1.5">
        <Label htmlFor="vinculo">Vínculo</Label>
        <Controller
          control={control}
          name="vinculo"
          render={({ field }) => (
            <Select value={field.value ?? "CLT"} onValueChange={field.onChange}>
              <SelectTrigger id="vinculo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLT">CLT</SelectItem>
                <SelectItem value="PJ">PJ</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="data_nascimento">Nascimento</Label>
          <Input
            id="data_nascimento"
            type="date"
            className="font-mono"
            {...register("data_nascimento")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admissao">Admissão</Label>
          <Input id="admissao" type="date" className="font-mono" {...register("admissao")} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cnh_categoria">CNH — categoria</Label>
          <Controller
            control={control}
            name="cnh_categoria"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="cnh_categoria">
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {CNH_CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>
                      Categoria {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cnh_validade">CNH — validade</Label>
          <Input
            id="cnh_validade"
            type="date"
            className="font-mono"
            {...register("cnh_validade")}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="base">Base</Label>
        <Input id="base" placeholder="Santo Ângelo — RS" {...register("base")} />
      </div>

      <div className="space-y-1.5">
        <span className="text-sm font-medium leading-none">Equipamentos habilitados</span>
        <Controller
          control={control}
          name="equipamentos_ids"
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-2">
              {equipamentosAtivos.map((e) => {
                const selecionados = field.value ?? [];
                const marcado = selecionados.includes(e.id);
                return (
                  <label key={e.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={marcado}
                      onCheckedChange={(v) =>
                        field.onChange(
                          v ? [...selecionados, e.id] : selecionados.filter((id) => id !== e.id),
                        )
                      }
                    />
                    {e.nome}
                  </label>
                );
              })}
            </div>
          )}
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

  if (inicial) return formulario;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Dados cadastrais</CardTitle>
        </CardHeader>
        <CardContent>{formulario}</CardContent>
      </Card>
      <ResumoNovoOperadorConectado control={control} equipamentosAtivos={equipamentosAtivos} />
    </div>
  );
}

// Lê `equipamentos_ids` do próprio formulário (useWatch) e resolve pra
// objetos Equipamento completos antes de repassar ao resumo — mantém
// ResumoNovoOperador simples (recebe a lista já resolvida, não os ids).
function ResumoNovoOperadorConectado({
  control,
  equipamentosAtivos,
}: {
  control: Control<OperadorFormValues>;
  equipamentosAtivos: Equipamento[];
}) {
  const ids = useWatch({ control, name: "equipamentos_ids" }) ?? [];
  const selecionados = equipamentosAtivos.filter((e) => ids.includes(e.id));
  return <ResumoNovoOperador control={control} equipamentosSelecionados={selecionados} />;
}
