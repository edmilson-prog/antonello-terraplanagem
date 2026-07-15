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
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { proximoNumeroOS } from "@/features/ordem-servico/numero-os";
import {
  ordemSchema,
  ordemCriacaoSchema,
  type OrdemFormValues,
} from "@/features/ordem-servico/ordem-schema";
import {
  MODELO_LABEL,
  TIPO_SERVICO_LABEL,
  TIPOS_SERVICO,
  SEM_RESPONSAVEL,
  SEM_EQUIPAMENTO,
  SEM_ORCAMENTO,
} from "@/features/ordem-servico/labels";
import { clientesStore } from "@/features/clientes/clientes-store";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { GerarTextoBotao } from "@/features/ia/components/gerar-texto-botao";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SugestaoAlocacaoPainel } from "@/features/ia/components/sugestao-alocacao-painel";
import { ResumoNovaOrdem } from "@/features/ordem-servico/components/resumo-nova-ordem";
import type { ModeloCobranca, OrdemServico } from "@/shared/types";

const MODELOS: ModeloCobranca[] = ["hora_maquina", "por_metro"];

interface Props {
  inicial: OrdemServico | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OrdemForm({ inicial, onSuccess, onCancel }: Props) {
  const clientes = clientesStore.useAll().filter((c) => c.ativo);
  const operadores = operadoresStore.useAll().filter((o) => o.ativo);
  const apontamentos = apontamentosStore.useTodos();
  const equipamentos = equipamentosStore.useAll();
  const equipamentosAtivos = equipamentosStore.useAll().filter((e) => e.ativo);
  const orcamentosVinculaveis = orcamentosStore
    .useTodos()
    .filter((o) => o.status === "aprovado" && !o.os_id);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrdemFormValues>({
    resolver: zodResolver(inicial ? ordemSchema : ordemCriacaoSchema),
    defaultValues: {
      cliente_id: inicial?.cliente_id ?? "",
      obra_nome: inicial?.obra_nome ?? "",
      endereco: inicial?.endereco ?? "",
      modelo_cobranca: inicial?.modelo_cobranca ?? "hora_maquina",
      responsavel_id: inicial?.responsavel_id ?? undefined,
      observacao: inicial?.observacao ?? "",
      diametro_broca_mm: inicial?.diametro_broca_mm ?? undefined,
      tipo_servico: inicial?.tipo_servico ?? undefined,
      equipamento_previsto_id: inicial?.equipamento_previsto_id ?? undefined,
      inicio_previsto: inicial?.inicio_previsto ?? "",
      orcamento_id: undefined,
    },
  });

  const modelo = watch("modelo_cobranca");

  const onSubmit = async (values: OrdemFormValues) => {
    const responsavel =
      values.responsavel_id && values.responsavel_id !== SEM_RESPONSAVEL
        ? values.responsavel_id
        : null;
    const equipamentoPrevisto =
      values.equipamento_previsto_id && values.equipamento_previsto_id !== SEM_EQUIPAMENTO
        ? values.equipamento_previsto_id
        : null;
    const orcamentoEscolhido =
      values.orcamento_id && values.orcamento_id !== SEM_ORCAMENTO ? values.orcamento_id : null;
    const ehPorMetro = values.modelo_cobranca === "por_metro";
    const dados = {
      cliente_id: values.cliente_id,
      obra_nome: values.obra_nome,
      endereco: values.endereco?.trim() ? values.endereco.trim() : null,
      modelo_cobranca: values.modelo_cobranca,
      responsavel_id: responsavel,
      observacao: values.observacao?.trim() ? values.observacao.trim() : null,
      diametro_broca_mm: ehPorMetro ? (values.diametro_broca_mm ?? null) : null,
      tipo_servico: values.tipo_servico ?? null,
      equipamento_previsto_id: equipamentoPrevisto,
      inicio_previsto: values.inicio_previsto?.trim() ? values.inicio_previsto.trim() : null,
    };

    try {
      if (inicial) {
        await ordensStore.atualizar(inicial.id, dados);
        toast.success("OS atualizada.");
      } else {
        const numero = proximoNumeroOS(ordensStore.listar(), new Date().getFullYear());
        const novaOrdem = await ordensStore.criar({ ...dados, numero });
        if (orcamentoEscolhido) {
          await orcamentosStore.vincularOS(orcamentoEscolhido, novaOrdem.id);
        }
        toast.success(`OS criada — ${numero}.`);
      }
      onSuccess();
    } catch (err) {
      const detalhe = err instanceof Error ? `: ${err.message}` : "";
      toast.error((inicial ? "Falha ao atualizar a OS" : "Falha ao criar a OS") + detalhe);
    }
  };

  const formulario = (
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
              <Select value={field.value ?? SEM_RESPONSAVEL} onValueChange={field.onChange}>
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
        <div className="space-y-1.5">
          <Label htmlFor="diametro_broca_mm">Diâmetro da broca (mm) *</Label>
          <Input
            id="diametro_broca_mm"
            type="number"
            step="1"
            min="0"
            className="font-mono"
            placeholder="ex.: 400"
            {...register("diametro_broca_mm", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
            aria-invalid={!!errors.diametro_broca_mm}
          />
          {errors.diametro_broca_mm ? (
            <p className="text-xs text-destructive">{errors.diametro_broca_mm.message}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="tipo_servico">
            Tipo de serviço{!inicial ? <span className="text-destructive"> *</span> : null}
          </Label>
          <Controller
            control={control}
            name="tipo_servico"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="tipo_servico" aria-invalid={!!errors.tipo_servico}>
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_SERVICO.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_SERVICO_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.tipo_servico ? (
            <p className="text-xs text-destructive">{errors.tipo_servico.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inicio_previsto">Início previsto</Label>
          <Input
            id="inicio_previsto"
            type="date"
            className="font-mono"
            {...register("inicio_previsto")}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="equipamento_previsto_id">Equipamento previsto</Label>
        <Controller
          control={control}
          name="equipamento_previsto_id"
          render={({ field }) => (
            <Select value={field.value ?? SEM_EQUIPAMENTO} onValueChange={field.onChange}>
              <SelectTrigger id="equipamento_previsto_id">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SEM_EQUIPAMENTO}>Sem equipamento definido</SelectItem>
                {equipamentosAtivos.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {!inicial ? (
        <div className="space-y-1.5">
          <Label htmlFor="orcamento_id">Orçamento vinculado</Label>
          <Controller
            control={control}
            name="orcamento_id"
            render={({ field }) => (
              <Select value={field.value ?? SEM_ORCAMENTO} onValueChange={field.onChange}>
                <SelectTrigger id="orcamento_id">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEM_ORCAMENTO}>Sem orçamento vinculado</SelectItem>
                  {orcamentosVinculaveis.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.numero} · {o.descricao_obra}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="observacao">Observação</Label>
          {inicial ? (
            <GerarTextoBotao
              os={inicial}
              apontamentos={apontamentos.filter((a) => a.os_id === inicial.id)}
              equipamentos={equipamentos}
              onGerado={(texto) => setValue("observacao", texto)}
            />
          ) : null}
        </div>
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

  if (inicial) return formulario;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados da OS</TabsTrigger>
          <TabsTrigger value="sugestao">Sugestão de IA</TabsTrigger>
        </TabsList>
        <TabsContent value="dados" className="mt-4">
          {formulario}
        </TabsContent>
        <TabsContent value="sugestao" className="mt-4">
          <SugestaoAlocacaoPainel modeloCobranca={modelo} />
        </TabsContent>
      </Tabs>
      <ResumoNovaOrdem control={control} />
    </div>
  );
}
