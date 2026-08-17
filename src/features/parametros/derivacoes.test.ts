import { describe, it, expect } from "vitest";
import {
  CHAVES_EDITAVEIS,
  chavesAlteradas,
  chavesInvalidas,
  formatarHora,
  formatarValor,
  paraFormulario,
  paraPatch,
  rotuloDoCampo,
  sujosPorSecao,
  textoParaNumero,
} from "@/features/parametros/derivacoes";
import { CAMPOS_POR_CHAVE, CAMPOS_SEM_EFEITO, SECOES } from "@/features/parametros/campos";
import type { Parametros } from "@/shared/types";

const base: Parametros = {
  id: "p1",
  razao_social: "Antonello Terraplanagem Ltda.",
  nome_fantasia: "Antonello Terraplanagem",
  cnpj: "36.508.280/0001-90",
  inscricao_estadual: "",
  telefone: "(55) 99924-2409",
  email: "",
  sede: "Frederico Westphalen — RS",
  jornada_horas: 8,
  tolerancia_horimetro: 0.2,
  alerta_manutencao_horas: 20,
  fechamento_dia: "20:00:00",
  aprovacao_apontamento: "supervisor",
  dias_uteis: "seg_sex",
  apontamento_via_app: true,
  foto_obrigatoria: false,
  registrar_gps: false,
  depreciacao_anual_pct: 10,
  custo_operador_hora: 62,
  margem_minima_pct: 30,
  horas_mes_referencia: 160,
  diesel_preco_litro: 5.84,
  tanque_capacidade_litros: 2000,
  arredondamento_preco: "nenhum",
  reajuste_automatico_precos: false,
  alertar_margem_baixa: true,
  vencimento_dias: 30,
  juros_mes_pct: 1,
  multa_atraso_pct: 2,
  nf_serie: "1",
  nf_proxima_numeracao: "000001",
  regime_tributario: "lucro_presumido",
  recebimento_padrao: "pix",
  chave_pix: "",
  nf_numeracao_automatica: true,
  nf_envio_email: true,
  whatsapp_numero: "",
  email_remetente: "",
  sincronizacao_app: "5min",
  webhook_url: "",
  canal_whatsapp_ativo: false,
  backup_diario: false,
  sessao_expira_min: 30,
  retencao_logs_dias: 365,
  politica_senha: "padrao",
  perfil_padrao_novo_usuario: "operador",
  dupla_verificacao: false,
  particionamento_financeiro: true,
  versao: 1,
  atualizado_por: null,
  created_at: "2026-08-16T12:00:00.000Z",
  updated_at: "2026-08-16T12:00:00.000Z",
};

describe("paraFormulario", () => {
  it("converte números para texto com vírgula decimal", () => {
    const form = paraFormulario(base);
    expect(form.jornada_horas).toBe("8,0");
    expect(form.tolerancia_horimetro).toBe("0,2");
    expect(form.diesel_preco_litro).toBe("5,84");
  });

  it("corta os segundos do horário e preserva booleanos", () => {
    const form = paraFormulario(base);
    expect(form.fechamento_dia).toBe("20:00");
    expect(form.apontamento_via_app).toBe(true);
    expect(form.foto_obrigatoria).toBe(false);
  });

  it("cobre todas as chaves editáveis", () => {
    const form = paraFormulario(base);
    for (const chave of CHAVES_EDITAVEIS) {
      expect(form[chave], `faltou ${chave}`).toBeDefined();
    }
  });
});

describe("textoParaNumero", () => {
  it("aceita vírgula e ponto", () => {
    expect(textoParaNumero("8,5")).toBe(8.5);
    expect(textoParaNumero("8.5")).toBe(8.5);
  });

  it("retorna null em vez de 0 quando o campo está vazio ou inválido", () => {
    expect(textoParaNumero("")).toBeNull();
    expect(textoParaNumero("   ")).toBeNull();
    expect(textoParaNumero("abc")).toBeNull();
  });
});

describe("chavesAlteradas", () => {
  it("lista só o que mudou", () => {
    const inicial = paraFormulario(base);
    const editado = { ...inicial, margem_minima_pct: "35,0", dupla_verificacao: true };
    expect(chavesAlteradas(editado, inicial).sort()).toEqual([
      "dupla_verificacao",
      "margem_minima_pct",
    ]);
  });

  it("é vazio quando nada mudou", () => {
    const inicial = paraFormulario(base);
    expect(chavesAlteradas({ ...inicial }, inicial)).toEqual([]);
  });
});

describe("paraPatch", () => {
  it("converte o texto de volta para número e o horário de volta com segundos", () => {
    const inicial = paraFormulario(base);
    const editado = { ...inicial, jornada_horas: "8,5", fechamento_dia: "18:30" };
    expect(paraPatch(editado, inicial)).toEqual({
      jornada_horas: 8.5,
      fechamento_dia: "18:30:00",
    });
  });

  it("não inclui campos que não mudaram", () => {
    const inicial = paraFormulario(base);
    const editado = { ...inicial, nf_serie: "2" };
    expect(paraPatch(editado, inicial)).toEqual({ nf_serie: "2" });
  });

  it("preserva booleanos como booleanos", () => {
    const inicial = paraFormulario(base);
    const editado = { ...inicial, foto_obrigatoria: true };
    expect(paraPatch(editado, inicial)).toEqual({ foto_obrigatoria: true });
  });
});

describe("chavesInvalidas", () => {
  it("acusa campo numérico vazio", () => {
    const form = { ...paraFormulario(base), margem_minima_pct: "" };
    expect(chavesInvalidas(form)).toEqual(["margem_minima_pct"]);
  });

  it("não acusa texto vazio em campo de texto", () => {
    const form = { ...paraFormulario(base), chave_pix: "" };
    expect(chavesInvalidas(form)).toEqual([]);
  });
});

describe("formatarValor", () => {
  it("acrescenta a unidade", () => {
    expect(formatarValor("margem_minima_pct", "30,0")).toBe("30,0 %");
    expect(formatarValor("jornada_horas", "8,0")).toBe("8,0 h/dia");
  });

  it("traduz opção de select para o rótulo", () => {
    expect(formatarValor("regime_tributario", "lucro_presumido")).toBe("Lucro Presumido");
    expect(formatarValor("recebimento_padrao", "pix")).toBe("PIX");
  });

  it("descreve booleano e vazio em palavras", () => {
    expect(formatarValor("dupla_verificacao", true)).toBe("ativado");
    expect(formatarValor("dupla_verificacao", false)).toBe("desativado");
    expect(formatarValor("chave_pix", "")).toBe("vazio");
  });
});

describe("formatarHora", () => {
  it("corta os segundos", () => {
    expect(formatarHora("20:00:00")).toBe("20:00");
  });
});

describe("rotuloDoCampo", () => {
  it("traduz o nome da coluna que o histórico guarda", () => {
    expect(rotuloDoCampo("alerta_manutencao_horas")).toBe("Alerta de manutenção");
  });

  it("devolve a própria chave quando não conhece o campo", () => {
    expect(rotuloDoCampo("coluna_que_nao_existe")).toBe("coluna_que_nao_existe");
  });
});

describe("sujosPorSecao", () => {
  it("conta os campos alterados de cada seção", () => {
    const conta = sujosPorSecao(["margem_minima_pct", "horas_mes_referencia", "cnpj"]);
    expect(conta.custos).toBe(2);
    expect(conta.empresa).toBe(1);
    expect(conta.operacao).toBe(0);
  });
});

describe("catálogo de campos", () => {
  it("descreve as 6 seções do UI kit", () => {
    expect(SECOES.map((s) => s.id)).toEqual([
      "empresa",
      "operacao",
      "custos",
      "faturamento",
      "integracoes",
      "acesso",
    ]);
  });

  it("não marca como sem efeito nenhum parâmetro que o sistema já consulta", () => {
    const ligados = [
      // Jornada e dias úteis passaram a valer na Onda 16 (Utilização da Frota).
      "jornada_horas",
      "dias_uteis",
      "alerta_manutencao_horas",
      "margem_minima_pct",
      "horas_mes_referencia",
      "alertar_margem_baixa",
      "recebimento_padrao",
    ];
    for (const chave of ligados) {
      expect(CAMPOS_SEM_EFEITO.has(chave as never), `${chave} está marcado sem efeito`).toBe(false);
    }
  });

  it("só marca chaves que existem no catálogo", () => {
    for (const chave of CAMPOS_SEM_EFEITO) {
      expect(CAMPOS_POR_CHAVE.has(chave), `${chave} não está em nenhuma seção`).toBe(true);
    }
  });
});
