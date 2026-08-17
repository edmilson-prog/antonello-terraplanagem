import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import type { Parametros } from "@/shared/types";

const parametros: Parametros = {
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
  versao: 4,
  atualizado_por: null,
  created_at: "2026-08-16T12:00:00.000Z",
  updated_at: "2026-08-16T12:00:00.000Z",
};

const salvar = vi.fn().mockResolvedValue(undefined);

vi.mock("@/features/parametros/parametros-store", () => ({
  parametrosStore: {
    get: () => parametros,
    useParametros: () => parametros,
    useEstado: () => ({ isLoading: false, error: null }),
    salvar: (patch: unknown) => salvar(patch),
    carregarHistorico: vi.fn().mockResolvedValue([]),
    retry: vi.fn(),
  },
}));

vi.mock("@/features/auth/usuario-retaguarda", () => ({
  useUsuarioRetaguarda: () => ({ nome: "Ana Antonello", perfil: "proprietario" }),
}));

// O bloco de provedores fala com localStorage e com a Edge Function do WAHA —
// fora do que este teste verifica.
vi.mock("@/features/integracoes/components/provedores-integracoes", () => ({
  ProvedoresIntegracoes: () => <div data-testid="provedores" />,
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { ConfiguracoesPage } from "./configuracoes-page";

// A página tem um Link de volta para /admin/parametros, que precisa de um
// router montado.
async function renderPagina() {
  const rootRoute = createRootRoute({ component: () => <ConfiguracoesPage /> });
  const router = createRouter({ routeTree: rootRoute });
  const utils = render(<RouterProvider router={router} />);
  await waitFor(() => expect(document.body.textContent).not.toBe(""));
  return utils;
}

describe("ConfiguracoesPage", () => {
  beforeEach(() => salvar.mockClear());

  it("começa sem alterações, com salvar e descartar desabilitados", async () => {
    await renderPagina();

    expect(screen.getByText("Sem alterações")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /salvar alterações/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /descartar/i })).toBeDisabled();
    expect(screen.getByText("Nenhuma alteração desde o último salvamento.")).toBeInTheDocument();
  });

  it("mostra o diff antes → depois ao editar um campo", async () => {
    await renderPagina();

    fireEvent.change(screen.getByLabelText(/razão social/i), {
      target: { value: "Antonello Terraplanagem ME" },
    });

    expect(screen.getByText("1 alteração não salva")).toBeInTheDocument();
    expect(screen.getByText("Antonello Terraplanagem Ltda.")).toBeInTheDocument();
    expect(screen.getByText("Antonello Terraplanagem ME")).toBeInTheDocument();
  });

  it("descartar volta o formulário ao valor carregado", async () => {
    await renderPagina();

    const campo = screen.getByLabelText(/nome fantasia/i);
    fireEvent.change(campo, { target: { value: "Outro nome" } });
    expect(screen.getByText("1 alteração não salva")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /descartar/i }));

    expect(screen.getByText("Sem alterações")).toBeInTheDocument();
    expect(campo).toHaveValue("Antonello Terraplanagem");
  });

  it("envia no patch só o campo alterado, já convertido para número", async () => {
    await renderPagina();

    fireEvent.click(screen.getByRole("button", { name: /custos & preços/i }));
    fireEvent.change(screen.getByLabelText(/margem mínima/i), { target: { value: "35" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }));

    await waitFor(() => expect(salvar).toHaveBeenCalledWith({ margem_minima_pct: 35 }));
  });

  it("bloqueia o salvamento quando um campo numérico fica vazio", async () => {
    await renderPagina();

    fireEvent.click(screen.getByRole("button", { name: /custos & preços/i }));
    fireEvent.change(screen.getByLabelText(/horas\/mês de referência/i), { target: { value: "" } });

    expect(screen.getByText("Campo inválido")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /salvar alterações/i })).toBeDisabled();
  });

  it("conta os campos sujos na aba da seção correspondente", async () => {
    await renderPagina();

    fireEvent.change(screen.getByLabelText(/cnpj/i), { target: { value: "00.000.000/0001-00" } });

    expect(screen.getByRole("button", { name: /empresa\s*1/i })).toBeInTheDocument();
  });

  it("mostra a versão dos parâmetros vinda do banco", async () => {
    await renderPagina();

    expect(screen.getByText("v4")).toBeInTheDocument();
  });

  it("marca como só cadastro os parâmetros que o sistema ainda não consulta", async () => {
    await renderPagina();

    fireEvent.click(screen.getByRole("button", { name: /acesso & segurança/i }));

    // As 6 chaves da seção Acesso estão todas em CAMPOS_SEM_EFEITO.
    expect(screen.getAllByText("só cadastro")).toHaveLength(6);
  });
});
