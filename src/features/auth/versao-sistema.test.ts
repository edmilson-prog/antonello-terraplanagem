import { describe, it, expect } from "vitest";
import { VERSAO_SISTEMA, CODINOME_SISTEMA } from "./versao-sistema";

describe("versao-sistema", () => {
  it("expõe a versão e o codinome atuais do sistema", () => {
    expect(VERSAO_SISTEMA).toBe("0.24.0");
    expect(CODINOME_SISTEMA).toBe("Watchtower");
  });
});
