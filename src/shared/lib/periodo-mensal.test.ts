import { describe, it, expect } from "vitest";
import {
  mesReferencia,
  mesAnterior,
  proximoMes,
  rotuloMes,
} from "@/shared/lib/periodo-mensal";

describe("shared/lib/periodo-mensal", () => {
  describe("mesReferencia", () => {
    it("formata ano-mês com 2 dígitos", () => {
      expect(mesReferencia(new Date(2026, 6, 2))).toBe("2026-07");
    });

    it("preenche o zero à esquerda em meses de um dígito", () => {
      expect(mesReferencia(new Date(2026, 0, 15))).toBe("2026-01");
    });
  });

  describe("mesAnterior", () => {
    it("retrocede um mês dentro do mesmo ano", () => {
      expect(mesAnterior("2026-07")).toBe("2026-06");
    });

    it("retrocede de janeiro para dezembro do ano anterior", () => {
      expect(mesAnterior("2026-01")).toBe("2025-12");
    });
  });

  describe("proximoMes", () => {
    it("avança um mês dentro do mesmo ano", () => {
      expect(proximoMes("2026-06")).toBe("2026-07");
    });

    it("avança de dezembro para janeiro do ano seguinte", () => {
      expect(proximoMes("2025-12")).toBe("2026-01");
    });
  });

  describe("rotuloMes", () => {
    it("formata o rótulo por extenso", () => {
      expect(rotuloMes("2026-06")).toBe("Junho 2026");
    });
  });
});
