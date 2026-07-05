import { describe, it, expect } from "vitest";
import { avisosWhatsApp } from "./avisos-whatsapp";
import { ordensServico } from "./ordens-servico";
import { clientes } from "./clientes";

describe("mock avisosWhatsApp", () => {
  it("tem 2 registros", () => {
    expect(avisosWhatsApp).toHaveLength(2);
  });

  it("aviso-001 referencia os-007/cl-001, enviado via Evolution API", () => {
    const a = avisosWhatsApp.find((x) => x.id === "aviso-001");
    expect(a?.os_id).toBe("os-007");
    expect(a?.cliente_id).toBe("cl-001");
    expect(a?.provedor).toBe("evolution_api");
    expect(a?.status).toBe("enviado");
    expect(a?.mensagem_preview.length).toBeGreaterThan(0);
  });

  it("aviso-002 referencia os-011/cl-003 (cliente sem telefone), falha", () => {
    const a = avisosWhatsApp.find((x) => x.id === "aviso-002");
    expect(a?.os_id).toBe("os-011");
    expect(a?.cliente_id).toBe("cl-003");
    expect(a?.provedor).toBe("meta_cloud_api");
    expect(a?.status).toBe("falha_telefone_invalido");
    expect(a?.mensagem_preview).toBe("");
  });

  it("toda referência os_id/cliente_id existe nos mocks correspondentes", () => {
    const idsOS = new Set(ordensServico.map((o) => o.id));
    const idsClientes = new Set(clientes.map((c) => c.id));
    avisosWhatsApp.forEach((a) => {
      expect(idsOS.has(a.os_id)).toBe(true);
      expect(idsClientes.has(a.cliente_id)).toBe(true);
    });
  });

  it("aviso-002 está consistente com o cliente real não ter telefone cadastrado", () => {
    const cliente = clientes.find((c) => c.id === "cl-003");
    expect(cliente?.telefone).toBeNull();
  });
});
