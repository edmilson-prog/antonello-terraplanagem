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
  FotoCampo,
  IconeTile,
  SegGrupo,
  SegOpcao,
  StepperCampo,
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
import { TIPO_TRANSPORTE, type TipoTransporte } from "@/features/registros-campo/tipos";
import { formatHorimetro } from "@/shared/lib/format";
import type { OrdemServico } from "@/shared/types";

/*
 * Mobilização / prancha (`screen === 'mob'` no CampoApp.jsx): o transporte do
 * equipamento até a obra e de volta. Os km entram no faturamento da OS pela
 * tabela de preços — o valor em si nunca aparece aqui.
 */

const TIPOS = Object.keys(TIPO_TRANSPORTE) as TipoTransporte[];
const BASE = "Base Antonello";

function trajetoDe(ordem: OrdemServico | undefined, tipo: TipoTransporte): string {
  const obra = ordem?.endereco?.split(" — ")[0] ?? ordem?.obra_nome ?? "obra";
  if (tipo === "desmobilizacao") return `${obra} → ${BASE}`;
  if (tipo === "transferencia") return `${obra} → outra obra`;
  return `${BASE} → ${obra}`;
}

export function PranchaPage({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const equipamentos = equipamentosStore.useAll();

  const [tipo, setTipo] = useState<TipoTransporte>("mobilizacao");
  const [km, setKm] = useState(12);
  const [observacao, setObservacao] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  const equipamento = ordem?.equipamento_previsto_id
    ? equipamentos.find((e) => e.id === ordem.equipamento_previsto_id)
    : undefined;
  const trajeto = trajetoDe(ordem, tipo);

  function confirmar() {
    registrosCampoStore.registrar({
      tipo: "mobilizacao",
      os_id: ordemId,
      equipamento_id: equipamento?.id ?? null,
      dados: {
        tipo,
        km,
        trajeto,
        observacao: observacao.trim() || null,
        com_foto: foto !== null,
      },
    });
    setConfirmado(true);
  }

  if (confirmado) {
    return (
      <TelaCampo>
        <ConfirmacaoCampo
          titulo={`${TIPO_TRANSPORTE[tipo]} registrada`}
          linhas={[
            { rotulo: ordem?.numero ?? "OS", valor: equipamento?.nome ?? "Equipamento" },
            { rotulo: "Trajeto", valor: trajeto },
            { rotulo: "Percurso", valor: `${km} km de prancha` },
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
        titulo="Prancha"
        tag={ordem ? <TagCabecalho>{ordem.numero}</TagCabecalho> : undefined}
      />
      <AreaRolagem className="pb-3">
        <BlocoCampo rotulo="Tipo de transporte">
          <SegGrupo>
            {TIPOS.map((id) => (
              <SegOpcao
                key={id}
                ativo={tipo === id}
                onClick={() => setTipo(id)}
                className="min-h-[46px] text-[10.5px]"
              >
                {TIPO_TRANSPORTE[id]}
              </SegOpcao>
            ))}
          </SegGrupo>
        </BlocoCampo>

        <BlocoCampo rotulo="Equipamento na prancha">
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

        <BlocoCampo rotulo="Trajeto">
          <CaixaCampo>
            <IconeTile>
              <Icon icon="lucide:map-pin" className="h-[17px] w-[17px]" />
            </IconeTile>
            <b className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
              {trajeto}
            </b>
          </CaixaCampo>
        </BlocoCampo>

        <BlocoCampo rotulo="Quilômetros de prancha">
          <StepperCampo
            valor={`${km} km`}
            legenda="só ida · conforme odômetro"
            diminuirDesabilitado={km <= 1}
            onDiminuir={() => setKm((v) => Math.max(1, v - 1))}
            onAumentar={() => setKm((v) => v + 1)}
          />
        </BlocoCampo>

        <BlocoCampo rotulo="Observação (opcional)">
          <TextareaCampo
            value={observacao}
            onChange={setObservacao}
            placeholder="Ex.: saída 06h40, escolta no trecho da RS-344…"
          />
        </BlocoCampo>

        <BlocoCampo rotulo="Foto do equipamento carregado">
          <FotoCampo
            valor={foto}
            onChange={setFoto}
            placeholder="Toque para fotografar na prancha"
            altura={140}
          />
        </BlocoCampo>

        <AvisoCampo className="mb-3.5">
          Os km de prancha entram no <b className="text-foreground">faturamento da OS</b> pela
          tabela de preços — os valores ficam na retaguarda.
        </AvisoCampo>

        <BotaoCampo onClick={confirmar}>
          <Icon icon="lucide:check" className="h-[18px] w-[18px]" strokeWidth={2.2} />
          Registrar transporte
        </BotaoCampo>
      </AreaRolagem>
    </TelaCampo>
  );
}
