import { useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { posicoesEquipamentos } from "@/features/dashboard-operacional/mock-posicoes-equipamentos";
import type { Equipamento, EquipamentoStatus } from "@/shared/types";

const COR_STATUS: Record<EquipamentoStatus, string> = {
  em_uso: "#FFB300",
  disponivel: "#9AA1A8",
  manutencao: "#B0341B",
};

const ROTULO_STATUS: Record<EquipamentoStatus, string> = {
  em_uso: "Em uso",
  disponivel: "Disponível",
  manutencao: "Manutenção",
};

// divIcon (HTML inline) em vez de L.icon — evita o problema clássico do bundler
// não resolver os PNGs padrão do Leaflet (marker-icon.png ausente no build).
function iconePin(status: EquipamentoStatus): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:${COR_STATUS[status]};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);font-size:14px;">🚜</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

interface MapaCanteiroLeafletProps {
  equipamentosAtivos: Equipamento[];
}

// Posições fictícias (RF-003) plotadas num mapa real (Leaflet + OpenStreetMap),
// num ponto genérico sem vínculo com um endereço real da empresa.
export function MapaCanteiroLeaflet({ equipamentosAtivos }: MapaCanteiroLeafletProps) {
  const pins = useMemo(
    () =>
      posicoesEquipamentos
        .map((pos) => ({ pos, equipamento: equipamentosAtivos.find((e) => e.id === pos.equipamento_id) }))
        .filter(
          (p): p is { pos: typeof p.pos; equipamento: NonNullable<typeof p.equipamento> } =>
            p.equipamento !== undefined,
        ),
    [equipamentosAtivos],
  );

  const primeiraPosicao = pins[0]?.pos ?? posicoesEquipamentos[0];
  const centro: [number, number] = [primeiraPosicao.lat, primeiraPosicao.lng];

  return (
    <MapContainer
      center={centro}
      zoom={16}
      scrollWheelZoom={false}
      className="h-[360px] w-full rounded-xl border"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map(({ pos, equipamento }) => (
        <Marker key={equipamento.id} position={[pos.lat, pos.lng]} icon={iconePin(equipamento.status)}>
          <Popup>
            <strong>{equipamento.nome}</strong>
            <br />
            {ROTULO_STATUS[equipamento.status]}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
