import { useSyncExternalStore } from "react";
import { avisosWhatsApp as seed } from "@/mocks/avisos-whatsapp";
import { montarMensagemAviso } from "@/features/aviso-whatsapp/derivacoes";
import type { AvisoWhatsApp, Cliente, OrdemServico, ProvedorWhatsApp } from "@/shared/types";

export type ResultadoDispararAviso =
  | { ok: true; aviso: AvisoWhatsApp }
  | { ok: false; motivo: string; aviso?: AvisoWhatsApp };

export function criarAvisosWhatsAppStore(inicial: AvisoWhatsApp[]) {
  let itens: AvisoWhatsApp[] = inicial.map((a) => ({ ...a }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;
  const obter = (id: string): AvisoWhatsApp | null => itens.find((a) => a.id === id) ?? null;

  function dispararAviso(
    os: OrdemServico,
    cliente: Cliente,
    provedor: ProvedorWhatsApp,
  ): ResultadoDispararAviso {
    const jaExiste = itens.find((a) => a.os_id === os.id);
    if (jaExiste) return { ok: false, motivo: "Aviso já disparado para esta OS." };

    const agora = new Date().toISOString();

    if (!cliente.telefone) {
      const falha: AvisoWhatsApp = {
        id: crypto.randomUUID(),
        os_id: os.id,
        cliente_id: cliente.id,
        provedor,
        status: "falha_telefone_invalido",
        mensagem_preview: "",
        enviado_em: agora,
        created_at: agora,
      };
      itens = [falha, ...itens];
      notificar();
      return {
        ok: false,
        motivo: "Cliente sem telefone válido — aviso não enviado.",
        aviso: falha,
      };
    }

    const novo: AvisoWhatsApp = {
      id: crypto.randomUUID(),
      os_id: os.id,
      cliente_id: cliente.id,
      provedor,
      status: "enviado",
      mensagem_preview: montarMensagemAviso(os, cliente),
      enviado_em: agora,
      created_at: agora,
    };
    itens = [novo, ...itens];
    notificar();
    return { ok: true, aviso: novo };
  }

  const useTodas = () => useSyncExternalStore(inscrever, listar, listar);

  return { listar, obter, dispararAviso, useTodas };
}

export const avisosWhatsAppStore = criarAvisosWhatsAppStore(seed);
