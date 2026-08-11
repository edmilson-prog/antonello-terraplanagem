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
  LINHA_CAMPO_CLICAVEL,
  LinhaCorpo,
  LinhaMeta,
  LinhaTitulo,
  TagCabecalho,
  TagOS,
  TelaCampo,
  VazioCampo,
} from "@/features/operador/components/kit";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { ordensDoOperador } from "@/features/ordem-servico/derivacoes";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import { clientesStore } from "@/features/clientes/clientes-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { formatDiaCurto, rotuloDiaRelativo } from "@/shared/lib/format";
import type { OrdemServico } from "@/shared/types";

/*
 * Minha escala (`screen === 'esc'` no CampoApp.jsx).
 *
 * A escala real da Antonello é o campo `inicio_previsto` da OS somado ao
 * responsável — não existe tabela de escala. Esta tela mostra os próximos sete
 * dias a partir desse planejamento; quem muda é a retaguarda, como diz o kit.
 */

const DIAS_JANELA = 7;

function chaveDiaLocal(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function EscalaPage() {
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const equipamentos = equipamentosStore.useAll();

  const hoje = new Date();
  const inicio = chaveDiaLocal(hoje);
  const fimData = new Date(hoje);
  fimData.setDate(fimData.getDate() + DIAS_JANELA - 1);
  const fim = chaveDiaLocal(fimData);

  const dias = useMemo(() => {
    const minhas = ordensDoOperador(ordens, apontamentos, getOperadorLogadoId());
    const programadas = minhas.filter(
      (os) =>
        os.status !== "fechada" &&
        os.inicio_previsto !== null &&
        os.inicio_previsto >= inicio &&
        os.inicio_previsto <= fim,
    );
    const mapa = new Map<string, OrdemServico[]>();
    for (const os of programadas) {
      const dia = os.inicio_previsto as string;
      const grupo = mapa.get(dia);
      if (grupo) grupo.push(os);
      else mapa.set(dia, [os]);
    }
    return [...mapa.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [ordens, apontamentos, inicio, fim]);

  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={
          <Link to="/app" aria-label="Voltar" className={BOTAO_VOLTAR}>
            <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
          </Link>
        }
        titulo="Minha escala"
        tag={
          <TagCabecalho>
            {formatDiaCurto(hoje).split(", ")[1]}–{formatDiaCurto(fimData).split(", ")[1]}
          </TagCabecalho>
        }
      />
      <AreaRolagem>
        {dias.length === 0 ? (
          <VazioCampo
            icone="lucide:calendar"
            titulo="Nada programado"
            descricao="Nenhuma OS sua tem início previsto nos próximos sete dias."
          />
        ) : (
          <CartaoCampo>
            {dias.flatMap(([dia, ordensDoDia]) =>
              ordensDoDia.map((os, indice) => {
                const cliente = clientesStore.getById(os.cliente_id);
                const equipamento = os.equipamento_previsto_id
                  ? equipamentos.find((e) => e.id === os.equipamento_previsto_id)
                  : undefined;
                const rotulo = rotuloDiaRelativo(dia);
                const [semana, data] = formatDiaCurto(new Date(`${dia}T12:00:00`)).split(", ");
                return (
                  <Link
                    key={os.id}
                    to="/app/ordens/$ordemId"
                    params={{ ordemId: os.id }}
                    className={LINHA_CAMPO_CLICAVEL}
                  >
                    <div className="w-[52px] shrink-0">
                      {indice === 0 ? (
                        <>
                          <div
                            className={
                              rotulo === "Hoje" || rotulo === "Ontem"
                                ? "font-mono text-[11px] font-bold leading-none text-primary"
                                : "font-mono text-[11px] font-bold leading-none text-foreground"
                            }
                          >
                            {semana}
                          </div>
                          <div className="mt-1 font-mono text-[10px] font-medium leading-none text-foreground-faint">
                            {data}
                          </div>
                        </>
                      ) : null}
                    </div>
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
              }),
            )}
          </CartaoCampo>
        )}

        <AvisoCampo className="mt-3.5">
          A escala é definida pela retaguarda e pode mudar — alterações chegam por{" "}
          <b className="text-foreground">notificação</b>. Toque num dia para abrir a OS.
        </AvisoCampo>
      </AreaRolagem>
    </TelaCampo>
  );
}
