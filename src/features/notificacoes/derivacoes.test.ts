import { describe, expect, it } from "vitest";
import {
  agruparPorDia,
  aparenciaDaNotificacao,
  horaDaNotificacao,
  rotuloDoDia,
} from "@/features/notificacoes/derivacoes";
import type { Notificacao } from "@/shared/types";

// Referência fixa para não depender de "agora": 14:00 local de 09/08/2026.
const REFERENCIA = new Date(2026, 7, 9, 14, 0, 0);

/** Constrói um ISO a partir de hora LOCAL — as derivações raciocinam em local. */
function isoLocal(ano: number, mes: number, dia: number, hora = 9, minuto = 0): string {
  return new Date(ano, mes - 1, dia, hora, minuto, 0).toISOString();
}

function notificacao(over: Partial<Notificacao> = {}): Notificacao {
  return {
    id: "nt-1",
    operador_id: "op-1",
    tipo: "os_atribuida",
    titulo: "Nova OS atribuída a você",
    mensagem: "OS-024 · Nivelamento de pátio",
    os_id: null,
    origem_id: null,
    lida_em: null,
    created_at: isoLocal(2026, 8, 9),
    updated_at: isoLocal(2026, 8, 9),
    ...over,
  };
}

describe("aparenciaDaNotificacao", () => {
  it("dá a cada tipo do kit o seu ícone", () => {
    expect(aparenciaDaNotificacao("os_atribuida").icone).toBe("lucide:clipboard-list");
    expect(aparenciaDaNotificacao("manutencao_agendada").icone).toBe("lucide:wrench");
    expect(aparenciaDaNotificacao("apontamento_aprovado").icone).toBe("lucide:check");
    expect(aparenciaDaNotificacao("lembrete_apontamento").icone).toBe("lucide:gauge");
    expect(aparenciaDaNotificacao("abastecimento_registrado").icone).toBe("lucide:fuel");
    expect(aparenciaDaNotificacao("correcao_solicitada").icone).toBe("lucide:circle-alert");
  });

  it("reserva o tom de alerta para a correção solicitada", () => {
    expect(aparenciaDaNotificacao("correcao_solicitada").tom).toBe("alerta");
    expect(aparenciaDaNotificacao("os_atribuida").tom).toBe("padrao");
    expect(aparenciaDaNotificacao("abastecimento_registrado").tom).toBe("padrao");
  });

  it("não quebra com um tipo que o frontend ainda não conhece", () => {
    // O banco pode ganhar um tipo novo antes deste build chegar ao aparelho.
    expect(aparenciaDaNotificacao("tipo_do_futuro")).toEqual({
      icone: "lucide:bell",
      tom: "padrao",
    });
  });
});

describe("horaDaNotificacao", () => {
  it("mostra só hora e minuto", () => {
    expect(horaDaNotificacao(isoLocal(2026, 8, 9, 7, 38))).toBe("07:38");
  });

  it("devolve vazio para data inválida em vez de 'Invalid Date'", () => {
    expect(horaDaNotificacao("não é data")).toBe("");
  });
});

describe("rotuloDoDia", () => {
  it("chama o dia corrente de Hoje", () => {
    expect(rotuloDoDia(isoLocal(2026, 8, 9, 7, 38), REFERENCIA)).toBe("Hoje");
  });

  it("chama o dia anterior de Ontem", () => {
    expect(rotuloDoDia(isoLocal(2026, 8, 8, 18, 22), REFERENCIA)).toBe("Ontem");
  });

  it("usa dia da semana e data a partir de anteontem", () => {
    // 06/08/2026 é uma quinta-feira.
    expect(rotuloDoDia(isoLocal(2026, 8, 6, 9, 10), REFERENCIA)).toBe("qui, 06/08");
  });

  it("compara por dia do calendário, não por 24 horas corridas", () => {
    // 23:50 de ontem está a menos de 24h das 14:00 de hoje e ainda assim é Ontem.
    expect(rotuloDoDia(isoLocal(2026, 8, 8, 23, 50), REFERENCIA)).toBe("Ontem");
    // 00:05 de hoje está a mais de 13h e continua sendo Hoje.
    expect(rotuloDoDia(isoLocal(2026, 8, 9, 0, 5), REFERENCIA)).toBe("Hoje");
  });
});

describe("agruparPorDia", () => {
  it("junta as do mesmo dia num grupo só, preservando a ordem recebida", () => {
    const grupos = agruparPorDia(
      [
        notificacao({ id: "a", created_at: isoLocal(2026, 8, 9, 7, 38) }),
        notificacao({ id: "b", created_at: isoLocal(2026, 8, 9, 7, 15) }),
        notificacao({ id: "c", created_at: isoLocal(2026, 8, 8, 18, 22) }),
      ],
      REFERENCIA,
    );

    expect(grupos.map((g) => g.dia)).toEqual(["Hoje", "Ontem"]);
    expect(grupos[0].itens.map((n) => n.id)).toEqual(["a", "b"]);
    expect(grupos[1].itens.map((n) => n.id)).toEqual(["c"]);
  });

  it("devolve lista vazia sem inventar grupo", () => {
    expect(agruparPorDia([], REFERENCIA)).toEqual([]);
  });

  it("não funde dias iguais que não estão lado a lado", () => {
    // Não deve acontecer com a RPC (que ordena por data), mas se acontecer é
    // melhor mostrar dois blocos do que reordenar por baixo do pano.
    const grupos = agruparPorDia(
      [
        notificacao({ id: "a", created_at: isoLocal(2026, 8, 9, 7, 38) }),
        notificacao({ id: "b", created_at: isoLocal(2026, 8, 8, 18, 22) }),
        notificacao({ id: "c", created_at: isoLocal(2026, 8, 9, 6, 0) }),
      ],
      REFERENCIA,
    );

    expect(grupos.map((g) => g.dia)).toEqual(["Hoje", "Ontem", "Hoje"]);
  });
});
