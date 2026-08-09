import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  AvisoCampo,
  BlocoCampo,
  BotaoCampo,
  CabecalhoCampo,
  CaixaCampo,
  CartaoCampo,
  FotoCampo,
  IconeTile,
  LINHA_CAMPO_CLICAVEL,
  LinhaCorpo,
  LinhaMeta,
  LinhaTitulo,
  SegGrupo,
  SegOpcao,
  TagCabecalho,
  TelaCampo,
  TextareaCampo,
  ValorCaixa,
  classeBotaoCampo,
} from "@/features/operador/components/kit";
import { ConfirmacaoCampo } from "@/features/operador/components/confirmacao-campo";
import { VoltarParaOS } from "@/features/operador/components/voltar-os";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { registrosCampoStore } from "@/features/registros-campo/registros-campo-store";
import {
  PROBLEMA_MANUTENCAO,
  type TipoProblemaManutencao,
  type UrgenciaManutencao,
} from "@/features/registros-campo/tipos";
import { formatHorimetro } from "@/shared/lib/format";

/*
 * Solicitar manutenção pelo lado do operador (`screen === 'mnt'` no
 * CampoApp.jsx). "Máquina parada" é o sinal que a retaguarda precisa receber
 * na hora — por isso ela tem tratamento visual próprio.
 */

const PROBLEMAS = Object.keys(PROBLEMA_MANUTENCAO) as TipoProblemaManutencao[];

export function SolicitarManutencaoPage({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const equipamentos = equipamentosStore.useAll();

  const [problema, setProblema] = useState<TipoProblemaManutencao | null>(null);
  const [urgencia, setUrgencia] = useState<UrgenciaManutencao>("pode_aguardar");
  const [observacao, setObservacao] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  const equipamento = ordem?.equipamento_previsto_id
    ? equipamentos.find((e) => e.id === ordem.equipamento_previsto_id)
    : undefined;

  function confirmar() {
    if (!problema) return;
    registrosCampoStore.registrar({
      tipo: "solicitacao_manutencao",
      os_id: ordemId,
      equipamento_id: equipamento?.id ?? null,
      dados: {
        problema,
        urgencia,
        observacao: observacao.trim() || null,
        horimetro: equipamento?.horimetro_atual ?? null,
        com_foto: foto !== null,
      },
    });
    setConfirmado(true);
  }

  if (confirmado && problema) {
    return (
      <TelaCampo>
        <ConfirmacaoCampo
          titulo="Solicitação enviada"
          linhas={[
            { rotulo: ordem?.numero ?? "OS", valor: equipamento?.nome ?? "Equipamento" },
            { rotulo: "Tipo", valor: PROBLEMA_MANUTENCAO[problema].label },
            {
              rotulo: "Urgência",
              valor: urgencia === "maquina_parada" ? "Máquina parada" : "Pode aguardar",
            },
            ...(equipamento
              ? [{ rotulo: "Horímetro", valor: formatHorimetro(equipamento.horimetro_atual) }]
              : []),
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
        titulo="Solicitar manutenção"
        tag={ordem ? <TagCabecalho>{ordem.numero}</TagCabecalho> : undefined}
      />
      <AreaRolagem className="pb-3">
        <BlocoCampo rotulo="Equipamento">
          <CaixaCampo>
            <IconeTile>
              <Icon
                icon={equipamento ? TIPO_ICONE[equipamento.tipo] : "lucide:truck"}
                className="h-[18px] w-[18px]"
              />
            </IconeTile>
            <b className="min-w-0 truncate text-[13.5px] font-semibold text-foreground">
              {equipamento?.nome ?? "Sem equipamento previsto"}
            </b>
            {equipamento ? (
              <ValorCaixa>horím. {formatHorimetro(equipamento.horimetro_atual)}</ValorCaixa>
            ) : null}
          </CaixaCampo>
        </BlocoCampo>

        <BlocoCampo rotulo="Qual o problema?">
          <CartaoCampo>
            {PROBLEMAS.map((id) => {
              const opcao = PROBLEMA_MANUTENCAO[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setProblema(id)}
                  aria-pressed={problema === id}
                  className={LINHA_CAMPO_CLICAVEL}
                >
                  <IconeTile tom={opcao.perigo ? "danger" : "amber"}>
                    <Icon icon={opcao.icone} className="h-[17px] w-[17px]" />
                  </IconeTile>
                  <LinhaCorpo>
                    <LinhaTitulo>{opcao.label}</LinhaTitulo>
                    <LinhaMeta>{opcao.descricao}</LinhaMeta>
                  </LinhaCorpo>
                  {problema === id ? (
                    <Icon icon="lucide:check" className="h-[17px] w-[17px] shrink-0 text-primary" />
                  ) : null}
                </button>
              );
            })}
          </CartaoCampo>
        </BlocoCampo>

        <BlocoCampo rotulo="Urgência">
          <SegGrupo colunas={2}>
            <SegOpcao
              ativo={urgencia === "pode_aguardar"}
              icone="lucide:clock"
              onClick={() => setUrgencia("pode_aguardar")}
            >
              Pode aguardar
            </SegOpcao>
            <SegOpcao
              ativo={urgencia === "maquina_parada"}
              icone="lucide:ban"
              perigo
              onClick={() => setUrgencia("maquina_parada")}
            >
              Máquina parada
            </SegOpcao>
          </SegGrupo>
        </BlocoCampo>

        {urgencia === "maquina_parada" ? (
          <AvisoCampo tom="perigo" className="mb-3.5">
            Máquina parada abre chamado <b>corretivo prioritário</b> e avisa a retaguarda assim que
            o aparelho conectar.
          </AvisoCampo>
        ) : null}

        <BlocoCampo rotulo="Observação">
          <TextareaCampo
            value={observacao}
            onChange={setObservacao}
            placeholder="Ex.: vazamento no cilindro da lança, começou hoje cedo…"
          />
        </BlocoCampo>

        <BlocoCampo rotulo="Foto do problema (opcional)">
          <FotoCampo
            valor={foto}
            onChange={setFoto}
            placeholder="Toque para fotografar o problema"
            altura={140}
          />
        </BlocoCampo>

        <BotaoCampo disabled={!problema} onClick={confirmar}>
          <Icon icon="lucide:wrench" className="h-[18px] w-[18px]" />
          {problema ? "Enviar solicitação" : "Selecione o problema"}
        </BotaoCampo>
      </AreaRolagem>
    </TelaCampo>
  );
}
