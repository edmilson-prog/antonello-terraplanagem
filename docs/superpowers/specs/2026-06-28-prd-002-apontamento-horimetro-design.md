# PRD-002 — Apontamento de Horímetro (Operador) · Design

> Spec derivado do `docs/prds/PRD-002-op-apontamento-horimetro.md`, refinado em brainstorming.
> Convenções de código/UI: ver `CLAUDE.md` do repositório (não repetidas aqui).

**Objetivo:** Entregar a UI mockada do apontamento de campo — o operador lê o horímetro do equipamento ao iniciar e ao finalizar o trabalho, e o sistema calcula as horas. Primeira captura de dado real da operação.

**Ambiente:** App do Operador (`/app/*`), mobile-first, alto contraste, **sem nenhum dado financeiro**.

**Fase do projeto:** Frontend First (mockado). Sem Supabase, sem upload real, sem engine de sync.

---

## Decisões de design (fechadas no brainstorming)

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | OS embutida no fluxo atual de `/app/ordens` vs. apontamento novo | **Manter separado.** Apontamento é feature standalone com `os_id` opcional; o fluxo de horímetro embutido na OS fica como está; o PRD-003 reconcilia (OS agrega apontamentos). |
| 2 | Múltiplos apontamentos `em_andamento` ao mesmo tempo | **Permitir vários** (equipamentos diferentes). Sem regra de bloqueio — YAGNI, a regra ainda não foi validada com o cliente. |
| 3 | Captura por foto/OCR (RF-003, "Could") | **Simulado e plugável.** Botão "Foto do horímetro" simula a leitura (delay + valor mock) e mostra em campo editável; camada isolada com flag liga/desliga. Sem lib de OCR real. |

### Desvios deliberados do texto literal do PRD (com justificativa)

- **Nome do type sem prefixo `I`.** O codebase usa `Equipamento`/`Operador`/`OrdemServicoOperador` (sem `I`), e o PRD-001 seguiu essa convenção. Usamos **`Apontamento`** (não `IApontamento`). Consistência com o código vence o exemplo ilustrativo do PRD.
- **Seletor de OS reaproveita o mock `ordensOperador`** em vez de criar `src/mocks/obras.ts`. O mock de OS já existe e traz `numero`/`obra`/`cliente_nome`; criar um `obras.ts` paralelo duplicaria dados que tendem a divergir (DRY). O `os_id` do apontamento referencia ids reais como `"os-1042"`.
- **Operador logado por constante.** A sessão mock (`SessaoMock`) guarda só `{ perfil, nome }`, sem `operador_id`. Definimos `OPERADOR_LOGADO_ID = "op-001"` (José Carlos da Silva — mesmo operador assumido pelo mock de OS) para filtrar "Meus apontamentos". Quando o backend chegar, isso vem da sessão autenticada.

---

## Contrato de Dados (types)

Adicionar em `src/shared/types/index.ts` (espelha o schema futuro em `snake_case`):

```typescript
export type StatusApontamento = "em_andamento" | "finalizado";

export interface Apontamento {
  id: string;
  equipamento_id: string;           // FK → Equipamento (PRD-001)
  operador_id: string;              // FK → Operador (PRD-001) — quem apontou
  os_id: string | null;             // FK → OS (PRD-003) — opcional nesta fase
  horimetro_inicial: number;        // horas, 1 casa decimal (ex.: 1234.5)
  horimetro_final: number | null;   // null enquanto em andamento
  horas_trabalhadas: number | null; // calculado: round1(final - inicial)
  foto_inicial_url: string | null;  // evidência (mock nesta fase)
  foto_final_url: string | null;
  observacao: string | null;
  status: StatusApontamento;
  pendente_sync: boolean;           // afford. de offline (só visual nesta fase)
  iniciado_em: string;              // ISO 8601
  finalizado_em: string | null;
  created_at: string;
  updated_at: string;
}
```

`Apontamento` **não** estende a `Entidade` do `createMockStore` (que exige `ativo`/soft-delete). O ciclo de vida do apontamento é `status: em_andamento → finalizado`, então ele usa um **store dedicado** (ver abaixo).

---

## Arquitetura

### Store dedicado — `src/features/apontamento/apontamentos-store.ts`

Espelha o padrão de `src/features/operador/ordens-store.ts`: módulo em memória com `useSyncExternalStore`, refletindo mudanças em todas as telas que leem a lista. **Não** usa `createMockStore` (incompatível com o shape do apontamento).

API:

```typescript
// leitura
listarApontamentos(): Apontamento[]
obterApontamento(id: string): Apontamento | undefined
useApontamentos(): Apontamento[]                          // reativo
useApontamento(id: string): Apontamento | undefined       // reativo
apontamentosDoOperador(operadorId: string): Apontamento[] // filtro derivado

// mutação de domínio
iniciarApontamento(input: {
  equipamento_id: string;
  horimetro_inicial: number;
  os_id?: string | null;
  observacao?: string | null;
  foto_inicial_url?: string | null;
}): Apontamento                                            // cria status "em_andamento", pendente_sync: true

finalizarApontamento(id: string, input: {
  horimetro_final: number;
  foto_final_url?: string | null;
}): { ok: true; apontamento: Apontamento }
  | { ok: false; erro: "nao_encontrado" | "ja_finalizado" | "final_menor_que_inicial" }
```

- `iniciarApontamento` define `operador_id = OPERADOR_LOGADO_ID`, `iniciado_em`/`created_at`/`updated_at = agora`, `status = "em_andamento"`, `horimetro_final/horas_trabalhadas/finalizado_em = null`, `pendente_sync = true`.
- `finalizarApontamento` valida `horimetro_final ≥ horimetro_inicial`; calcula `horas_trabalhadas = calcularHoras(inicial, final)`; define `status = "finalizado"`, `finalizado_em = agora`, `pendente_sync = true`. Retorna resultado discriminado para a UI tratar o erro de inconsistência sem exceções.
- `OPERADOR_LOGADO_ID = "op-001"` exportado do módulo (comentado como ponto de troca para a sessão real).

### Cálculo de horas — `src/features/apontamento/calcular-horas.ts`

```typescript
calcularHoras(inicial: number, final: number): number  // round1(final - inicial); evita drift de float
```

Pura, testável. Arredonda para 1 casa decimal (ex.: `1208.5 - 1200.0 = 8.5`; `1208.3 - 1200.1 = 8.2`).

### Validação — `src/features/apontamento/apontamento-schema.ts`

Zod (mesmo stack do PRD-001), lógica pura testável:

- `iniciarApontamentoSchema`: `equipamento_id` obrigatório (string não vazia); `horimetro_inicial` número finito ≥ 0; `os_id` opcional; `observacao` opcional (máx. ~280 chars).
- `finalizarApontamentoSchema`: `horimetro_final` número finito ≥ 0. A regra `final ≥ inicial` depende do valor inicial (cross-field), então é validada no store/com `superRefine` recebendo o inicial via contexto, ou checada na UI antes do submit usando o retorno discriminado do store. **Fonte da verdade da regra `final ≥ inicial`: o store** (`finalizarApontamento`), para garantir consistência mesmo fora do form.

### OCR simulado e plugável — `src/shared/lib/ocr.ts`

Camada isolada (o PRD exige "ligar/desligar conforme a viabilidade"):

```typescript
export const OCR_HABILITADO = true;  // flag única de liga/desliga

// Simula leitura: delay ~1.2s e retorna um valor plausível, ou rejeita
// (erro simulado) para exercitar o fallback manual.
export async function lerHorimetroDaFoto(arquivo: File | Blob): Promise<number>
```

Sem dependência de lib de OCR. Quando o backend/serviço real existir, troca-se só esta implementação.

---

## Componentes compartilhados (extraídos para `src/shared/`)

- **`components/horimetro-capture.tsx`** — campo de horímetro reutilizado para inicial e final. Input numérico grande em fonte mono (IBM Plex Mono, ampliado), `inputMode="decimal"`, passo de 0,1. Quando `OCR_HABILITADO`, exibe botão "Foto do horímetro" (`<input type="file" accept="image/*" capture="environment">`) que chama `lerHorimetroDaFoto`, mostra spinner durante a leitura, e despeja o valor lido **no mesmo input editável** para conferência. Se a leitura falhar, exibe aviso "Não foi possível ler — digite manualmente" e mantém o campo livre. Props controladas (`value`, `onChange`) + `onFotoCapturada?(url)` para registrar a evidência.
- **`components/sync-badge.tsx`** — badge "Pendente de sincronização" (ícone + texto), exibido quando `pendente_sync`. Afford. visual de offline; sem lógica de sync.

---

## Rotas & Fluxos (telas full-screen — melhor para campo/uma mão)

Sub-rotas full-screen (não dialogs), porque o form de iniciar é rico e o PRD exige forte usabilidade de campo (uma mão, alvos ≥ 44px, leitura sob sol).

| Rota | Arquivo | Tela |
|------|---------|------|
| `/app/apontamento` | `src/routes/app.apontamento.tsx` | **Lista "Meus apontamentos"** — substitui o placeholder atual. |
| `/app/apontamento/novo` | `src/routes/app.apontamento.novo.tsx` | **Iniciar apontamento.** |
| `/app/apontamento/$apontamentoId` | `src/routes/app.apontamento.$apontamentoId.tsx` | **Detalhe / Finalizar.** |

### Lista "Meus apontamentos" (`/app/apontamento`)

- Filtra por `OPERADOR_LOGADO_ID`. Duas seções: **Em andamento** (cards com badge `pendente_sync` quando aplicável e botão *Finalizar* que navega ao detalhe) e **Recentes / finalizados** (read-only, mostram horas trabalhadas).
- CTA primário fixo/destacado: *Iniciar apontamento* → `/app/apontamento/novo`.
- Estados: **loading** (skeleton de cards via `useMockResource`), **empty** ("Nenhum apontamento ainda" + CTA "Iniciar apontamento"), **error** (mensagem + "Tentar novamente"), **success**.

### Iniciar (`/app/apontamento/novo`)

- Campos: seletor de **equipamento** (somente `ativo`, vindo de `equipamentosStore`/mock), **horímetro inicial** (`HorimetroCapture`), **OS opcional** (seletor com as OS do operador a partir de `ordensOperador` — rótulo `numero — obra`; opção "Sem OS"), **observação** (textarea curta).
- Confirmar: valida (`iniciarApontamentoSchema`) → `iniciarApontamento(...)` → toast de sucesso → volta à lista. Botão grande, ao alcance do polegar, com spinner durante o "salvar".
- Pré-preenche o horímetro inicial sugerido com o `horimetro_atual` do equipamento selecionado (editável) — conveniência de campo.

### Detalhe / Finalizar (`/app/apontamento/$apontamentoId`)

- `loader` lança `notFound()` se o id não existir (padrão da rota de OS).
- Resumo read-only: equipamento, OS (se houver), horímetro inicial (mono, ampliado), observação, `iniciado_em`, badge `pendente_sync`.
- Se `status === "em_andamento"`: seção **Finalizar** com `HorimetroCapture` para o horímetro final. Ao confirmar: chama `finalizarApontamento`; se `ok: false, erro: "final_menor_que_inicial"`, **bloqueia** e exibe aviso de inconsistência (não navega); se `ok`, mostra as horas calculadas, toast de sucesso e passa a read-only.
- Se `status === "finalizado"`: mostra `horimetro_final`, `horas_trabalhadas` (destaque mono) e `finalizado_em`.

---

## Dados Mockados — `src/mocks/apontamentos.ts`

~6 apontamentos espelhando o schema (`snake_case`), reusando `equipamento_id` válidos (`eq-001`..`eq-007`, todos `ativo`) e `os_id` válidos (`os-1042`, `os-1039`...). Edge cases obrigatórios:

- 1 `em_andamento` (sem `horimetro_final`).
- ≥2 `finalizado` com `horas_trabalhadas` coerentes.
- 1 **sem `os_id`** (apontamento avulso).
- 1 com **observação longa**.
- 1 com **`pendente_sync: true`**.
- 1 de **outro operador** (`op-002`) — prova que o filtro "Meus apontamentos" o exclui.

A maioria com `operador_id = "op-001"` para popular a lista do operador logado. Reutiliza `equipamentos.ts`/`operadores.ts`/`ordens-operador.ts` (não duplica).

---

## Estados de Tela (resumo)

| Tela | Loading | Empty | Error | Success |
|------|---------|-------|-------|---------|
| Lista | skeleton de cards | "Nenhum apontamento ainda" + CTA "Iniciar" | mensagem + "Tentar novamente" | seções em andamento + recentes |
| Captura (foto/OCR) | spinner durante leitura | — | "Não foi possível ler — digite manualmente" | valor lido em campo editável |
| Iniciar / Finalizar | botão com spinner | — | toast de erro / aviso de inconsistência, mantém dados | toast de sucesso + volta/atualiza |

Loading/error são simulados (delays/toggles) via `useMockResource`, como no PRD-001.

---

## Testes (híbrido — vitest na lógica pura + visual na UI)

**vitest:**
- `calcular-horas`: subtração com decimais, arredondamento a 1 casa, diferença zero.
- `apontamento-schema`: equipamento obrigatório; horímetro inicial inválido (negativo/NaN); observação acima do limite; caminho feliz.
- `apontamentos-store`: `iniciarApontamento` cria `em_andamento` com `pendente_sync` e aparece na lista; `finalizarApontamento` calcula horas + marca `finalizado`; rejeita `final < inicial` (`erro: "final_menor_que_inicial"`); rejeita id inexistente e já finalizado; `apontamentosDoOperador` filtra por operador.
- `ocr`: `lerHorimetroDaFoto` resolve número quando habilitado (plugável).

**Visual (navegador, dev server):** 3 telas em 375px e 768px — estados (loading/empty/error/success), contraste, alvos ≥ 44px, fluxo iniciar → finalizar → ver na lista, captura com OCR simulado + edição manual, ausência total de dado financeiro.

---

## Fora de escopo (explícito)

- Motor real de offline/sync e resolução de conflito (**PRD-000 / PRD-003**). `pendente_sync` é só visual.
- Gestão completa da OS (abrir/fechar/colaborar) — **PRD-003**. Aqui `os_id` é vínculo opcional.
- Qualquer dado financeiro no `/app/*`.
- Backend real (Supabase), upload real de fotos, lib de OCR real.
- Edição/exclusão de apontamentos de outros operadores.
- Refatorar o fluxo de horímetro embutido na OS (`/app/ordens`).

---

## Pós-implementação

- Versão **MINOR** → **`0.2.0`**, codinome **"Tally"** (registro de horas).
- `CHANGELOG.md`: seção `[0.2.0]` com **Added** (apontamento, captura de horímetro, OCR simulado, lista "Meus apontamentos", badge de pendência) e **Changed** (types estendidos com `Apontamento`).
- Renomear `docs/prds/PRD-002-op-apontamento-horimetro.md` → `..._DONE.md`; atualizar a seção "Status de Implementação".
- Atualizar `docs/prds/INDEX-PRDs-antonello.md` (PRD-002 → ✅, recomputar resumo).
