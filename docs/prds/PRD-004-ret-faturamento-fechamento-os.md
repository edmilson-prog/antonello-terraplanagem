# PRD-004: Faturamento ao Fechar OS

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Criar a UI (mockada) que transforma uma OS fechada em faturamento: aplica os preços às horas/metros e materializa o pipeline executado → faturado |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 4 |
| **Prioridade** | Média |
| **Ambiente** | Retaguarda (`/admin/*`) — **dado financeiro** |
| **Épico** | Onda 1 — Fundação |
| **PRDs Relacionados** | PRD-003 (OS fechada — origem), PRD-005 (preços — aplicados), PRD-007 (contas a receber — estágio "recebido", Onda 2) |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 5+ arquivos, regra de negócio de cálculo (preço × horas/metros), cruza duas entidades (OS + preços) e inaugura o pipeline de cobrança |

---

## Contexto do Problema

Este é o **PRD que fecha o argumento de ROI** do projeto. Hoje o serviço é executado, mas a nota só sai dias depois — quando alguém junta os papéis, calcula as horas e aplica o preço. Esse atraso trava o caixa.

O Leonardo distingue três estágios: serviço **executado**, **faturado** e **recebido**. Eles não são a mesma coisa, e ele precisa enxergar cada um. Este PRD entrega o salto do **executado → faturado**: ao fechar uma OS (PRD-003), o sistema aplica os preços (PRD-005) às horas e metros apontados e gera o faturamento — em minutos, não dias. (O estágio **recebido** é a Onda 2, PRD-007.)

Como lida com valores em R$, vive **exclusivamente na retaguarda**. O operador nunca vê nada disso.

---

## Conceito da Solução

### Situação Atual (As-Is)

Não existe. Será adicionada a rota `/admin/faturamento`.

### Situação Desejada (To-Be)

Ao fechar uma OS, o sistema **gera automaticamente um faturamento em rascunho**: monta os itens a partir dos apontamentos (horas por equipamento) ou da metragem (fundação), aplica os preços do PRD-005 e calcula o total. A retaguarda **revisa, ajusta se preciso e confirma** ("faturado"). Uma visão de pipeline mostra o que está executado, faturado e (futuramente) recebido.

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Calcular tudo manualmente fora do sistema | É exatamente a dor atual (atraso e erro) |
| Faturar sem etapa de revisão | O dono quer conferir antes de emitir — ajustes acontecem |
| Só um "log" de serviços | O cliente precisa de **pipeline** (executado/faturado/recebido), não de um log |
| Mostrar o faturamento ao operador | Viola a barreira financeira |

---

## Escopo

### Incluído

- ✅ **Gerar faturamento (rascunho)** a partir de uma OS fechada, com itens calculados
- ✅ Aplicar preços do PRD-005: hora-máquina (seca/operada) e por metro (por diâmetro)
- ✅ Incluir **mobilização** quando aplicável
- ✅ **Revisar/ajustar** o rascunho e **confirmar** ("faturado")
- ✅ Listar faturamentos e exibir **visão de pipeline** (executado → faturado → recebido*)
- ✅ `types` (contrato): `IFaturamento`, `IFaturamentoItem` (+ `StatusFaturamento`)
- ✅ Mocks, estados de tela, validações; **retaguarda apenas**

\* "recebido" entra como **estágio visível** no pipeline, mas sua gestão é o PRD-007 (Onda 2).

### Excluído

- ❌ Gestão de recebimento / contas a receber (baixa de pagamento) — **PRD-007**
- ❌ Emissão de **nota fiscal** e cálculo de impostos — escopo futuro / a definir
- ❌ Gateway de cobrança (boleto/PIX) — **PRD-008**
- ❌ Backend real (Supabase); RLS (fase de backend)
- ❌ Qualquer exibição financeira no app do operador

---

## Requisitos Funcionais

> **Priorização MoSCoW:** Must = essencial · Should = importante · Could = desejável.

### Geração e Cálculo

- **RF-001 (Must):** Ao fechar uma OS (PRD-003), gerar um faturamento em **rascunho** vinculado a ela.
- **RF-002 (Must):** Montar itens a partir dos apontamentos: para `hora_maquina`, agrupar horas por equipamento e aplicar a tarifa (seca/operada); para `por_metro`, aplicar valor por metro do diâmetro.
- **RF-003 (Must):** Calcular `valor_total` = soma dos itens (+ mobilização, se houver).
- **RF-004 (Should):** Permitir **incluir mobilização/desmobilização** no faturamento.

### Revisão e Confirmação

- **RF-005 (Must):** Exibir o rascunho com itens detalhados (descrição, quantidade, valor unitário, total).
- **RF-006 (Should):** Permitir **ajustar** itens (corrigir quantidade/valor, remover/adicionar item) antes de confirmar.
- **RF-007 (Must):** **Confirmar** o faturamento, mudando o status de `rascunho` para `faturado`.

### Listagem e Pipeline

- **RF-008 (Must):** Listar faturamentos com cliente, OS de origem, valor e status.
- **RF-009 (Should):** Exibir uma **visão de pipeline** com os estágios **executado → faturado → recebido** (recebido como estágio futuro, PRD-007).
- **RF-010 (Could):** Filtrar faturamentos por status, cliente e período.

### Transversais

- **RF-011 (Must):** Toda a tela vive na retaguarda (`/admin/faturamento`). **Nunca** acessível ou carregada em `/app/*`.

---

## Requisitos Não-Funcionais

- **RNF-001 (Exatidão):** O cálculo deve ser exato (sem erro de arredondamento perceptível); valores em R$ com 2 casas.
- **RNF-002 (Segurança de exibição):** Nenhum dado de faturamento é importado/renderizado no ambiente do operador.
- **RNF-003 (Rastreabilidade):** O faturamento mantém vínculo claro com a OS e os apontamentos de origem.
- **RNF-004 (Responsividade):** Funciona em desktop e mobile (tabela → cards).
- **RNF-005 (Consistência):** Componentes shadcn/ui e tokens do design system.

---

## Contrato de Dados (types)

> Definir **antes** dos mocks. Espelha o schema futuro (`snake_case`). Trecho ilustrativo:

```typescript
type StatusFaturamento = 'rascunho' | 'faturado'   // 'recebido' é gerido no PRD-007

interface IFaturamentoItem {
  id: string
  descricao: string            // ex: "Escavadeira CAT 320 — 8.5h operada"
  tipo: ModeloCobranca         // 'hora_maquina' | 'por_metro'
  quantidade: number           // horas ou metros
  valor_unitario: number       // R$/h ou R$/m (do PRD-005)
  valor_total: number          // quantidade × valor_unitario
}

interface IFaturamento {
  id: string
  numero: string               // legível, ex: "FAT-2026-0042"
  os_id: string                // FK → IOrdemServico (PRD-003)
  cliente_id: string           // FK → ICliente (PRD-001)
  itens: IFaturamentoItem[]
  valor_total: number          // soma dos itens (+ mobilização)
  status: StatusFaturamento
  observacao: string | null
  gerado_em: string            // ISO 8601 (rascunho criado)
  faturado_em: string | null   // quando confirmado
  created_at: string
  updated_at: string
}
```

> O faturamento **deriva** da OS + apontamentos + preços. Não recria horas nem preços — referencia e aplica.

---

## Critérios de Aceitação

### RF-001 / RF-002 / RF-003: Gerar faturamento de uma OS

```gherkin
DADO uma OS "hora_maquina" fechada, com apontamentos somando 8.5h de uma escavadeira operada
  E um preço operada cadastrado para essa escavadeira
QUANDO a OS é fechada
ENTÃO é gerado um faturamento em rascunho com um item "8.5h operada"
  E o valor do item = 8.5 × valor_hora_operada
  E o valor total reflete a soma dos itens
```

### RF-002 (por metro): Modelo fundação

```gherkin
DADO uma OS "por_metro" fechada, com 30 metros executados em broca de 400mm
  E um preço por metro cadastrado para 400mm
QUANDO o faturamento é gerado
ENTÃO o item reflete 30 × valor_metro(400mm)
```

### RF-007: Confirmação

```gherkin
DADO um faturamento em rascunho revisado
QUANDO a retaguarda confirma
ENTÃO o status muda para "faturado"
  E o faturamento passa a constar como "faturado" no pipeline
```

### RF-011: Barreira financeira (segurança)

```gherkin
DADO o ambiente do operador (/app/*)
QUANDO qualquer tela é renderizada
ENTÃO nenhum dado de faturamento é exibido ou carregado
```

### Cenários de Erro / Edge

```gherkin
DADO uma OS fechada cujo equipamento não tem preço cadastrado
QUANDO o faturamento é gerado
ENTÃO o item correspondente é sinalizado como "sem preço"
  E o total indica pendência até a tarifa ser definida

DADO que não há faturamentos
QUANDO a retaguarda abre /admin/faturamento
ENTÃO é exibido empty state explicativo
```

---

## Estados de Tela

| Tela / Componente | Loading | Empty | Error | Success |
|-------------------|---------|-------|-------|---------|
| Lista de Faturamentos | skeleton | "Nenhum faturamento ainda" | mensagem + retry | tabela com status/valor |
| Detalhe / Rascunho | skeleton | — | mensagem + retry | itens detalhados + total + ação confirmar |
| Visão Pipeline | skeleton | "Nada executado ainda" | mensagem + retry | colunas executado / faturado / recebido* |

\* coluna "recebido" exibida como estágio futuro (PRD-007).

---

## Dados Mockados (Frontend First)

| Arquivo Mock | Conteúdo | Edge Cases a Incluir |
|--------------|----------|----------------------|
| `src/mocks/faturamentos.ts` | ~5 faturamentos (mix `hora_maquina` e `por_metro`) | 1 `rascunho`, 1 `faturado`, 1 com mobilização, 1 com item "sem preço", 1 multi-equipamento |

> Derivar dos mocks de `ordens-servico.ts` (PRD-003), `apontamentos.ts` (PRD-002) e `precos-*.ts` (PRD-005), mantendo coerência (as horas/metros batem com os apontamentos). Mocks viram `seed.sql` no backend.

---

## Fases de Implementação

**Modelo A — Frontend First (mockado):**

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | `types` (`IFaturamento`, `IFaturamentoItem`) + mocks coerentes com OS/apontamentos/preços | ~3 |
| 2 | UI: geração do rascunho a partir da OS, detalhe com itens, lista e visão pipeline | ~8-10 |
| 3 | Estados de tela + cálculo + casos "sem preço" + confirmação (rascunho → faturado) | ~4 |
| 4 | Fluxo completo em memória (fechar OS → gerar → revisar → confirmar) + responsividade + barreira "nada no operador" | ~2 |

### Detalhamento das Fases

#### Fase 1: Contrato + Mocks
**Objetivo:** Definir os types e mocks coerentes.
**Ações:**
- [ ] Definir `IFaturamento`, `IFaturamentoItem`, `StatusFaturamento`
- [ ] Criar `src/mocks/faturamentos.ts` derivando de OS/apontamentos/preços
**Validação:** Mocks compilam; horas/metros batem com os apontamentos de origem.

#### Fase 2: UI com Mocks
**Objetivo:** Telas de faturamento e pipeline.
**Ações:**
- [ ] Geração do rascunho a partir de uma OS fechada
- [ ] Detalhe com itens; lista; visão de pipeline (executado/faturado/recebido*)
**Validação:** Navegação completa; rascunho exibe itens calculados.

#### Fase 3: Cálculo + Estados
**Objetivo:** Lógica de cálculo e estados de tela.
**Ações:**
- [ ] Aplicar preços (seca/operada, por diâmetro); somar total + mobilização
- [ ] Caso "sem preço"; loading/empty/error/success; confirmação rascunho → faturado
**Validação:** Cálculo correto; casos de borda tratados; estados demonstráveis.

#### Fase 4: Fluxo + Barreira
**Objetivo:** Fluxo ponta a ponta e não-vazamento.
**Ações:**
- [ ] Fechar OS → gerar → revisar → confirmar (em memória); responsividade
- [ ] Garantir que nada de faturamento é importado em `/app/*`
**Validação:** Pipeline executado → faturado funciona; nenhuma referência financeira no operador.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-003 | Ordem de Serviço (fonte: OS fechada + apontamentos) | ⏳ Pendente (documentado) |
| PRD-005 | Tabela de Preços (aplicados aos itens) | ⏳ Pendente (documentado) |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Nenhum (nesta fase) | — | Nota fiscal / gateway são escopo futuro (PRD-008) |

### Decisões Pendentes

- [ ] Onde se define **seca × operada** para o cálculo? (na OS, no equipamento da OS, ou por apontamento?)
- [ ] O faturamento emite **nota fiscal**? Há **impostos** a calcular? (define escopo futuro)
- [ ] Pode haver **desconto** ou ajuste manual de valor no faturamento?
- [ ] **Faturamento parcial** (faturar parte de uma OS longa) é necessário?
- [ ] Numeração do faturamento: formato e origem.

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onda 1 — Fundação"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| — | PRD-003 | Ordem de Serviço Colaborativa | ⏳ (documentado) | Origem (OS fechada) |
| — | PRD-005 | Tabela de Preços | ⏳ (documentado) | Tarifas aplicadas |
| **N** | **PRD-004** | **Faturamento ao Fechar OS** | **🔄 ATUAL** | Depende de PRD-003, PRD-005 |
| N+1 | PRD-007 | Contas a receber (estágio "recebido") | ⏳ | Continua o pipeline (Onda 2) |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Faturamentos e valores (R$) | **Comercial/financeiro sensível** | Retaguarda apenas; no backend, RLS restrito a `proprietário/admin` (recepção conforme política) |

### Autenticação e Autorização

Faturamento é da retaguarda. No backend, RLS garante que o operador jamais acesse; nesta fase, a barreira é por ambiente/rota. Confirmação de faturamento é candidata a exigir perfil `proprietário/admin`.

### Auditoria

`gerado_em`, `faturado_em`, vínculo com OS/apontamentos e o histórico compõem a trilha financeira — base do pipeline executado → faturado → recebido.

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[OS fechada (PRD-003)] ─▶ sistema gera faturamento "rascunho" (itens calculados)
[Retaguarda] ─▶ /admin/faturamento ─▶ revisa itens ─▶ (ajusta se preciso) ─▶ "Confirmar" ─▶ "faturado"
```

### Fluxos de Exceção
- Equipamento sem preço → item sinalizado "sem preço"; total com pendência até a tarifa existir.

### Fluxos de Erro
- Falha simulada ao carregar/gerar → estado de erro com retry.

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

**Codinomes:** Para MINOR/MAJOR, gerar codinome em inglês baseado no contexto (sugestão: **"Invoice"** ou **"Settle"**).

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Casos "sem preço" não impedem gerar o restante do rascunho |
| **Fail gracefully** | Sinalizar pendências em vez de travar |
| **Preservar evidências** | Manter vínculo com OS/apontamentos de origem |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas durante a implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Barreira financeira** | `src/features/faturamento/` nunca é importado em `/app/*` |
| **Derivar, não duplicar** | Itens vêm de apontamentos × preços; não recriar horas/tarifas |
| **Cálculo isolado** | Centralizar a lógica de cálculo num utilitário testável |
| **Pipeline** | Modelar a visão executado → faturado → recebido (recebido como estágio futuro/placeholder) |
| **Contrato primeiro** | Definir os types antes da UI; PRD-007 dá sequência ao pipeline |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Exibir, importar ou renderizar faturamento/valores no app do operador |
| Recriar horas ou preços (derivar de PRD-002/003/005) |
| Implementar recebimento/baixa (é o PRD-007) ou nota fiscal/gateway (PRD-008) |
| Hardcodar valores ou cálculos espalhados |
| Conectar Supabase nesta fase |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Implementado por** | - |
| **Observações** | - |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
