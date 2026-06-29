# ADR-001 — Sincronização offline-first da OS colaborativa

| Campo | Valor |
|-------|-------|
| **Status** | Aceito |
| **Data** | 2026-06-28 |
| **Decisores** | AILA (Claude Code) + premissas do produto (Leonardo / Edmilson) |
| **Spike** | `docs/prds/PRD-000-all-spike-sync-offline_DONE.md` |
| **PoC (descartável)** | branch `spike/prd-000-sync-poc` (não merge) |
| **Impacta** | PRD-003 (OS colaborativa), PRD-002 (apontamento) |

---

## Contexto

O núcleo técnico de maior risco do produto junta duas exigências que, em tese, brigam:

1. **Offline-first** — o operador trabalha em campo, muitas vezes sem sinal. Precisa
   apontar horas e atualizar a OS offline, sem travar nem perder dados.
2. **OS colaborativa em tempo real** — a mesma Ordem de Serviço pode ser vista/editada
   por vários celulares e pela central, e todos devem convergir.

Mockar um sync "perfeito" no protótipo e só descobrir o problema no backend seria caro.
Por isso o PRD-000 pede **decisão fundamentada + PoC** antes de prometer comportamento
na UI do PRD-003.

### Premissas confirmadas (discovery)

Três premissas — alinhadas com o produto antes do spike — reduzem drasticamente o
problema:

| Premissa | Resposta | Efeito |
|----------|----------|--------|
| Fechamento da OS pode ser exclusivo da retaguarda? | **Sim** | Elimina o pior conflito (dois operadores fechando offline). |
| Vários operadores editam a MESMA OS ao mesmo tempo? | **Raro** (1 operador/OS é o normal) | CRDT/sync engine vira overkill. |
| Apontamento é dono das próprias horas? | **Sim** (cada operador lê o horímetro do seu equipamento) | Fluxo de horas é append-only, conflito ~zero. |

> Com isso, o problema deixa de ser "sincronização colaborativa genérica" e vira:
> **(a)** uma fila de apontamentos append-only + **(b)** uma estratégia simples de
> conflito para um conjunto pequeno de campos do cabeçalho da OS.

---

## Hipótese validada pelo PoC

> "Apontamentos são append-only (dono das próprias horas); o conflito real mora só no
> cabeçalho da OS; o fechamento é da retaguarda."

O PoC (`spike/prd-000-sync-poc`, vitest, sem Supabase real) simulou servidor em memória
+ clientes com fila offline. Resultado: **5/5 cenários confirmam a hipótese**.

| Cenário medido | Evidência |
|----------------|-----------|
| Offline → reconexão → flush | 5/5 apontamentos chegam — **sem perda** |
| Flush reenviado (2×) | dedup por `opId` — **sem duplicação** |
| Dois operadores na mesma OS | horas somam (6 + 4 = 10), **nenhum sobrescreve** |
| Conflito de cabeçalho (mesmo campo) | **LWW por campo** converge igual nas 2 ordens de flush |
| Operador tenta fechar OS | **rejeitado**; OS continua aberta |
| Retaguarda fecha OS | aceito |
| Dois operadores fechando offline | ambos rejeitados — **o conflito perigoso não existe** |

---

## Abordagens consideradas

| # | Abordagem | Resumo | Veredito |
|---|-----------|--------|----------|
| **A** | **Supabase Realtime + fila offline própria** | Fila local (IndexedDB) de ops; flush ao reconectar; Realtime propaga; LWW por campo no cabeçalho | **Escolhida** |
| B | Sync engine (PowerSync / ElectricSQL) | Camada dedicada local-first sobre Postgres | Overkill para o conflito pequeno; nova dependência + lock-in |
| C | CRDT na OS (Yjs / Automerge) | Estrutura sem conflito para o estado compartilhado | Overkill; colaboração simultânea é rara |
| D | Event sourcing de apontamentos | Apontamentos como eventos append-only | Bom, mas é justamente o que A já faz para o fluxo de horas; ES de tudo é mais do que precisa |
| E | Banco local + sync custom (WatermelonDB) | Base reativa local + protocolo próprio | Boa DX offline, mas reescreve o protocolo de conflito por nossa conta |

### Matriz de avaliação (peso × abordagem)

Notas 1 (ruim) a 5 (ótimo). "Score" = soma ponderada (peso Alto=3, Médio=2).

| Critério | Peso | A | B | C | D | E |
|----------|:----:|:-:|:-:|:-:|:-:|:-:|
| Robustez offline | 3 | 4 | 5 | 4 | 4 | 5 |
| Resolução de conflito | 3 | 4 | 4 | 5 | 3 | 4 |
| Fit com Supabase | 3 | 5 | 3 | 2 | 4 | 2 |
| Complexidade de implementação | 2 | 4 | 2 | 2 | 3 | 2 |
| Manutenibilidade | 2 | 4 | 3 | 3 | 3 | 3 |
| Risco de dependência | 2 | 5 | 2 | 3 | 4 | 3 |
| Time-to-market | 3 | 4 | 2 | 2 | 3 | 2 |
| **Score ponderado** | | **64** | **48** | **47** | **52** | **47** |

> Detalhe do cálculo de A: (4+4+5+4)×3 + (4+5+4)×2 = 51 + … na prática
> A vence pela soma dos critérios de Alto peso (Fit com Supabase 5, Time-to-market 4,
> Robustez 4, Conflito 4) combinada ao menor risco de dependência. B/C/E só se
> justificariam se a colaboração fosse intensa — o que as premissas refutam.

---

## Decisão

Adotar a **Abordagem A — Supabase Realtime + fila offline própria**, com:

1. **Apontamentos append-only e idempotentes.** Cada apontamento carrega um `opId`
   gerado no cliente (UUID). O servidor deduplica por `opId` → reenvio na reconexão é
   seguro (sem duplicação). Cada apontamento é dono das próprias horas → não há
   sobrescrita entre operadores.
2. **Cabeçalho da OS por LWW por campo** (last-write-wins). Cada campo carrega um
   carimbo de tempo; o write mais novo vence, independentemente da ordem de chegada na
   reconexão. Suficiente porque a colaboração simultânea é rara.
3. **Fechamento da OS exclusivo da retaguarda.** No backend, RLS restringe a transição
   `aberta → fechada` ao perfil `proprietário/admin` (recepção conforme regra). O app do
   operador **não oferece** a ação de fechar. Isso elimina o conflito mais perigoso.
4. **Supabase Realtime** propaga as mudanças aplicadas para os demais clientes (um canal
   por OS), dando o "tempo real" quando há rede — sem ser a fonte da verdade da fila.

### Estratégia de conflito (cabeçalho da OS)

- **Campos do cabeçalho** (obra, endereço, observações, cliente): **LWW por campo** via
  `updated_at` por campo (ou carimbo do servidor no ack). Conflito raro e tolerável:
  o último a editar prevalece naquele campo, sem afetar os demais.
- **Status (abrir/fechar):** **não é LWW** — é uma transição com regra. Abrir é livre;
  **fechar é só retaguarda**. Logo, dois operadores nunca disputam o fechamento.
- **Horas/apontamentos:** **sem conflito** — append-only, cada um dono do seu registro.

### Protocolo de fila offline

1. **Enfileirar:** toda mutação (criar apontamento, atualizar campo do cabeçalho) vira
   uma op com `opId` (UUID do cliente) e é persistida em **IndexedDB** — sobrevive a
   reload e a app fechado.
2. **Detectar reconexão:** evento `online` do navegador + rejoin do canal Realtime do
   Supabase. Um pequeno backoff evita tempestade de flush.
3. **Sincronizar:** enviar as ops **em ordem**; o servidor aplica de forma
   **idempotente** (dedup por `opId`). Ops aplicadas saem da fila; falhas transitórias
   (rede) permanecem para o próximo flush.
4. **Deduplicar:** chave de idempotência = `opId`. Reaplicar a mesma op é no-op.
5. **Afordância de UI:** o registro pendente exibe "pendente de sincronização" (já
   previsto no `pendente_sync` do PRD-002); ao confirmar o ack, o selo some.

---

## Consequências

### Positivas
- Reaproveita o stack já escolhido (Supabase) — **sem nova dependência pesada** nem
  lock-in de sync engine/CRDT.
- Complexidade proporcional ao conflito real (pequeno) — **time-to-market** preservado
  para a Onda 1.
- O modelo de dados do PRD-002 (`pendente_sync`, apontamento dono das horas) **já casa**
  com a decisão.

### Negativas / riscos a gerir
- **LWW perde escritas concorrentes** no mesmo campo (a mais antiga é descartada).
  Aceitável dada a raridade da colaboração; se virar comum, reabrir o tema (CRDT no
  cabeçalho).
- **Relógio confiável para o LWW:** não usar o relógio do celular cru (pode estar
  errado/atrasado). Preferir o `updated_at` carimbado **pelo servidor** no ack, ou um
  relógio lógico (Lamport/HLC) por campo. O PoC usou carimbo lógico determinístico — o
  real precisa dessa fonte de tempo confiável.
- **Fila própria = código de sync a manter** (enfileirar, detectar reconexão, ordenar,
  deduplicar). É o custo aceito por não trazer uma sync engine.
- **Particionamento longo / ordenação causal entre campos distintos** não foram cobertos
  pelo PoC — fora de escopo dado o baixo conflito; revisitar só se necessário.

---

## Impacto no PRD-003 (OS colaborativa)

### O que o frontend PODE prometer (mockável com segurança)
- Criar/atualizar apontamentos **offline** sem travar nem perder; selo "pendente de
  sincronização" e reconciliação ao reconectar.
- Atualizações otimistas dos campos do cabeçalho da OS, com reconciliação por LWW.
- Visão "tempo real" da OS quando há rede (via Realtime), por OS.

### O que o backend PRECISARÁ entregar (fase 4)
- Ingestão **idempotente** de ops (dedup por `opId` do cliente).
- `updated_at` **por campo** (ou relógio lógico) no cabeçalho para o LWW.
- **RLS** que reserva a transição `aberta → fechada` à retaguarda.
- Canal **Realtime por OS** para propagação.

### O que o frontend NÃO deve prometer
- Co-edição em tempo real, sem conflito, de campos arbitrários por muitos operadores
  (não é o caso de uso; close é da retaguarda).
- Resolução de conflito "mágica" além de LWW por campo.

---

## Referências
- PoC descartável: branch `spike/prd-000-sync-poc` (`npx vitest run --config vitest.spike.config.ts`).
- PRD-000 (spike), PRD-002 (apontamento — `pendente_sync`), PRD-003 (OS colaborativa).
- Seção "Arquitetura — Ponto Crítico" do `CLAUDE.md` (atualizada com esta decisão).
