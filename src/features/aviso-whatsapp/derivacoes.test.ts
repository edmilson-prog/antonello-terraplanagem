import { describe, it, expect } from "vitest";
import { avisoDaOS, montarMensagemAviso, telefoneParaChatId } from "./derivacoes";
import type { AvisoWhatsApp, Cliente, OrdemServico } from "@/shared/types";

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
  tipo_servico: null,
  equipamento_previsto_id: null,
  inicio_previsto: null,
  aberta_em: "2026-07-01T00:00:00.000Z",
  fechada_em: "2026-07-02T00:00:00.000Z",
  pendente_sync: false,
  created_at: "2026-07-01T00:00:00.000Z",
  updated_at: "2026-07-02T00:00:00.000Z",
  local_lat: null,
  local_lng: null,
};

const cliente: Cliente = {
  id: "cl-x",
  nome: "Cliente Teste",
  documento: null,
  telefone: "44999990000",
  ativo: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  nome_fantasia: null,
  segmento: null,
  email: null,
  endereco: null,
  cidade: null,
  contato_nome: null,
  contato_papel: null,
};

describe("montarMensagemAviso", () => {
  it("inclui nome do cliente, obra e número da OS, sem valores monetários", () => {
    const msg = montarMensagemAviso(os, cliente);
    expect(msg).toContain("Cliente Teste");
    expect(msg).toContain("Obra Teste");
    expect(msg).toContain("OS-2026-0099");
    expect(msg).not.toMatch(/R\$/);
  });
});

describe("avisoDaOS", () => {
  const avisos: AvisoWhatsApp[] = [
    {
      id: "a1",
      os_id: "os-x",
      cliente_id: "cl-x",
      provedor: "evolution_api",
      status: "enviado",
      mensagem_preview: "oi",
      enviado_em: "2026-07-02T00:00:00.000Z",
      created_at: "2026-07-02T00:00:00.000Z",
    },
  ];

  it("retorna o aviso da OS quando existe", () => {
    expect(avisoDaOS("os-x", avisos)?.id).toBe("a1");
  });

  it("retorna null quando a OS não tem aviso", () => {
    expect(avisoDaOS("os-inexistente", avisos)).toBeNull();
  });
});

describe("telefoneParaChatId", () => {
  it("remove formatação e prefixa o DDI 55", () => {
    expect(telefoneParaChatId("(44) 99111-0000")).toBe("5544991110000@c.us");
  });

  it("funciona com telefone já só de dígitos", () => {
    expect(telefoneParaChatId("44999990000")).toBe("5544999990000@c.us");
  });
});
