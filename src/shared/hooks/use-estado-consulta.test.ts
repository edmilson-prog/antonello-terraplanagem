import { describe, it, expect, vi } from "vitest";
import { combinarEstados } from "@/shared/hooks/use-estado-consulta";

const pronta = { estado: { isLoading: false, error: null }, retry: vi.fn() };
const carregando = { estado: { isLoading: true, error: null }, retry: vi.fn() };
const comErro = (msg: string) => ({
  estado: { isLoading: false, error: new Error(msg) },
  retry: vi.fn(),
});

describe("combinarEstados", () => {
  it("carrega enquanto QUALQUER fonte ainda carrega", () => {
    expect(combinarEstados(pronta, carregando, pronta).isLoading).toBe(true);
    expect(combinarEstados(pronta, pronta).isLoading).toBe(false);
  });

  it("devolve o primeiro erro, não uma pilha deles", () => {
    const r = combinarEstados(pronta, comErro("sessão expirada"), comErro("sem rede"));
    expect(r.error?.message).toBe("sessão expirada");
  });

  it("erro vence a ausência de erro, esteja em que posição estiver", () => {
    expect(combinarEstados(comErro("falhou"), pronta).error).not.toBeNull();
    expect(combinarEstados(pronta, comErro("falhou")).error).not.toBeNull();
  });

  it("sem nenhuma fonte, não há o que esperar nem o que reportar", () => {
    const r = combinarEstados();
    expect(r.isLoading).toBe(false);
    expect(r.error).toBeNull();
  });

  it("retry dispara TODAS as fontes, inclusive as que deram certo", () => {
    // Recarregar só quem falhou deixaria a tela cruzando dado novo com dado
    // velho — e obrigaria a rastrear qual fonte quebrou.
    const a = { estado: { isLoading: false, error: null }, retry: vi.fn() };
    const b = { estado: { isLoading: false, error: new Error("x") }, retry: vi.fn() };

    combinarEstados(a, b).retry();

    expect(a.retry).toHaveBeenCalledTimes(1);
    expect(b.retry).toHaveBeenCalledTimes(1);
  });

  it("retry não estoura quando uma das fontes rejeita", () => {
    const quebrada = {
      estado: { isLoading: false, error: null },
      retry: vi.fn(() => Promise.reject(new Error("offline"))),
    };
    const seguinte = { estado: { isLoading: false, error: null }, retry: vi.fn() };

    expect(() => combinarEstados(quebrada, seguinte).retry()).not.toThrow();
    expect(seguinte.retry).toHaveBeenCalledTimes(1);
  });
});
