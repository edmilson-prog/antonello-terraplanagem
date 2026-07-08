import { describe, expect, it } from "vitest";
import { criarAnomaliaRevisoesStore } from "@/features/ia/anomalia-revisoes-store";

describe("anomaliaRevisoesStore", () => {
  it("starts with nothing confirmed", () => {
    const store = criarAnomaliaRevisoesStore();
    expect(store.estaConfirmada("ap-1")).toBe(false);
  });

  it("marks an apontamento as confirmed ok", () => {
    const store = criarAnomaliaRevisoesStore();
    store.confirmarOk("ap-1");
    expect(store.estaConfirmada("ap-1")).toBe(true);
    expect(store.estaConfirmada("ap-2")).toBe(false);
  });
});
