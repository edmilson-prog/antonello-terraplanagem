import { useEffect, useState } from "react";

import type { ProvedorGateway } from "@/shared/types";

const STORAGE_KEY = "antonello.integracoes.gateway_ativo";
const PADRAO: ProvedorGateway = "mercado_pago";

function getInicial(): ProvedorGateway {
  if (typeof window === "undefined") return PADRAO;
  const salvo = window.localStorage.getItem(STORAGE_KEY) as ProvedorGateway | null;
  if (salvo === "mercado_pago" || salvo === "asaas") return salvo;
  return PADRAO;
}

export function useProvedorGatewayAtivo() {
  const [provedor, setProvedorState] = useState<ProvedorGateway>(PADRAO);

  useEffect(() => {
    setProvedorState(getInicial());
  }, []);

  const setProvedor = (novo: ProvedorGateway) => {
    setProvedorState(novo);
    window.localStorage.setItem(STORAGE_KEY, novo);
  };

  return { provedor, setProvedor };
}
