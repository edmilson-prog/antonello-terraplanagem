# PRD-004 — Faturamento ao Fechar OS — Design

> **Origem:** `docs/prds/PRD-004-ret-faturamento-fechamento-os.md`
> **Data:** 2026-06-29 · **Ambiente:** Retaguarda (`/admin/*`) — dado financeiro
> **Depende de:** PRD-003 (OS fechada + apontamentos), PRD-005 (preços). Ambos ✅.

## Objetivo

Transformar uma **OS fechada** em **faturamento**: aplicar os preços (PRD-005) às horas/metros apontados (PRD-002/003), gerar uma fatura em rascunho, permitir revisão/ajuste e confirmação (`rascunho → faturado`), e exibir o pipeline **executado → faturado → recebido***. Vive **exclusivamente na retaguarda**; o operador nunca vê nada disso.

\* "recebido" é estágio visível placeholder; sua gestão é o PRD-007 (Onda 2).

## Decisões de Design (resolvidas no brainstorming)

| Tema | Decisão |
|------|---------|
| **Information Architecture** | `/admin/faturamento` vira seção com abas **Faturas** (operacional, padrão) + **Análise** (o dashboard de gráficos atual, preservado). Não renomeia menu. |
| **Seca × operada** | Padrão **operada** (o apontamento sempre tem operador da Antonello); a retaguarda troca para **seca** por item quando for o caso. **Não altera o PRD-003.** |
| **Gatilho de geração** | Geração **pela tela de Faturamento**, a partir de OS fechadas ("Aguardando faturamento" → "Gerar"). Lógica financeira isolada em `features/faturamento`; **não** acopla ao fluxo de fechar OS. |
| **Ajuste do rascunho** | Editor completo: editar qtd/valor por item, toggle seca/operada, **+ mobilização** (PRD-005), **desconto**, **observação**. Total recalcula ao vivo. |
| **Numeração** | `FAT-AAAA-NNNN` (espelha `OS-AAAA-NNNN`). |
| **Faturamento parcial** | **Fora de escopo** (YAGNI): 1 OS fechada → 1 fatura cobrindo todos os apontamentos. |
| **Versão** | MINOR **0.4.0 → 0.5.0**, codinome **"Invoice"**. |

## Arquitetura

Nova feature isolada **`src/features/faturamento/`** (retaguarda-only; nunca importada em `/app/*` — RF-011).

### Rotas (espelha o padrão `admin.ordens.*` do PRD-003)

```
src/routes/admin.faturamento.tsx           → REMOVIDO (era a página de gráficos)
src/routes/admin.faturamento.index.tsx      → NOVA: página com abas [Faturas | Análise]
src/routes/admin.faturamento.$faturamentoId.tsx → NOVA: detalhe/editor da fatura (noindex)
```

- A aba **Análise** recebe o conteúdo extraído do antigo `admin.faturamento.tsx` (gráficos recharts + export PDF), sem perda de funcionalidade.
- A aba **Faturas** é o novo fluxo (pipeline + aguardando + lista).
- Componente de abas: shadcn `Tabs` (`@/components/ui/tabs`; `@radix-ui/react-tabs` já é dependência). Aba padrão: **Faturas**.

### Contrato de Dados (`src/shared/types/index.ts` — sem prefixo `I`)

```typescript
export type StatusFaturamento = "rascunho" | "faturado"; // "recebido" = PRD-007
export type TipoItemFaturamento = "hora_maquina" | "por_metro" | "mobilizacao";

export interface FaturamentoItem {
  id: string;
  tipo: TipoItemFaturamento;
  descricao: string;                    // "Escavadeira CAT 320D 18t — 18h operada"
  origem_id: string | null;             // equipamento_id (hora) / preco_mobilizacao_id (mob.) / null
  hora_tipo: "seca" | "operada" | null; // só hora_maquina (default "operada")
  quantidade: number;                   // horas, metros ou 1 (mobilização)
  valor_unitario: number | null;        // null = SEM PREÇO ativo cadastrado (pendência)
  valor_total: number;                  // round2(quantidade × valor_unitario); 0 se sem preço
  sem_preco: boolean;
}

export interface Faturamento {
  id: string;
  numero: string;                       // "FAT-2026-0042"
  os_id: string;                        // FK → OrdemServico
  cliente_id: string;                   // FK → Cliente
  modelo_cobranca: ModeloCobranca;      // herdado da OS (exibição)
  itens: FaturamentoItem[];
  desconto: number;                     // R$ subtraído do subtotal (≥ 0)
  valor_total: number;                  // soma(itens) − desconto
  observacao: string | null;
  status: StatusFaturamento;
  gerado_em: string;                    // ISO — rascunho criado
  faturado_em: string | null;           // ISO — confirmado
  created_at: string;
  updated_at: string;
}
```

`tem_pendencia` (algum item `sem_preco`) é **derivado** por helper — não armazenado. `Faturamento.valor_total` e `FaturamentoItem.valor_total` são armazenados (espelham o schema futuro) e recalculados a cada mutação pela store.

### Motor de Cálculo — `src/features/faturamento/calculo.ts` (puro, testável)

Math em **centavos** para exatidão (RNF-001 — sem erro de arredondamento; 2 casas):

- `round2(reais): number` — arredonda para 2 casas via inteiros (`Math.round(reais * 100) / 100`).
- `valorItem(quantidade, valorUnitario): number` — `round2(quantidade × valorUnitario)`.
- `precoHoraDoEquipamento(equipamento, precosHM): PrecoHoraMaquina | null` — busca ativo por `equipamento_id`; senão por `tipo_equipamento`; senão `null`.
- `precoFundacaoDoDiametro(diametro, precosFund): PrecoFundacao | null` — busca ativo por `diametro_broca_mm`.
- `gerarItens(os, apontamentos, equipamentos, precosHM, precosFund): FaturamentoItem[]`:
  - **hora_maquina:** agrupa apontamentos *finalizados* da OS por `equipamento_id`, soma `horas_trabalhadas`; para cada equipamento, busca preço → `hora_tipo: "operada"`, `valor_unitario = valor_hora_operada`. Sem preço ativo → `sem_preco: true`, `valor_unitario: null`, `valor_total: 0`.
  - **por_metro:** 1 item de `os.metragem_executada × valor_metro(os.diametro_broca_mm)`. Sem metragem ou sem preço → `sem_preco`/0.
- `aplicarHoraTipo(item, equipamento, precosHM, tipo): FaturamentoItem` — re-busca o preço e devolve item com `hora_tipo`, `valor_unitario` (seca/operada), `valor_total` e `descricao` atualizados.
- `calcularValorTotal(itens, desconto): number` — `round2(soma(item.valor_total) − desconto)`.
- `temPendencia(fat): boolean` — `fat.itens.some(i => i.sem_preco)`.

Pendência **sinaliza, não bloqueia** (princípio do PRD): o rascunho é gerado mesmo com itens sem preço; o total os trata como 0 e a UI marca a pendência. Confirmar com pendência é permitido, mas com aviso explícito.

### Numeração — `src/features/faturamento/numero-faturamento.ts`

`proximoNumeroFAT(faturamentos: Pick<Faturamento,"numero">[], ano: number): string` → `FAT-AAAA-NNNN` (maior NNNN do ano + 1, base 0001). Espelha `numero-os.ts`.

### Derivações — `src/features/faturamento/derivacoes.ts`

- `faturamentoDaOS(osId, faturamentos): Faturamento | null`.
- `osFechadasSemFaturamento(ordens, faturamentos): OrdemServico[]` — `status === "fechada"` e sem fatura nenhuma. Popula "Aguardando faturamento".
- `resumoPipeline(ordens, faturamentos): { executado: number; faturado: { qtd: number; total: number }; recebido: 0 }` — para os 3 cartões. **Semântica:** `executado` = OS fechadas ainda **não confirmadas** (sem fatura **ou** fatura em rascunho); `faturado` = faturas `status === "faturado"` (quantidade + soma `valor_total`); `recebido` = 0 (placeholder PRD-007).

### Store — `src/features/faturamento/faturamentos-store.ts`

`useSyncExternalStore` singleton (Faturamento não tem `ativo` → não usa `createMockStore`; segue `ordensStore`):

- `listar()`, `obter(id)`, `useTodos()`, `useFaturamento(id)`.
- `gerarDeOS(os, apontamentos, equipamentos, precosHM, precosFund): Faturamento` — monta itens, número (`proximoNumeroFAT`), `status: "rascunho"`, `gerado_em`, `valor_total`; persiste e retorna.
- `atualizar(id, patch)` — edita itens/desconto/observação; recalcula `valor_total`; `updated_at`.
- `confirmar(id): ResultadoConfirmar` — `rascunho → faturado`, `faturado_em`. Guard: erro se já `faturado`. Pendência não bloqueia (aviso é da UI).

### Componentes — `src/features/faturamento/components/`

| Componente | Papel |
|------------|-------|
| `faturas-tab.tsx` | Pipeline + aguardando + lista (conteúdo da aba Faturas) |
| `analise-tab.tsx` | Dashboard de gráficos extraído do antigo route (aba Análise) |
| `faturamento-pipeline.tsx` | 3 cartões: Executado / Faturado / Recebido* |
| `aguardando-faturamento.tsx` | OS fechadas sem fatura → botão "Gerar" |
| `faturas-list.tsx` | Tabela (nº, cliente, OS, valor, status) + filtros status/cliente/período (RF-010) |
| `faturamento-detalhe.tsx` | Editor (rascunho) / leitura (faturado); Confirmar |
| `faturamento-item-row.tsx` | Linha de item editável (qtd, valor, toggle seca/operada, remover) |
| `labels.tsx` | `StatusFaturamentoBadge`, rótulos |

**Fluxo principal:**
```
[OS fechada] → aba Faturas → "Aguardando faturamento" → "Gerar"
   → gerarDeOS (rascunho derivado) → /admin/faturamento/$id (editor)
   → revisa/ajusta (itens, mobilização, desconto, obs.) → "Confirmar" → faturado
```

## Mocks (coerentes com a origem)

`src/mocks/faturamentos.ts` (novo) + **append aditivo** em `ordens-servico.ts` e `apontamentos.ts` (novas OS fechadas + apontamentos; **não altera entradas existentes**, mantém os testes do PRD-002/003 válidos quanto às entradas já asseridas). Horas/metros batem com os apontamentos.

| Fatura | OS origem (status fechada) | Apontamentos | Caso de borda |
|--------|----------------------------|--------------|---------------|
| `fat-001` faturado | os-003 (existente, hora_maquina) | ap-002 (eq-002, 18h) | single equipamento |
| `fat-002` rascunho | os-007 (nova, hora_maquina) | 2 apont. (eq-001 + eq-002) | multi-equipamento + **mobilização** |
| `fat-003` rascunho | os-008 (nova, hora_maquina) | 1 apont. em equip. **sem preço ativo** | item **"sem preço"** |
| `fat-004` faturado | os-009 (nova, por_metro Ø300) | — (metragem na OS) | por metro |
| *(sem fatura)* | os-010 (nova, hora_maquina, fechada) | 1 apont. | popula "Aguardando faturamento" |

Os mocks viram `seed.sql` no backend; manter `snake_case` e mesmos campos do contrato.

## Estados de Tela

| Tela | Loading | Empty | Error | Success |
|------|---------|-------|-------|---------|
| Lista de Faturas | skeleton | "Nenhum faturamento ainda" | mensagem + retry | tabela status/valor |
| Aguardando faturamento | skeleton | "Nenhuma OS fechada aguardando" | — | cards + "Gerar" |
| Detalhe/Rascunho | skeleton | — (notFound se id inválido) | mensagem + retry | itens + total + Confirmar |
| Pipeline | — | "Nada executado ainda" | — | 3 colunas |

## Requisitos cobertos

RF-001 (gerar rascunho da OS fechada — via tela), RF-002 (itens por apontamento/metro, tarifa operada+toggle seca), RF-003 (total), RF-004 (mobilização), RF-005 (itens detalhados), RF-006 (ajustar), RF-007 (confirmar → faturado), RF-008 (lista), RF-009 (pipeline), RF-010 (filtros), RF-011 (barreira). RNF-001..005.

## Testes

- **Vitest puro (node):** `calculo.test.ts` (exatidão, agrupamento por equipamento, sem-preço, seca↔operada, desconto, por_metro), `numero-faturamento.test.ts`, `derivacoes.test.ts`, `faturamentos.test.ts` (coerência mock × apontamentos/preços).
- **Gate:** `npx tsc --noEmit` (EXIT 0, autoritativo) + `npm test`. Tarefas de rota validadas por **SSR smoke** (curl em `:8082`).
- `npm run lint` = ruído pré-existente de CRLF — **não é gate**.

## Fora de Escopo

Recebimento/baixa (PRD-007), nota fiscal/impostos (futuro), gateway boleto/PIX (PRD-008), backend Supabase/RLS, qualquer exibição financeira no operador, faturamento parcial.
