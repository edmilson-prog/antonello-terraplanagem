# PRD-008: Integração — Gateway de Cobrança (Boleto + PIX)

> **✅ Provedor definido (2026-07-04):** **múltiplos gateways** — **Mercado Pago** e **Asaas**, com arquitetura de adapter/seleção de provedor (ver "Arquitetura Multi-Provedor" abaixo). Os servidores de API de ambos já estão em produção (fora deste repositório).
>
> **⚠️ Escopo desta versão (MVP mockado — Frontend First):** o `CLAUDE.md` do projeto mantém a fase atual como **Frontend First** ("NÃO conectar backend real... backend só será implementado após aprovação do projeto"). A aprovação de provedor acima **não** revoga essa fase — o que muda é que a spec deixa de ter campos `[a definir]` de provedor, mas a implementação **desta versão** é mockada em `src/mocks/`: seleção de provedor ativo, emissão simulada de cobrança e simulação do webhook de pagamento, sem nenhuma chamada de rede real nem credencial real. A seção "Especificação Técnica" abaixo documenta o formato real de cada provedor como **referência para a Fase 4** (backend real), não como algo chamado por este MVP.

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Integrar com um gateway de pagamento para emitir boleto/PIX a partir das contas a receber e dar baixa automática ao confirmar o pagamento |
| **Tipo** | Integração |
| **Complexidade** | Alta |
| **Total de Fases** | 4 |
| **Prioridade** | Média |
| **Ambiente** | Retaguarda / Backend (`/admin/*` + Edge/n8n) |
| **Épico** | Onda 2 — Estrutura |
| **PRDs Relacionados** | PRD-007 (contas a receber — origem da cobrança e destino da baixa), PRD-004 (faturamento) |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

---

## Informações do Serviço Externo

### Dados do Provedor

| Campo | Valor |
|-------|-------|
| **Nome do Serviço** | **Mercado Pago** e **Asaas** (multi-provedor — servidores já em produção) |
| **Provedor** | Mercado Pago (Checkout Transparente / Pagamentos) + Asaas (Cobranças) |
| **Documentação** | Mercado Pago: https://www.mercadopago.com.br/developers · Asaas: https://docs.asaas.com |
| **Tipo de API** | REST (ambos) |
| **Versão da API** | Mercado Pago: API v1 (`/v1/payments`) · Asaas: API v3 (`/api/v3/payments`) — confirmar versão vigente na documentação oficial ao iniciar a Fase 4 |
| **Ambiente** | Sandbox/Teste (Mercado Pago: credenciais de teste · Asaas: ambiente sandbox) → Produção |

### Arquitetura Multi-Provedor

Cada conta a receber é emitida por **um** gateway por vez, escolhido por um seletor de "provedor ativo" (configurável na retaguarda). O código nunca acopla lógica de negócio a um provedor específico — usa um adapter comum:

```typescript
type ProvedorGateway = "mercado_pago" | "asaas";

interface AdapterGateway {
  provedor: ProvedorGateway;
  emitirCobranca(conta: ContaReceber): CobrancaEmitida; // mock: gera linha_digitavel/pix fake
  simularWebhookPago(cobrancaId: string): EventoWebhookGateway; // mock: simula confirmação
}
```

Trocar de provedor = trocar o adapter selecionado, nunca reescrever o fluxo de emissão/baixa. Isso vale tanto para o MVP mockado (seleção troca qual "adapter mock" gera os dados fake) quanto para a Fase 4 (seleção troca qual cliente HTTP real é chamado).

### Credenciais Necessárias (referência para Fase 4)

| Credencial | Tipo | Onde Obter |
|------------|------|------------|
| Access Token (Mercado Pago) | Chave de acesso | Painel de desenvolvedores Mercado Pago |
| API Key (Asaas) | Chave de acesso | Painel Asaas → Integrações |
| Chave/assinatura de Webhook | Validação de assinatura do webhook | Config de cada provedor |

> ⚠️ **NUNCA** incluir credenciais reais neste documento. Usar variáveis de ambiente (`.env`, sem prefixo `VITE_` — é backend). No MVP mockado desta versão, não há nenhuma credencial real envolvida.

### Limites e Quotas (referência para Fase 4)

| Limite | Valor | Consequência se Exceder |
|--------|-------|------------------------|
| Rate Limit | Varia por provedor (consultar doc oficial ao integrar) | 429 Too Many Requests |
| Payload / Timeout | Varia por provedor | Retry necessário |

---

## Contexto da Integração

### Por que Integrar?

Fechar o ciclo financeiro com **cobrança real**: hoje o sistema saberá quanto há a receber (PRD-007), mas a emissão do boleto/PIX e a baixa do pagamento são manuais. A integração automatiza:
1. **Emitir** a cobrança (boleto/PIX) a partir de uma conta a receber.
2. **Reconciliar**: quando o cliente paga, o provedor avisa (webhook) e a conta a receber recebe **baixa automática** (PRD-007).

Isso reduz trabalho manual, acelera o caixa e diminui erro de conciliação.

### Fluxo de Dados

```
┌─────────────┐   emitir cobrança    ┌─────────────┐
│   NOSSO     │ ───────────────────▶ │   GATEWAY   │
│  BACKEND    │                       │ (Asaas/Efí) │
│ (PRD-007)   │ ◀─────────────────── │             │
└─────────────┘   webhook: pago       └─────────────┘
       │  baixa automática
       ▼
  conta a receber → "liquidada" (recebido)
```

### Direção da Integração

| Direção | Uso |
|---------|-----|
| **Outbound** | Emitir cobrança (criar boleto/PIX) |
| **Inbound (webhook)** | Receber confirmação de pagamento → baixa automática |
| ⇒ **Bidirecional** | Ambas |

---

## Escopo da Integração

### Operações Incluídas

| Operação | Endpoint | Método | Prioridade |
|----------|----------|--------|------------|
| Criar cobrança (boleto/PIX) | `[a definir]` | POST | Alta |
| Consultar status da cobrança | `[a definir]` | GET | Média |
| Webhook de pagamento confirmado | (recebido) | POST (inbound) | Alta |
| Cancelar cobrança | `[a definir]` | [a definir] | Baixa |

### Operações Excluídas (Escopo Futuro)

| Operação | Motivo |
|----------|--------|
| Split de pagamento, assinaturas recorrentes | Não se aplica ao modelo do cliente |
| Estorno automatizado | Tratar manualmente por ora |

---

## Especificação Técnica

### Autenticação

| Campo | Valor |
|-------|-------|
| **Tipo** | [a definir — normalmente API Key em header] |
| **Header** | `[a definir]` |
| **Expiração / Refresh** | [a definir pelo provedor] |

### Endpoint: Criar Cobrança (esboço)

| Campo | Valor |
|-------|-------|
| **URL** | `[a definir]` |
| **Método** | POST |
| **Content-Type** | application/json |

**Request Body (shape ilustrativo — ajustar ao provedor):**

```json
{
  "cliente": { "nome": "...", "documento": "...", "email": "..." },
  "valor": 5000.00,
  "vencimento": "2026-07-15",
  "formas_pagamento": ["boleto", "pix"],
  "referencia_externa": "conta_receber_id"
}
```

**Response (shape ilustrativo):**

```json
{
  "id": "cob_abc123",
  "status": "pendente",
  "linha_digitavel": "...",
  "pix_copia_cola": "...",
  "url": "https://.../fatura"
}
```

**Response de Erro:**

| Código | Significado | Ação |
|--------|-------------|------|
| 400 | Payload inválido | Validar dados |
| 401 | Não autorizado | Verificar/renovar credencial |
| 429 | Rate limit | Backoff |
| 5xx | Erro do provedor | Retry com backoff |

### Webhook: Pagamento Confirmado (inbound)

- Recebe evento do provedor (ex.: `payment.confirmed`).
- **Validar assinatura** do webhook (chave de webhook).
- Localizar a conta a receber via `referencia_externa` e **dar baixa** (PRD-007), marcando `liquidada` + forma/data.
- Responder 200 rapidamente; processar idempotente (evitar baixa duplicada).

---

## Mapeamento de Dados

### Enviado (Request)

| Campo Nosso Sistema | Campo Gateway | Transformação |
|--------------------|---------------|---------------|
| `conta_receber.valor` | `valor` | Nenhuma |
| `conta_receber.vencimento` | `vencimento` | ISO date |
| `cliente.nome` / `documento` | `cliente.*` | Nenhuma |
| `conta_receber.id` | `referencia_externa` | Nenhuma (chave de reconciliação) |

### Recebido (Webhook)

| Campo Gateway | Campo Nosso Sistema | Transformação |
|---------------|---------------------|---------------|
| `referencia_externa` | `conta_receber.id` | Localizar conta |
| `status` (pago) | `conta_receber.status` | Mapear → `liquidada` |
| `data_pagamento` | `conta_receber.recebido_em` | Parse date |
| `forma` | `conta_receber.forma_recebimento` | Mapear enum |

---

## Tratamento de Erros

### Retry

| Cenário | Estratégia | Máx. |
|---------|-----------|------|
| Timeout | Retry imediato | 3 |
| 429 | Exponential backoff | 5 |
| 5xx | Retry com delay | 3 |
| 4xx | Não fazer retry | 0 |

### Fallback

| Cenário | Comportamento |
|---------|---------------|
| Gateway indisponível na emissão | Enfileirar e tentar depois; permitir cobrança manual como alternativa |
| Webhook não chega | Job de **consulta periódica** de status como rede de segurança |
| Evento duplicado | Idempotência por `referencia_externa` + id do evento (não baixar duas vezes) |

### Monitoramento

| Métrica | Como |
|---------|------|
| Cobranças emitidas × pagas | Contagem por status |
| Falhas de webhook | Log + alerta |
| Latência de reconciliação | Tempo entre pago e baixa |

---

## Fases de Implementação

> **Nota:** as fases 1–4 abaixo descrevem o alcance final (Fase 4, backend real). **A versão implementada agora é um MVP mockado** (ver nota no topo do documento): seletor de provedor ativo + emissão simulada + simulação do webhook, tudo em `src/mocks/`/`src/features/`, sem chamada de rede real. A tabela abaixo permanece como guia para quando o backend real (Edge/n8n) for aprovado.

| Fase | Objetivo | Arquivos |
|------|----------|----------|
| 1 | Configuração + autenticação + ambiente sandbox | [N] |
| 2 | Emissão de cobrança (outbound) + persistência do id/linha/pix | [N] |
| 3 | Webhook de pagamento + baixa automática (PRD-007) + idempotência | [N] |
| 4 | Retry/fallback + job de consulta + validação sandbox→produção | [N] |

---

## Critérios de Aceitação

### Emissão

```gherkin
DADO uma conta a receber em aberto (PRD-007)
QUANDO a retaguarda solicita a emissão da cobrança
ENTÃO o gateway retorna boleto/PIX
  E o id/linha digitável/pix são persistidos na conta
```

### Reconciliação (webhook)

```gherkin
DADO uma cobrança emitida
QUANDO o gateway envia o webhook de pagamento confirmado (assinatura válida)
ENTÃO a conta a receber correspondente é baixada automaticamente ("liquidada")
  E o evento é processado de forma idempotente (sem baixa duplicada)
```

### Falha

```gherkin
DADO que o gateway está indisponível
QUANDO a emissão é solicitada
ENTÃO o sistema faz retry conforme a estratégia
  E registra o erro, oferecendo a cobrança manual como alternativa
```

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onda 2 — Estrutura"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| — | PRD-004 | Faturamento | ⏳ (documentado) | Origem do valor |
| — | PRD-007 | Contas a Pagar e Receber | ⏳ (documentado) | Origem da cobrança + destino da baixa |
| **N** | **PRD-008** | **Integração Gateway de Cobrança** | **🔄 ATUAL** | Depende de PRD-007 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Credenciais

| Item | Requisito |
|------|-----------|
| Armazenamento | Variáveis de ambiente (backend), nunca em código nem com prefixo `VITE_` |
| Acesso | Apenas backend/Edge autorizado |

### Dados em Trânsito

| Item | Requisito |
|------|-----------|
| Protocolo | HTTPS obrigatório |
| Webhook | **Validar assinatura**; rejeitar não assinados |

### Logs

| Logar | NÃO logar |
|-------|-----------|
| Id da cobrança, status, timestamps | Credenciais, tokens |
| Códigos de erro | Dados sensíveis do pagador além do necessário |

---

## Perguntas em Aberto

- [x] **Qual gateway?** — **Resolvido (2026-07-04):** múltiplos — Mercado Pago + Asaas, via adapter selecionável (ver "Arquitetura Multi-Provedor"). Servidores já em produção.
- [ ] Formas aceitas: **boleto + PIX** apenas, ou também cartão?
- [ ] Quem define o **vencimento** e as regras de multa/juros?
- [ ] O cliente recebe a cobrança **como** (link, e-mail, WhatsApp via PRD-009)?
- [ ] Necessário **cancelar/estornar** cobranças pelo sistema?
- [ ] O webhook será recebido por **Edge Function** (Supabase) ou por **n8n**? (decisão de Fase 4 — não impacta o MVP mockado)

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web). Siga as convenções do `CLAUDE.md`. **Provedor já definido (multi-provedor: Mercado Pago + Asaas) — implemente como MVP mockado (Frontend First), não como integração real.**

### Esclarecimento de Dúvidas

> **💬 A implementação real (Fase 4) só ocorre após aprovação do backend; o MVP mockado usa apenas dados simulados em `src/mocks/`, sem credenciais nem chamadas de rede.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. CREDENCIAIS:**
> - NUNCA hardcodar credenciais; usar variáveis de ambiente (backend).
> - Verificar ambiente correto (sandbox vs produção).

> **⚠️ 3. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/)
> - Atualizar o `CHANGELOG.md` seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar o `INDEX-PRDs-antonello.md`
> - Atualizar a seção "Status de Implementação" (incluindo ambiente testado)

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Para MINOR/MAJOR, gerar codinome em inglês baseado no contexto (sugestão: **"Gateway"**).

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Falha na cobrança não trava o sistema; oferecer alternativa manual |
| **Fail gracefully** | Sempre ter fallback (fila + consulta periódica) |
| **Idempotência** | Webhook processado sem baixa duplicada |
| **Preservar evidências** | Logar requests/responses sanitizados |
| **Documentar decisões** | Registrar decisões técnicas durante a implementação |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Hardcodar credenciais |
| Confiar em webhook sem validar assinatura (Fase 4) |
| Baixar conta duas vezes (sem idempotência) |
| Fazer qualquer chamada de rede real ou usar credencial real no MVP mockado |
| Logar dados sensíveis do pagador |

---

## Troubleshooting

| Problema | Causa provável | Solução |
|----------|----------------|---------|
| 401 | Credencial errada/ambiente trocado | Verificar API key e sandbox/produção |
| Webhook não baixa a conta | `referencia_externa` divergente | Conferir o mapeamento da chave |
| Baixa duplicada | Falta de idempotência | Dedup por id do evento + referência |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO (MVP mockado — Frontend First; integração real segue Fase 4) |
| **Data de Implementação** | 2026-07-05 |
| **Versão do App** | 0.15.0 (Gateway) |
| **Implementado por** | Claude Code via Subagent-Driven Development (4 tasks + revisão final), branch `feat/prd-008-gateway-cobranca-mockado` |
| **Ambiente Testado** | Mockado (`npm run dev`, Chrome DevTools MCP) — 380/380 testes, 0 erros de tipo, 0 achados Critical/Important na revisão final |
| **Observações** | Provedor definido como **multi-provedor**: Mercado Pago + Asaas, via adapter selecionável e seletor de "provedor padrão" persistido em `localStorage` (`/admin/integracoes`). Nenhuma chamada de rede real, nenhuma credencial — `CobrancaGateway` é uma entidade lateral mockada, referenciando `ContaReceber` sem alterá-la. A baixa automática (simulação de webhook) reaproveita `contasReceberStore.darBaixaReceber`, garantindo ordem correta (baixa confirmada antes de marcar a cobrança como paga) e idempotência. 2 achados Minor não-bloqueantes aceitos (cosmético: estado "Emitindo…" não chega a pintar por não haver gap assíncrono real no mock; array `PROVEDORES` duplica as chaves do label em vez de derivar via `Object.keys`). **Pendência de fechamento:** a atualização de `INDEX-PRDs-antonello.md` (marcar este PRD como ✅) ficou **pendente** — esse arquivo tinha uma edição não commitada de outra sessão (provável Agente Arquiteto) revertendo-o para estado pré-implementação; o rascunho externo foi preservado em `docs/prds/INDEX-PRDs-antonello.ARQUITETO-DRAFT-2026-07-04.md` e a reconciliação aguarda decisão do usuário.

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial (provisória — provedor em aberto) |
| 2026-07-04 | v2 | Provedor definido (multi-provedor: Mercado Pago + Asaas, servidores já em produção); escopo desta versão redefinido como MVP mockado (Frontend First) |

---

**AILA - Sistemas Inteligentes**
