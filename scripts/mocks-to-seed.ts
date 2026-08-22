// Gera supabase/seed.sql a partir de src/mocks/*.ts — fonte única de verdade.
// Rodar com: npx tsx scripts/mocks-to-seed.ts

import { writeFileSync } from "node:fs";
import { v5 as uuidv5 } from "uuid";

import { equipamentos } from "../src/mocks/equipamentos";
import { operadores } from "../src/mocks/operadores";
import { clientes } from "../src/mocks/clientes";
import { precosHoraMaquina } from "../src/mocks/precos-hora-maquina";
import { precosFundacao } from "../src/mocks/precos-fundacao";
import { precosMobilizacao } from "../src/mocks/precos-mobilizacao";
import { planosManutencao } from "../src/mocks/planos-manutencao";
import { ordensServico } from "../src/mocks/ordens-servico";
import { apontamentos } from "../src/mocks/apontamentos";
import { orcamentos } from "../src/mocks/orcamentos";
import { faturamentos } from "../src/mocks/faturamentos";
import { contasReceber } from "../src/mocks/contas-receber";
import { contasPagar } from "../src/mocks/contas-pagar";
import { cobrancasGateway } from "../src/mocks/cobrancas-gateway";
import { registrosManutencao } from "../src/mocks/registros-manutencao";
import { abastecimentos } from "../src/mocks/abastecimentos";
import { componentesCusto } from "../src/mocks/componentes-custo";
import { comprovantes } from "../src/mocks/comprovantes";
import { avisosWhatsApp } from "../src/mocks/avisos-whatsapp";

// Namespace fixo do projeto — NÃO alterar (todo id gerado depende dele).
const NAMESPACE = "6f0f6b1a-9c8e-4b0a-8a1e-4a5a2b6f0c10";

function id(mockId: string | null | undefined): string | null {
  if (mockId === null || mockId === undefined) return null;
  return uuidv5(mockId, NAMESPACE);
}

function sqlUuid(mockId: string | null | undefined): string {
  const mapped = id(mockId);
  return mapped ? `'${mapped}'` : "null";
}

function sqlStr(v: string | null | undefined): string {
  if (v === null || v === undefined) return "null";
  return `'${v.replace(/'/g, "''")}'`;
}

function sqlNum(v: number | null | undefined): string {
  if (v === null || v === undefined) return "null";
  return String(v);
}

function sqlBool(v: boolean): string {
  return v ? "true" : "false";
}

function insert(table: string, columns: string[], rows: string[][]): string {
  if (rows.length === 0) return `-- ${table}: nenhum registro no mock\n`;
  const valuesSql = rows.map((r) => `  (${r.join(", ")})`).join(",\n");
  return `insert into public.${table} (${columns.join(", ")}) values\n${valuesSql};\n`;
}

// --- CPFs válidos (algoritmo padrão) para os 5 operadores do mock ---
function digitoVerificador(digitos: number[]): number {
  let soma = 0;
  let peso = digitos.length + 1;
  for (const d of digitos) {
    soma += d * peso;
    peso--;
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

function gerarCpf(base9: string): string {
  const nums = base9.split("").map(Number);
  const dv1 = digitoVerificador(nums);
  const dv2 = digitoVerificador([...nums, dv1]);
  return base9 + String(dv1) + String(dv2);
}

const BASES_CPF = ["123456789", "987654321", "111222333", "444555666", "789123456"];

// --- Integridade referencial: os mocks de display (fase Frontend First) não
// eram checados contra FKs reais. contas-receber.ts referencia
// fat-005/fat-006/fat-007 como "referências futuras" (ver comentário no
// próprio arquivo) que NUNCA foram criadas em faturamentos.ts. Como
// contas_receber.faturamento_id é `not null references faturamentos(id)`,
// inserir essas linhas quebraria o seed. Filtramos aqui as contas cujo
// faturamento não existe, e propagamos a exclusão para cobrancas_gateway
// (conta_receber_id também é FK not null).
const faturamentoIds = new Set(faturamentos.map((f) => f.id));
const contasReceberValidas = contasReceber.filter((c) => faturamentoIds.has(c.faturamento_id));
const contasReceberOmitidas = contasReceber.filter((c) => !faturamentoIds.has(c.faturamento_id));
const contaReceberIds = new Set(contasReceberValidas.map((c) => c.id));
const cobrancasGatewayValidas = cobrancasGateway.filter((c) =>
  contaReceberIds.has(c.conta_receber_id),
);
const cobrancasGatewayOmitidas = cobrancasGateway.filter(
  (c) => !contaReceberIds.has(c.conta_receber_id),
);

if (contasReceberOmitidas.length > 0) {
  console.warn(
    `Aviso: ${contasReceberOmitidas.length} conta(s) a receber omitida(s) do seed por referenciar faturamento inexistente: ${contasReceberOmitidas.map((c) => `${c.id} -> ${c.faturamento_id}`).join(", ")}`,
  );
}
if (cobrancasGatewayOmitidas.length > 0) {
  console.warn(
    `Aviso: ${cobrancasGatewayOmitidas.length} cobrança(s) gateway omitida(s) do seed por referenciar conta a receber omitida: ${cobrancasGatewayOmitidas.map((c) => `${c.id} -> ${c.conta_receber_id}`).join(", ")}`,
  );
}

let sql = `-- Gerado por scripts/mocks-to-seed.ts a partir de src/mocks/*.ts. Não editar à mão.\n\n`;

// 1. equipamentos / operadores / clientes
sql += insert(
  "equipamentos",
  [
    "id",
    "nome",
    "tipo",
    "capacidade",
    "horimetro_atual",
    "identificador",
    "status",
    "ativo",
    "created_at",
    "updated_at",
  ],
  equipamentos.map((e) => [
    sqlUuid(e.id),
    sqlStr(e.nome),
    sqlStr(e.tipo),
    sqlStr(e.capacidade),
    sqlNum(e.horimetro_atual),
    sqlStr(e.identificador),
    sqlStr(e.status),
    sqlBool(e.ativo),
    sqlStr(e.created_at),
    sqlStr(e.updated_at),
  ]),
);

sql += insert(
  "operadores",
  ["id", "nome", "telefone", "cpf", "pin_hash", "ativo", "created_at", "updated_at"],
  operadores.map((o, i) => {
    const cpf = gerarCpf(BASES_CPF[i % BASES_CPF.length]);
    const pin = cpf.slice(0, 4);
    return [
      sqlUuid(o.id),
      sqlStr(o.nome),
      sqlStr(o.telefone),
      sqlStr(cpf),
      `extensions.crypt('${pin}', extensions.gen_salt('bf'))`,
      sqlBool(o.ativo),
      sqlStr(o.created_at),
      sqlStr(o.updated_at),
    ];
  }),
);

sql += insert(
  "clientes",
  ["id", "nome", "documento", "telefone", "ativo", "created_at", "updated_at"],
  clientes.map((c) => [
    sqlUuid(c.id),
    sqlStr(c.nome),
    sqlStr(c.documento),
    sqlStr(c.telefone),
    sqlBool(c.ativo),
    sqlStr(c.created_at),
    sqlStr(c.updated_at),
  ]),
);

// 2. precos_* / planos_manutencao
sql += insert(
  "precos_hora_maquina",
  [
    "id",
    "equipamento_id",
    "tipo_equipamento",
    "valor_hora_seca",
    "valor_hora_operada",
    "ativo",
    "created_at",
    "updated_at",
  ],
  precosHoraMaquina.map((p) => [
    sqlUuid(p.id),
    sqlUuid(p.equipamento_id),
    sqlStr(p.tipo_equipamento),
    sqlNum(p.valor_hora_seca),
    sqlNum(p.valor_hora_operada),
    sqlBool(p.ativo),
    sqlStr(p.created_at),
    sqlStr(p.updated_at),
  ]),
);

sql += insert(
  "precos_fundacao",
  ["id", "diametro_broca_mm", "valor_metro", "descricao", "ativo", "created_at", "updated_at"],
  precosFundacao.map((p) => [
    sqlUuid(p.id),
    sqlNum(p.diametro_broca_mm),
    sqlNum(p.valor_metro),
    sqlStr(p.descricao),
    sqlBool(p.ativo),
    sqlStr(p.created_at),
    sqlStr(p.updated_at),
  ]),
);

sql += insert(
  "precos_mobilizacao",
  ["id", "descricao", "valor", "ativo", "created_at", "updated_at"],
  precosMobilizacao.map((p) => [
    sqlUuid(p.id),
    sqlStr(p.descricao),
    sqlNum(p.valor),
    sqlBool(p.ativo),
    sqlStr(p.created_at),
    sqlStr(p.updated_at),
  ]),
);

sql += insert(
  "planos_manutencao",
  [
    "id",
    "equipamento_id",
    "tipo_equipamento",
    "descricao",
    "intervalo_horas",
    "ativo",
    "created_at",
    "updated_at",
  ],
  planosManutencao.map((p) => [
    sqlUuid(p.id),
    sqlUuid(p.equipamento_id),
    sqlStr(p.tipo_equipamento),
    sqlStr(p.descricao),
    sqlNum(p.intervalo_horas),
    sqlBool(p.ativo),
    sqlStr(p.created_at),
    sqlStr(p.updated_at),
  ]),
);

// 3. ordens_servico -> apontamentos
sql += insert(
  "ordens_servico",
  [
    "id",
    "numero",
    "cliente_id",
    "obra_nome",
    "endereco",
    "modelo_cobranca",
    "status",
    "responsavel_id",
    "observacao",
    "diametro_broca_mm",
    "local_lat",
    "local_lng",
    "aberta_em",
    "fechada_em",
    "pendente_sync",
    "created_at",
    "updated_at",
  ],
  ordensServico.map((o) => [
    sqlUuid(o.id),
    sqlStr(o.numero),
    sqlUuid(o.cliente_id),
    sqlStr(o.obra_nome),
    sqlStr(o.endereco),
    sqlStr(o.modelo_cobranca),
    sqlStr(o.status),
    sqlUuid(o.responsavel_id),
    sqlStr(o.observacao),
    sqlNum(o.diametro_broca_mm),
    sqlNum(o.local_lat),
    sqlNum(o.local_lng),
    sqlStr(o.aberta_em),
    sqlStr(o.fechada_em),
    sqlBool(o.pendente_sync),
    sqlStr(o.created_at),
    sqlStr(o.updated_at),
  ]),
);

sql += insert(
  "apontamentos",
  [
    "id",
    "equipamento_id",
    "operador_id",
    "os_id",
    "horimetro_inicial",
    "horimetro_final",
    "horas_trabalhadas",
    "foto_inicial_url",
    "foto_final_url",
    "observacao",
    "modalidade",
    "metros_executados",
    "status",
    "pendente_sync",
    "iniciado_em",
    "finalizado_em",
    "created_at",
    "updated_at",
  ],
  apontamentos.map((a) => [
    sqlUuid(a.id),
    sqlUuid(a.equipamento_id),
    sqlUuid(a.operador_id),
    sqlUuid(a.os_id),
    sqlNum(a.horimetro_inicial),
    sqlNum(a.horimetro_final),
    sqlNum(a.horas_trabalhadas),
    sqlStr(a.foto_inicial_url),
    sqlStr(a.foto_final_url),
    sqlStr(a.observacao),
    sqlStr(a.modalidade),
    sqlNum(a.metros_executados),
    sqlStr(a.status),
    sqlBool(a.pendente_sync),
    sqlStr(a.iniciado_em),
    sqlStr(a.finalizado_em),
    sqlStr(a.created_at),
    sqlStr(a.updated_at),
  ]),
);

// 4. orcamentos (+itens) -> faturamentos (+itens)
sql += insert(
  "orcamentos",
  [
    "id",
    "numero",
    "cliente_id",
    "descricao_obra",
    "desconto",
    "valor_total",
    "validade",
    "observacao",
    "status",
    "os_id",
    "enviado_em",
    "decidido_em",
    "created_at",
    "updated_at",
  ],
  orcamentos.map((o) => [
    sqlUuid(o.id),
    sqlStr(o.numero),
    sqlUuid(o.cliente_id),
    sqlStr(o.descricao_obra),
    sqlNum(o.desconto),
    sqlNum(o.valor_total),
    sqlStr(o.validade),
    sqlStr(o.observacao),
    sqlStr(o.status),
    sqlUuid(o.os_id),
    sqlStr(o.enviado_em),
    sqlStr(o.decidido_em),
    sqlStr(o.created_at),
    sqlStr(o.updated_at),
  ]),
);

sql += insert(
  "orcamento_itens",
  [
    "id",
    "orcamento_id",
    "tipo",
    "descricao",
    "origem_id",
    "hora_tipo",
    "quantidade_estimada",
    "valor_unitario",
    "valor_total",
    "sem_preco",
  ],
  orcamentos.flatMap((o) =>
    o.itens.map((it) => [
      sqlUuid(it.id),
      sqlUuid(o.id),
      sqlStr(it.tipo),
      sqlStr(it.descricao),
      sqlUuid(it.origem_id),
      sqlStr(it.hora_tipo),
      sqlNum(it.quantidade_estimada),
      sqlNum(it.valor_unitario),
      sqlNum(it.valor_total),
      sqlBool(it.sem_preco),
    ]),
  ),
);

sql += insert(
  "faturamentos",
  [
    "id",
    "numero",
    "os_id",
    "cliente_id",
    "modelo_cobranca",
    "desconto",
    "valor_total",
    "observacao",
    "status",
    "gerado_em",
    "faturado_em",
    "created_at",
    "updated_at",
  ],
  faturamentos.map((f) => [
    sqlUuid(f.id),
    sqlStr(f.numero),
    sqlUuid(f.os_id),
    sqlUuid(f.cliente_id),
    sqlStr(f.modelo_cobranca),
    sqlNum(f.desconto),
    sqlNum(f.valor_total),
    sqlStr(f.observacao),
    sqlStr(f.status),
    sqlStr(f.gerado_em),
    sqlStr(f.faturado_em),
    sqlStr(f.created_at),
    sqlStr(f.updated_at),
  ]),
);

sql += insert(
  "faturamento_itens",
  [
    "id",
    "faturamento_id",
    "tipo",
    "descricao",
    "origem_id",
    "hora_tipo",
    "quantidade",
    "valor_unitario",
    "valor_total",
    "sem_preco",
  ],
  faturamentos.flatMap((f) =>
    f.itens.map((it) => [
      sqlUuid(it.id),
      sqlUuid(f.id),
      sqlStr(it.tipo),
      sqlStr(it.descricao),
      sqlUuid(it.origem_id),
      sqlStr(it.hora_tipo),
      sqlNum(it.quantidade),
      sqlNum(it.valor_unitario),
      sqlNum(it.valor_total),
      sqlBool(it.sem_preco),
    ]),
  ),
);

// 5. contas_receber / contas_pagar / cobrancas_gateway
// (contasReceberValidas/cobrancasGatewayValidas — ver filtro de integridade acima)
sql += insert(
  "contas_receber",
  [
    "id",
    "faturamento_id",
    "cliente_id",
    "valor",
    "vencimento",
    "status",
    "recebido_em",
    "forma_recebimento",
    "created_at",
    "updated_at",
  ],
  contasReceberValidas.map((c) => [
    sqlUuid(c.id),
    sqlUuid(c.faturamento_id),
    sqlUuid(c.cliente_id),
    sqlNum(c.valor),
    sqlStr(c.vencimento),
    sqlStr(c.status),
    sqlStr(c.recebido_em),
    sqlStr(c.forma_recebimento),
    sqlStr(c.created_at),
    sqlStr(c.updated_at),
  ]),
);

sql += insert(
  "contas_pagar",
  [
    "id",
    "descricao",
    "fornecedor",
    "categoria",
    "valor",
    "vencimento",
    "status",
    "pago_em",
    "created_at",
    "updated_at",
  ],
  contasPagar.map((c) => [
    sqlUuid(c.id),
    sqlStr(c.descricao),
    sqlStr(c.fornecedor),
    sqlStr(c.categoria),
    sqlNum(c.valor),
    sqlStr(c.vencimento),
    sqlStr(c.status),
    sqlStr(c.pago_em),
    sqlStr(c.created_at),
    sqlStr(c.updated_at),
  ]),
);

sql += insert(
  "cobrancas_gateway",
  [
    "id",
    "conta_receber_id",
    "provedor",
    "status",
    "linha_digitavel",
    "pix_copia_cola",
    "valor",
    "emitida_em",
    "paga_em",
    "created_at",
    "updated_at",
  ],
  cobrancasGatewayValidas.map((c) => [
    sqlUuid(c.id),
    sqlUuid(c.conta_receber_id),
    sqlStr(c.provedor),
    sqlStr(c.status),
    sqlStr(c.linha_digitavel),
    sqlStr(c.pix_copia_cola),
    sqlNum(c.valor),
    sqlStr(c.emitida_em),
    sqlStr(c.paga_em),
    sqlStr(c.created_at),
    sqlStr(c.updated_at),
  ]),
);

// 6. registros_manutencao / abastecimentos / componentes_custo
sql += insert(
  "registros_manutencao",
  [
    "id",
    "equipamento_id",
    "plano_id",
    "horimetro_previsto",
    "horimetro_realizado",
    "status",
    "custo",
    "observacao",
    "realizada_em",
    "created_at",
    "updated_at",
  ],
  registrosManutencao.map((r) => [
    sqlUuid(r.id),
    sqlUuid(r.equipamento_id),
    sqlUuid(r.plano_id),
    sqlNum(r.horimetro_previsto),
    sqlNum(r.horimetro_realizado),
    sqlStr(r.status),
    sqlNum(r.custo),
    sqlStr(r.observacao),
    sqlStr(r.realizada_em),
    sqlStr(r.created_at),
    sqlStr(r.updated_at),
  ]),
);

sql += insert(
  "abastecimentos",
  [
    "id",
    "equipamento_id",
    "operador_id",
    "litros",
    "horimetro",
    "preco_litro",
    "custo_total",
    "local",
    "abastecido_em",
    "created_at",
    "updated_at",
  ],
  abastecimentos.map((a) => [
    sqlUuid(a.id),
    sqlUuid(a.equipamento_id),
    sqlUuid(a.operador_id),
    sqlNum(a.litros),
    sqlNum(a.horimetro),
    sqlNum(a.preco_litro),
    sqlNum(a.custo_total),
    sqlStr(a.local),
    sqlStr(a.abastecido_em),
    sqlStr(a.created_at),
    sqlStr(a.updated_at),
  ]),
);

sql += insert(
  "componentes_custo",
  ["id", "equipamento_id", "descricao", "tipo", "valor", "ativo", "created_at", "updated_at"],
  componentesCusto.map((c) => [
    sqlUuid(c.id),
    sqlUuid(c.equipamento_id),
    sqlStr(c.descricao),
    sqlStr(c.tipo),
    sqlNum(c.valor),
    sqlBool(c.ativo),
    sqlStr(c.created_at),
    sqlStr(c.updated_at),
  ]),
);

// 7. comprovantes / avisos_whatsapp
sql += insert(
  "comprovantes",
  [
    "id",
    "numero",
    "os_id",
    "cliente_id",
    "resumo_servico",
    "assinante_nome",
    "assinatura_url",
    "status",
    "motivo_recusa",
    "gerado_em",
    "assinado_em",
    "created_at",
    "updated_at",
  ],
  comprovantes.map((c) => [
    sqlUuid(c.id),
    sqlStr(c.numero),
    sqlUuid(c.os_id),
    sqlUuid(c.cliente_id),
    sqlStr(c.resumo_servico),
    sqlStr(c.assinante_nome),
    sqlStr(c.assinatura_url),
    sqlStr(c.status),
    sqlStr(c.motivo_recusa),
    sqlStr(c.gerado_em),
    sqlStr(c.assinado_em),
    sqlStr(c.created_at),
    sqlStr(c.updated_at),
  ]),
);

sql += insert(
  "avisos_whatsapp",
  [
    "id",
    "os_id",
    "cliente_id",
    "provedor",
    "status",
    "mensagem_preview",
    "enviado_em",
    "created_at",
  ],
  avisosWhatsApp.map((a) => [
    sqlUuid(a.id),
    sqlUuid(a.os_id),
    sqlUuid(a.cliente_id),
    sqlStr(a.provedor),
    sqlStr(a.status),
    sqlStr(a.mensagem_preview),
    sqlStr(a.enviado_em),
    sqlStr(a.created_at),
  ]),
);

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql, "utf-8");
console.log("supabase/seed.sql gerado.");
