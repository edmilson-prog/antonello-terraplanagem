import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  AtalhoCampo,
  AvisoCampo,
  BOTAO_VOLTAR,
  BlocoCampo,
  BotaoCampo,
  CabecalhoCampo,
  CaixaCampo,
  IconeTile,
  InputCampo,
  StepperCampo,
  TagCabecalho,
  TelaCampo,
  TextareaCampo,
  ValorCaixa,
  VazioCampo,
  classeBotaoCampo,
} from "@/features/operador/components/kit";
import { ConfirmacaoCampo } from "@/features/operador/components/confirmacao-campo";
import { BotaoFotoHorimetro } from "@/shared/components/botao-foto-horimetro";
import { RegistrarAbastecimentoOperadorDialog } from "@/features/diesel/components/registrar-abastecimento-operador-dialog";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { formatHorimetro } from "@/shared/lib/format";

/*
 * Apontamento (`screen === 'apontar'` no CampoApp.jsx). No kit esta tela é o
 * fechamento do turno: o horímetro inicial já foi registrado e o operador
 * ajusta o final. O passo de INICIAR não existe no protótipo e continua vivo
 * em /app/apontamento/novo — sem ele não haveria horímetro inicial.
 */

const PASSO = 0.5;
const JORNADA_PADRAO = 8;

export function ApontamentoDetalhe({ apontamentoId }: { apontamentoId: string }) {
  const apontamento = apontamentosStore.useApontamento(apontamentoId);
  const equipamentos = equipamentosStore.useAll();
  const ordens = ordensStore.useTodas();

  const inicial = apontamento?.horimetro_inicial ?? 0;
  const [horimetroFinal, setHorimetroFinal] = useState<number>(inicial + JORNADA_PADRAO);
  const [observacao, setObservacao] = useState("");
  const [metros, setMetros] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [abastecimentoAberto, setAbastecimentoAberto] = useState(false);
  const [confirmado, setConfirmado] = useState<{ horas: number; final: number } | null>(null);
  const [encerrando, setEncerrando] = useState(false);

  if (!apontamento) return <ApontamentoNaoEncontrado />;

  const equipamento = equipamentos.find((e) => e.id === apontamento.equipamento_id);
  const os = apontamento.os_id ? ordens.find((o) => o.id === apontamento.os_id) : null;
  const exigeMetros = os?.modelo_cobranca === "por_metro";
  const horas = Math.round((horimetroFinal - apontamento.horimetro_inicial) * 10) / 10;

  const voltar = os ? (
    <Link
      to="/app/ordens/$ordemId"
      params={{ ordemId: os.id }}
      aria-label="Voltar"
      className={BOTAO_VOLTAR}
    >
      <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
    </Link>
  ) : (
    <Link to="/app" aria-label="Voltar" className={BOTAO_VOLTAR}>
      <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
    </Link>
  );

  if (confirmado) {
    return (
      <TelaCampo>
        <ConfirmacaoCampo
          titulo="Apontamento registrado"
          linhas={[
            ...(os ? [{ rotulo: os.numero, valor: equipamento?.nome ?? "Equipamento" }] : []),
            {
              rotulo: "Horímetro",
              valor: `${formatHorimetro(apontamento.horimetro_inicial)} → ${formatHorimetro(confirmado.final)}`,
            },
            {
              rotulo: "Horas",
              valor: `${confirmado.horas.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} h`,
            },
          ]}
          acoes={
            <>
              <Link to="/app" className={classeBotaoCampo()}>
                Voltar ao início
              </Link>
              <Link to="/app/apontamento/novo" className={classeBotaoCampo("ghost")}>
                Novo apontamento
              </Link>
            </>
          }
        />
      </TelaCampo>
    );
  }

  const jaFinalizado = apontamento.status === "finalizado";

  async function confirmar() {
    if (!apontamento) return;
    if (exigeMetros && metros.trim() === "") {
      setErro("Informe a metragem executada — esta OS é cobrada por metro.");
      return;
    }
    setEncerrando(true);
    const r = await apontamentosStore.finalizar(apontamento.id, {
      horimetro_final: horimetroFinal,
      metros_executados: metros.trim() === "" ? null : Number(metros),
      observacao: observacao.trim() || null,
    });
    setEncerrando(false);
    if (!r.ok) {
      setErro(
        r.erro === "final_menor_que_inicial"
          ? `O horímetro final não pode ser menor que o inicial (${formatHorimetro(apontamento.horimetro_inicial)}).`
          : (r.mensagem ?? "Não foi possível finalizar este apontamento."),
      );
      return;
    }
    setConfirmado({ horas: r.apontamento.horas_trabalhadas ?? 0, final: horimetroFinal });
  }

  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={voltar}
        titulo="Apontamento"
        tag={os ? <TagCabecalho>{os.numero}</TagCabecalho> : undefined}
      />
      <AreaRolagem>
        <BlocoCampo rotulo="Equipamento">
          <CaixaCampo>
            <IconeTile>
              <Icon
                icon={equipamento ? TIPO_ICONE[equipamento.tipo] : "lucide:truck"}
                className="h-[18px] w-[18px]"
              />
            </IconeTile>
            <b className="min-w-0 truncate text-[13.5px] font-semibold text-foreground">
              {equipamento?.nome ?? "Equipamento"}
            </b>
            <ValorCaixa>início {formatHorimetro(apontamento.horimetro_inicial)}</ValorCaixa>
          </CaixaCampo>
        </BlocoCampo>

        {jaFinalizado ? (
          <>
            <BlocoCampo rotulo="Horímetro final">
              <CaixaCampo>
                <IconeTile tom="muted">
                  <Icon icon="lucide:gauge" className="h-[18px] w-[18px]" />
                </IconeTile>
                <b className="font-mono text-[15px] font-semibold text-foreground">
                  {apontamento.horimetro_final != null
                    ? formatHorimetro(apontamento.horimetro_final)
                    : "—"}
                </b>
                <ValorCaixa>
                  {apontamento.horas_trabalhadas != null
                    ? `${apontamento.horas_trabalhadas.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} h`
                    : ""}
                </ValorCaixa>
              </CaixaCampo>
            </BlocoCampo>
            <AvisoCampo>
              Este apontamento já foi <b className="text-foreground">encerrado</b>. Correções são
              feitas pela retaguarda.
            </AvisoCampo>
          </>
        ) : (
          <>
            <BlocoCampo rotulo="Horímetro final">
              <StepperCampo
                valor={formatHorimetro(horimetroFinal).replace(" h", "")}
                legenda="horas máquina"
                diminuirDesabilitado={horimetroFinal <= apontamento.horimetro_inicial}
                onDiminuir={() => {
                  setErro(null);
                  setHorimetroFinal((v) =>
                    Math.max(apontamento.horimetro_inicial, Math.round((v - PASSO) * 10) / 10),
                  );
                }}
                onAumentar={() => {
                  setErro(null);
                  setHorimetroFinal((v) => Math.round((v + PASSO) * 10) / 10);
                }}
              />
              <BotaoFotoHorimetro
                base={apontamento.horimetro_inicial}
                onLeitura={(valor) => {
                  setHorimetroFinal(valor);
                  setErro(null);
                }}
                className="mt-2"
              />
            </BlocoCampo>

            <div className="mb-4 flex items-center gap-2.5 rounded-[10px] border border-primary/26 bg-primary/12 px-3.5 py-3">
              <Icon icon="lucide:clock" className="h-[17px] w-[17px] shrink-0 text-primary" />
              <b className="font-mono text-[17px] font-semibold leading-none text-primary">
                {horas.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} h
              </b>
              <span className="text-xs text-muted-foreground">
                {os ? "trabalhadas nesta OS" : "trabalhadas neste turno"}
              </span>
            </div>

            {exigeMetros ? (
              <BlocoCampo rotulo="Metragem executada (m)">
                <InputCampo
                  type="number"
                  value={metros}
                  onChange={(v) => {
                    setMetros(v);
                    setErro(null);
                  }}
                  placeholder="ex.: 30"
                />
              </BlocoCampo>
            ) : null}

            <BlocoCampo rotulo="Observação (opcional)">
              <TextareaCampo
                value={observacao}
                onChange={setObservacao}
                placeholder="Ex.: chuva no fim da tarde, troca de frente…"
              />
            </BlocoCampo>

            <AtalhoCampo icone="lucide:fuel" onClick={() => setAbastecimentoAberto(true)}>
              Registrar abastecimento
            </AtalhoCampo>

            {erro ? (
              <AvisoCampo tom="perigo" className="mt-3.5">
                {erro}
              </AvisoCampo>
            ) : null}

            <div className="mt-3.5">
              <BotaoCampo
                onClick={() => void confirmar()}
                disabled={encerrando || horimetroFinal <= apontamento.horimetro_inicial}
              >
                <Icon icon="lucide:check" className="h-[18px] w-[18px]" strokeWidth={2.2} />
                {encerrando ? "Encerrando…" : "Confirmar apontamento"}
              </BotaoCampo>
            </div>
          </>
        )}
      </AreaRolagem>

      <RegistrarAbastecimentoOperadorDialog
        open={abastecimentoAberto}
        onOpenChange={setAbastecimentoAberto}
        equipamentoId={apontamento.equipamento_id}
        horimetroAtual={equipamento?.horimetro_atual}
      />
    </TelaCampo>
  );
}

export function ApontamentoNaoEncontrado() {
  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={
          <Link to="/app" aria-label="Voltar" className={BOTAO_VOLTAR}>
            <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
          </Link>
        }
        titulo="Apontamento"
      />
      <AreaRolagem>
        <VazioCampo
          icone="lucide:file-question"
          titulo="Apontamento não encontrado"
          descricao="Ele pode ter sido removido ou não pertence a você."
        />
      </AreaRolagem>
    </TelaCampo>
  );
}
