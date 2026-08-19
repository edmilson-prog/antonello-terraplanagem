#!/usr/bin/env node
/*
 * Varredura da diretriz D1 (CLAUDE.md): nada mockado chega em produção.
 *
 * Percorre o código de produção (src/, exceto testes) procurando os padrões que
 * já produziram dado fabricado neste projeto. Sai com código 1 quando acha algo
 * fora do inventário — então serve tanto para a revisão manual do começo de
 * sessão quanto para travar CI.
 *
 * Rodar: npm run auditar:mocks
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const RAIZ = process.cwd();
const SRC = join(RAIZ, "src");

// Arquivos que são, por natureza, fonte de dado de teste — não de produção.
const IGNORAR = [
  /\.test\.[tj]sx?$/,
  /\.spec\.[tj]sx?$/,
  /[\\/]__tests__[\\/]/,
  /[\\/]test-utils[\\/]/,
];

// Cada regra descreve um jeito conhecido de fabricar dado.
const REGRAS = [
  {
    id: "import-mocks",
    gravidade: "erro",
    descricao: "Código de produção importando fixtures de src/mocks/",
    regex: /from\s+["'](?:@\/mocks\/|\.{1,2}(?:\/\.\.)*\/mocks\/)/,
  },
  {
    id: "showcase-data",
    gravidade: "erro",
    descricao: "Gerador de dado de exemplo (showcase) alimentando tela",
    regex: /showcase-data|showcaseDo[A-Z]|ShowcaseKpi/,
  },
  {
    id: "loading-falso",
    gravidade: "erro",
    descricao: "Estado de carregamento fabricado por setTimeout (useMockResource)",
    regex: /useMockResource|use-mock-resource/,
  },
  {
    id: "store-em-memoria",
    gravidade: "erro",
    descricao: "Store mock em memória em vez de Supabase",
    regex: /createMockStore|create-mock-store/,
  },
  {
    id: "aleatorio-em-tela",
    gravidade: "erro",
    descricao: "Valor aleatório compondo dado exibido",
    regex: /Math\.random\s*\(/,
  },
  {
    id: "id-mock",
    gravidade: "erro",
    descricao: "Tradução de id real para id mock (shim da fase mockada)",
    regex: /idMockDoCliente|cliente-mock-id/,
  },
  {
    id: "marcador-pendente",
    gravidade: "aviso",
    descricao: "Marcador de pendência no código",
    regex: /\b(TODO|FIXME|XXX|HACK)\b/,
  },
];

/** Exceções conscientes: caminho + regra + porquê. Toda linha aqui é dívida assumida. */
const EXCECOES = [
  {
    arquivo: "src/features/ia/mock/",
    regras: ["import-mocks", "aleatorio-em-tela", "showcase-data"],
    motivo:
      "Suíte de IA (PRD-019) — respostas locais enquanto não há credencial de provedor. " +
      "Ver docs/PENDENCIAS-MOCK.md.",
  },
  {
    arquivo: "src/components/ui/",
    regras: ["aleatorio-em-tela"],
    motivo:
      "Primitivas shadcn intocadas — a largura sorteada é do esqueleto de carregamento, " +
      "não de dado exibido.",
  },
  {
    arquivo: "scripts/",
    regras: ["import-mocks"],
    motivo: "Geração de seed a partir dos fixtures — é o caminho legítimo mock→seed.",
  },
];

function listarArquivos(dir) {
  const saida = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      if (nome === "node_modules" || nome === ".git") continue;
      saida.push(...listarArquivos(caminho));
    } else if (/\.[tj]sx?$/.test(nome)) {
      saida.push(caminho);
    }
  }
  return saida;
}

function temExcecao(rel, regraId) {
  return EXCECOES.some(
    (e) => rel.split(sep).join("/").startsWith(e.arquivo) && e.regras.includes(regraId),
  );
}

const achados = [];

for (const caminho of listarArquivos(SRC)) {
  const rel = relative(RAIZ, caminho).split(sep).join("/");
  if (IGNORAR.some((re) => re.test(rel))) continue;

  const linhas = readFileSync(caminho, "utf8").split("\n");
  linhas.forEach((linha, i) => {
    for (const regra of REGRAS) {
      if (!regra.regex.test(linha)) continue;
      if (temExcecao(rel, regra.id)) continue;
      achados.push({ rel, linha: i + 1, texto: linha.trim().slice(0, 110), regra });
    }
  });
}

const erros = achados.filter((a) => a.regra.gravidade === "erro");
const avisos = achados.filter((a) => a.regra.gravidade === "aviso");

const porRegra = new Map();
for (const a of achados) {
  if (!porRegra.has(a.regra.id)) porRegra.set(a.regra.id, []);
  porRegra.get(a.regra.id).push(a);
}

console.log("\nAuditoria de mocks — diretriz D1 (CLAUDE.md)\n");

if (achados.length === 0) {
  console.log("  Nenhum dado fabricado no código de produção.\n");
} else {
  for (const [id, lista] of porRegra) {
    const { descricao, gravidade } = lista[0].regra;
    console.log(`  [${gravidade}] ${id} — ${descricao} (${lista.length})`);
    for (const a of lista) console.log(`      ${a.rel}:${a.linha}  ${a.texto}`);
    console.log("");
  }
}

console.log(`  ${erros.length} erro(s), ${avisos.length} aviso(s).`);
console.log("  Inventário: docs/PENDENCIAS-MOCK.md\n");

process.exit(erros.length > 0 ? 1 : 0);
