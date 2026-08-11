import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  AvisoCampo,
  BlocoCampo,
  BotaoCampo,
  CarregandoCampo,
  CartaoCampo,
  ErroCampo,
  IconeTile,
  InputCampo,
  LINHA_CAMPO_CLICAVEL,
  LinhaCorpo,
  LinhaMeta,
  LinhaTitulo,
  StepperCampo,
  TelaCampo,
  VazioCampo,
  classeBotaoCampo,
} from "@/features/operador/components/kit";
import { CabecalhoAba } from "@/features/operador/components/cabecalho-aba";
import { ConfirmacaoCampo } from "@/features/operador/components/confirmacao-campo";
import { HorimetroCapture } from "@/shared/components/horimetro-capture";
import { CupomCaptureButton } from "@/features/ia/components/cupom-capture-button";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import { formatHorimetro } from "@/shared/lib/format";
import type { Equipamento } from "@/shared/types";

/*
 * Aba "Abastecer" (`tab === 'fuel'` no CampoApp.jsx): escolher o equipamento,
 * informar litros e confirmar. Mantém o que o app real já tinha e o kit não
 * mostra — horímetro do momento (obrigatório para consumo médio), leitura do
 * cupom por foto e local — sem nunca exibir preço ou custo.
 */

const PASSO_LITROS = 10;

export function AbastecerPage() {
  const equipamentos = equipamentosStore.useAll();
  const { isLoading, error } = equipamentosStore.useEstado();
  const apontamentos = apontamentosStore.useTodos();

  const [equipamentoId, setEquipamentoId] = useState<string | null>(null);
  const [litros, setLitros] = useState(PASSO_LITROS * 12);
  const [horimetro, setHorimetro] = useState("");
  const [local, setLocal] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState<{ litros: number; equipamento: string } | null>(
    null,
  );

  const ativos = useMemo(() => equipamentos.filter((e) => e.ativo), [equipamentos]);

  // Sugere o equipamento do apontamento em andamento — é quase sempre o que
  // está sendo abastecido.
  const sugerido = useMemo(() => {
    const operadorId = getOperadorLogadoId();
    const aberto = apontamentos.find(
      (a) => a.operador_id === operadorId && a.status === "em_andamento",
    );
    return aberto?.equipamento_id ?? null;
  }, [apontamentos]);

  const selecionadoId = equipamentoId ?? sugerido;
  const selecionado = ativos.find((e) => e.id === selecionadoId);

  function escolher(equipamento: Equipamento) {
    setEquipamentoId(equipamento.id);
    setHorimetro(String(equipamento.horimetro_atual));
    setErro(null);
  }

  function registrar() {
    if (!selecionado) {
      setErro("Escolha o equipamento abastecido.");
      return;
    }
    const horimetroInformado =
      horimetro.trim() === "" ? selecionado.horimetro_atual : Number(horimetro);
    if (Number.isNaN(horimetroInformado)) {
      setErro("Informe um horímetro válido.");
      return;
    }
    const r = abastecimentosStore.registrar({
      equipamento_id: selecionado.id,
      litros,
      horimetro: horimetroInformado,
      operador_id: getOperadorLogadoId(),
      local: local.trim() || null,
    });
    if (!r.ok) {
      setErro(
        r.erro === "litros_invalido"
          ? "Os litros devem ser maiores que zero."
          : "O horímetro não pode ser menor que o do último abastecimento deste equipamento.",
      );
      return;
    }
    setConfirmado({ litros, equipamento: selecionado.nome });
  }

  if (confirmado) {
    return (
      <TelaCampo>
        <ConfirmacaoCampo
          titulo="Abastecimento registrado"
          linhas={[
            { rotulo: "Equipamento", valor: confirmado.equipamento },
            { rotulo: "Litros", valor: `${confirmado.litros} L` },
            { rotulo: "Horímetro", valor: formatHorimetro(Number(horimetro || 0)) },
          ]}
          acoes={
            <>
              <Link to="/app" className={classeBotaoCampo()}>
                Voltar ao início
              </Link>
              <BotaoCampo
                variante="ghost"
                onClick={() => {
                  setConfirmado(null);
                  setLocal("");
                  setErro(null);
                }}
              >
                Novo abastecimento
              </BotaoCampo>
            </>
          }
        />
      </TelaCampo>
    );
  }

  return (
    <TelaCampo>
      <AreaRolagem className="pt-3.5">
        <CabecalhoAba
          titulo="Abastecer"
          subtitulo="diesel do tanque interno"
          className="px-0 pb-2.5 pt-0"
        />

        <BlocoCampo rotulo="Equipamento">
          {isLoading ? (
            <CarregandoCampo linhas={3} />
          ) : error ? (
            <ErroCampo mensagem={error.message} onTentarNovamente={equipamentosStore.retry} />
          ) : ativos.length === 0 ? (
            <VazioCampo icone="lucide:truck" titulo="Nenhum equipamento ativo" />
          ) : (
            <CartaoCampo>
              {ativos.map((equipamento) => (
                <button
                  key={equipamento.id}
                  type="button"
                  onClick={() => escolher(equipamento)}
                  className={LINHA_CAMPO_CLICAVEL}
                >
                  <IconeTile>
                    <Icon icon={TIPO_ICONE[equipamento.tipo]} className="h-[17px] w-[17px]" />
                  </IconeTile>
                  <LinhaCorpo>
                    <LinhaTitulo>{equipamento.nome}</LinhaTitulo>
                    <LinhaMeta>horím. {formatHorimetro(equipamento.horimetro_atual)}</LinhaMeta>
                  </LinhaCorpo>
                  {selecionadoId === equipamento.id ? (
                    <Icon icon="lucide:check" className="h-[17px] w-[17px] shrink-0 text-primary" />
                  ) : null}
                </button>
              ))}
            </CartaoCampo>
          )}
        </BlocoCampo>

        <BlocoCampo rotulo="Litros">
          <StepperCampo
            valor={`${litros} L`}
            legenda="diesel S10"
            diminuirDesabilitado={litros <= PASSO_LITROS}
            onDiminuir={() => setLitros((v) => Math.max(PASSO_LITROS, v - PASSO_LITROS))}
            onAumentar={() => setLitros((v) => v + PASSO_LITROS)}
          />
          <div className="mt-2">
            <CupomCaptureButton
              onLeitura={(litrosLidos) => {
                setLitros(Math.round(litrosLidos));
                setErro(null);
              }}
            />
          </div>
        </BlocoCampo>

        <BlocoCampo>
          <HorimetroCapture
            label="Horímetro no abastecimento"
            value={horimetro}
            onChange={(v) => {
              setHorimetro(v);
              setErro(null);
            }}
            ocrBase={selecionado?.horimetro_atual}
          />
        </BlocoCampo>

        <BlocoCampo rotulo="Local (opcional)">
          <InputCampo
            value={local}
            onChange={setLocal}
            placeholder="Ex.: comboio na obra, posto da BR-472"
          />
        </BlocoCampo>

        {erro ? (
          <AvisoCampo tom="perigo" className="mb-3.5">
            {erro}
          </AvisoCampo>
        ) : null}

        <BotaoCampo onClick={registrar} disabled={!selecionado}>
          <Icon icon="lucide:fuel" className="h-[18px] w-[18px]" />
          Registrar abastecimento
        </BotaoCampo>
      </AreaRolagem>
    </TelaCampo>
  );
}
