import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  BOTAO_VOLTAR,
  BarraProgresso,
  BlocoCampo,
  CabecalhoCampo,
  CartaoCampo,
  IconeTile,
  LINHA_CAMPO,
  LinhaCorpo,
  LinhaMeta,
  LinhaTitulo,
  SecaoCampo,
  StatusCampo,
  TagCabecalho,
  TelaCampo,
  VazioCampo,
} from "@/features/operador/components/kit";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { STATUS_LABEL, TIPO_ICONE, TIPO_LABEL } from "@/features/equipamentos/labels";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import {
  abastecimentosDoEquipamento,
  apontamentosFinalizadosDoEquipamento,
  consumoMedioLh,
  totalHoras,
  totalLitros,
} from "@/features/diesel/derivacoes";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { resumoProximaManutencao } from "@/features/manutencao/derivacoes";
import { clientesStore } from "@/features/clientes/clientes-store";
import { formatData, formatHorimetro } from "@/shared/lib/format";
import type { ReactNode } from "react";

/*
 * Ficha do equipamento no App de Campo (`screen === 'eqf'` no CampoApp.jsx).
 *
 * O kit abre com uma foto da máquina; a tabela `equipamentos` não guarda foto,
 * então a identidade usa o ladrilho da marca. Consumo médio é derivado
 * (litros ÷ horas), nunca armazenado — mesma regra do PRD-012.
 */

export function FichaEquipamentoPage({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();
  const abastecimentos = abastecimentosStore.useTodos();
  const planos = planosManutencaoStore.useAll();
  const registros = registrosManutencaoStore.useTodos();

  const voltar = (
    <Link
      to="/app/ordens/$ordemId"
      params={{ ordemId }}
      aria-label="Voltar"
      className={BOTAO_VOLTAR}
    >
      <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
    </Link>
  );

  const equipamento = ordem?.equipamento_previsto_id
    ? equipamentos.find((e) => e.id === ordem.equipamento_previsto_id)
    : undefined;

  if (!equipamento) {
    return (
      <TelaCampo>
        <CabecalhoCampo voltar={voltar} titulo="Equipamento" />
        <AreaRolagem>
          <VazioCampo
            icone="lucide:truck"
            titulo="Sem equipamento previsto"
            descricao="Esta OS ainda não tem um equipamento definido pela retaguarda."
          />
        </AreaRolagem>
      </TelaCampo>
    );
  }

  const cliente = ordem ? clientesStore.getById(ordem.cliente_id) : undefined;

  const abs = abastecimentosDoEquipamento(abastecimentos, equipamento.id);
  const aps = apontamentosFinalizadosDoEquipamento(apontamentos, equipamento.id);
  const consumo = consumoMedioLh(totalLitros(abs), totalHoras(aps), abs.length);

  const proxima = resumoProximaManutencao(equipamento, planos, registros);
  const realizadas = registros
    .filter((r) => r.equipamento_id === equipamento.id && r.status === "realizada")
    .sort((a, b) => (b.realizada_em ?? "").localeCompare(a.realizada_em ?? ""))
    .slice(0, 4);

  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={voltar}
        titulo="Equipamento"
        tag={ordem ? <TagCabecalho>{ordem.numero}</TagCabecalho> : undefined}
      />
      <AreaRolagem className="pb-3">
        <div className="mb-3.5 flex items-center gap-[11px]">
          <IconeTile tom="brand" tamanho={40}>
            <Icon icon={TIPO_ICONE[equipamento.tipo]} className="h-5 w-5" />
          </IconeTile>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-[15px] font-extrabold uppercase leading-[1.15] text-foreground">
              {equipamento.nome}
            </div>
            <div className="mt-[3px] truncate text-[11.5px] text-foreground-faint">
              {ordem
                ? `alocada na ${ordem.numero} · ${cliente?.nome ?? "Cliente"}`
                : TIPO_LABEL[equipamento.tipo]}
            </div>
          </div>
          <StatusCampo tom={equipamento.status === "manutencao" ? "danger" : "amber"} led>
            {STATUS_LABEL[equipamento.status]}
          </StatusCampo>
        </div>

        <CartaoCampo className="mb-3.5">
          <DadoFicha icone="lucide:gauge" rotulo="Horímetro">
            {formatHorimetro(equipamento.horimetro_atual)}
          </DadoFicha>
          <DadoFicha icone="lucide:wrench" rotulo="Tipo">
            {TIPO_LABEL[equipamento.tipo]}
          </DadoFicha>
          {equipamento.ano ? (
            <DadoFicha icone="lucide:calendar" rotulo="Ano">
              {equipamento.ano}
            </DadoFicha>
          ) : null}
          {equipamento.identificador ? (
            <DadoFicha icone="lucide:id-card" rotulo="Série">
              {equipamento.identificador}
            </DadoFicha>
          ) : null}
          <DadoFicha icone="lucide:fuel" rotulo="Consumo">
            {consumo != null ? (
              <>
                {consumo.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} L/h{" "}
                <small className="text-foreground-faint">médio</small>
              </>
            ) : (
              <span className="text-foreground-faint">sem dados suficientes</span>
            )}
          </DadoFicha>
        </CartaoCampo>

        <BlocoCampo rotulo="Próxima manutenção">
          {proxima ? (
            <BarraProgresso
              valor={proxima.descricao}
              legenda={
                proxima.restantes <= 0
                  ? `vencida · ${Math.abs(proxima.restantes)} h`
                  : `em ${proxima.restantes} h`
              }
              percentual={
                proxima.intervalo > 0
                  ? ((proxima.intervalo - Math.max(0, proxima.restantes)) / proxima.intervalo) * 100
                  : 100
              }
              alerta={proxima.status === "vencida"}
            />
          ) : (
            <div className="rounded-[10px] border border-dashed bg-surface px-3.5 py-3 text-[12.5px] text-foreground-faint">
              Nenhum plano de manutenção previsto para esta máquina.
            </div>
          )}
        </BlocoCampo>

        <SecaoCampo>Últimas manutenções</SecaoCampo>
        {realizadas.length === 0 ? (
          <VazioCampo icone="lucide:wrench" titulo="Nenhuma manutenção registrada" />
        ) : (
          <CartaoCampo>
            {realizadas.map((r) => {
              const plano = planos.find((p) => p.id === r.plano_id);
              return (
                <div key={r.id} className={LINHA_CAMPO}>
                  <IconeTile tom="muted">
                    <Icon icon="lucide:wrench" className="h-4 w-4" />
                  </IconeTile>
                  <LinhaCorpo>
                    <LinhaTitulo>{plano?.descricao ?? "Manutenção"}</LinhaTitulo>
                    <LinhaMeta className="font-mono">
                      {r.realizada_em ? formatData(r.realizada_em.slice(0, 10)) : "—"}
                      {r.horimetro_realizado != null
                        ? ` · ${formatHorimetro(r.horimetro_realizado)}`
                        : ""}
                    </LinhaMeta>
                  </LinhaCorpo>
                </div>
              );
            })}
          </CartaoCampo>
        )}
      </AreaRolagem>
    </TelaCampo>
  );
}

function DadoFicha({
  icone,
  rotulo,
  children,
}: {
  icone: string;
  rotulo: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-[11px] border-t border-border-soft px-3.5 py-3 text-[13px] first:border-t-0">
      <Icon icon={icone} className="h-4 w-4 shrink-0 text-foreground-faint" />
      <span className="w-[86px] shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground-faint">
        {rotulo}
      </span>
      <span className="min-w-0 flex-1 truncate font-mono font-medium text-foreground">
        {children}
      </span>
    </div>
  );
}
