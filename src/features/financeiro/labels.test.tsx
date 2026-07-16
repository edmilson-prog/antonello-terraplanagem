import { describe, it, expect } from "vitest";
import { FORMA_RECEBIMENTO_ICONE, CATEGORIA_ICONE } from "@/features/financeiro/labels";

describe("FORMA_RECEBIMENTO_ICONE", () => {
  it("cobre todas as formas de recebimento", () => {
    expect(FORMA_RECEBIMENTO_ICONE.pix).toBe("lucide:credit-card");
    expect(FORMA_RECEBIMENTO_ICONE.transferencia).toBe("lucide:landmark");
    expect(FORMA_RECEBIMENTO_ICONE.boleto).toBe("lucide:link");
    expect(FORMA_RECEBIMENTO_ICONE.dinheiro).toBe("lucide:banknote");
    expect(FORMA_RECEBIMENTO_ICONE.cheque).toBe("lucide:file-text");
    expect(FORMA_RECEBIMENTO_ICONE.outro).toBe("lucide:circle");
  });
});

describe("CATEGORIA_ICONE", () => {
  it("cobre todas as categorias de despesa", () => {
    expect(CATEGORIA_ICONE.diesel).toBe("lucide:fuel");
    expect(CATEGORIA_ICONE.manutencao).toBe("lucide:wrench");
    expect(CATEGORIA_ICONE.folha).toBe("lucide:hard-hat");
    expect(CATEGORIA_ICONE.fornecedor).toBe("lucide:truck");
    expect(CATEGORIA_ICONE.outro).toBe("lucide:circle");
  });
});
