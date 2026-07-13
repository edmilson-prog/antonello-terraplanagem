import type { Orcamento } from "@/shared/types";

// Validade vencida: validade (YYYY-MM-DD) anterior à data de hoje. Comparação lexical de
// datas ISO date-only é segura. `agoraISO` injetado p/ pureza/determinismo nos testes.
export function validadeVencida(orc: Pick<Orcamento, "validade">, agoraISO: string): boolean {
  if (!orc.validade) return false;
  return orc.validade < agoraISO.slice(0, 10);
}

// Enviar: só de rascunho e com ao menos um item.
export function podeEnviar(orc: Pick<Orcamento, "status" | "itens">): {
  pode: boolean;
  motivo?: string;
} {
  if (orc.status !== "rascunho") return { pode: false, motivo: "Só rascunhos podem ser enviados." };
  if (orc.itens.length === 0)
    return { pode: false, motivo: "Orçamento vazio: adicione ao menos um item." };
  return { pode: true };
}

// Aprovar/recusar: só de enviado.
export function podeDecidir(orc: Pick<Orcamento, "status">): { pode: boolean; motivo?: string } {
  if (orc.status !== "enviado")
    return { pode: false, motivo: "Só orçamentos enviados podem ser decididos." };
  return { pode: true };
}
