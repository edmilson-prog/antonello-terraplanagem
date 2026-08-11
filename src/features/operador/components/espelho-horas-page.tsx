import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  AvisoCampo,
  BOTAO_VOLTAR,
  CabecalhoCampo,
  CartaoCampo,
  IconeTile,
  LINHA_CAMPO,
  LinhaCorpo,
  LinhaMeta,
  LinhaTitulo,
  SecaoCampo,
  TagCabecalho,
  TagOS,
  TelaCampo,
  TileCampo,
  TilesCampo,
  VazioCampo,
} from "@/features/operador/components/kit";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import {
  diasComApontamento,
  finalizadosNoMes,
  horasPorOS,
  horasPorSemana,
  somarHoras,
} from "@/features/apontamento/resumo-horas";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { formatData } from "@/shared/lib/format";

/*
 * Espelho de horas (`screen === 'esp'` no CampoApp.jsx): o que o operador
 * apontou no mês, por OS e por semana. Só horas — nenhum valor de folha, que é
 * assunto da retaguarda.
 */

const formatoHoras = (h: number) =>
  h.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function rotuloSemana(inicioISO: string, indice: number): string {
  const inicio = new Date(`${inicioISO}T12:00:00`);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 6);
  const dd = (d: Date) => String(d.getDate()).padStart(2, "0");
  const mm = (d: Date) => String(d.getMonth() + 1).padStart(2, "0");
  return `S${indice + 1} · ${dd(inicio)}–${dd(fim)}/${mm(fim)}`;
}

export function EspelhoHorasPage() {
  const apontamentos = apontamentosStore.useTodos();
  const ordens = ordensStore.useTodas();

  const hoje = new Date();
  const operadorId = getOperadorLogadoId();

  const doMes = useMemo(
    () => finalizadosNoMes(apontamentos, operadorId, hoje),
    // `hoje` muda a cada render mas só o mês importa; a chave estável é o mês.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apontamentos, operadorId, hoje.getFullYear(), hoje.getMonth()],
  );

  const total = somarHoras(doMes);
  const dias = diasComApontamento(doMes);
  const media = dias > 0 ? Math.round((total / dias) * 10) / 10 : 0;
  const porOS = horasPorOS(doMes);
  const porSemana = horasPorSemana(doMes);
  const maiorOS = porOS[0]?.horas ?? 0;

  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  const mesRotulo = hoje
    .toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    .replace(".", "");

  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={
          <Link to="/app/perfil" aria-label="Voltar" className={BOTAO_VOLTAR}>
            <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
          </Link>
        }
        titulo="Espelho de horas"
        tag={<TagCabecalho>{mesRotulo}</TagCabecalho>}
      />
      <AreaRolagem>
        <TilesCampo colunas={3}>
          <TileCampo rotulo="No mês" valor={formatoHoras(total)} unidade="h" />
          <TileCampo rotulo="Dias" valor={dias} />
          <TileCampo rotulo="Média/dia" valor={formatoHoras(media)} unidade="h" />
        </TilesCampo>

        {doMes.length === 0 ? (
          <div className="mt-4">
            <VazioCampo
              icone="lucide:calendar-clock"
              titulo="Nenhuma hora fechada neste mês"
              descricao="Os apontamentos encerrados no mês aparecem aqui, por OS e por semana."
            />
          </div>
        ) : (
          <>
            <SecaoCampo>Por ordem de serviço</SecaoCampo>
            <CartaoCampo>
              {porOS.map((linha) => {
                const os = linha.osId ? ordens.find((o) => o.id === linha.osId) : null;
                const largura = maiorOS > 0 ? (linha.horas / maiorOS) * 100 : 0;
                return (
                  <div key={linha.osId ?? "sem-os"} className={LINHA_CAMPO}>
                    <TagOS>{os?.numero ?? "Sem OS"}</TagOS>
                    <LinhaCorpo>
                      <LinhaTitulo>{os?.obra_nome ?? "Apontamentos sem OS vinculada"}</LinhaTitulo>
                      <div className="mt-[7px] h-1 overflow-hidden rounded-[2px] bg-surface-2">
                        <i
                          style={{ width: `${largura}%` }}
                          className="block h-full rounded-[2px] bg-gradient-to-r from-primary to-primary-deep"
                        />
                      </div>
                    </LinhaCorpo>
                    <b className="shrink-0 font-mono text-[13px] font-semibold text-foreground">
                      {formatoHoras(linha.horas)} h
                    </b>
                  </div>
                );
              })}
            </CartaoCampo>

            <SecaoCampo>Por semana</SecaoCampo>
            <CartaoCampo>
              {porSemana.map((semana, indice) => (
                <div key={semana.inicio} className={LINHA_CAMPO}>
                  <IconeTile tom="muted">
                    <Icon icon="lucide:calendar" className="h-4 w-4" />
                  </IconeTile>
                  <LinhaCorpo>
                    <LinhaTitulo>{rotuloSemana(semana.inicio, indice)}</LinhaTitulo>
                    <LinhaMeta>
                      {indice === porSemana.length - 1 ? "semana em curso" : "semana fechada"}
                    </LinhaMeta>
                  </LinhaCorpo>
                  <b className="shrink-0 font-mono text-[13px] font-semibold text-foreground">
                    {formatoHoras(semana.horas)} h
                  </b>
                </div>
              ))}
            </CartaoCampo>
          </>
        )}

        <AvisoCampo className="mt-3.5">
          Confira suas horas até o fechamento do mês, em{" "}
          <b className="text-foreground">
            {formatData(
              `${ultimoDia.getFullYear()}-${String(ultimoDia.getMonth() + 1).padStart(2, "0")}-${String(ultimoDia.getDate()).padStart(2, "0")}`,
            )}
          </b>
          . Valores de folha são tratados pela retaguarda.
        </AvisoCampo>
      </AreaRolagem>
    </TelaCampo>
  );
}
