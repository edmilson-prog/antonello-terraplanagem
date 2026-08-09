import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  AvatarCampo,
  CarregandoCampo,
  CartaoCampo,
  CartaoDestaque,
  ErroCampo,
  classeBotaoCampo,
  IconeTile,
  LINHA_CAMPO_CLICAVEL,
  LinhaCorpo,
  LinhaMeta,
  LinhaTitulo,
  SecaoCampo,
  StatusCampo,
  TagOS,
  TelaCampo,
  TileCampo,
  TilesCampo,
  VazioCampo,
} from "@/features/operador/components/kit";
import {
  CabecalhoAba,
  SeloSincronizacao,
  SinoNotificacoes,
} from "@/features/operador/components/cabecalho-aba";
import { useAlertasSeguranca } from "@/features/operador/hooks/use-alertas-seguranca";
import { useNotificacoesCampo } from "@/features/operador/hooks/use-notificacoes-campo";
import { usePendenciasSync } from "@/features/operador/hooks/use-pendencias-sync";
import { useUltimaSincronizacao } from "@/features/operador/ultima-sincronizacao";
import { primeiroNome, saudacaoPorHora } from "@/features/operador/saudacao";
import {
  apontamentoEmAndamentoDoOperador,
  apontamentosStore,
} from "@/features/apontamento/apontamentos-store";
import { finalizadosNoDia, somarHoras } from "@/features/apontamento/resumo-horas";
import { getOperadorLogadoId, lerSessaoOperador } from "@/features/auth/operador-session";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { ordensDoOperador, statusEfetivoOS } from "@/features/ordem-servico/derivacoes";
import { clientesStore } from "@/features/clientes/clientes-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import {
  formatDataExtensa,
  formatHoraCurta,
  formatHorimetro,
  iniciaisDoNome,
} from "@/shared/lib/format";

/*
 * Aba "Hoje" — tela inicial do App de Campo (`tab === 'hoje'` no CampoApp.jsx).
 * Ordem do kit: cabeçalho, o que está em andamento agora, números do dia e a
 * lista de OS do operador.
 */

export function HojePage() {
  const ordens = ordensStore.useTodas();
  const { isLoading, error } = ordensStore.useEstado();
  const apontamentos = apontamentosStore.useTodos();
  const equipamentos = equipamentosStore.useAll();
  const { naoLidas } = useNotificacoesCampo();
  const { pendentes: alertasPendentes } = useAlertasSeguranca();
  const pendentes = usePendenciasSync();
  const ultimaSincronizacao = useUltimaSincronizacao();

  const sessao = lerSessaoOperador();
  const nome = sessao?.operadorNome ?? "Operador";
  const agora = new Date();

  const operadorId = getOperadorLogadoId();
  const emAndamento = apontamentoEmAndamentoDoOperador(apontamentos, operadorId);
  const equipamentoAtual = emAndamento
    ? equipamentos.find((e) => e.id === emAndamento.equipamento_id)
    : undefined;
  const osAtual = emAndamento?.os_id ? ordens.find((o) => o.id === emAndamento.os_id) : undefined;

  const doDia = finalizadosNoDia(apontamentos, operadorId, agora);
  const minhas = ordensDoOperador(ordens, apontamentos, operadorId);
  const ativas = minhas.filter((o) => statusEfetivoOS(o, apontamentos) !== "fechada");

  return (
    <TelaCampo>
      <CabecalhoAba
        titulo={`${saudacaoPorHora(agora.getHours())}, ${primeiroNome(nome)}`}
        subtitulo={formatDataExtensa(agora)}
        avatar={<AvatarCampo iniciais={iniciaisDoNome(nome)} tamanho={40} />}
        acoes={
          <>
            <SinoNotificacoes naoLidas={naoLidas} />
            <SeloSincronizacao
              pendentes={pendentes.length}
              ultimaSincronizacao={formatHoraCurta(ultimaSincronizacao)}
            />
          </>
        }
      />

      <AreaRolagem>
        {alertasPendentes > 0 ? (
          <Link
            to="/app/seguranca"
            className="mb-4 flex w-full items-center gap-[11px] rounded-[14px] border border-destructive/35 bg-destructive/15 px-3.5 py-3 text-left transition-colors hover:bg-destructive/20"
          >
            <span
              aria-hidden
              className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px] bg-destructive/25 text-destructive"
            >
              <Icon icon="lucide:hard-hat" className="h-[17px] w-[17px]" />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[13.5px] font-bold text-foreground">Alertas de segurança</b>
              <span className="mt-1 block text-[11.5px] text-destructive">
                {alertasPendentes} {alertasPendentes === 1 ? "pendente" : "pendentes"} — confirme
                ciência antes de operar
              </span>
            </span>
            <Icon icon="lucide:chevron-right" className="h-4 w-4 shrink-0 text-destructive" />
          </Link>
        ) : null}

        <SecaoCampo className="mt-0">Em andamento agora</SecaoCampo>
        {emAndamento ? (
          <CartaoDestaque>
            <div className="flex items-center gap-2.5 px-[15px] pt-[13px]">
              {osAtual ? (
                <span className="font-mono text-[13px] font-bold leading-none text-primary">
                  {osAtual.numero}
                </span>
              ) : null}
              <StatusCampo tom="amber" led>
                Em andamento
              </StatusCampo>
            </div>
            <h2 className="px-[15px] pt-2 text-[15px] font-bold leading-[1.25] text-foreground">
              {osAtual?.obra_nome ?? equipamentoAtual?.nome ?? "Apontamento aberto"}
            </h2>
            <div className="flex flex-wrap gap-x-3.5 gap-y-2 px-[15px] pb-[13px] pt-2 font-mono text-[11.5px] font-medium text-foreground-faint">
              <span className="inline-flex items-center gap-1.5">
                <Icon icon="lucide:truck" className="h-3 w-3" />
                {equipamentoAtual?.nome ?? "Equipamento"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon icon="lucide:gauge" className="h-3 w-3" />
                início {formatHorimetro(emAndamento.horimetro_inicial)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon icon="lucide:clock" className="h-3 w-3" />
                desde {formatHoraCurta(emAndamento.iniciado_em)}
              </span>
            </div>
            <div className="flex border-t border-border-soft">
              <Link
                to="/app/apontamento/$apontamentoId"
                params={{ apontamentoId: emAndamento.id }}
                className="flex min-h-[52px] w-full items-center justify-center gap-2.5 text-[14.5px] font-bold text-primary transition-colors hover:bg-primary/12"
              >
                <Icon icon="lucide:gauge" className="h-[17px] w-[17px]" />
                Encerrar e apontar horas
              </Link>
            </div>
          </CartaoDestaque>
        ) : (
          <Link to="/app/apontamento/novo" className={classeBotaoCampo()}>
            <Icon icon="lucide:play" className="h-[18px] w-[18px]" />
            Iniciar apontamento
          </Link>
        )}

        <SecaoCampo>Hoje</SecaoCampo>
        <TilesCampo>
          <TileCampo
            rotulo="Horas apontadas"
            valor={somarHoras(doDia).toLocaleString("pt-BR")}
            unidade="h"
          />
          <TileCampo rotulo="Apontamentos" valor={doDia.length} />
        </TilesCampo>

        <SecaoCampo
          acao={
            <Link
              to="/app/escala"
              className="inline-flex items-center gap-1 text-[11px] font-semibold normal-case tracking-normal text-primary"
            >
              Minha escala
              <Icon icon="lucide:chevron-right" className="h-3 w-3" />
            </Link>
          }
        >
          Minhas OS
        </SecaoCampo>

        {isLoading ? (
          <CarregandoCampo />
        ) : error ? (
          <ErroCampo mensagem={error.message} onTentarNovamente={ordensStore.retry} />
        ) : ativas.length === 0 ? (
          <VazioCampo
            icone="lucide:clipboard-list"
            titulo="Nenhuma OS ativa"
            descricao="Suas ordens de serviço aparecem aqui assim que a recepção atribuir."
          />
        ) : (
          <CartaoCampo>
            {ativas.map((os) => {
              const cliente = clientesStore.getById(os.cliente_id);
              const equipamento = os.equipamento_previsto_id
                ? equipamentos.find((e) => e.id === os.equipamento_previsto_id)
                : undefined;
              return (
                <Link
                  key={os.id}
                  to="/app/ordens/$ordemId"
                  params={{ ordemId: os.id }}
                  className={LINHA_CAMPO_CLICAVEL}
                >
                  <IconeTile>
                    <Icon
                      icon={equipamento ? TIPO_ICONE[equipamento.tipo] : "lucide:clipboard-list"}
                      className="h-[17px] w-[17px]"
                    />
                  </IconeTile>
                  <LinhaCorpo>
                    <LinhaTitulo>{os.obra_nome}</LinhaTitulo>
                    <LinhaMeta>
                      {cliente?.nome ?? "Cliente"}
                      {equipamento ? ` · ${equipamento.nome}` : ""}
                    </LinhaMeta>
                  </LinhaCorpo>
                  <TagOS>{os.numero}</TagOS>
                </Link>
              );
            })}
          </CartaoCampo>
        )}
      </AreaRolagem>
    </TelaCampo>
  );
}
