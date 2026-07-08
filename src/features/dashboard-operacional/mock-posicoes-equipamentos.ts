// Posição ILUSTRATIVA de cada equipamento no mapa do canteiro (PRD-019).
// Coordenadas fictícias (não é GPS real, RF-003) — usadas para plotar os pins
// num mapa real (Leaflet + OpenStreetMap), num ponto genérico sem vínculo com
// um endereço real da empresa.
export interface PosicaoEquipamento {
  equipamento_id: string;
  lat: number;
  lng: number;
}

export const posicoesEquipamentos: PosicaoEquipamento[] = [
  { equipamento_id: "eq-001", lat: -25.094, lng: -50.1675 },
  { equipamento_id: "eq-002", lat: -25.0935, lng: -50.166 },
  { equipamento_id: "eq-003", lat: -25.095, lng: -50.165 },
  { equipamento_id: "eq-004", lat: -25.0958, lng: -50.167 },
  { equipamento_id: "eq-005", lat: -25.093, lng: -50.1645 },
  { equipamento_id: "eq-006", lat: -25.0955, lng: -50.1685 },
  { equipamento_id: "eq-007", lat: -25.0965, lng: -50.1655 },
  { equipamento_id: "eq-008", lat: -25.0945, lng: -50.1635 },
];
