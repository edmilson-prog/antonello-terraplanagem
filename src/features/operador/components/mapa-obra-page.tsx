import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  BOTAO_VOLTAR,
  CabecalhoCampo,
  IconeTile,
  TagCabecalho,
  TelaCampo,
  VazioCampo,
  classeBotaoCampo,
} from "@/features/operador/components/kit";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { clientesStore } from "@/features/clientes/clientes-store";

/*
 * Mapa da obra (`screen === 'mapa'` no CampoApp.jsx).
 *
 * A tabela `ordens_servico` guarda o endereço como texto, sem latitude e
 * longitude — não há como cravar o pino nem calcular distância/tempo da base.
 * Esta tela usa o estado de fallback que o próprio kit prevê (`acm-fallback`) e
 * entrega o que resolve o problema do operador: abrir a rota no GPS do celular
 * pelo endereço. Plotar o mapa depende de a retaguarda passar a geolocalizar a
 * obra no cadastro da OS.
 */

function urlRota(endereco: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`;
}

export function MapaObraPage({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const cliente = ordem ? clientesStore.getById(ordem.cliente_id) : undefined;

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

  if (!ordem) {
    return (
      <TelaCampo>
        <CabecalhoCampo voltar={voltar} titulo="Mapa da obra" />
        <AreaRolagem>
          <VazioCampo icone="lucide:map-pin" titulo="OS não encontrada" />
        </AreaRolagem>
      </TelaCampo>
    );
  }

  const endereco = ordem.endereco?.trim() ?? "";

  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={voltar}
        titulo="Mapa da obra"
        tag={<TagCabecalho>{ordem.numero}</TagCabecalho>}
      />

      <div className="relative flex-1 overflow-hidden bg-surface-2">
        <div className="grid h-full place-items-center px-8 text-center">
          <div className="max-w-[280px]">
            <Icon icon="lucide:map-pin" className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-3 text-[12.5px] leading-[1.6] text-foreground-faint">
              {endereco
                ? "O mapa aparece aqui quando a obra tiver coordenadas cadastradas. Enquanto isso, abra a rota direto no GPS do celular."
                : "Esta OS ainda não tem endereço cadastrado pela retaguarda."}
            </p>
          </div>
        </div>

        <div className="absolute inset-x-3 bottom-3 flex flex-col gap-[11px] rounded-[14px] border border-border-strong bg-background/95 px-3.5 py-3 backdrop-blur">
          <div className="flex items-center gap-[11px]">
            <IconeTile>
              <Icon icon="lucide:map-pin" className="h-[17px] w-[17px]" />
            </IconeTile>
            <div className="min-w-0 flex-1">
              <b className="block truncate text-[13.5px] font-semibold text-foreground">
                {endereco || "Sem endereço cadastrado"}
              </b>
              <span className="mt-[3px] block truncate text-[11.5px] text-foreground-faint">
                {cliente?.nome ?? "Cliente"} · {ordem.obra_nome}
              </span>
            </div>
          </div>

          {endereco ? (
            <a
              href={urlRota(endereco)}
              target="_blank"
              rel="noopener noreferrer"
              className={classeBotaoCampo("solido", "min-h-12")}
            >
              <Icon icon="lucide:arrow-up-right" className="h-[18px] w-[18px]" />
              Abrir rota no GPS
            </a>
          ) : (
            <div className="flex min-h-12 items-center justify-center rounded-xl border border-dashed text-[12.5px] text-foreground-faint">
              Peça o endereço à retaguarda
            </div>
          )}
        </div>
      </div>
    </TelaCampo>
  );
}
