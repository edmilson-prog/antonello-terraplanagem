import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  CarregandoCampo,
  CartaoCampo,
  ErroCampo,
  IconeTile,
  LINHA_CAMPO,
  LINHA_CAMPO_CLICAVEL,
  LinhaCorpo,
  LinhaMeta,
  LinhaTitulo,
  SecaoCampo,
  StatusCampo,
  TagOS,
  TelaCampo,
  VazioCampo,
} from "@/features/operador/components/kit";
import { CabecalhoAba } from "@/features/operador/components/cabecalho-aba";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { ordensDoOperador, statusEfetivoOS } from "@/features/ordem-servico/derivacoes";
import { STATUS_OS_LABEL } from "@/features/ordem-servico/labels";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { finalizadosNoDia } from "@/features/apontamento/resumo-horas";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import { clientesStore } from "@/features/clientes/clientes-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { formatHorimetro } from "@/shared/lib/format";
import type { StatusOS } from "@/shared/types";
import { cn } from "@/lib/utils";

/*
 * Aba "Minhas OS" (`tab === 'os'` no CampoApp.jsx). O kit lista três OS sem
 * busca; aqui a busca e os filtros de status continuam porque a lista real
 * cresce sem limite e já eram funcionalidade existente da tela.
 */

type FiltroId = "todas" | StatusOS;

const FILTROS: { id: FiltroId; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "aberta", label: STATUS_OS_LABEL.aberta },
  { id: "em_andamento", label: STATUS_OS_LABEL.em_andamento },
  { id: "fechada", label: STATUS_OS_LABEL.fechada },
];

export function MinhasOSPage() {
  const ordens = ordensStore.useTodas();
  const { isLoading, error } = ordensStore.useEstado();
  const apontamentos = apontamentosStore.useTodos();
  const equipamentos = equipamentosStore.useAll();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroId>("todas");

  const operadorId = getOperadorLogadoId();
  const minhas = useMemo(
    () => ordensDoOperador(ordens, apontamentos, operadorId),
    [ordens, apontamentos, operadorId],
  );
  const ativas = minhas.filter((o) => statusEfetivoOS(o, apontamentos) !== "fechada");

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return minhas.filter((os) => {
      if (filtro !== "todas" && statusEfetivoOS(os, apontamentos) !== filtro) return false;
      if (!termo) return true;
      const cliente = clientesStore.getById(os.cliente_id);
      return (
        os.numero.toLowerCase().includes(termo) ||
        os.obra_nome.toLowerCase().includes(termo) ||
        (cliente?.nome.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [minhas, apontamentos, busca, filtro]);

  const doDia = finalizadosNoDia(apontamentos, operadorId, new Date());

  return (
    <TelaCampo>
      <AreaRolagem className="pt-3.5">
        <CabecalhoAba
          titulo="Minhas OS"
          subtitulo={`${ativas.length} ${ativas.length === 1 ? "ativa" : "ativas"} no momento`}
          className="px-0 pb-2.5 pt-0"
        />

        <div className="relative mb-2.5">
          <Icon
            icon="lucide:search"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-faint"
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por número, cliente ou obra"
            className="h-[46px] w-full rounded-[10px] border bg-surface pl-9 pr-3.5 text-sm font-medium text-foreground outline-none placeholder:text-foreground-faint focus:border-primary focus:ring-[3px] focus:ring-primary/15"
          />
        </div>

        <div className="scrollbar-hide -mx-4 mb-1 overflow-x-auto px-4">
          <div className="flex gap-2">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltro(f.id)}
                aria-pressed={filtro === f.id}
                className={cn(
                  "min-h-11 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold transition-colors",
                  filtro === f.id
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-border bg-surface text-foreground-faint hover:border-border-strong",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="mt-3">
            <CarregandoCampo linhas={4} />
          </div>
        ) : error ? (
          <div className="mt-3">
            <ErroCampo mensagem={error.message} onTentarNovamente={ordensStore.retry} />
          </div>
        ) : visiveis.length === 0 ? (
          <div className="mt-3">
            <VazioCampo
              icone="lucide:clipboard-list"
              titulo="Nenhuma OS encontrada"
              descricao="Ajuste a busca ou os filtros — ou aguarde a recepção atribuir uma nova ordem."
            />
          </div>
        ) : (
          <CartaoCampo className="mt-3">
            {visiveis.map((os) => {
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
                      {equipamento
                        ? ` · horím. ${formatHorimetro(equipamento.horimetro_atual)}`
                        : ""}
                    </LinhaMeta>
                  </LinhaCorpo>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <TagOS>{os.numero}</TagOS>
                    {statusEfetivoOS(os, apontamentos) === "fechada" ? (
                      <StatusCampo tom="neutral">Fechada</StatusCampo>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </CartaoCampo>
        )}

        <SecaoCampo
          acao={
            <Link
              to="/app/historico"
              className="inline-flex items-center gap-1 text-[11px] font-semibold normal-case tracking-normal text-primary"
            >
              Ver histórico
              <Icon icon="lucide:chevron-right" className="h-3 w-3" />
            </Link>
          }
        >
          Apontamentos de hoje
        </SecaoCampo>

        {doDia.length === 0 ? (
          <VazioCampo icone="lucide:clock" titulo="Nada apontado hoje" />
        ) : (
          <CartaoCampo>
            {doDia.map((a) => {
              const os = a.os_id ? ordens.find((o) => o.id === a.os_id) : null;
              const equipamento = equipamentos.find((e) => e.id === a.equipamento_id);
              return (
                <div key={a.id} className={LINHA_CAMPO}>
                  <IconeTile tom="muted">
                    <Icon icon="lucide:clock" className="h-4 w-4" />
                  </IconeTile>
                  <LinhaCorpo>
                    <LinhaTitulo>{os?.numero ?? equipamento?.nome ?? "Apontamento"}</LinhaTitulo>
                    <LinhaMeta>{equipamento?.nome ?? "Equipamento"}</LinhaMeta>
                  </LinhaCorpo>
                  <b className="shrink-0 font-mono text-[13px] font-semibold text-foreground">
                    {(a.horas_trabalhadas ?? 0).toLocaleString("pt-BR", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{" "}
                    h
                  </b>
                </div>
              );
            })}
          </CartaoCampo>
        )}
      </AreaRolagem>
    </TelaCampo>
  );
}
