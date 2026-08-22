import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { PinEquipamento } from "@/features/dashboard-operacional/posicoes";
import type { EquipamentoStatus } from "@/shared/types";

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
  pins: PinEquipamento[];
  centro: { lat: number; lng: number };
}

// Pins e centro chegam prontos de `posicoesDaFrota` — este componente só
// desenha. Antes ele importava um arquivo de coordenadas fixas e fazia a
// junção aqui, que desde a migração para o Supabase não casava com nada.
export function MapaCanteiroLeaflet({ pins, centro }: MapaCanteiroLeafletProps) {
  return (
    <MapContainer
      center={[centro.lat, centro.lng]}
      // Obras diferentes ficam a quilômetros umas das outras; um zoom de
      // canteiro (16) só enquadraria uma delas.
      zoom={pins.length > 1 ? 11 : 15}
      scrollWheelZoom={false}
      className="h-[360px] w-full rounded-xl border"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((pin) => (
        <Marker
          key={pin.equipamento.id}
          position={[pin.lat, pin.lng]}
          icon={iconePin(pin.equipamento.status)}
        >
          <Popup>
            <strong>{pin.equipamento.nome}</strong>
            <br />
            {ROTULO_STATUS[pin.equipamento.status]}
            <br />
            {pin.osNumero} · {pin.obraNome}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
