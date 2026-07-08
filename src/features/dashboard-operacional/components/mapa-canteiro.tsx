import { lazy, Suspense, useEffect, useState } from "react";
import { EmptyState } from "@/shared/components/empty-state";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";

const MapaCanteiroLeaflet = lazy(() =>
  import("@/features/dashboard-operacional/components/mapa-canteiro-leaflet").then((m) => ({
    default: m.MapaCanteiroLeaflet,
  })),
);

const PLACEHOLDER = <div className="h-[360px] animate-pulse rounded-xl border bg-muted" />;

// Mapa real (Leaflet + OpenStreetMap) carregado só no cliente (import dinâmico +
// gate de montagem): Leaflet acessa `window`/`navigator` na importação e
// quebraria durante o SSR (TanStack Start renderiza `/admin` no servidor).
export function MapaCanteiro() {
  const equipamentos = equipamentosStore.useAll();
  const { isLoading, error, retry } = useMockResource(equipamentos);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  if (isLoading) {
    return PLACEHOLDER;
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex h-[360px] flex-col items-center justify-center gap-3 rounded-xl border bg-card text-center"
      >
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <button type="button" onClick={retry} className="text-sm font-semibold text-primary hover:underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  const ativos = equipamentos.filter((e) => e.ativo);

  if (ativos.length === 0) {
    return (
      <EmptyState
        icon="lucide:map"
        titulo="Sem equipamentos ativos"
        descricao="Nenhum equipamento ativo para mostrar no mapa do canteiro."
      />
    );
  }

  if (!montado) {
    return PLACEHOLDER;
  }

  return (
    <Suspense fallback={PLACEHOLDER}>
      <MapaCanteiroLeaflet equipamentosAtivos={ativos} />
    </Suspense>
  );
}
