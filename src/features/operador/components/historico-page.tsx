import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  BOTAO_VOLTAR,
  CabecalhoCampo,
  CartaoCampo,
  IconeTile,
  LINHA_CAMPO,
  LinhaCorpo,
  LinhaMeta,
  LinhaTitulo,
  SecaoCampo,
  SyncMini,
  TagCabecalho,
  TelaCampo,
  VazioCampo,
} from "@/features/operador/components/kit";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import {
  agruparPorDia,
  finalizadosDoOperador,
  somarHoras,
} from "@/features/apontamento/resumo-horas";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { formatHorimetro, rotuloDiaRelativo } from "@/shared/lib/format";

/*
 * Histórico de apontamentos (`screen === 'hist'` no CampoApp.jsx): agrupado
 * por dia, com o horímetro de início → fim de cada registro.
 */

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

export function HistoricoPage() {
  const apontamentos = apontamentosStore.useTodos();
  const ordens = ordensStore.useTodas();
  const equipamentos = equipamentosStore.useAll();

  const meus = useMemo(
    () => finalizadosDoOperador(apontamentos, getOperadorLogadoId()),
    [apontamentos],
  );
  const grupos = useMemo(() => agruparPorDia(meus), [meus]);

  const limite = Date.now() - SETE_DIAS_MS;
  const horasSemana = somarHoras(
    meus.filter((a) => new Date(a.finalizado_em as string).getTime() >= limite),
  );

  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={
          <Link to="/app/ordens" aria-label="Voltar" className={BOTAO_VOLTAR}>
            <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
          </Link>
        }
        titulo="Histórico"
        tag={
          <TagCabecalho>
            {horasSemana.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} h na semana
          </TagCabecalho>
        }
      />
      <AreaRolagem>
        {grupos.length === 0 ? (
          <VazioCampo
            icone="lucide:history"
            titulo="Nenhum apontamento fechado"
            descricao="Assim que você encerrar um apontamento ele aparece aqui."
          />
        ) : (
          grupos.map((grupo) => (
            <div key={grupo.dia}>
              <SecaoCampo>{rotuloDiaRelativo(grupo.dia)}</SecaoCampo>
              <CartaoCampo>
                {grupo.apontamentos.map((a) => {
                  const os = a.os_id ? ordens.find((o) => o.id === a.os_id) : null;
                  const equipamento = equipamentos.find((e) => e.id === a.equipamento_id);
                  return (
                    <div key={a.id} className={LINHA_CAMPO}>
                      <IconeTile>
                        <Icon
                          icon={equipamento ? TIPO_ICONE[equipamento.tipo] : "lucide:gauge"}
                          className="h-[17px] w-[17px]"
                        />
                      </IconeTile>
                      <LinhaCorpo>
                        <LinhaTitulo>
                          {os ? `${os.numero} · ` : ""}
                          {equipamento?.nome ?? "Equipamento"}
                        </LinhaTitulo>
                        <LinhaMeta className="font-mono">
                          {formatHorimetro(a.horimetro_inicial)} →{" "}
                          {a.horimetro_final != null ? formatHorimetro(a.horimetro_final) : "—"}
                        </LinhaMeta>
                      </LinhaCorpo>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <b className="font-mono text-[13px] font-semibold text-foreground">
                          {(a.horas_trabalhadas ?? 0).toLocaleString("pt-BR", {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          })}{" "}
                          h
                        </b>
                        <SyncMini sincronizado={!a.pendente_sync} />
                      </div>
                    </div>
                  );
                })}
              </CartaoCampo>
            </div>
          ))
        )}
      </AreaRolagem>
    </TelaCampo>
  );
}
