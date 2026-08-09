import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  AvisoCampo,
  BlocoCampo,
  BotaoCampo,
  CabecalhoCampo,
  SegGrupo,
  SegOpcao,
  StepperCampo,
  TagCabecalho,
  TelaCampo,
  TextareaCampo,
  TileCampo,
  TilesCampo,
  classeBotaoCampo,
} from "@/features/operador/components/kit";
import { ConfirmacaoCampo } from "@/features/operador/components/confirmacao-campo";
import { VoltarParaOS } from "@/features/operador/components/voltar-os";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { registrosCampoStore } from "@/features/registros-campo/registros-campo-store";
import { viagensDeHoje } from "@/features/registros-campo/derivacoes";
import { MATERIAL_VIAGEM, type MaterialViagem } from "@/features/registros-campo/tipos";

/*
 * Viagens de basculante (`screen === 'via'` no CampoApp.jsx): contador grande,
 * pensado para o operador tocar com luva a cada viagem.
 *
 * O kit mostra o trajeto e os km rodados a partir de uma tabela de jazidas/
 * bota-fora que não existe no sistema. Aqui ficam material, contador e volume
 * — o que dá para afirmar com verdade.
 */

const MATERIAIS = Object.keys(MATERIAL_VIAGEM) as MaterialViagem[];

export function ViagensPage({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const registros = registrosCampoStore.useTodos();

  const [material, setMaterial] = useState<MaterialViagem>("bota_fora");
  const [viagens, setViagens] = useState(0);
  const [capacidade, setCapacidade] = useState(12);
  const [observacao, setObservacao] = useState("");
  const [confirmado, setConfirmado] = useState<{ viagens: number; volume: number } | null>(null);

  const jaRegistradas = viagensDeHoje(registros, ordemId);

  function confirmar() {
    if (viagens === 0) return;
    registrosCampoStore.registrar({
      tipo: "viagens",
      os_id: ordemId,
      equipamento_id: ordem?.equipamento_previsto_id ?? null,
      dados: {
        material,
        viagens,
        capacidade_m3: capacidade,
        observacao: observacao.trim() || null,
      },
    });
    setConfirmado({ viagens, volume: viagens * capacidade });
  }

  if (confirmado) {
    return (
      <TelaCampo>
        <ConfirmacaoCampo
          titulo="Viagens registradas"
          linhas={[
            { rotulo: ordem?.numero ?? "OS", valor: ordem?.obra_nome ?? "—" },
            { rotulo: "Material", valor: MATERIAL_VIAGEM[material] },
            {
              rotulo: "Viagens",
              valor: `${confirmado.viagens} × ${capacidade} m³ ≈ ${confirmado.volume} m³`,
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
        titulo="Viagens"
        tag={ordem ? <TagCabecalho>{ordem.numero}</TagCabecalho> : undefined}
      />
      <AreaRolagem className="pb-3">
        <BlocoCampo rotulo="Material">
          <SegGrupo>
            {MATERIAIS.map((id) => (
              <SegOpcao
                key={id}
                ativo={material === id}
                onClick={() => setMaterial(id)}
                className="min-h-[46px]"
              >
                {MATERIAL_VIAGEM[id]}
              </SegOpcao>
            ))}
          </SegGrupo>
        </BlocoCampo>

        <div className="rounded-[14px] border bg-surface px-[15px] py-4 text-center">
          <div className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-faint">
            Viagens neste registro
          </div>
          <div className="mt-2.5 font-mono text-[52px] font-semibold leading-none text-foreground">
            {viagens}
          </div>
          <div className="mt-[7px] text-[11.5px] text-foreground-faint">
            {jaRegistradas > 0
              ? `${jaRegistradas} já registradas hoje nesta OS · caçamba ${capacidade} m³`
              : `caçamba ${capacidade} m³`}
          </div>
          <div className="mt-3.5 flex gap-2.5">
            <button
              type="button"
              aria-label="Desfazer última viagem"
              disabled={viagens === 0}
              onClick={() => setViagens((v) => Math.max(0, v - 1))}
              className="grid w-[58px] shrink-0 place-items-center rounded-xl border bg-surface-2 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => setViagens((v) => v + 1)}
              className="min-h-[60px] flex-1 rounded-xl border border-primary bg-primary text-[17px] font-bold text-primary-foreground transition-colors hover:bg-primary-hover active:bg-primary-deep"
            >
              +1 viagem
            </button>
          </div>
        </div>

        <TilesCampo className="my-3">
          <TileCampo rotulo="Volume estimado" valor={viagens * capacidade} unidade="m³" />
          <TileCampo rotulo="Hoje nesta OS" valor={jaRegistradas + viagens} unidade="viagens" />
        </TilesCampo>

        <BlocoCampo rotulo="Capacidade da caçamba">
          <StepperCampo
            valor={`${capacidade} m³`}
            legenda="por viagem"
            diminuirDesabilitado={capacidade <= 1}
            onDiminuir={() => setCapacidade((v) => Math.max(1, v - 1))}
            onAumentar={() => setCapacidade((v) => v + 1)}
          />
        </BlocoCampo>

        <BlocoCampo rotulo="Observação (opcional)">
          <TextareaCampo
            value={observacao}
            onChange={setObservacao}
            placeholder="Ex.: bota-fora no depósito da obra, 3,2 km de trajeto…"
          />
        </BlocoCampo>

        <AvisoCampo className="mb-3.5">
          As viagens entram na <b className="text-foreground">medição</b> da OS. Encerre o dia para
          enviar o total contado.
        </AvisoCampo>

        <BotaoCampo disabled={viagens === 0} onClick={confirmar}>
          <Icon icon="lucide:check" className="h-[18px] w-[18px]" strokeWidth={2.2} />
          {viagens === 0 ? "Conte ao menos uma viagem" : `Encerrar · ${viagens} viagens`}
        </BotaoCampo>
      </AreaRolagem>
    </TelaCampo>
  );
}
