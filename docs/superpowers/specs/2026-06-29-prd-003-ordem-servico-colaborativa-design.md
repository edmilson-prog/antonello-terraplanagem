# PRD-003 — Ordem de Serviço Colaborativa · Design

> Spec de implementação (Frontend First / mockado). Reconcilia o modelo de OS legado
> (`OrdemServicoOperador`) com o modelo **colaborativo** do PRD-003 (`OrdemServico`).
> Convenções: `CLAUDE.md`. Decisão de sync: `ADR-001`.

| Campo | Valor |
|-------|-------|
| PRD | `docs/prds/PRD-003-all-ordem-servico-colaborativa.md` |
| Ambiente | Transversal — operador (`/app/ordens`) + retaguarda (`/admin/ordens`) |
| Versão alvo | 0.3.0 → **0.4.0** · codinome **"Worksite"** |
| Depende de | PRD-000 (ADR-001 ✅), PRD-001 (clientes ✅), PRD-002 (apontamentos ✅) |

---

## 1. Decisões (brainstorming)

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Detalhe da OS no operador | **Colaborativo** — cabeçalho + lista de apontamentos (dele + colegas) + total de horas derivado. Ação = **"Apontar nesta OS"** (abre o fluxo do PRD-002 com a OS pré-preenchida). Operador **não fecha**. Remove o "Iniciar turno / Finalizar OS" legado (horímetro direto na OS). |
| 2 | "Minhas OS" do operador | OS onde **tem ≥1 apontamento dele OU é o `responsavel_id`**. |
| 3 | Fechar OS | **Exclusivo da retaguarda** (ADR-001). Bloqueado se houver apontamento `em_andamento` na OS (RF-012). |
| 4 | Criar OS | **Só retaguarda** (RF-001). |

## 2. Desvios conscientes / Reconciliação

Este PRD é o ponto de reconciliação que o PRD-002 adiou. Mudanças de modelo:

| Ação | Detalhe |
|------|---------|
| **Remove** | `OrdemServicoOperador`, `OrdemStatus` (types); `src/features/operador/ordens-store.ts`; `src/features/operador/status-ordem-badge.tsx`; `src/mocks/ordens-operador.ts` |
| **Adiciona** | `OrdemServico`, `StatusOS` (`aberta\|em_andamento\|fechada`), `ModeloCobranca` (`hora_maquina\|por_metro`); feature `src/features/ordem-servico/` |
| **Reconcilia (PRD-002)** | `src/mocks/apontamentos.ts` (remapeia `os_id` para as novas OS + liga `ap-006` à OS colaborativa); `iniciar-apontamento-form.tsx` (seletor de OS lê o novo store + pré-preenchimento `?os=`); `apontamento-detalhe.tsx` (lookup da OS no novo store); `app.apontamento.novo.tsx` (`validateSearch` para `os`) |

Outros desvios: **types sem prefixo `I`** (consistência com `Equipamento`/`Apontamento`/`PrecoHoraMaquina`); status terminal **`fechada`** (não `concluida`); cliente por **`cliente_id`** (FK), não `cliente_nome` denormalizado (resolve nome via `clientes` mock).

## 3. Contrato de dados (`src/shared/types/index.ts`)

```typescript
export type ModeloCobranca = "hora_maquina" | "por_metro";
export type StatusOS = "aberta" | "em_andamento" | "fechada";

export interface OrdemServico {
  id: string;
  numero: string;                     // "OS-2026-0042"
  cliente_id: string;                 // FK → Cliente (PRD-001)
  obra_nome: string;
  endereco: string | null;
  modelo_cobranca: ModeloCobranca;
  status: StatusOS;                   // ciclo de vida (aberta/em_andamento/fechada)
  responsavel_id: string | null;      // FK → Operador
  observacao: string | null;
  metragem_executada: number | null;  // modelo por_metro
  diametro_broca_mm: number | null;   // modelo por_metro
  aberta_em: string;                  // ISO 8601
  fechada_em: string | null;
  pendente_sync: boolean;             // afordância de offline (visual)
  created_at: string;
  updated_at: string;
}
```

> A OS **não** guarda valores em R$ nem equipamento/operador/horímetro. Total de horas
> e status efetivo são **derivados** dos apontamentos vinculados.

## 4. Derivações (`src/features/ordem-servico/derivacoes.ts` — puro + testável)

```typescript
// total de horas = soma de horas_trabalhadas dos apontamentos finalizados da OS
totalHorasOS(osId: string, apontamentos: Apontamento[]): number

// status para exibição: fechada > (em_andamento se há apontamento) > status armazenado
statusEfetivoOS(os: OrdemServico, apontamentos: Apontamento[]): StatusOS

// pode fechar? bloqueia se já fechada ou se há apontamento em_andamento na OS
podeFecharOS(os: OrdemServico, apontamentos: Apontamento[]):
  { pode: true } | { pode: false; motivo: string }

// "minhas OS": responsável OU tem apontamento meu
ordensDoOperador(ordens: OrdemServico[], apontamentos: Apontamento[], operadorId: string): OrdemServico[]

// apontamentos vinculados a uma OS (helper de UI)
apontamentosDaOS(osId: string, apontamentos: Apontamento[]): Apontamento[]
```

Regra de `statusEfetivoOS`: `fechada` se `os.status==="fechada"`; senão `em_andamento` se
há ≥1 apontamento na OS; senão `os.status` (cobre `por_metro` autorado `em_andamento` sem
apontamento). Isso satisfaz RF-011 sem acoplar os dois stores.

## 5. Store (`src/features/ordem-servico/ordens-store.ts`)

Dedicado (padrão `useSyncExternalStore`, como `apontamentos-store` — `OrdemServico` não
tem `ativo`, logo não usa `createMockStore`). API:
`listar/obter/useTodas/useOrdem`, `criar(data)`, `atualizar(id, patch)`,
`fechar(id, apontamentos)` → resultado discriminado `{ok:true,ordem} | {ok:false,motivo}`
(reusa `podeFecharOS`). `OPERADOR_LOGADO_ID` reusado de apontamentos (`op-001`).

## 6. Numeração (`numero-os.ts`, puro + testável)

`proximoNumeroOS(ordens, ano): string` → `OS-${ano}-${seq+1 zero-pad 4}`, onde `seq` é o
maior sufixo numérico existente no mesmo ano (senão 0). Ex.: `OS-2026-0045`.

## 7. Estrutura de arquivos

```
src/shared/types/index.ts                 (remove legado; adiciona OrdemServico/StatusOS/ModeloCobranca)
src/features/ordem-servico/
├── derivacoes.ts + derivacoes.test.ts
├── numero-os.ts + numero-os.test.ts
├── ordens-store.ts
├── ordem-schema.ts + ordem-schema.test.ts
├── labels.ts                             (STATUS_OS_LABEL, MODELO_LABEL, StatusOSBadge, ModeloBadge)
├── components/
│   ├── apontamentos-da-os.tsx            (lista de apontamentos da OS — compartilhada, SEM R$)
│   ├── ordem-resumo-card.tsx             (cabeçalho da OS — compartilhado)
│   ├── ordens-operador-page.tsx          (/app/ordens — "Minhas OS")
│   ├── ordem-detalhe-operador.tsx        (/app/ordens/$id — colaborativo + "Apontar nesta OS")
│   ├── ordens-retaguarda-page.tsx        (/admin/ordens — lista + Nova OS)
│   ├── ordem-form.tsx                    (criar/editar OS — retaguarda)
│   └── ordem-detalhe-retaguarda.tsx      (/admin/ordens/$id — detalhe + fechar + editar)
└── index.ts                              (barrel)
src/mocks/ordens-servico.ts               (6 OS)
src/mocks/apontamentos.ts                 (MODIFY — remapeia os_id)
src/features/apontamento/components/iniciar-apontamento-form.tsx  (MODIFY — OS source + ?os=)
src/features/apontamento/components/apontamento-detalhe.tsx       (MODIFY — OS lookup)
src/routes/app.apontamento.novo.tsx       (MODIFY — validateSearch os)
src/routes/app.ordens.index.tsx           (REWRITE)
src/routes/app.ordens.$ordemId.tsx        (REWRITE)
src/routes/admin.ordens.tsx               (REMOVE → vira index + $ordemId)
src/routes/admin.ordens.index.tsx         (CREATE)
src/routes/admin.ordens.$ordemId.tsx      (CREATE)
src/features/operador/ordens-store.ts     (REMOVE)
src/features/operador/status-ordem-badge.tsx (REMOVE)
src/mocks/ordens-operador.ts              (REMOVE)
```

## 8. Telas

**Operador (`/app/ordens`, mobile-first):**
- Lista "Minhas OS" (cards): número, cliente (nome via mock), obra, `StatusOSBadge` (efetivo), `SyncBadge` se `pendente_sync`. Busca + filtro de status. Vínculo via `ordensDoOperador`.
- Detalhe colaborativo: cabeçalho (número/cliente/obra/endereço/status), **total de horas** (hora_maquina) ou metragem (por_metro), lista de apontamentos (dele + colegas — nome do operador + equipamento + horas, `SyncBadge`), botão **"Apontar nesta OS"** → `/app/apontamento/novo?os=<id>`. **Sem fechar, sem valores.**

**Retaguarda (`/admin/ordens`, desktop):**
- Lista (`DataList`): número, cliente, obra, modelo, status efetivo, total de horas. Filtro por status/cliente. Botão **"Nova OS"** (FormDialog → `OrdemForm`).
- `OrdemForm`: cliente (Select de clientes ativos), obra, endereço, modelo, responsável, observação; (por_metro) metragem + diâmetro. Numeração automática.
- Detalhe: cabeçalho + apontamentos agregados + total + **"Fechar OS"** (bloqueia com motivo se RF-012) + **editar** (obra/observação enquanto não fechada, RF-005).

## 9. Barreira financeira (RF-014)

A OS não possui campos R$ (valores são PRD-004), então o operador é naturalmente
value-free. `apontamentos-da-os.tsx` e os componentes compartilhados **não** importam nada
financeiro. Verificação por grep no fim (mesma da PRD-005, estendida): nada de
`features/precos|mocks/precos|brlExato|formatBRL` em `/app/*`; e os componentes de OS do
operador não renderizam valor.

## 10. Mocks (`src/mocks/ordens-servico.ts`) + remapeamento

6 OS reusando `cl-001..cl-004` / `op-001..op-002`:

| id | numero | cliente | modelo | status(armaz.) | resp. | pend_sync | apontamentos | demonstra |
|----|--------|---------|--------|------|------|-----------|--------------|-----------|
| os-001 | OS-2026-0042 | cl-001 | hora_maquina | aberta | op-001 | false | ap-001(op-001,em_and.) + ap-006(op-002,final.) | **colaborativa**; status efetivo → em_andamento; bloqueia fechar |
| os-002 | OS-2026-0041 | cl-002 | hora_maquina | aberta | op-001 | **true** | — | aberta sem apontamentos + pendente_sync |
| os-003 | OS-2026-0039 | cl-003 | hora_maquina | fechada | op-001 | false | ap-002(op-001,final.) | fechada |
| os-004 | OS-2026-0037 | cl-001 | hora_maquina | aberta | op-001 | false | ap-004(op-001,final.) | em_andamento; **pode fechar** |
| os-005 | OS-2026-0044 | cl-004 | por_metro | em_andamento | op-002 | false | — | por_metro (metragem 120 / Ø400) |
| os-006 | OS-2026-0040 | cl-002 | por_metro | aberta | op-002 | false | — | por_metro sem metragem (Ø300) |

Remapeamento em `apontamentos.ts`: `ap-001` os-1042→**os-001**, `ap-002` os-1039→**os-003**,
`ap-004` os-1037→**os-004**, `ap-006` null→**os-001** (torna a os-001 colaborativa).
`ap-003`/`ap-005` seguem `null`. `apontamentos.test.ts` continua verde (não asserta os_id).

## 11. Testes (vitest, pura lógica)

- `derivacoes.test.ts` — totalHorasOS (só finalizados), statusEfetivoOS (fechada/derivado/armazenado), podeFecharOS (bloqueio por em_andamento e por já-fechada), ordensDoOperador (responsável OU apontamento), apontamentosDaOS.
- `numero-os.test.ts` — próximo número por ano, zero-pad, lista vazia.
- `ordem-schema.test.ts` — campos obrigatórios; por_metro exige diâmetro; hora_maquina ignora metragem.
- `ordens-servico` mock: invariantes (cliente_ids válidos, ≥1 colaborativa, ≥1 fechada, ≥1 por_metro).

Componentes/rotas: gate `tsc --noEmit` + smoke SSR (:8082).

## 12. Bookkeeping

`package.json` 0.3.0→0.4.0; `CHANGELOG` `## [0.4.0] - 2026-06-29 - Worksite`; PRD-003
`_DONE` + status; INDEX (implementados 4→5, PRD-003 ✅, recálculo). PRD-002 não muda de
versão (já estava `_DONE`); registro a reconciliação no CHANGELOG (Changed).

## 13. Fora de escopo

Motor real de sync/offline (ADR-001 + backend); cálculo de valores/faturamento (PRD-004);
dashboards/KPIs (placeholders seguem); comprovante assinado (PRD-011); WhatsApp (PRD-009).

## 14. Gate

`npx tsc --noEmit` (EXIT 0, autoritativo) + `npm test`. `npm run lint` é ruído CRLF — não é gate.
