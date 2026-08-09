import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AreaRolagem,
  BOTAO_VOLTAR,
  BotaoCampo,
  CabecalhoCampo,
  TelaCampo,
  classeBotaoCampo,
} from "@/features/operador/components/kit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HorimetroCapture } from "@/shared/components/horimetro-capture";
import { MicrofoneIABotao } from "@/features/ia/components/microfone-ia-button";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { statusEquipamento } from "@/features/manutencao/derivacoes";
import { ManutencaoIndicador } from "@/features/manutencao/components/manutencao-indicador";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { ordensDoOperador } from "@/features/ordem-servico/derivacoes";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import {
  iniciarApontamentoSchema,
  type IniciarApontamentoValues,
} from "@/features/apontamento/apontamento-schema";

const SEM_OS = "sem-os";

export function IniciarApontamentoForm({ osIdInicial }: { osIdInicial?: string }) {
  const navigate = useNavigate();
  const equipamentos = equipamentosStore.useAll().filter((e) => e.ativo);
  const planos = planosManutencaoStore.useAll();
  const registros = registrosManutencaoStore.useTodos();
  const apontamentos = apontamentosStore.useTodos();
  const ordens = ordensDoOperador(
    ordensStore.useTodas(),
    apontamentos,
    getOperadorLogadoId(),
  ).filter((o) => o.status !== "fechada");
  const [fotoInicialUrl, setFotoInicialUrl] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IniciarApontamentoValues>({
    resolver: zodResolver(iniciarApontamentoSchema),
    defaultValues: {
      equipamento_id: "",
      horimetro_inicial: Number.NaN,
      os_id: osIdInicial ?? SEM_OS,
      observacao: "",
      modalidade: "operada",
    },
  });

  const equipamentoId = watch("equipamento_id");
  const equipamentoSel = equipamentos.find((e) => e.id === equipamentoId);
  const osIdSel = watch("os_id");
  const osSel = ordens.find((o) => o.id === osIdSel);
  const mostrarModalidade = osSel?.modelo_cobranca !== "por_metro";

  // Conveniência de campo: ao escolher o equipamento, sugere o horímetro atual
  // dele (editável). Trocar de equipamento atualiza a sugestão.
  useEffect(() => {
    if (equipamentoSel) setValue("horimetro_inicial", equipamentoSel.horimetro_atual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipamentoId]);

  const onSubmit = (values: IniciarApontamentoValues) => {
    apontamentosStore.iniciar({
      equipamento_id: values.equipamento_id,
      horimetro_inicial: values.horimetro_inicial,
      os_id: values.os_id && values.os_id !== SEM_OS ? values.os_id : null,
      observacao: values.observacao ?? null,
      foto_inicial_url: fotoInicialUrl,
      modalidade: mostrarModalidade ? (values.modalidade ?? "operada") : null,
    });
    toast.success("Apontamento iniciado.");
    // Volta para "Hoje": é lá que o apontamento aberto fica em destaque, com o
    // atalho para encerrar no fim do turno.
    void navigate({ to: "/app" });
  };

  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={
          <Link to="/app" aria-label="Voltar" className={BOTAO_VOLTAR}>
            <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
          </Link>
        }
        titulo="Iniciar apontamento"
      />
      <AreaRolagem>
        <p className="mb-4 text-[12.5px] leading-[1.5] text-foreground-faint">
          Escolha o equipamento e registre o horímetro inicial. O horímetro final é lançado no fim
          do turno.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="equipamento">Equipamento *</Label>
            <Controller
              control={control}
              name="equipamento_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="equipamento"
                    className="h-12"
                    aria-invalid={!!errors.equipamento_id}
                  >
                    <SelectValue placeholder="Selecione o equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipamentos.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        <span className="flex items-center gap-2">
                          {e.nome}
                          <ManutencaoIndicador status={statusEquipamento(e, planos, registros)} />
                        </span>
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

          <Controller
            control={control}
            name="horimetro_inicial"
            render={({ field }) => (
              <HorimetroCapture
                label="Horímetro inicial *"
                value={Number.isNaN(field.value) ? "" : String(field.value)}
                onChange={(v) => field.onChange(v === "" ? Number.NaN : Number(v))}
                ocrBase={equipamentoSel?.horimetro_atual}
                onFotoCapturada={setFotoInicialUrl}
                error={errors.horimetro_inicial?.message}
              />
            )}
          />

          <div className="space-y-1.5">
            <Label htmlFor="os">Ordem de Serviço (opcional)</Label>
            <Controller
              control={control}
              name="os_id"
              render={({ field }) => (
                <Select value={field.value ?? SEM_OS} onValueChange={field.onChange}>
                  <SelectTrigger id="os" className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SEM_OS}>Sem OS</SelectItem>
                    {ordens.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.numero} — {o.obra_nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {mostrarModalidade ? (
            <div className="space-y-1.5">
              <Label htmlFor="modalidade">Modalidade</Label>
              <Controller
                control={control}
                name="modalidade"
                render={({ field }) => (
                  <Select value={field.value ?? "operada"} onValueChange={field.onChange}>
                    <SelectTrigger id="modalidade" className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operada">Operada (com operador)</SelectItem>
                      <SelectItem value="seca">Seca (sem operador)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="observacao">Observação (opcional)</Label>
            <Controller
              control={control}
              name="observacao"
              render={({ field }) => (
                <div className="flex items-start gap-2">
                  <Textarea
                    id="observacao"
                    rows={3}
                    placeholder="Algo relevante sobre o serviço?"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    aria-invalid={!!errors.observacao}
                    className="flex-1"
                  />
                  <MicrofoneIABotao campo="observacao" onResultado={field.onChange} />
                </div>
              )}
            />
            {errors.observacao ? (
              <p className="text-xs text-destructive">{errors.observacao.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2.5 pt-1">
            <BotaoCampo type="submit" disabled={isSubmitting}>
              <Icon icon="lucide:play" className="h-[18px] w-[18px]" />
              Iniciar apontamento
            </BotaoCampo>
            <Link to="/app" className={classeBotaoCampo("ghost")}>
              Cancelar
            </Link>
          </div>
        </form>
      </AreaRolagem>
    </TelaCampo>
  );
}
