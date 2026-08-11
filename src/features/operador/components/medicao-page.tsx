import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  AvisoCampo,
  BlocoCampo,
  BotaoCampo,
  CabecalhoCampo,
  CartaoCampo,
  IconeTile,
  InputCampo,
  TagCabecalho,
  TelaCampo,
  classeBotaoCampo,
} from "@/features/operador/components/kit";
import { ConfirmacaoCampo } from "@/features/operador/components/confirmacao-campo";
import { VoltarParaOS } from "@/features/operador/components/voltar-os";
import { SignaturePad } from "@/features/comprovantes/components/signature-pad";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { totalHorasOS } from "@/features/ordem-servico/derivacoes";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { registrosCampoStore } from "@/features/registros-campo/registros-campo-store";
import { formatData } from "@/shared/lib/format";

/*
 * Assinatura da medição em campo (`screen === 'sig'` no CampoApp.jsx).
 *
 * O responsável do cliente confirma as HORAS EXECUTADAS — valores são tratados
 * pela retaguarda, e nenhum aparece nesta tela. O comprovante formal continua
 * sendo o do PRD-011, gerado na retaguarda a partir da OS fechada.
 */

export function MedicaoPage({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const apontamentos = apontamentosStore.useTodos();
  const equipamentos = equipamentosStore.useAll();

  const [responsavel, setResponsavel] = useState("");
  const [assinatura, setAssinatura] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  const cliente = ordem ? clientesStore.getById(ordem.cliente_id) : undefined;
  const equipamento = ordem?.equipamento_previsto_id
    ? equipamentos.find((e) => e.id === ordem.equipamento_previsto_id)
    : undefined;
  const horas = ordem ? totalHorasOS(ordem.id, apontamentos) : 0;
  const nomeValido = responsavel.trim().length > 0;

  function confirmar() {
    if (!assinatura || !nomeValido) return;
    registrosCampoStore.registrar({
      tipo: "medicao_assinada",
      os_id: ordemId,
      equipamento_id: equipamento?.id ?? null,
      dados: {
        responsavel: responsavel.trim(),
        horas_periodo: horas,
        assinatura,
      },
    });
    setConfirmado(true);
  }

  if (confirmado) {
    return (
      <TelaCampo>
        <ConfirmacaoCampo
          titulo="Medição assinada"
          linhas={[
            { rotulo: ordem?.numero ?? "OS", valor: ordem?.obra_nome ?? "—" },
            {
              rotulo: "Responsável",
              valor: `${responsavel.trim()} — ${cliente?.nome ?? "cliente"}`,
            },
            {
              rotulo: "Horas no período",
              valor: `${horas.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} h`,
            },
          ]}
          acoes={
            <Link to="/app/ordens/$ordemId" params={{ ordemId }} className={classeBotaoCampo()}>
              Voltar para a OS
            </Link>
          }
        />
      </TelaCampo>
    );
  }

  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={<VoltarParaOS ordemId={ordemId} />}
        titulo="Assinatura da medição"
        tag={ordem ? <TagCabecalho>{ordem.numero}</TagCabecalho> : undefined}
      />
      <AreaRolagem className="pb-3">
        <BlocoCampo rotulo={`Medição até ${formatData(new Date().toISOString().slice(0, 10))}`}>
          <CartaoCampo className="px-3.5 py-3">
            <div className="mb-2.5 flex items-center gap-[11px]">
              <IconeTile>
                <Icon
                  icon={equipamento ? TIPO_ICONE[equipamento.tipo] : "lucide:clipboard-list"}
                  className="h-[17px] w-[17px]"
                />
              </IconeTile>
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-semibold text-foreground">
                  {ordem?.obra_nome ?? "Obra"}
                </div>
                <div className="mt-[3px] truncate text-[11.5px] text-foreground-faint">
                  {cliente?.nome ?? "Cliente"}
                  {ordem?.endereco ? ` · ${ordem.endereco}` : ""}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border-soft pt-2.5 font-mono text-[12.5px] font-semibold text-foreground">
              <span>
                {horas.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} h no período
              </span>
              {equipamento ? (
                <span className="text-foreground-faint">{equipamento.nome}</span>
              ) : null}
            </div>
          </CartaoCampo>
        </BlocoCampo>

        <BlocoCampo rotulo="Responsável no cliente">
          <InputCampo
            value={responsavel}
            onChange={setResponsavel}
            placeholder="Nome de quem acompanha a obra"
          />
        </BlocoCampo>

        <BlocoCampo rotulo="Assinatura">
          <SignaturePad onChange={setAssinatura} />
        </BlocoCampo>

        <AvisoCampo className="mb-3.5">
          A assinatura confirma as <b className="text-foreground">horas executadas</b> — valores são
          tratados pela retaguarda.
        </AvisoCampo>

        <BotaoCampo disabled={!assinatura || !nomeValido} onClick={confirmar}>
          <Icon icon="lucide:check" className="h-[18px] w-[18px]" strokeWidth={2.2} />
          {!assinatura
            ? "Colete a assinatura"
            : !nomeValido
              ? "Informe o responsável"
              : "Confirmar medição"}
        </BotaoCampo>
      </AreaRolagem>
    </TelaCampo>
  );
}
