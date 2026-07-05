import { useEffect, useState } from "react";

import type { ProvedorWhatsApp } from "@/shared/types";

const STORAGE_KEY = "antonello.integracoes.whatsapp_ativo";
const PADRAO: ProvedorWhatsApp = "evolution_api";
const VALIDOS: ProvedorWhatsApp[] = ["evolution_api", "evolution_go", "meta_cloud_api", "openwa"];

function getInicial(): ProvedorWhatsApp {
  if (typeof window === "undefined") return PADRAO;
  const salvo = window.localStorage.getItem(STORAGE_KEY) as ProvedorWhatsApp | null;
  if (salvo && VALIDOS.includes(salvo)) return salvo;
  return PADRAO;
}

export function useProvedorWhatsAppAtivo() {
  const [provedor, setProvedorState] = useState<ProvedorWhatsApp>(PADRAO);

  useEffect(() => {
    setProvedorState(getInicial());
  }, []);

  const setProvedor = (novo: ProvedorWhatsApp) => {
    setProvedorState(novo);
    window.localStorage.setItem(STORAGE_KEY, novo);
  };

  return { provedor, setProvedor };
}
