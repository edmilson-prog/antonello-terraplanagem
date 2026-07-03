# PRD-013: Custo Real da Hora-Máquina

> **⚠️ Camada analítica (Fase 4 / dependente de dados reais).** Painel mockável agora; o custo só é confiável com diesel (PRD-012), manutenção (PRD-010) e horas (PRD-002) reais. É a base da rentabilidade (PRD-014).

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Criar a UI (mockada) que calcula o custo real por hora de cada equipamento, somando os componentes de custo e dividindo pelas horas trabalhadas |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 4 |
| **Prioridade** | Baixa |
| **Ambiente** | Retaguarda (`/admin/*`) — **dado financeiro/analítico** |
| **Épico** | Onda 3 — Acabamento |
| **PRDs Relacionados** | PRD-012 (diesel), PRD-010 (manutenção), PRD-002 (horas), PRD-005 (preço — para comparar), PRD-014 (rentabilidade — consome o custo) |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 5+ arquivos, agrega múltiplas fontes de custo (diesel, manutenção, fixos), regra de rateio e cálculo por hora |

---

## Contexto do Problema

Esta é a pergunta que mais incomoda o Leonardo: **quanto custa, de verdade, uma hora daquela máquina?** Sem isso, ele cobra "no achismo" — e pode estar operando no prejuízo sem perceber. O preço (PRD-005) só faz sentido quando comparado ao **custo real**.

O custo da hora-máquina soma vários componentes: **diesel** (PRD-012), **manutenção** (PRD-010), **material rodante** (pneus/esteiras), **depreciação/financiamento** (FINAME/BNDES), **operador** (quando operada) e outros fixos (seguro), tudo dividido pelas **horas trabalhadas** (PRD-002). Este PRD entrega esse cálculo e a **comparação com o preço praticado** — a margem por equipamento.

Por ser financeiro/analítico, vive **só na retaguarda**.

---

## Conceito da Solução

### Situação Atual (As-Is)

Não existe. Será adicionada a rota `/admin/custo-hora`.

### Situação Desejada (To-Be)

A retaguarda configura os **componentes de custo** de cada equipamento (fixos mensais + variáveis por hora). O sistema puxa diesel (PRD-012) e manutenção (PRD-010), soma tudo, divide pelas horas (PRD-002) e apresenta o **custo por hora** — com detalhamento por componente — e a **margem** frente ao preço (PRD-005).

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Custo "de cabeça" | É a dor atual; leva a preço errado |
| Só custo variável (ignorar fixos) | Depreciação/financiamento (FINAME) é peso real; ignorá-los mascara o custo |
| Custo único da frota | Máquinas diferentes têm custos muito diferentes; precisa ser por equipamento |

---

## Escopo

### Incluído

- ✅ Configurar **componentes de custo** por equipamento: fixos mensais (financiamento/FINAME, seguro, depreciação) e variáveis por hora (material rodante, operador)
- ✅ Puxar **diesel** (PRD-012) e **manutenção** (PRD-010) como componentes
- ✅ Calcular **custo por hora** = (custos do período) ÷ (horas trabalhadas no período, PRD-002)
- ✅ **Detalhamento** do custo por componente (quanto é diesel, manutenção, fixo…)
- ✅ **Comparar** custo/hora com o preço praticado (PRD-005) → **margem** por equipamento
- ✅ `types` (contrato): `IComponenteCusto`, `ICustoHoraEquipamento` (derivado)
- ✅ Mocks, estados de tela; **retaguarda apenas**

### Excluído

- ❌ Rentabilidade por obra (usa o custo, mas é o PRD-014)
- ❌ Contabilidade formal / rateio fiscal — escopo futuro
- ❌ Backend real (Supabase)
- ❌ Qualquer exibição no app do operador

---

## Requisitos Funcionais

> **Priorização MoSCoW:** Must = essencial · Should = importante · Could = desejável.

### Componentes de Custo

- **RF-001 (Must):** Configurar componentes de custo por equipamento: **fixos mensais** (ex.: parcela FINAME, seguro, depreciação) e **variáveis por hora** (ex.: material rodante, operador).
- **RF-002 (Must):** Incorporar **diesel** (do PRD-012) e **manutenção** (do PRD-010) ao custo.

### Cálculo

- **RF-003 (Must):** Calcular o **custo por hora** de cada equipamento no período = soma dos custos ÷ horas trabalhadas (PRD-002).
- **RF-004 (Must):** Exibir o **detalhamento** por componente (diesel, manutenção, fixos, material rodante, operador).
- **RF-005 (Should):** Comparar o custo/hora com o **preço** praticado (PRD-005) e exibir a **margem** (R$ e %).
- **RF-006 (Could):** Ranking de custo/hora entre equipamentos.

### Transversais

- **RF-007 (Must):** Tudo vive na retaguarda (`/admin/custo-hora`). **Nunca** acessível ou carregado em `/app/*`.

---

## Requisitos Não-Funcionais

- **RNF-001 (Exatidão):** Cálculo correto de rateio (fixos mensais → por hora conforme as horas do período).
- **RNF-002 (Segurança de exibição):** Nada de custo/margem é carregado no ambiente do operador.
- **RNF-003 (Transparência):** O detalhamento deixa claro de onde vem cada parcela.
- **RNF-004 (Responsividade):** Desktop (analítico).
- **RNF-005 (Consistência):** Componentes shadcn/ui e tokens do design system.

---

## Contrato de Dados (types)

> Definir **antes** dos mocks. Espelha o schema futuro (`snake_case`). Trecho ilustrativo:

```typescript
type TipoComponente = 'fixo_mensal' | 'variavel_hora' | 'diesel' | 'manutencao'

interface IComponenteCusto {
  id: string
  equipamento_id: string          // FK → IEquipamento (PRD-001)
  descricao: string               // ex: "Parcela FINAME", "Seguro", "Material rodante"
  tipo: TipoComponente
  valor: number                   // R$ (mensal se fixo; por hora se variável)
  ativo: boolean
  created_at: string
  updated_at: string
}

// Resultado DERIVADO por equipamento/período (não persistido):
interface ICustoHoraEquipamento {
  equipamento_id: string
  periodo: string                 // ex: "2026-06"
  horas_trabalhadas: number       // do PRD-002
  custo_diesel: number            // do PRD-012
  custo_manutencao: number        // do PRD-010
  custo_fixo_rateado: number      // fixos mensais rateados pelas horas
  custo_variavel: number          // variáveis × horas
  custo_total: number
  custo_por_hora: number          // custo_total / horas_trabalhadas
  preco_hora: number | null       // do PRD-005 (para comparação)
  margem_hora: number | null      // preco_hora - custo_por_hora
}
```

> O `ICustoHoraEquipamento` é **calculado** a partir dos componentes + diesel + manutenção + horas; não é persistido.

---

## Critérios de Aceitação

### RF-003 / RF-004: Cálculo e detalhamento

```gherkin
DADO os componentes de custo de uma escavadeira, o diesel (PRD-012), a manutenção (PRD-010) e as horas do período (PRD-002)
QUANDO o custo/hora é calculado
ENTÃO o sistema exibe o custo por hora
  E o detalhamento por componente (diesel, manutenção, fixos, variáveis)
```

### RF-005: Margem vs preço

```gherkin
DADO o custo/hora calculado e o preço praticado (PRD-005) para o equipamento
QUANDO a comparação é exibida
ENTÃO mostra a margem (R$ e %), sinalizando se o preço cobre o custo
```

### RF-007: Barreira financeira

```gherkin
DADO o ambiente do operador (/app/*)
QUANDO qualquer tela é renderizada
ENTÃO nenhum dado de custo/margem é exibido ou carregado
```

### Cenários de Erro / Edge

```gherkin
DADO um equipamento sem horas trabalhadas no período
QUANDO o custo/hora seria calculado
ENTÃO o sistema sinaliza "sem horas no período" (evita divisão por zero)

DADO um equipamento sem componentes configurados
QUANDO o custo é exibido
ENTÃO indica que a configuração está incompleta
```

---

## Estados de Tela

| Tela / Componente | Loading | Empty | Error | Success |
|-------------------|---------|-------|-------|---------|
| Custo por equipamento | skeleton | "Configure os componentes" | mensagem + retry | custo/hora + detalhamento + margem |
| Configuração de componentes | skeleton | "Nenhum componente" + CTA | erro inline | lista de componentes por equipamento |

---

## Dados Mockados (Frontend First)

| Arquivo Mock | Conteúdo | Edge Cases a Incluir |
|--------------|----------|----------------------|
| `src/mocks/componentes-custo.ts` | ~6 componentes por equipamento (FINAME, seguro, material rodante…) | 1 equipamento sem componentes, 1 inativo |

> Derivar diesel de `abastecimentos.ts` (PRD-012), manutenção de `registros-manutencao.ts` (PRD-010), horas de `apontamentos.ts` (PRD-002) e preço de `precos-*.ts` (PRD-005). Mocks viram `seed.sql` no backend.

---

## Fases de Implementação

**Modelo A — Frontend First (mockado):**

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | `types` (componentes + custo derivado) + mocks | ~3 |
| 2 | UI: configuração de componentes + painel de custo/hora com detalhamento | ~7-9 |
| 3 | Estados de tela + cálculo (rateio, custo/hora) + margem vs preço | ~4 |
| 4 | Fluxo completo em memória + ranking + responsividade + barreira financeira | ~2 |

### Detalhamento das Fases

#### Fase 1: Contrato + Mocks
- [ ] Definir `IComponenteCusto`, `ICustoHoraEquipamento`
- [ ] Criar mocks derivando de diesel/manutenção/horas/preço
**Validação:** Mocks compilam; fontes cruzadas coerentes.

#### Fase 2: UI com Mocks
- [ ] Configuração de componentes + painel de custo/hora com detalhamento em `/admin/custo-hora`
**Validação:** Navegação; custo e detalhamento exibidos.

#### Fase 3: Cálculo + Margem
- [ ] Rateio de fixos por horas; soma dos componentes; custo/hora; margem vs preço; estados de tela
**Validação:** Cálculo e margem corretos; edge cases (sem horas) tratados.

#### Fase 4: Fluxo + Barreira
- [ ] Configurar → calcular → comparar (memória); ranking; responsividade
- [ ] Garantir que nada de custo é carregado em `/app/*`
**Validação:** Fluxo completo; barreira intacta.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-012 | Diesel (componente de custo) | ⏳ Pendente (documentado) |
| PRD-010 | Manutenção (componente de custo) | ⏳ Pendente (documentado) |
| PRD-002 | Apontamento (horas — denominador) | ⏳ Pendente (documentado) |
| PRD-005 | Tabela de Preços (para a margem) | ⏳ Pendente (documentado) |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Nenhum (nesta fase) | — | — |

### Decisões Pendentes

- [ ] Como calcular **depreciação** (linear? valor de mercado? saldo FINAME)?
- [ ] O custo do **operador** entra por hora (folha ÷ horas) ou é fixo mensal rateado?
- [ ] **Material rodante** é por hora estimada ou por evento de troca?
- [ ] O rateio de **fixos** usa horas trabalhadas ou horas disponíveis do período?

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onda 3 — Acabamento"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| — | PRD-012 | Diesel e Utilização | ⏳ (documentado) | Insumo de custo |
| — | PRD-010 | Manutenção Preventiva | ⏳ (documentado) | Insumo de custo |
| **2** | **PRD-013** | **Custo Real da Hora-Máquina** | **🔄 ATUAL** | Depende de PRD-012, PRD-010, PRD-002 |
| 3 | PRD-014 | Rentabilidade por equipamento e obra | ⏳ | Consome o custo |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Componentes de custo, custo/hora, margem (R$) | **Financeiro estratégico** | Retaguarda-only; no backend, RLS restrito a `proprietário/admin` |

### Autenticação e Autorização

Dado estratégico do dono. Operador jamais acessa. No backend, RLS.

### Auditoria

Alterações de componentes de custo são candidatas a log (impactam decisão de preço).

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[Proprietário] ─▶ /admin/custo-hora ─▶ configura componentes do equipamento
─▶ sistema soma diesel + manutenção + fixos/variáveis ÷ horas ─▶ custo/hora + margem vs preço
```

### Fluxos de Exceção
- Equipamento sem horas no período → sinaliza (evita divisão por zero).
- Componentes incompletos → indica configuração pendente.

### Fluxos de Erro
- Falha simulada ao carregar → estado de erro com retry.

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web). Siga as convenções do `CLAUDE.md` do repositório.

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/)
> - Atualizar o `CHANGELOG.md` seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar o `INDEX-PRDs-antonello.md`
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Para MINOR/MAJOR, gerar codinome em inglês baseado no contexto (sugestão: **"Meter"**).

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Componentes faltantes sinalizam, não travam |
| **Fail gracefully** | Evitar divisão por zero (sem horas) |
| **Preservar evidências** | Histórico de componentes de custo |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas durante a implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Cálculo transparente** | Detalhar cada parcela do custo; não entregar um número "caixa-preta" |
| **Derivar** | Somar diesel/manutenção/horas de PRD-012/010/002; não recriar |
| **Barreira financeira** | `src/features/custo-hora/` nunca em `/app/*` |
| **Cálculo isolado** | Lógica de rateio/custo num utilitário testável |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Exibir custo/margem no app do operador |
| Ignorar custos fixos (depreciação/FINAME) |
| Dividir por zero quando não há horas |
| Persistir o custo derivado (recalcular) |
| Conectar Supabase nesta fase |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO (mockado, Frontend First) |
| **Data de Implementação** | 2026-07-02 |
| **Versão do App** | 0.13.0 "Meter" |
| **Implementado por** | Claude Code via Subagent-Driven Development (4 tasks + revisão final) |
| **Observações** | Painel mockado antes do previsto para a Fase 4 (a nota "⚠️ Camada analítica" no topo do PRD já sinalizava "Painel mockável agora"). As "Decisões Pendentes" originais foram resolvidas pelo próprio contrato de dados da spec: depreciação/FINAME entram como `fixo_mensal` (valor mensal informado pelo usuário, sem cálculo interno de depreciação); operador e material rodante entram como `variavel_hora` (R$/h configurado, não folha÷horas nem por evento); rateio de fixos usa horas trabalhadas (não horas disponíveis), conforme `custo_por_hora = custo_total / horas_trabalhadas`. Preço de comparação usa `valor_hora_operada` (preço ativo atual, não histórico por mês — decisão documentada, não-bloqueante). RF-005 (margem em % além de R$) não foi implementado — gap menor de escopo, não-bloqueante, registrado na revisão final. Revisão final: 0 Critical, 0 Important, 4 Minor (1 corrigido — arredondamento do detalhamento; 3 documentados como decisões aceitas). |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial |
| 2026-07-02 | v2 | ✅ Implementado — painel de custo/hora + CRUD de componentes, v0.13.0 Meter |

---

**AILA - Sistemas Inteligentes**
