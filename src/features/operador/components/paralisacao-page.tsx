import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  AvisoCampo,
  BlocoCampo,
  BotaoCampo,
  CabecalhoCampo,
  CartaoCampo,
  IconeTile,
  LINHA_CAMPO,
  LINHA_CAMPO_CLICAVEL,
  LinhaCorpo,
  LinhaMeta,
  LinhaTitulo,
  SecaoCampo,
  StepperCampo,
  TagCabecalho,
  TelaCampo,
  TextareaCampo,
  VazioCampo,
  classeBotaoCampo,
} from "@/features/operador/components/kit";
import { ConfirmacaoCampo } from "@/features/operador/components/confirmacao-campo";
import { VoltarParaOS } from "@/features/operador/components/voltar-os";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { registrosCampoStore } from "@/features/registros-campo/registros-campo-store";
import { registrosDoTipo, resumoRegistro } from "@/features/registros-campo/derivacoes";
import { MOTIVO_PARALISACAO, type MotivoParalisacao } from "@/features/registros-campo/tipos";
import { rotuloDiaRelativo } from "@/shared/lib/format";

/*
 * Registro de paralisação (`screen === 'par'` no CampoApp.jsx): por que a
 * frente parou e por quanto tempo. É o que justifica horas menores na medição.
 */

const MOTIVOS = Object.keys(MOTIVO_PARALISACAO) as MotivoParalisacao[];
const PASSO = 0.5;

export function ParalisacaoPage({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const registros = registrosCampoStore.useTodos();

  const [motivo, setMotivo] = useState<MotivoParalisacao | null>(null);
  const [duracao, setDuracao] = useState(1);
  const [observacao, setObservacao] = useState("");
  const [confirmado, setConfirmado] = useState(false);

  const recentes = registrosDoTipo(registros, "paralisacao").slice(0, 4);

  function confirmar() {
    if (!motivo) return;
    registrosCampoStore.registrar({
      tipo: "paralisacao",
      os_id: ordemId,
      equipamento_id: ordem?.equipamento_previsto_id ?? null,
      dados: { motivo, duracao_horas: duracao, observacao: observacao.trim() || null },
    });
    setConfirmado(true);
  }

  if (confirmado && motivo) {
    return (
      <TelaCampo>
        <ConfirmacaoCampo
          titulo="Paralisação registrada"
          linhas={[
            { rotulo: ordem?.numero ?? "OS", valor: ordem?.obra_nome ?? "—" },
            { rotulo: "Motivo", valor: MOTIVO_PARALISACAO[motivo].label },
            {
              rotulo: "Duração",
              valor: `${duracao.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} h`,
            },
          ]}
          acoes={
            <>
              <Link to="/app/ordens/$ordemId" params={{ ordemId }} className={classeBotaoCampo()}>
                Voltar para a OS
              </Link>
              {motivo === "quebra" ? (
                <Link
                  to="/app/ordens/$ordemId/manutencao"
                  params={{ ordemId }}
                  className={classeBotaoCampo("ghost")}
                >
                  Solicitar manutenção
                </Link>
              ) : null}
            </>
          }
        />
      </TelaCampo>
    );
  }

  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={<VoltarParaOS ordemId={ordemId} />}
        titulo="Paralisação"
        tag={ordem ? <TagCabecalho>{ordem.numero}</TagCabecalho> : undefined}
      />
      <AreaRolagem className="pb-3">
        <BlocoCampo rotulo="Motivo da parada">
          <CartaoCampo>
            {MOTIVOS.map((id) => {
              const opcao = MOTIVO_PARALISACAO[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMotivo(id)}
                  aria-pressed={motivo === id}
                  className={LINHA_CAMPO_CLICAVEL}
                >
                  <IconeTile>
                    <Icon icon={opcao.icone} className="h-[17px] w-[17px]" />
                  </IconeTile>
                  <LinhaCorpo>
                    <LinhaTitulo>{opcao.label}</LinhaTitulo>
                    <LinhaMeta>{opcao.descricao}</LinhaMeta>
                  </LinhaCorpo>
                  {motivo === id ? (
                    <Icon icon="lucide:check" className="h-[17px] w-[17px] shrink-0 text-primary" />
                  ) : null}
                </button>
              );
            })}
          </CartaoCampo>
        </BlocoCampo>

        <BlocoCampo rotulo="Duração">
          <StepperCampo
            valor={`${duracao.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} h`}
            legenda="frente parada"
            diminuirDesabilitado={duracao <= PASSO}
            onDiminuir={() => setDuracao((v) => Math.max(PASSO, Math.round((v - PASSO) * 10) / 10))}
            onAumentar={() => setDuracao((v) => Math.round((v + PASSO) * 10) / 10)}
          />
        </BlocoCampo>

        {motivo === "quebra" ? (
          <AvisoCampo tom="perigo" className="mb-3.5">
            Quebra de máquina? Abra também uma <b>solicitação de manutenção</b> — o botão aparece na
            confirmação.
          </AvisoCampo>
        ) : null}

        <BlocoCampo rotulo="Observação (opcional)">
          <TextareaCampo
            value={observacao}
            onChange={setObservacao}
            placeholder="Ex.: chuva forte das 13h às 14h30, frente alagada…"
          />
        </BlocoCampo>

        <AvisoCampo className="mb-3.5">
          A paralisação entra no <b className="text-foreground">diário de obra</b> e justifica horas
          menores na medição.
        </AvisoCampo>

        <BotaoCampo disabled={!motivo} onClick={confirmar}>
          <Icon icon="lucide:check" className="h-[18px] w-[18px]" strokeWidth={2.2} />
          {motivo ? "Registrar paralisação" : "Selecione o motivo"}
        </BotaoCampo>

        <SecaoCampo>Paralisações recentes</SecaoCampo>
        {recentes.length === 0 ? (
          <VazioCampo icone="lucide:ban" titulo="Nenhuma paralisação registrada" />
        ) : (
          <CartaoCampo>
            {recentes.map((registro) => (
              <div key={registro.id} className={LINHA_CAMPO}>
                <IconeTile tom="muted">
                  <Icon icon="lucide:ban" className="h-[15px] w-[15px]" />
                </IconeTile>
                <LinhaCorpo>
                  <LinhaTitulo>{resumoRegistro(registro)}</LinhaTitulo>
                  <LinhaMeta>{rotuloDiaRelativo(registro.registrado_em.slice(0, 10))}</LinhaMeta>
                </LinhaCorpo>
              </div>
            ))}
          </CartaoCampo>
        )}
      </AreaRolagem>
    </TelaCampo>
  );
}
