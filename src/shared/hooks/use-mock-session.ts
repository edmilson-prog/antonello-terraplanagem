import { useEffect, useState } from "react";
import type { Perfil, SessaoMock } from "@/shared/types";

const STORAGE_KEY = "antonello.sessao";

export function lerSessao(): SessaoMock | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessaoMock;
  } catch {
    return null;
  }
}

export function gravarSessao(sessao: SessaoMock) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessao));
}

export function encerrarSessao() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function rotaPorPerfil(perfil: Perfil): "/app" | "/admin" {
  return perfil === "operador" ? "/app" : "/admin";
}

export function useMockSession() {
  const [sessao, setSessao] = useState<SessaoMock | null>(null);

  useEffect(() => {
    setSessao(lerSessao());
  }, []);

  return { sessao, setSessao };
}
