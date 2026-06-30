# PRD-007: Contas a Pagar e Receber

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Criar a UI (mockada) que fecha o pipeline financeiro: acompanhar recebimentos (a partir dos faturamentos) e registrar pagamentos, dando visão de caixa |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 4 |
| **Prioridade** | Média |
| **Ambiente** | Retaguarda (`/admin/*`) — **dado financeiro** |
| **Épico** | Onda 2 — Estrutura |
| **PRDs Relacionados** | PRD-004 (faturamento — origem das contas a receber), PRD-001 (clientes) |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 5+ arquivos, dois domínios (receber e pagar), fecha o pipeline executado → faturado → **recebido** e introduz visão de fluxo de caixa |

---

## Contexto do Problema

O Leonardo separa três estágios — **executado**, **faturado** e **recebido** — e precisa enxergar cada um. A Onda 1 entregou executado → faturado (PRD-004). **Este PRD entrega o estágio que faltava: o recebido**, além da contraparte de saída (o que a empresa precisa pagar).

Sem isso, o sistema sabe quanto foi faturado, mas não quanto **entrou** — e não dá visão de caixa. Aqui a retaguarda acompanha o que cada cliente deve (a receber, vindo dos faturamentos), dá baixa quando recebe, e registra as contas a pagar (diesel, fornecedores, manutenção, folha), fechando o ciclo financeiro do MVP estrutural.

Por lidar com valores, vive **só na retaguarda**.

---

## Conceito da Solução

### Situação Atual (As-Is)

Não existe. O pipeline para em "faturado" (PRD-004). Serão adicionadas rotas em `/admin/financeiro` (a receber / a pagar / caixa).

### Situação Desejada (To-Be)

- **A Receber:** cada faturamento confirmado (PRD-004) gera uma conta a receber; a retaguarda acompanha vencimentos e **dá baixa** ao receber. O pipeline passa a mostrar executado → faturado → **recebido**.
- **A Pagar:** a retaguarda registra contas a pagar (com categoria e vencimento) e dá baixa ao pagar.
- **Caixa:** visão consolidada de entradas (a receber) × saídas (a pagar).

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Só "a receber" (ignorar "a pagar") | Sem saídas não há visão de caixa real |
| Controlar caixa em planilha | Perde o vínculo com faturamento e a automação do pipeline |
| Misturar com o faturamento (PRD-004) | Faturar e receber são estágios distintos; separar mantém o pipeline claro |

---

## Escopo

### Incluído

- ✅ **A Receber:** gerar conta a receber a partir do faturamento (PRD-004); listar; **dar baixa** (recebido) com data e forma
- ✅ **A Pagar:** registrar conta a pagar (descrição, fornecedor, categoria, valor, vencimento); listar; **dar baixa** (pago)
- ✅ Visões por **vencimento** (a vencer / vencidas) em ambos
- ✅ **Caixa:** resumo consolidado a receber × a pagar
- ✅ Pipeline atualizado: executado → faturado → **recebido**
- ✅ `types` (contrato): `IContaReceber`, `IContaPagar` (+ `StatusConta`)
- ✅ Mocks, estados de tela, validações; **retaguarda apenas**

### Excluído

- ❌ **Baixa automática** via gateway (boleto/PIX) — é o **PRD-008**
- ❌ Conciliação bancária / extrato — escopo futuro
- ❌ Relatórios contábeis / DRE — escopo futuro (a inteligência de rentabilidade é a Onda 3)
- ❌ Backend real (Supabase); RLS (fase de backend)
- ❌ Qualquer exibição financeira no app do operador

---

## Requisitos Funcionais

> **Priorização MoSCoW:** Must = essencial · Should = importante · Could = desejável.

### A Receber

- **RF-001 (Must):** Gerar uma **conta a receber** a partir de cada faturamento confirmado (PRD-004), com valor, cliente e vencimento.
- **RF-002 (Must):** Listar contas a receber com cliente, valor, vencimento e status (`aberta`/`liquidada`).
- **RF-003 (Must):** **Dar baixa** (marcar como recebida) informando data e forma de recebimento.
- **RF-004 (Should):** Visões "a vencer" e "vencidas".

### A Pagar

- **RF-005 (Must):** Registrar conta a pagar (descrição, fornecedor, categoria, valor, vencimento).
- **RF-006 (Must):** Listar contas a pagar com status (`aberta`/`liquidada`).
- **RF-007 (Must):** **Dar baixa** (marcar como paga) informando data.
- **RF-008 (Should):** Categorizar a despesa (ex.: diesel, manutenção, folha, fornecedor, outro).

### Caixa e Pipeline

- **RF-009 (Should):** Exibir **resumo de caixa** (total a receber × total a pagar; saldo previsto).
- **RF-010 (Must):** Refletir o estágio **recebido** no pipeline executado → faturado → recebido (continuidade do PRD-004).

### Transversais

- **RF-011 (Must):** Tudo vive na retaguarda (`/admin/financeiro`). **Nunca** acessível ou carregado em `/app/*`.

---

## Requisitos Não-Funcionais

- **RNF-001 (Exatidão):** Somatórios exatos; valores em R$ com 2 casas.
- **RNF-002 (Segurança de exibição):** Nada de financeiro é importado/renderizado no ambiente do operador.
- **RNF-003 (Rastreabilidade):** Conta a receber mantém vínculo com o faturamento de origem.
- **RNF-004 (Responsividade):** Desktop e mobile (tabela → cards).
- **RNF-005 (Consistência):** Componentes shadcn/ui e tokens do design system.

---

## Contrato de Dados (types)

> Definir **antes** dos mocks. Espelha o schema futuro (`snake_case`). Trecho ilustrativo:

```typescript
type StatusConta = 'aberta' | 'liquidada'   // liquidada = recebida (receber) / paga (pagar)
type FormaRecebimento = 'dinheiro' | 'pix' | 'transferencia' | 'boleto' | 'cheque' | 'outro'
type CategoriaDespesa = 'diesel' | 'manutencao' | 'folha' | 'fornecedor' | 'outro'

interface IContaReceber {
  id: string
  faturamento_id: string          // FK → IFaturamento (PRD-004)
  cliente_id: string              // FK → ICliente (PRD-001)
  valor: number
  vencimento: string              // ISO (data)
  status: StatusConta
  recebido_em: string | null
  forma_recebimento: FormaRecebimento | null
  created_at: string
  updated_at: string
}

interface IContaPagar {
  id: string
  descricao: string
  fornecedor: string | null
  categoria: CategoriaDespesa
  valor: number
  vencimento: string              // ISO (data)
  status: StatusConta
  pago_em: string | null
  created_at: string
  updated_at: string
}
```

> A conta a receber **deriva** do faturamento (não recria o valor — referencia). A conta a pagar é entrada manual nesta fase.

---

## Critérios de Aceitação

### RF-001 / RF-003: Receber

```gherkin
DADO um faturamento confirmado (PRD-004) de R$ 5.000 com vencimento definido
QUANDO a conta a receber é gerada e depois recebida
ENTÃO a conta nasce "aberta" vinculada ao faturamento
  E ao dar baixa com data e forma, passa a "liquidada"
  E o pipeline marca o faturamento como "recebido"
```

### RF-005 / RF-007: Pagar

```gherkin
DADO o registro de uma conta a pagar (ex.: diesel, R$ 1.200, vencimento)
QUANDO a retaguarda dá baixa informando a data
ENTÃO a conta passa a "liquidada"
  E sai do total "a pagar" em aberto
```

### RF-009: Caixa

```gherkin
DADO contas a receber e a pagar em aberto
QUANDO a retaguarda abre o resumo de caixa
ENTÃO vê o total a receber, o total a pagar e o saldo previsto
```

### RF-011: Barreira financeira (segurança)

```gherkin
DADO o ambiente do operador (/app/*)
QUANDO qualquer tela é renderizada
ENTÃO nenhum dado financeiro é exibido ou carregado
```

### Cenários de Erro / Edge

```gherkin
DADO que não há contas
QUANDO a retaguarda abre /admin/financeiro
ENTÃO é exibido empty state explicativo em cada aba (a receber / a pagar)

DADO uma conta vencida e em aberto
QUANDO a lista é exibida
ENTÃO a conta é destacada como "vencida"
```

---

## Estados de Tela

| Tela / Componente | Loading | Empty | Error | Success |
|-------------------|---------|-------|-------|---------|
| A Receber | skeleton | "Nenhuma conta a receber" | mensagem + retry | tabela com vencimento/status; vencidas destacadas |
| A Pagar | skeleton | "Nenhuma conta a pagar" + CTA | mensagem + retry | tabela com vencimento/status |
| Resumo de Caixa | skeleton | "Sem movimentações" | mensagem + retry | totais a receber × a pagar + saldo |
| Dar baixa (form) | botão com spinner | — | erro inline | toast de sucesso + status atualizado |

---

## Dados Mockados (Frontend First)

| Arquivo Mock | Conteúdo | Edge Cases a Incluir |
|--------------|----------|----------------------|
| `src/mocks/contas-receber.ts` | ~5 (vinculadas a faturamentos) | 1 `liquidada`, 1 vencida em aberto, 1 a vencer, formas variadas |
| `src/mocks/contas-pagar.ts` | ~5 (categorias variadas) | 1 `liquidada`, 1 vencida, 1 sem fornecedor, categoria diesel/manutenção/folha |

> Contas a receber derivam de `faturamentos.ts` (PRD-004) e `clientes.ts` (PRD-001). Mocks viram `seed.sql` no backend.

---

## Fases de Implementação

**Modelo A — Frontend First (mockado):**

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | `types` (`IContaReceber`, `IContaPagar`) + mocks | ~3 |
| 2 | UI: abas A Receber / A Pagar / Caixa, com listas e baixa | ~8-10 |
| 3 | Estados de tela + vencimentos (destaque vencidas) + cálculo de caixa + baixa | ~4 |
| 4 | Fluxo completo em memória (gerar receber a partir de faturamento → baixar; registrar pagar → baixar) + pipeline recebido + responsividade + barreira "nada no operador" | ~2 |

### Detalhamento das Fases

#### Fase 1: Contrato + Mocks
**Objetivo:** Definir types e mocks.
**Ações:**
- [ ] Definir `IContaReceber`, `IContaPagar`, `StatusConta`, enums de forma/categoria
- [ ] Criar mocks derivando de faturamentos; incluir edge cases
**Validação:** Mocks compilam; contas a receber referenciam faturamentos.

#### Fase 2: UI com Mocks
**Objetivo:** Telas financeiras.
**Ações:**
- [ ] Abas A Receber / A Pagar / Caixa em `/admin/financeiro`; listas e ação de baixa
**Validação:** Navegação completa; baixa reflete na lista.

#### Fase 3: Vencimentos + Caixa
**Objetivo:** Regras de vencimento e consolidação.
**Ações:**
- [ ] Destaque de vencidas; visões a vencer/vencidas; cálculo do resumo de caixa; estados de tela
**Validação:** Vencidas destacadas; caixa correto; estados completos.

#### Fase 4: Fluxo + Pipeline
**Objetivo:** Fluxo ponta a ponta.
**Ações:**
- [ ] Gerar a receber a partir de faturamento → baixar; registrar a pagar → baixar; refletir "recebido" no pipeline; responsividade
- [ ] Garantir que nada financeiro é importado em `/app/*`
**Validação:** Pipeline executado → faturado → recebido completo; barreira intacta.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Faturamento (origem das contas a receber) | ⏳ Pendente (documentado) |
| PRD-001 | Cadastros base (clientes) | ⏳ Pendente (documentado) |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Nenhum (nesta fase) | — | Baixa automática via gateway é o PRD-008 |

### Decisões Pendentes

- [ ] **Vencimento** da conta a receber: prazo padrão (ex.: à vista, 30 dias) ou definido por cliente/faturamento?
- [ ] **Recebimento parcial** (baixa parcial de uma conta) é necessário?
- [ ] Quais **categorias** de despesa o Leonardo usa de fato (validar a lista)?
- [ ] O "a pagar" inclui **folha de pagamento** dos operadores ou só despesas operacionais?

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onda 2 — Estrutura"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| — | PRD-004 | Faturamento ao Fechar OS | ⏳ (documentado) | Origem das contas a receber |
| **N** | **PRD-007** | **Contas a Pagar e Receber** | **🔄 ATUAL** | Depende de PRD-004 |
| N+1 | PRD-008 | Integração gateway de cobrança | ⏳ | Automatiza a baixa do recebido |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Contas, valores, fluxo de caixa (R$) | **Financeiro sensível** | Retaguarda apenas; no backend, RLS restrito a `proprietário/admin` |

### Autenticação e Autorização

Domínio financeiro da retaguarda. Operador jamais acessa. Em Frontend First, barreira por ambiente/rota; RLS no backend.

### Auditoria

`recebido_em`, `pago_em`, vínculo com faturamento, `created_at`/`updated_at` compõem a trilha financeira — base para a rentabilidade (Onda 3).

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[Faturamento confirmado (PRD-004)] ─▶ gera "conta a receber" (aberta)
[Retaguarda] ─▶ /admin/financeiro ─▶ A Receber ─▶ "Dar baixa" (data/forma) ─▶ recebida ─▶ pipeline "recebido"
[Retaguarda] ─▶ A Pagar ─▶ "Nova conta" (diesel/fornecedor) ─▶ "Dar baixa" ─▶ paga
```

### Fluxos de Exceção
- Conta vencida em aberto → destacada na lista.

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

**Codinomes:** Para MINOR/MAJOR, gerar codinome em inglês baseado no contexto (sugestão: **"Cashflow"**).

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Operações secundárias não impedem o core |
| **Fail gracefully** | Falhas simuladas não travam a tela |
| **Preservar evidências** | Manter vínculo conta↔faturamento e histórico de baixa |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas durante a implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Barreira financeira** | `src/features/financeiro/` nunca importado em `/app/*` |
| **Derivar a receber** | Conta a receber referencia o faturamento; não recria o valor |
| **Pipeline coeso** | Reaproveitar a visão de pipeline do PRD-004, agora com "recebido" |
| **Cálculo isolado** | Reutilizar utilitário de soma/máscara monetária |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Exibir, importar ou renderizar dados financeiros no app do operador |
| Implementar baixa automática via gateway (é o PRD-008) |
| Recriar valores de faturamento (derivar de PRD-004) |
| Hardcodar valores ou cálculos |
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
