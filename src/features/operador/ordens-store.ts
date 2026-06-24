import { useSyncExternalStore } from "react";
import { ordensOperador as ordensIniciais } from "@/mocks/ordens-operador";
import type { OrdemServicoOperador, OrdemStatus } from "@/shared/types";

// Store mock em memória. Em produção isso vira mutation no backend + invalidate
// das queries; aqui usamos useSyncExternalStore para refletir mudanças nas duas
// telas (lista e detalhe) sem precisar de Zustand/Redux.

let ordens: OrdemServicoOperador[] = ordensIniciais.map((o) => ({ ...o }));
const ouvintes = new Set<() => void>();

function notificar() {
  ouvintes.forEach((fn) => fn());
}

function inscrever(fn: () => void) {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
}

export function listarOrdens(): OrdemServicoOperador[] {
  return ordens;
}

export function obterOrdem(id: string): OrdemServicoOperador | undefined {
  return ordens.find((o) => o.id === id);
}

export function useOrdens(): OrdemServicoOperador[] {
  return useSyncExternalStore(inscrever, listarOrdens, listarOrdens);
}

export function useOrdem(id: string): OrdemServicoOperador | undefined {
  return useSyncExternalStore(
    inscrever,
    () => ordens.find((o) => o.id === id),
    () => ordens.find((o) => o.id === id),
  );
}

function atualizar(id: string, patch: Partial<OrdemServicoOperador>) {
  ordens = ordens.map((o) => (o.id === id ? { ...o, ...patch } : o));
  notificar();
}

export function iniciarTurno(id: string) {
  const o = obterOrdem(id);
  if (!o || o.status !== "aberta") return;
  atualizar(id, {
    status: "em_andamento",
    data_abertura: new Date().toISOString(),
    horimetro_inicio: o.horimetro_inicio ?? 0,
  });
}

export function finalizarOrdem(id: string, horimetroFim?: number) {
  const o = obterOrdem(id);
  if (!o || o.status !== "em_andamento") return;
  const fim =
    horimetroFim ??
    (o.horimetro_inicio != null ? o.horimetro_inicio + 8 : null);
  atualizar(id, {
    status: "concluida",
    data_fechamento: new Date().toISOString(),
    horimetro_fim: fim,
  });
}

export function proximoStatus(s: OrdemStatus): OrdemStatus | null {
  if (s === "aberta") return "em_andamento";
  if (s === "em_andamento") return "concluida";
  return null;
}
