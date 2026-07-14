import { describe, it, expect, beforeEach } from "vitest";
import { STORAGE_KEY_LEMBRAR, backingStorage, storageAdaptavel } from "./supabase-storage";

describe("storageAdaptavel", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("usa localStorage quando não há preferência gravada", () => {
    expect(backingStorage()).toBe(localStorage);
    storageAdaptavel.setItem("chave", "valor");
    expect(localStorage.getItem("chave")).toBe("valor");
    expect(sessionStorage.getItem("chave")).toBeNull();
  });

  it("usa localStorage quando a preferência é lembrar (true)", () => {
    localStorage.setItem(STORAGE_KEY_LEMBRAR, "true");
    expect(backingStorage()).toBe(localStorage);
  });

  it("usa sessionStorage quando a preferência é não lembrar (false)", () => {
    localStorage.setItem(STORAGE_KEY_LEMBRAR, "false");
    expect(backingStorage()).toBe(sessionStorage);
    storageAdaptavel.setItem("chave", "valor");
    expect(sessionStorage.getItem("chave")).toBe("valor");
    expect(localStorage.getItem("chave")).toBeNull();
  });

  it("removeItem limpa dos dois storages", () => {
    localStorage.setItem("chave", "valor-local");
    sessionStorage.setItem("chave", "valor-session");
    storageAdaptavel.removeItem("chave");
    expect(localStorage.getItem("chave")).toBeNull();
    expect(sessionStorage.getItem("chave")).toBeNull();
  });
});
