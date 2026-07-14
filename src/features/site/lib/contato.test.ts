import { describe, it, expect } from "vitest";
import { contato } from "./contato";

describe("contato", () => {
  it("expõe os dados reais da empresa e wa.me links distintos por CTA", () => {
    expect(contato.cidadeUf).toBe("Frederico Westphalen — RS");
    expect(contato.telefoneExibicao).toBe("(55) 99924-2409");
    expect(contato.cnpj).toBe("36.508.280/0001-90");

    expect(contato.whatsappOrcamento).toMatch(/^https:\/\/wa\.me\/5555999242409\?text=/);
    expect(contato.whatsappContato).toMatch(/^https:\/\/wa\.me\/5555999242409\?text=/);
    expect(contato.whatsappOrcamento).not.toBe(contato.whatsappContato);
  });
});
