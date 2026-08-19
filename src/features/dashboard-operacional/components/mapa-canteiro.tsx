import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { EmptyState } from "@/shared/components/empty-state";
import { combinarEstados } from "@/shared/hooks/use-estado-consulta";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { posicoesDaFrota } from "@/features/dashboard-operacional/posicoes";
import { buscarClima, LOCAL_PADRAO, type Clima } from "@/features/dashboard-operacional/clima";

const MapaCanteiroLeaflet = lazy(() =>
  import("@/features/dashboard-operacional/components/mapa-canteiro-leaflet").then((m) => ({
    default: m.MapaCanteiroLeaflet,
  })),
);

const PLACEHOLDER = <div className="h-[360px] animate-pulse bg-muted" />;

// Mapa real (Leaflet + OpenStreetMap) carregado só no cliente (import dinâmico +
// gate de montagem): Leaflet acessa `window`/`navigator` na importação e
// quebraria durante o SSR (TanStack Start renderiza `/admin` no servidor).
export function MapaCanteiro() {
  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();
  const ordens = ordensStore.useTodas();
  const { isLoading, error, retry } = combinarEstados(
    { estado: equipamentosStore.useEstado(), retry: equipamentosStore.retry },
    { estado: apontamentosStore.useEstado(), retry: apontamentosStore.retry },
    { estado: ordensStore.useEstado(), retry: ordensStore.retry },
  );
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  const ativos = equipamentos.filter((e) => e.ativo);
  const operadoresEmCampo = new Set(
    apontamentos.filter((a) => a.status === "em_andamento").map((a) => a.operador_id),
  ).size;
  const { pins, semLocalizacao, centro } = useMemo(
    () => posicoesDaFrota(ativos, apontamentos, ordens),
    [ativos, apontamentos, ordens],
  );

  return (
    <CardSecao
      titulo="Operacional em tempo real"
      icone="lucide:map-pin"
      acessorio={
        <CardPill>
          {pins.length} equipamento{pins.length === 1 ? "" : "s"} no mapa
        </CardPill>
      }
      bodyClassName="p-0"
    >
      {isLoading ? (
        PLACEHOLDER
      ) : error ? (
        <div
          role="alert"
          className="flex h-[360px] flex-col items-center justify-center gap-3 text-center"
        >
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <button
            type="button"
            onClick={retry}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : pins.length === 0 ? (
        <EmptyState
          icon="lucide:map"
          titulo={
            semLocalizacao > 0 ? "Obras sem localização" : "Nenhuma máquina em operação agora"
          }
          descricao={
            semLocalizacao > 0
              ? `${semLocalizacao} equipamento(s) apontando em obras sem coordenada informada. Preencha "Localização no mapa" na OS para vê-los aqui.`
              : "O mapa mostra os equipamentos com apontamento em andamento. Nenhum está apontando no momento."
          }
          className="border-0"
        />
      ) : (
        <div className="relative h-[360px]">
          {montado ? (
            <Suspense fallback={PLACEHOLDER}>
              <MapaCanteiroLeaflet pins={pins} centro={centro} />
            </Suspense>
          ) : (
            PLACEHOLDER
          )}

          {/* Agora é posição real de canteiro (a obra em que a máquina aponta),
              não mais coordenada ilustrativa — mas continua sem GPS de pessoa
              (RF-003), e o selo diz de onde o ponto vem. */}
          <span className="pointer-events-none absolute left-14 top-3 z-[500] inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-card/90 px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Posição do canteiro
          </span>

          {semLocalizacao > 0 ? (
            <span className="pointer-events-none absolute right-3 top-3 z-[500] rounded-full border bg-card/90 px-2.5 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur">
              +{semLocalizacao} sem localização
            </span>
          ) : null}

          <FaixaCondicoes operadoresEmCampo={operadoresEmCampo} />
        </div>
      )}
    </CardSecao>
  );
}

// Clima da base + gente em campo. O clima vem da Open-Meteo em runtime; se a
// chamada falhar, a faixa simplesmente não mostra a parte de clima.
function FaixaCondicoes({ operadoresEmCampo }: { operadoresEmCampo: number }) {
  const [clima, setClima] = useState<Clima | null>(null);

  useEffect(() => {
    const controle = new AbortController();
    let vivo = true;
    buscarClima(LOCAL_PADRAO, controle.signal).then((c) => {
      if (vivo) setClima(c);
    });
    return () => {
      vivo = false;
      controle.abort();
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[500] flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border bg-card/90 px-3 py-2 text-xs text-foreground backdrop-blur">
      {clima ? (
        <>
          <Icon icon={clima.icone} className="h-4 w-4 text-primary" aria-hidden />
          <b className="font-mono font-semibold">{clima.temperatura}°</b>
          <span>· {LOCAL_PADRAO.nome} ·</span>
          <span>{clima.descricao}</span>
        </>
      ) : (
        <>
          <Icon icon="lucide:map-pin" className="h-4 w-4 text-primary" aria-hidden />
          <span>{LOCAL_PADRAO.nome}</span>
        </>
      )}
      <span className="flex-1" />
      <Icon icon="lucide:hard-hat" className="h-4 w-4 text-primary" aria-hidden />
      <span>
        {operadoresEmCampo} operador{operadoresEmCampo === 1 ? "" : "es"} em campo
      </span>
    </div>
  );
}
