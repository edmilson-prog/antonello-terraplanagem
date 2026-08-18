import { describe, it, expect } from "vitest";
import {
  canaisDaNotificacao,
  falhasPorCanal,
  filtrarNotificacoes,
  maisDisparadas,
  resumoDisparos,
  resumoPush,
} from "./retaguarda-derivacoes";
import type { Notificacao, NotificacaoEntrega } from "@/shared/types";

const AGORA = new Date(2026, 7, 18, 14, 0, 0);
const iso = (dia: number, hora = 9) => new Date(2026, 7, dia, hora, 0, 0).toISOString();

function entrega(over: Partial<NotificacaoEntrega> = {}): NotificacaoEntrega {
  return {
    id: "e-1",
    notificacao_id: "n-1",
    canal: "push",
    status: "entregue",
    motivo: null,
    destino: "https://fcm/abc",
    entregue_em: iso(18),
    aberta_em: null,
    created_at: iso(18),
    updated_at: iso(18),
    ...over,
  };
}

function notificacao(over: Partial<Notificacao> = {}): Notificacao {
  return {
    id: "n-1",
    operador_id: null,
    usuario_id: "u-1",
    tipo: "titulo_vencido",
    categoria: "financeiro",
    prioridade: "normal",
    titulo: "Título vencido",
    mensagem: "Cliente X",
    acao: null,
    canais: null,
    os_id: null,
    origem_id: null,
    lida_em: null,
    agendada_para: null,
    enviada_em: iso(18),
    created_at: iso(18),
    updated_at: iso(18),
    ...over,
  };
}

describe("resumoPush", () => {
  it("não conta suprimido no denominador — silêncio não é tentativa de entrega", () => {
    const r = resumoPush(
      [
        entrega({ id: "1", status: "entregue" }),
        entrega({ id: "2", status: "suprimido", motivo: "horário silencioso" }),
      ],
      AGORA,
    );
    expect(r.enviados).toBe(1);
    expect(r.taxaEntrega).toBe(1);
  });

  it("separa falha de suprimido", () => {
    const r = resumoPush(
      [
        entrega({ id: "1", status: "entregue" }),
        entrega({ id: "2", status: "falhou", motivo: "token expirado" }),
        entrega({ id: "3", status: "suprimido" }),
      ],
      AGORA,
    );
    expect(r.falhas).toBe(1);
    expect(r.enviados).toBe(2);
    expect(r.taxaEntrega).toBeCloseTo(0.5);
  });

  it("calcula abertura e tempo médio só sobre o que foi aberto", () => {
    const r = resumoPush(
      [
        entrega({
          id: "1",
          entregue_em: iso(18, 9),
          aberta_em: new Date(2026, 7, 18, 9, 6, 0).toISOString(),
        }),
        entrega({ id: "2", aberta_em: null }),
      ],
      AGORA,
    );
    expect(r.abertos).toBe(1);
    expect(r.taxaAbertura).toBeCloseTo(0.5);
    expect(r.minutosAteAbrir).toBe(6);
  });

  it("não inventa taxa quando não houve envio", () => {
    const r = resumoPush([], AGORA);
    expect(r.taxaEntrega).toBeNull();
    expect(r.taxaAbertura).toBeNull();
    expect(r.minutosAteAbrir).toBeNull();
  });

  it("conta aparelhos distintos, não envios", () => {
    const r = resumoPush(
      [
        entrega({ id: "1", destino: "https://fcm/a" }),
        entrega({ id: "2", destino: "https://fcm/a" }),
        entrega({ id: "3", destino: "https://fcm/b" }),
      ],
      AGORA,
    );
    expect(r.aparelhos).toBe(2);
  });

  it("a série tem 7 pontos terminando hoje", () => {
    const r = resumoPush(
      [entrega({ created_at: iso(18) }), entrega({ id: "2", created_at: iso(16) })],
      AGORA,
    );
    expect(r.serie).toHaveLength(7);
    expect(r.serie[6]).toBe(1); // hoje
    expect(r.serie[4]).toBe(1); // dois dias atrás
  });
});

describe("resumoDisparos", () => {
  it("conta o dia de hoje e ignora suprimido nos canais", () => {
    const r = resumoDisparos(
      [
        { tipo: "titulo_vencido", categoria: "financeiro", created_at: iso(18) },
        { tipo: "os_atribuida", categoria: "operacao", created_at: iso(17) },
      ],
      [
        entrega({ id: "1", canal: "app", status: "entregue", created_at: iso(18) }),
        entrega({ id: "2", canal: "push", status: "suprimido", created_at: iso(18) }),
      ],
      AGORA,
    );
    expect(r.hoje).toBe(1);
    expect(r.porCanalHoje.app).toBe(1);
    expect(r.porCanalHoje.push).toBe(0);
  });
});

describe("canaisDaNotificacao", () => {
  it("mantém o pior status quando o mesmo canal tem várias entregas", () => {
    const canais = canaisDaNotificacao("n-1", [
      entrega({ id: "1", canal: "push", status: "entregue", destino: "a" }),
      entrega({ id: "2", canal: "push", status: "falhou", destino: "b", motivo: "token expirado" }),
      entrega({ id: "3", canal: "app", status: "entregue" }),
      entrega({ id: "4", notificacao_id: "outra", canal: "email", status: "falhou" }),
    ]);
    expect(canais).toHaveLength(2);
    expect(canais.find((c) => c.canal === "push")).toMatchObject({
      status: "falhou",
      motivo: "token expirado",
    });
  });
});

describe("falhasPorCanal e maisDisparadas", () => {
  it("ordena falhas do canal que mais falhou para o que menos falhou", () => {
    const r = falhasPorCanal([
      entrega({ id: "1", canal: "email", status: "falhou" }),
      entrega({ id: "2", canal: "email", status: "falhou" }),
      entrega({ id: "3", canal: "push", status: "falhou" }),
      entrega({ id: "4", canal: "push", status: "entregue" }),
    ]);
    expect(r).toEqual([
      { canal: "email", total: 2 },
      { canal: "push", total: 1 },
    ]);
  });

  it("lista os tipos mais disparados, respeitando o limite", () => {
    const r = maisDisparadas(
      [
        { tipo: "os_atribuida", categoria: "operacao", created_at: iso(18) },
        { tipo: "os_atribuida", categoria: "operacao", created_at: iso(17) },
        { tipo: "titulo_vencido", categoria: "financeiro", created_at: iso(16) },
      ],
      1,
    );
    expect(r).toEqual([{ tipo: "os_atribuida", total: 2 }]);
  });
});

describe("filtrarNotificacoes", () => {
  const itens = [
    notificacao({ id: "a", categoria: "financeiro", lida_em: null }),
    notificacao({ id: "b", categoria: "frota", lida_em: iso(18) }),
  ];

  it("todas devolve tudo", () => {
    expect(filtrarNotificacoes(itens, "todas")).toHaveLength(2);
  });

  it("não lidas filtra por lida_em nulo", () => {
    expect(filtrarNotificacoes(itens, "nao_lidas").map((n) => n.id)).toEqual(["a"]);
  });

  it("categoria filtra pela coluna", () => {
    expect(filtrarNotificacoes(itens, "frota").map((n) => n.id)).toEqual(["b"]);
  });
});
