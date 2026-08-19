import { describe, it, expect } from "vitest";
import { paradasSemOrdem, registrosDaOS, solicitacoesPendentes } from "./retaguarda-derivacoes";
import type { RegistroCampoRecebido } from "./tipos";
import type { RegistroManutencao } from "@/shared/types";

/*
 * O recorte que o escritório enxerga do que veio do campo.
 *
 * A regra que estes testes protegem: "pendente" é DERIVADO da ausência de
 * ordem apontando para o chamado. Não existe status a ser atualizado à mão, e
 * portanto não existe o jeito clássico de essa lista mentir — alguém esquecer
 * de marcar como resolvido.
 */

function solicitacao(
  id: string,
  urgencia: "maquina_parada" | "pode_aguardar",
  registradoEm: string,
): RegistroCampoRecebido {
  return {
    id,
    op_id: `op-${id}`,
    tipo: "solicitacao_manutencao",
    dados: {
      problema: "hidraulico",
      urgencia,
      observacao: null,
      horimetro: 1000,
      com_foto: false,
    },
    operador_id: "operador-1",
    os_id: null,
    equipamento_id: "equip-1",
    assinatura: null,
    registrado_em: registradoEm,
    created_at: registradoEm,
  };
}

function ordem(origemId: string | null): RegistroManutencao {
  return {
    id: `ordem-${origemId ?? "propria"}`,
    equipamento_id: "equip-1",
    plano_id: null,
    tipo: "corretiva",
    descricao: "Vazamento",
    prioridade: "alta",
    horimetro_previsto: null,
    horimetro_realizado: null,
    horimetro_abertura: 1000,
    status: "em_andamento",
    aberta_em: "2026-08-10T10:00:00Z",
    realizada_em: null,
    created_at: "2026-08-10T10:00:00Z",
    updated_at: "2026-08-10T10:00:00Z",
    custo: null,
    fornecedor: null,
    observacao: null,
    origem_registro_campo_id: origemId,
  };
}

describe("solicitacoesPendentes", () => {
  it("lista o chamado que ainda não virou ordem", () => {
    const pendentes = solicitacoesPendentes([solicitacao("s1", "pode_aguardar", "2026-08-10")], []);
    expect(pendentes.map((s) => s.id)).toEqual(["s1"]);
  });

  it("some da lista quando uma ordem aponta para ele", () => {
    const pendentes = solicitacoesPendentes(
      [solicitacao("s1", "pode_aguardar", "2026-08-10")],
      [ordem("s1")],
    );
    expect(pendentes).toHaveLength(0);
  });

  it("uma ordem aberta no escritório não atende chamado nenhum", () => {
    // origem null: a ordem nasceu na retaguarda e não resolve o pedido do
    // operador. Se contasse, o chamado sumiria da lista sem ter sido visto.
    const pendentes = solicitacoesPendentes(
      [solicitacao("s1", "pode_aguardar", "2026-08-10")],
      [ordem(null)],
    );
    expect(pendentes).toHaveLength(1);
  });

  it("ignora registros de campo que não são solicitação", () => {
    const checklist: RegistroCampoRecebido = {
      id: "c1",
      op_id: "op-c1",
      tipo: "checklist",
      dados: { itens: [], nao_conformes: 0, horimetro: null },
      operador_id: "operador-1",
      os_id: null,
      equipamento_id: "equip-1",
      assinatura: null,
      registrado_em: "2026-08-10",
      created_at: "2026-08-10",
    };
    expect(solicitacoesPendentes([checklist], [])).toHaveLength(0);
  });

  it("máquina parada vem antes de quem pode aguardar", () => {
    const pendentes = solicitacoesPendentes(
      [
        solicitacao("aguarda", "pode_aguardar", "2026-08-01"),
        solicitacao("parada", "maquina_parada", "2026-08-15"),
      ],
      [],
    );
    // Mesmo sendo mais recente, a máquina parada sobe: é a que está custando
    // hora ociosa agora.
    expect(pendentes.map((s) => s.id)).toEqual(["parada", "aguarda"]);
  });

  it("na mesma urgência, quem espera há mais tempo vem primeiro", () => {
    const pendentes = solicitacoesPendentes(
      [
        solicitacao("nova", "maquina_parada", "2026-08-15"),
        solicitacao("antiga", "maquina_parada", "2026-08-02"),
      ],
      [],
    );
    expect(pendentes.map((s) => s.id)).toEqual(["antiga", "nova"]);
  });
});

describe("paradasSemOrdem", () => {
  it("conta só as de máquina parada", () => {
    const pendentes = solicitacoesPendentes(
      [
        solicitacao("a", "maquina_parada", "2026-08-01"),
        solicitacao("b", "pode_aguardar", "2026-08-02"),
        solicitacao("c", "maquina_parada", "2026-08-03"),
      ],
      [],
    );
    expect(paradasSemOrdem(pendentes)).toBe(2);
  });
});

describe("registrosDaOS", () => {
  it("filtra pela ordem e devolve do mais recente ao mais antigo", () => {
    const base = solicitacao("s1", "pode_aguardar", "2026-08-01");
    const registros: RegistroCampoRecebido[] = [
      { ...base, id: "antigo", os_id: "os-1", registrado_em: "2026-08-01" },
      { ...base, id: "recente", os_id: "os-1", registrado_em: "2026-08-10" },
      { ...base, id: "outra-os", os_id: "os-2", registrado_em: "2026-08-20" },
    ];

    expect(registrosDaOS(registros, "os-1").map((r) => r.id)).toEqual(["recente", "antigo"]);
  });
});
