import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  BlocoCampo,
  BotaoCampo,
  CabecalhoCampo,
  CaixaCampo,
  CartaoCampo,
  FotoCampo,
  IconeTile,
  LINHA_CAMPO,
  LinhaCorpo,
  LinhaMeta,
  LinhaTitulo,
  SecaoCampo,
  SegGrupo,
  SegOpcao,
  StepperCampo,
  SyncMini,
  TagCabecalho,
  TelaCampo,
  TextareaCampo,
  VazioCampo,
  classeBotaoCampo,
} from "@/features/operador/components/kit";
import { ConfirmacaoCampo } from "@/features/operador/components/confirmacao-campo";
import { VoltarParaOS } from "@/features/operador/components/voltar-os";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { finalizadosNoDia, somarHoras } from "@/features/apontamento/resumo-horas";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import { registrosCampoStore } from "@/features/registros-campo/registros-campo-store";
import { registrosDoTipo, resumoRegistro } from "@/features/registros-campo/derivacoes";
import { CLIMA_ICONE, CLIMA_LABEL, type ClimaTurno } from "@/features/registros-campo/tipos";
import { formatDataExtensa, rotuloDiaRelativo } from "@/shared/lib/format";

/*
 * Diário de obra — RDO (`screen === 'rdo'` no CampoApp.jsx). Um por dia e por
 * OS: clima dos dois turnos, tamanho da equipe, o que foi executado e as
 * ocorrências que justificam horas menores na medição.
 */

const CLIMAS: ClimaTurno[] = ["sol", "nublado", "chuva"];

export function DiarioObraPage({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const apontamentos = apontamentosStore.useTodos();
  const registros = registrosCampoStore.useTodos();

  const [climaManha, setClimaManha] = useState<ClimaTurno>("sol");
  const [climaTarde, setClimaTarde] = useState<ClimaTurno | null>(null);
  const [equipe, setEquipe] = useState(3);
  const [atividades, setAtividades] = useState("");
  const [ocorrencias, setOcorrencias] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  const hoje = new Date();
  const horasHoje = somarHoras(finalizadosNoDia(apontamentos, getOperadorLogadoId(), hoje));
  const anteriores = registrosDoTipo(registros, "diario_obra", ordemId).slice(0, 4);

  function confirmar() {
    if (!climaTarde) return;
    registrosCampoStore.registrar({
      tipo: "diario_obra",
      os_id: ordemId,
      equipamento_id: ordem?.equipamento_previsto_id ?? null,
      dados: {
        clima_manha: climaManha,
        clima_tarde: climaTarde,
        equipe,
        atividades: atividades.trim(),
        ocorrencias: ocorrencias.trim() || null,
        com_foto: foto !== null,
      },
    });
    setConfirmado(true);
  }

  if (confirmado && climaTarde) {
    return (
      <TelaCampo>
        <ConfirmacaoCampo
          titulo="Diário registrado"
          linhas={[
            { rotulo: ordem?.numero ?? "OS", valor: formatDataExtensa(hoje) },
            {
              rotulo: "Clima",
              valor: `${CLIMA_LABEL[climaManha]} · ${CLIMA_LABEL[climaTarde]}`,
            },
            { rotulo: "Equipe", valor: `${equipe} ${equipe === 1 ? "pessoa" : "pessoas"}` },
            {
              rotulo: "Horas de máquina",
              valor: `${horasHoje.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} h`,
            },
          ]}
          acoes={
            <Link to="/app/ordens/$ordemId" params={{ ordemId }} className={classeBotaoCampo()}>
              Voltar para a OS
            </Link>
          }
        />
      </TelaCampo>
    );
  }

  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={<VoltarParaOS ordemId={ordemId} />}
        titulo="Diário de obra"
        tag={ordem ? <TagCabecalho>{ordem.numero}</TagCabecalho> : undefined}
      />
      <AreaRolagem className="pb-3">
        <BlocoCampo rotulo={`Hoje · ${formatDataExtensa(hoje)}`}>
          <CaixaCampo>
            <IconeTile>
              <Icon icon="lucide:map-pin" className="h-[17px] w-[17px]" />
            </IconeTile>
            <b className="min-w-0 truncate text-[13px] font-semibold text-foreground">
              {ordem?.endereco || ordem?.obra_nome || "Obra"}
            </b>
          </CaixaCampo>
        </BlocoCampo>

        <BlocoCampo rotulo="Clima — manhã">
          <SegGrupo>
            {CLIMAS.map((clima) => (
              <SegOpcao
                key={clima}
                ativo={climaManha === clima}
                icone={CLIMA_ICONE[clima]}
                onClick={() => setClimaManha(clima)}
              >
                {CLIMA_LABEL[clima]}
              </SegOpcao>
            ))}
          </SegGrupo>
        </BlocoCampo>

        <BlocoCampo rotulo="Clima — tarde">
          <SegGrupo>
            {CLIMAS.map((clima) => (
              <SegOpcao
                key={clima}
                ativo={climaTarde === clima}
                icone={CLIMA_ICONE[clima]}
                onClick={() => setClimaTarde(clima)}
              >
                {CLIMA_LABEL[clima]}
              </SegOpcao>
            ))}
          </SegGrupo>
        </BlocoCampo>

        <BlocoCampo rotulo="Equipe em campo">
          <StepperCampo
            valor={equipe}
            legenda={equipe === 1 ? "pessoa" : "pessoas"}
            diminuirDesabilitado={equipe <= 1}
            onDiminuir={() => setEquipe((v) => Math.max(1, v - 1))}
            onAumentar={() => setEquipe((v) => v + 1)}
          />
        </BlocoCampo>

        <BlocoCampo rotulo="Atividades executadas">
          <TextareaCampo
            value={atividades}
            onChange={setAtividades}
            placeholder="Ex.: corte e aterro no platô norte, 2 viagens de bota-fora…"
          />
        </BlocoCampo>

        <BlocoCampo rotulo="Ocorrências (opcional)">
          <TextareaCampo
            value={ocorrencias}
            onChange={setOcorrencias}
            placeholder="Ex.: chuva paralisou a frente das 14h às 15h30…"
          />
        </BlocoCampo>

        <BlocoCampo rotulo="Foto da frente de serviço">
          <FotoCampo valor={foto} onChange={setFoto} placeholder="Toque para fotografar o dia" />
        </BlocoCampo>

        <BotaoCampo disabled={!climaTarde} onClick={confirmar}>
          <Icon icon="lucide:check" className="h-[18px] w-[18px]" strokeWidth={2.2} />
          {climaTarde ? "Enviar diário de hoje" : "Informe o clima da tarde"}
        </BotaoCampo>

        <SecaoCampo>Diários anteriores desta OS</SecaoCampo>
        {anteriores.length === 0 ? (
          <VazioCampo icone="lucide:file-text" titulo="Nenhum diário registrado ainda" />
        ) : (
          <CartaoCampo>
            {anteriores.map((registro) => (
              <div key={registro.id} className={LINHA_CAMPO}>
                <IconeTile tom="muted">
                  <Icon icon="lucide:file-text" className="h-4 w-4" />
                </IconeTile>
                <LinhaCorpo>
                  <LinhaTitulo>
                    {rotuloDiaRelativo(registro.registrado_em.slice(0, 10))}
                  </LinhaTitulo>
                  <LinhaMeta>{resumoRegistro(registro)}</LinhaMeta>
                </LinhaCorpo>
                <SyncMini sincronizado={!registro.pendente_sync} />
              </div>
            ))}
          </CartaoCampo>
        )}
      </AreaRolagem>
    </TelaCampo>
  );
}
