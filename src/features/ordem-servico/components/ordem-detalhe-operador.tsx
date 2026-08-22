import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  ATALHO_CAMPO,
  AreaRolagem,
  AtalhoConteudo,
  BOTAO_VOLTAR,
  BarraProgresso,
  BlocoCampo,
  CabecalhoCampo,
  CaixaCampo,
  CarregandoCampo,
  CartaoCampo,
  CartaoDestaque,
  ErroCampo,
  IconeTile,
  LINHA_CAMPO,
  LinhaCorpo,
  LinhaMeta,
  LinhaTitulo,
  SecaoCampo,
  StatusCampo,
  SyncMini,
  TagCabecalho,
  TelaCampo,
  ValorCaixa,
  VazioCampo,
  classeBotaoCampo,
} from "@/features/operador/components/kit";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import {
  apontamentosDaOS,
  statusEfetivoOS,
  totalHorasOS,
} from "@/features/ordem-servico/derivacoes";
import { STATUS_OS_LABEL, TIPO_SERVICO_LABEL } from "@/features/ordem-servico/labels";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { somarHoras } from "@/features/apontamento/resumo-horas";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import { clientesStore } from "@/features/clientes/clientes-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { formatData, formatHorimetro, rotuloDiaRelativo } from "@/shared/lib/format";
import type { StatusOS } from "@/shared/types";

/*
 * Detalhe da OS no App de Campo (`screen === 'osdet'` no CampoApp.jsx):
 * cabeçalho da ordem, equipamento com a régua de atalhos das ações de campo,
 * progresso, os apontamentos do próprio operador e o escopo. Sem nenhum dado
 * financeiro — regra do ambiente /app.
 */

const TOM_STATUS: Record<StatusOS, "amber" | "info" | "neutral"> = {
  aberta: "info",
  em_andamento: "amber",
  fechada: "neutral",
};

export function OrdemDetalheOperador({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const { isLoading, error } = ordensStore.useEstado();
  const apontamentos = apontamentosStore.useTodos();
  const equipamentos = equipamentosStore.useAll();

  const voltar = (
    <Link to="/app/ordens" aria-label="Voltar" className={BOTAO_VOLTAR}>
      <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
    </Link>
  );

  if (isLoading) {
    return (
      <TelaCampo>
        <CabecalhoCampo voltar={voltar} titulo="Ordem de Serviço" />
        <AreaRolagem>
          <CarregandoCampo linhas={5} />
        </AreaRolagem>
      </TelaCampo>
    );
  }

  if (error) {
    return (
      <TelaCampo>
        <CabecalhoCampo voltar={voltar} titulo="Ordem de Serviço" />
        <AreaRolagem>
          <ErroCampo mensagem={error.message} onTentarNovamente={ordensStore.retry} />
        </AreaRolagem>
      </TelaCampo>
    );
  }

  if (!ordem) return <OrdemNaoEncontrada />;

  const operadorId = getOperadorLogadoId();
  const cliente = clientesStore.getById(ordem.cliente_id);
  const equipamento = ordem.equipamento_previsto_id
    ? equipamentos.find((e) => e.id === ordem.equipamento_previsto_id)
    : undefined;

  const daOS = apontamentosDaOS(ordem.id, apontamentos);
  const meus = daOS
    .filter((a) => a.operador_id === operadorId)
    .sort((a, b) =>
      (b.finalizado_em ?? b.iniciado_em).localeCompare(a.finalizado_em ?? a.iniciado_em),
    );
  const minhasHoras = somarHoras(meus.filter((a) => a.status === "finalizado"));
  const horasEquipe = totalHorasOS(ordem.id, apontamentos);

  const status = statusEfetivoOS(ordem, apontamentos);
  const fechada = status === "fechada";
  const emAndamentoAqui = meus.find((a) => a.status === "em_andamento");

  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={voltar}
        titulo="Ordem de Serviço"
        tag={<TagCabecalho>{ordem.numero}</TagCabecalho>}
      />

      <AreaRolagem className="pb-3">
        <CartaoDestaque className="mb-3.5">
          <div className="flex items-center gap-2.5 px-[15px] pt-[13px]">
            <StatusCampo tom={TOM_STATUS[status]} led>
              {STATUS_OS_LABEL[status]}
            </StatusCampo>
          </div>
          <h2 className="px-[15px] pt-2 text-[15px] font-bold leading-[1.25] text-foreground">
            {ordem.obra_nome}
          </h2>
          <div className="flex flex-col gap-[7px] px-[15px] pb-[13px] pt-2 font-mono text-[11.5px] font-medium text-foreground-faint">
            <span className="inline-flex items-center gap-1.5">
              <Icon icon="lucide:user" className="h-3 w-3 shrink-0" />
              {cliente?.nome ?? "Cliente"}
            </span>
            {ordem.endereco ? (
              <span className="inline-flex items-center gap-1.5">
                <Icon icon="lucide:map-pin" className="h-3 w-3 shrink-0" />
                {ordem.endereco}
              </span>
            ) : null}
            {ordem.tipo_servico ? (
              <span className="inline-flex items-center gap-1.5">
                <Icon icon="lucide:hammer" className="h-3 w-3 shrink-0" />
                {TIPO_SERVICO_LABEL[ordem.tipo_servico]}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Icon icon="lucide:calendar" className="h-3 w-3 shrink-0" />
              desde {formatData(ordem.aberta_em.slice(0, 10))}
            </span>
          </div>
        </CartaoDestaque>

        <BlocoCampo rotulo="Equipamento">
          {equipamento ? (
            <CaixaCampo>
              <IconeTile>
                <Icon icon={TIPO_ICONE[equipamento.tipo]} className="h-[18px] w-[18px]" />
              </IconeTile>
              <b className="min-w-0 truncate text-[13.5px] font-semibold text-foreground">
                {equipamento.nome}
              </b>
              <ValorCaixa>horím. {formatHorimetro(equipamento.horimetro_atual)}</ValorCaixa>
            </CaixaCampo>
          ) : (
            <CaixaCampo>
              <IconeTile tom="muted">
                <Icon icon="lucide:truck" className="h-[18px] w-[18px]" />
              </IconeTile>
              <span className="text-[13px] text-foreground-faint">
                Nenhum equipamento previsto nesta OS
              </span>
            </CaixaCampo>
          )}

          {equipamento ? (
            <Link
              to="/app/ordens/$ordemId/equipamento"
              params={{ ordemId: ordem.id }}
              className={ATALHO_CAMPO}
            >
              <AtalhoConteudo icone="lucide:truck">Ficha do equipamento</AtalhoConteudo>
            </Link>
          ) : null}
          <Link
            to="/app/ordens/$ordemId/checklist"
            params={{ ordemId: ordem.id }}
            className={ATALHO_CAMPO}
          >
            <AtalhoConteudo icone="lucide:circle-check-big">
              Fazer checklist de pré-uso
            </AtalhoConteudo>
          </Link>
          <Link
            to="/app/ordens/$ordemId/diario"
            params={{ ordemId: ordem.id }}
            className={ATALHO_CAMPO}
          >
            <AtalhoConteudo icone="lucide:file-text">Diário de obra · hoje</AtalhoConteudo>
          </Link>
          <Link
            to="/app/ordens/$ordemId/manutencao"
            params={{ ordemId: ordem.id }}
            className={ATALHO_CAMPO}
          >
            <AtalhoConteudo icone="lucide:wrench">Solicitar manutenção</AtalhoConteudo>
          </Link>
          <Link
            to="/app/ordens/$ordemId/paralisacao"
            params={{ ordemId: ordem.id }}
            className={ATALHO_CAMPO}
          >
            <AtalhoConteudo icone="lucide:ban">Registrar paralisação</AtalhoConteudo>
          </Link>
          <Link
            to="/app/ordens/$ordemId/viagens"
            params={{ ordemId: ordem.id }}
            className={ATALHO_CAMPO}
          >
            <AtalhoConteudo icone="lucide:truck">Viagens de basculante</AtalhoConteudo>
          </Link>
          <Link
            to="/app/ordens/$ordemId/prancha"
            params={{ ordemId: ordem.id }}
            className={ATALHO_CAMPO}
          >
            <AtalhoConteudo icone="lucide:forklift">Mobilização · prancha</AtalhoConteudo>
          </Link>
          <Link
            to="/app/ordens/$ordemId/medicao"
            params={{ ordemId: ordem.id }}
            className={ATALHO_CAMPO}
          >
            <AtalhoConteudo icone="lucide:pencil">Medição · assinatura do cliente</AtalhoConteudo>
          </Link>
          <Link
            to="/app/ordens/$ordemId/mapa"
            params={{ ordemId: ordem.id }}
            className={ATALHO_CAMPO}
          >
            <AtalhoConteudo icone="lucide:map-pin">Mapa da obra · como chegar</AtalhoConteudo>
          </Link>
        </BlocoCampo>

        <BlocoCampo rotulo="Minhas horas nesta OS">
          <BarraProgresso
            valor={`${minhasHoras.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} h`}
            legenda={
              horasEquipe > 0
                ? `de ${horasEquipe.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} h da equipe`
                : "nenhuma hora fechada ainda nesta OS"
            }
            percentual={horasEquipe > 0 ? (minhasHoras / horasEquipe) * 100 : 0}
          />
        </BlocoCampo>

        <SecaoCampo>Meus apontamentos nesta OS</SecaoCampo>
        {meus.length === 0 ? (
          <VazioCampo icone="lucide:clock" titulo="Nenhum apontamento seu ainda" />
        ) : (
          <CartaoCampo>
            {meus.slice(0, 6).map((a) => (
              <div key={a.id} className={LINHA_CAMPO}>
                <IconeTile tom="muted">
                  <Icon icon="lucide:clock" className="h-4 w-4" />
                </IconeTile>
                <LinhaCorpo>
                  <LinhaTitulo>
                    {rotuloDiaRelativo((a.finalizado_em ?? a.iniciado_em).slice(0, 10))}
                  </LinhaTitulo>
                  <LinhaMeta className="font-mono">
                    {formatHorimetro(a.horimetro_inicial)} →{" "}
                    {a.horimetro_final != null
                      ? formatHorimetro(a.horimetro_final)
                      : "em andamento"}
                  </LinhaMeta>
                </LinhaCorpo>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <b className="font-mono text-[13px] font-semibold text-foreground">
                    {a.horas_trabalhadas != null
                      ? `${a.horas_trabalhadas.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} h`
                      : "—"}
                  </b>
                  <SyncMini sincronizado={!a.pendente_sync} />
                </div>
              </div>
            ))}
          </CartaoCampo>
        )}

        {ordem.observacao ? (
          <BlocoCampo rotulo="Escopo" className="mt-3.5">
            <div className="rounded-[10px] border border-dashed bg-surface px-3.5 py-3 text-[12.5px] leading-[1.6] text-muted-foreground">
              {ordem.observacao}
            </div>
          </BlocoCampo>
        ) : null}
      </AreaRolagem>

      {!fechada ? (
        <div className="flex shrink-0 gap-2.5 border-t bg-surface px-4 pb-3.5 pt-3">
          {emAndamentoAqui ? (
            <Link
              to="/app/apontamento/$apontamentoId"
              params={{ apontamentoId: emAndamentoAqui.id }}
              className={classeBotaoCampo("solido", "min-h-12")}
            >
              <Icon icon="lucide:gauge" className="h-[18px] w-[18px]" />
              Encerrar e apontar
            </Link>
          ) : (
            <Link
              to="/app/apontamento/novo"
              search={{ os: ordem.id }}
              className={classeBotaoCampo("solido", "min-h-12")}
            >
              <Icon icon="lucide:gauge" className="h-[18px] w-[18px]" />
              Apontar horas
            </Link>
          )}
          <Link
            to="/app/abastecer"
            className={classeBotaoCampo("ghost", "min-h-12 basis-[42%] shrink-0")}
          >
            <Icon icon="lucide:fuel" className="h-[17px] w-[17px]" />
            Abastecer
          </Link>
        </div>
      ) : null}
    </TelaCampo>
  );
}

export function OrdemNaoEncontrada() {
  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={
          <Link to="/app/ordens" aria-label="Voltar" className={BOTAO_VOLTAR}>
            <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
          </Link>
        }
        titulo="Ordem de Serviço"
      />
      <AreaRolagem>
        <VazioCampo
          icone="lucide:file-question"
          titulo="OS não encontrada"
          descricao="Esta ordem pode ter sido removida ou ainda não foi atribuída a você."
        />
      </AreaRolagem>
    </TelaCampo>
  );
}
