import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  AvisoCampo,
  BOTAO_VOLTAR,
  BotaoCampo,
  CabecalhoCampo,
  CienciaConfirmada,
  IconeTile,
  SecaoCampo,
  StatusCampo,
  TagCabecalho,
  TelaCampo,
  VazioCampo,
} from "@/features/operador/components/kit";
import { derivarAlertasSeguranca } from "@/features/operador/alertas-seguranca";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { registrosCampoStore } from "@/features/registros-campo/registros-campo-store";
import { cienciasConfirmadas } from "@/features/registros-campo/derivacoes";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import { cn } from "@/lib/utils";

/*
 * Alertas de segurança (`screen === 'seg'` no CampoApp.jsx).
 *
 * O DDS do kit depende de a retaguarda publicar o tema do dia, o que ainda não
 * existe no sistema — por isso o bloco aparece com o estado vazio explicado, em
 * vez de conteúdo inventado. Os alertas vêm dos riscos que o sistema já
 * conhece sobre as máquinas do operador (ver alertas-seguranca.ts), e a
 * ciência de cada um fica registrada e visível para a retaguarda.
 */

export function SegurancaPage() {
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const equipamentos = equipamentosStore.useAll();
  const planos = planosManutencaoStore.useAll();
  const registrosManutencao = registrosManutencaoStore.useTodos();
  const registrosCampo = registrosCampoStore.useTodos();

  const operadorId = getOperadorLogadoId();
  const alertas = useMemo(
    () =>
      derivarAlertasSeguranca({
        operadorId,
        ordens,
        apontamentos,
        equipamentos,
        planos,
        registrosManutencao,
        registrosCampo,
      }),
    [operadorId, ordens, apontamentos, equipamentos, planos, registrosManutencao, registrosCampo],
  );

  const confirmados = cienciasConfirmadas(registrosCampo);
  const pendentes = alertas.filter((a) => !confirmados.has(a.id)).length;

  function confirmarCiencia(alertaId: string, titulo: string) {
    registrosCampoStore.registrar({
      tipo: "ciencia_seguranca",
      dados: { alerta_id: alertaId, titulo },
    });
  }

  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={
          <Link to="/app" aria-label="Voltar" className={BOTAO_VOLTAR}>
            <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
          </Link>
        }
        titulo="Segurança"
        tag={
          <TagCabecalho tom={pendentes === 0 ? "success" : "amber"}>
            {pendentes === 0 ? "tudo ciente" : `${pendentes} pendentes`}
          </TagCabecalho>
        }
      />
      <AreaRolagem>
        <SecaoCampo className="mt-0">DDS de hoje</SecaoCampo>
        <div className="rounded-[14px] border border-dashed bg-surface px-3.5 py-4 text-center">
          <Icon icon="lucide:hard-hat" className="mx-auto h-6 w-6 text-foreground-faint" />
          <p className="mt-2 text-[12.5px] leading-[1.5] text-foreground-faint">
            A retaguarda ainda não publica o Diálogo Diário de Segurança pelo sistema. Quando
            publicar, ele aparece aqui para você confirmar participação.
          </p>
        </div>

        <SecaoCampo>Alertas ativos</SecaoCampo>
        {alertas.length === 0 ? (
          <VazioCampo
            icone="lucide:shield-check"
            titulo="Nenhum alerta para você"
            descricao="Nenhuma máquina sua está com manutenção vencida, checklist reprovado ou bloqueio de operação."
          />
        ) : (
          alertas.map((alerta) => {
            const critico = alerta.severidade === "critico";
            const ciente = confirmados.has(alerta.id);
            return (
              <div
                key={alerta.id}
                className={cn(
                  "mb-3 rounded-[14px] border bg-surface px-3.5 py-3.5",
                  critico ? "border-destructive/40" : "border-border",
                )}
              >
                <div className="mb-3 flex items-start gap-[11px]">
                  <IconeTile tom={critico ? "danger" : "amber"}>
                    <Icon icon={alerta.icone} className="h-[17px] w-[17px]" />
                  </IconeTile>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-bold text-foreground">{alerta.titulo}</div>
                    <div className="mt-1 text-xs leading-[1.5] text-muted-foreground">
                      {alerta.mensagem}
                    </div>
                  </div>
                  <StatusCampo tom={critico ? "danger" : "amber"}>
                    {critico ? "Crítico" : "Atenção"}
                  </StatusCampo>
                </div>
                {ciente ? (
                  <CienciaConfirmada>Ciente · confirmado</CienciaConfirmada>
                ) : (
                  <BotaoCampo
                    variante="ghost"
                    className="min-h-11"
                    onClick={() => confirmarCiencia(alerta.id, alerta.titulo)}
                  >
                    <Icon icon="lucide:check" className="h-4 w-4" strokeWidth={2.2} />
                    Confirmar ciência
                  </BotaoCampo>
                )}
              </div>
            );
          })
        )}

        <AvisoCampo className="mt-1">
          As confirmações ficam registradas e visíveis para a{" "}
          <b className="text-foreground">retaguarda</b>.
        </AvisoCampo>
      </AreaRolagem>
    </TelaCampo>
  );
}
