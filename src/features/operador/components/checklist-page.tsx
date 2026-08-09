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
  CartaoCampo,
  IconeTile,
  TagCabecalho,
  TelaCampo,
  ValorCaixa,
  classeBotaoCampo,
} from "@/features/operador/components/kit";
import { ConfirmacaoCampo } from "@/features/operador/components/confirmacao-campo";
import { VoltarParaOS } from "@/features/operador/components/voltar-os";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { registrosCampoStore } from "@/features/registros-campo/registros-campo-store";
import { ITENS_CHECKLIST } from "@/features/registros-campo/tipos";
import { formatHorimetro } from "@/shared/lib/format";
import { cn } from "@/lib/utils";

/*
 * Checklist de pré-uso (`screen === 'chk'` no CampoApp.jsx). Todos os itens
 * precisam de resposta; itens não conformes viram alerta de segurança e ficam
 * na fila para a Manutenção.
 */

type Resposta = "ok" | "nok";

export function ChecklistPage({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const equipamentos = equipamentosStore.useAll();
  const [respostas, setRespostas] = useState<Record<string, Resposta>>({});
  const [confirmado, setConfirmado] = useState<{ naoConformes: number } | null>(null);

  const equipamento = ordem?.equipamento_previsto_id
    ? equipamentos.find((e) => e.id === ordem.equipamento_previsto_id)
    : undefined;

  const respondidos = Object.keys(respostas).length;
  const naoConformes = Object.values(respostas).filter((r) => r === "nok").length;
  const completo = respondidos === ITENS_CHECKLIST.length;

  function confirmar() {
    registrosCampoStore.registrar({
      tipo: "checklist",
      os_id: ordemId,
      equipamento_id: equipamento?.id ?? null,
      dados: {
        itens: ITENS_CHECKLIST.map((item) => ({
          chave: item.chave,
          conforme: respostas[item.chave] === "ok",
        })),
        nao_conformes: naoConformes,
        horimetro: equipamento?.horimetro_atual ?? null,
      },
    });
    setConfirmado({ naoConformes });
  }

  if (confirmado) {
    return (
      <TelaCampo>
        <ConfirmacaoCampo
          titulo={confirmado.naoConformes > 0 ? "Checklist com pendências" : "Checklist concluído"}
          linhas={[
            { rotulo: "Equipamento", valor: equipamento?.nome ?? "—" },
            {
              rotulo: "Conformes",
              valor: `${ITENS_CHECKLIST.length - confirmado.naoConformes} de ${ITENS_CHECKLIST.length}`,
            },
            ...(confirmado.naoConformes > 0
              ? [
                  {
                    rotulo: "Não conformes",
                    valor: `${confirmado.naoConformes} — vira alerta de segurança`,
                  },
                ]
              : []),
          ]}
          acoes={
            <>
              <Link to="/app/ordens/$ordemId" params={{ ordemId }} className={classeBotaoCampo()}>
                Voltar para a OS
              </Link>
              {confirmado.naoConformes > 0 ? (
                <Link
                  to="/app/ordens/$ordemId/manutencao"
                  params={{ ordemId }}
                  className={classeBotaoCampo("ghost")}
                >
                  Solicitar manutenção
                </Link>
              ) : null}
            </>
          }
        />
      </TelaCampo>
    );
  }

  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={<VoltarParaOS ordemId={ordemId} />}
        titulo="Checklist"
        tag={
          <TagCabecalho tom={completo ? "success" : "amber"}>
            {respondidos}/{ITENS_CHECKLIST.length}
          </TagCabecalho>
        }
      />
      <AreaRolagem className="pb-3">
        <BlocoCampo rotulo="Pré-uso · hoje">
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

        <CartaoCampo>
          {ITENS_CHECKLIST.map((item) => (
            <div
              key={item.chave}
              className="flex min-h-16 items-center gap-3 border-t border-border-soft px-3.5 py-3 first:border-t-0"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold text-foreground">{item.titulo}</div>
                <div className="mt-[3px] text-[11.5px] text-foreground-faint">{item.detalhe}</div>
              </div>
              <div className="flex shrink-0 gap-2">
                <BotaoResposta
                  rotulo={`${item.titulo}: conforme`}
                  ativo={respostas[item.chave] === "ok"}
                  tom="ok"
                  onClick={() => setRespostas((r) => ({ ...r, [item.chave]: "ok" }))}
                />
                <BotaoResposta
                  rotulo={`${item.titulo}: não conforme`}
                  ativo={respostas[item.chave] === "nok"}
                  tom="nok"
                  onClick={() => setRespostas((r) => ({ ...r, [item.chave]: "nok" }))}
                />
              </div>
            </div>
          ))}
        </CartaoCampo>

        {naoConformes > 0 ? (
          <AvisoCampo tom="perigo" className="mt-3">
            Itens não conformes entram nos <b>alertas de segurança</b> e devem virar uma solicitação
            de manutenção.
          </AvisoCampo>
        ) : null}

        <div className="mt-3.5">
          <BotaoCampo disabled={!completo} onClick={confirmar}>
            <Icon icon="lucide:check" className="h-[18px] w-[18px]" strokeWidth={2.2} />
            {completo ? "Concluir checklist" : `Responda os ${ITENS_CHECKLIST.length} itens`}
          </BotaoCampo>
        </div>
      </AreaRolagem>
    </TelaCampo>
  );
}

function BotaoResposta({
  rotulo,
  ativo,
  tom,
  onClick,
}: {
  rotulo: string;
  ativo: boolean;
  tom: "ok" | "nok";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      aria-pressed={ativo}
      onClick={onClick}
      className={cn(
        "grid h-[46px] w-[46px] place-items-center rounded-[11px] border transition-colors",
        ativo
          ? tom === "ok"
            ? "border-success/45 bg-success/15 text-success-foreground"
            : "border-destructive/45 bg-destructive/15 text-destructive"
          : "border-border bg-surface-2 text-foreground-faint hover:border-border-strong",
      )}
    >
      <Icon
        icon={tom === "ok" ? "lucide:check" : "lucide:ban"}
        className={tom === "ok" ? "h-[18px] w-[18px]" : "h-4 w-4"}
        strokeWidth={2.3}
      />
    </button>
  );
}
