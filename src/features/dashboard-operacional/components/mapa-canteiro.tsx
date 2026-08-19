import { lazy, Suspense, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { EmptyState } from "@/shared/components/empty-state";
import { combinarEstados } from "@/shared/hooks/use-estado-consulta";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
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
  const { isLoading, error, retry } = combinarEstados(
    { estado: equipamentosStore.useEstado(), retry: equipamentosStore.retry },
    { estado: apontamentosStore.useEstado(), retry: apontamentosStore.retry },
  );
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  const ativos = equipamentos.filter((e) => e.ativo);
  const operadoresEmCampo = new Set(
    apontamentos.filter((a) => a.status === "em_andamento").map((a) => a.operador_id),
  ).size;

  return (
    <CardSecao
      titulo="Operacional em tempo real"
      icone="lucide:map-pin"
      acessorio={
        <CardPill>
          {ativos.length} equipamento{ativos.length === 1 ? "" : "s"} em campo
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
      ) : ativos.length === 0 ? (
        <EmptyState
          icon="lucide:map"
          titulo="Sem equipamentos ativos"
          descricao="Nenhum equipamento ativo para mostrar no mapa do canteiro."
          className="border-0"
        />
      ) : (
        <div className="relative h-[360px]">
          {montado ? (
            <Suspense fallback={PLACEHOLDER}>
              <MapaCanteiroLeaflet equipamentosAtivos={ativos} />
            </Suspense>
          ) : (
            PLACEHOLDER
          )}

          {/* As coordenadas são ilustrativas (PRD-019 RF-003) — o selo diz isso
              em vez do "Ao vivo" do mock, que prometeria GPS que não existe. */}
          <span className="pointer-events-none absolute left-14 top-3 z-[500] inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-card/90 px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Posições ilustrativas
          </span>

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
