import { useSyncExternalStore } from "react";
import { faturamentos as seed } from "@/mocks/faturamentos";
import { calcularValorTotal, gerarItens } from "@/features/faturamento/calculo";
import { proximoNumeroFAT } from "@/features/faturamento/numero-faturamento";
import type {
  Apontamento,
  Equipamento,
  Faturamento,
  PrecoFundacao,
  PrecoHoraMaquina,
} from "@/shared/types";

export type ResultadoConfirmar =
  | { ok: true; faturamento: Faturamento }
  | { ok: false; motivo: string };

export type PatchFaturamento = Partial<Pick<Faturamento, "itens" | "desconto" | "observacao">>;

export function criarFaturamentosStore(inicial: Faturamento[]) {
  let itens: Faturamento[] = inicial.map((f) => ({ ...f }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;
  const obter = (id: string) => itens.find((f) => f.id === id);

  function gerarDeOS(
    os: {
      id: string;
      cliente_id: string;
      modelo_cobranca: Faturamento["modelo_cobranca"];
      diametro_broca_mm: number | null;
    },
    apontamentos: Apontamento[],
    equipamentos: Equipamento[],
    precosHM: PrecoHoraMaquina[],
    precosFund: PrecoFundacao[],
  ): Faturamento {
    const agora = new Date().toISOString();
    const ano = new Date(agora).getFullYear();
    const osCompleta = {
      id: os.id,
      cliente_id: os.cliente_id,
      modelo_cobranca: os.modelo_cobranca,
      diametro_broca_mm: os.diametro_broca_mm,
    };
    const itensFat = gerarItens(
      osCompleta as Parameters<typeof gerarItens>[0],
      apontamentos,
      equipamentos,
      precosHM,
      precosFund,
    );
    const nova: Faturamento = {
      id: crypto.randomUUID(),
      numero: proximoNumeroFAT(itens, ano),
      os_id: os.id,
      cliente_id: os.cliente_id,
      modelo_cobranca: os.modelo_cobranca,
      itens: itensFat,
      desconto: 0,
      valor_total: calcularValorTotal(itensFat, 0),
      observacao: null,
      status: "rascunho",
      gerado_em: agora,
      faturado_em: null,
      created_at: agora,
      updated_at: agora,
    };
    itens = [nova, ...itens];
    notificar();
    return nova;
  }

  function atualizar(id: string, patch: PatchFaturamento) {
    itens = itens.map((f) => {
      if (f.id !== id) return f;
      const next: Faturamento = { ...f, ...patch, updated_at: new Date().toISOString() };
      next.valor_total = calcularValorTotal(next.itens, next.desconto);
      return next;
    });
    notificar();
  }

  function confirmar(id: string): ResultadoConfirmar {
    const atual = obter(id);
    if (!atual) return { ok: false, motivo: "Faturamento não encontrado." };
    if (atual.status === "faturado")
      return { ok: false, motivo: "Este faturamento já foi confirmado." };
    const agora = new Date().toISOString();
    const confirmado: Faturamento = {
      ...atual,
      status: "faturado",
      faturado_em: agora,
      updated_at: agora,
    };
    itens = itens.map((f) => (f.id === id ? confirmado : f));
    notificar();
    return { ok: true, faturamento: confirmado };
  }

  const useTodos = () => useSyncExternalStore(inscrever, listar, listar);
  const useFaturamento = (id: string) =>
    useSyncExternalStore(
      inscrever,
      () => itens.find((f) => f.id === id),
      () => itens.find((f) => f.id === id),
    );

  return { listar, obter, gerarDeOS, atualizar, confirmar, useTodos, useFaturamento };
}

export const faturamentosStore = criarFaturamentosStore(seed);
