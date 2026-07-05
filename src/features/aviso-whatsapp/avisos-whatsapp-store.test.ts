import { describe, it, expect, beforeEach } from "vitest";
import { criarAvisosWhatsAppStore } from "./avisos-whatsapp-store";
import type { Cliente, OrdemServico } from "@/shared/types";

const os: OrdemServico = {
  id: "os-x",
  numero: "OS-2026-0099",
  cliente_id: "cl-x",
  obra_nome: "Obra Teste",
  endereco: null,
  modelo_cobranca: "hora_maquina",
  status: "fechada",
  responsavel_id: null,
  observacao: null,
  diametro_broca_mm: null,
  aberta_em: "2026-07-01T00:00:00.000Z",
  fechada_em: "2026-07-02T00:00:00.000Z",
  pendente_sync: false,
  created_at: "2026-07-01T00:00:00.000Z",
  updated_at: "2026-07-02T00:00:00.000Z",
};

const clienteComTelefone: Cliente = {
  id: "cl-x",
  nome: "Cliente Teste",
  documento: null,
  telefone: "44999990000",
  ativo: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const clienteSemTelefone: Cliente = { ...clienteComTelefone, id: "cl-y", telefone: null };

describe("criarAvisosWhatsAppStore", () => {
  let store: ReturnType<typeof criarAvisosWhatsAppStore>;

  beforeEach(() => {
    store = criarAvisosWhatsAppStore([]);
  });

  it("listar começa vazio", () => {
    expect(store.listar()).toHaveLength(0);
  });

  it("dispararAviso com telefone válido cria aviso 'enviado' com mensagem preenchida", () => {
    const r = store.dispararAviso(os, clienteComTelefone, "evolution_api");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.aviso.status).toBe("enviado");
      expect(r.aviso.provedor).toBe("evolution_api");
      expect(r.aviso.mensagem_preview.length).toBeGreaterThan(0);
    }
  });

  it("dispararAviso sem telefone válido cria aviso 'falha_telefone_invalido' e retorna ok:false", () => {
    const r = store.dispararAviso(os, clienteSemTelefone, "meta_cloud_api");
    expect(r.ok).toBe(false);
    expect(store.listar()).toHaveLength(1);
    expect(store.listar()[0].status).toBe("falha_telefone_invalido");
    expect(store.listar()[0].mensagem_preview).toBe("");
  });

  it("dispararAviso duas vezes para a mesma OS bloqueia a segunda chamada (idempotência)", () => {
    store.dispararAviso(os, clienteComTelefone, "evolution_api");
    const r2 = store.dispararAviso(os, clienteComTelefone, "evolution_api");
    expect(r2.ok).toBe(false);
    expect(store.listar()).toHaveLength(1);
  });
});
