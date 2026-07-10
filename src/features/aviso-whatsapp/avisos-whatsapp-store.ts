import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { montarMensagemAviso, telefoneParaChatId } from "@/features/aviso-whatsapp/derivacoes";
import type { AvisoWhatsApp, Cliente, OrdemServico } from "@/shared/types";

// Store reativo respaldado pelo Supabase (mesmo padrão de ordensStore/orcamentosStore) —
// cache em memória + useSyncExternalStore, recarregado do banco após cada mutação.
// dispararAviso chama a edge function waha-enviar-texto (segura o segredo do lado do
// servidor) — nunca fala com o WAHA diretamente daqui.

export type ResultadoDispararAviso =
  | { ok: true; aviso: AvisoWhatsApp }
  | { ok: false; motivo: string; aviso?: AvisoWhatsApp };

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: AvisoWhatsApp[] = [];
let estado: Estado = { isLoading: true, error: null };
const ouvintes = new Set<() => void>();

const notificar = () => ouvintes.forEach((fn) => fn());
const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
};

async function carregar() {
  estado = { isLoading: true, error: null };
  notificar();

  const { data, error } = await supabase
    .from("avisos_whatsapp")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<AvisoWhatsApp[]>();

  if (error) {
    estado = { isLoading: false, error: new Error(error.message) };
  } else {
    itens = data ?? [];
    estado = { isLoading: false, error: null };
  }
  notificar();
}

carregar();

const listar = () => itens;
const obter = (id: string): AvisoWhatsApp | null => itens.find((a) => a.id === id) ?? null;
const useTodas = () => useSyncExternalStore(inscrever, listar, listar);
const useEstado = () =>
  useSyncExternalStore(
    inscrever,
    () => estado,
    () => estado,
  );

async function inserirAviso(
  campos: Omit<AvisoWhatsApp, "id" | "created_at">,
): Promise<AvisoWhatsApp> {
  const { data, error } = await supabase
    .from("avisos_whatsapp")
    .insert(campos)
    .select()
    .single()
    .returns<AvisoWhatsApp>();
  if (error) throw new Error(error.message);
  await carregar();
  return data;
}

async function dispararAviso(os: OrdemServico, cliente: Cliente): Promise<ResultadoDispararAviso> {
  const jaExiste = itens.find((a) => a.os_id === os.id);
  if (jaExiste) return { ok: false, motivo: "Aviso já disparado para esta OS." };

  const agora = new Date().toISOString();

  if (!cliente.telefone) {
    const falha = await inserirAviso({
      os_id: os.id,
      cliente_id: cliente.id,
      provedor: "waha",
      status: "falha_telefone_invalido",
      mensagem_preview: "",
      enviado_em: agora,
    });
    return {
      ok: false,
      motivo: "Cliente sem telefone válido — aviso não enviado.",
      aviso: falha,
    };
  }

  const mensagem = montarMensagemAviso(os, cliente);
  const chatId = telefoneParaChatId(cliente.telefone);

  const { data: resultadoEnvio, error: erroInvoke } = await supabase.functions.invoke<{
    ok: boolean;
    motivo?: string;
  }>("waha-enviar-texto", { body: { chatId, text: mensagem } });

  if (erroInvoke || !resultadoEnvio?.ok) {
    const status =
      resultadoEnvio?.motivo === "sessao_desconectada"
        ? "falha_sessao_desconectada"
        : "falha_envio";
    const falha = await inserirAviso({
      os_id: os.id,
      cliente_id: cliente.id,
      provedor: "waha",
      status,
      mensagem_preview: "",
      enviado_em: agora,
    });
    return {
      ok: false,
      motivo:
        status === "falha_sessao_desconectada"
          ? "Sessão do WhatsApp desconectada — reconecte em Integrações."
          : "Falha ao enviar a mensagem via WhatsApp.",
      aviso: falha,
    };
  }

  const enviado = await inserirAviso({
    os_id: os.id,
    cliente_id: cliente.id,
    provedor: "waha",
    status: "enviado",
    mensagem_preview: mensagem,
    enviado_em: agora,
  });
  return { ok: true, aviso: enviado };
}

export const avisosWhatsAppStore = {
  listar,
  obter,
  dispararAviso,
  useTodas,
  useEstado,
  retry: carregar,
};
