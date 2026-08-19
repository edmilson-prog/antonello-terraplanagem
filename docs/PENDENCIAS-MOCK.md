# Inventário de Pendências Mock

> **Diretriz D1** ([`CLAUDE.md`](../CLAUDE.md)): nada mockado chega em produção.
> Este arquivo é a lista auditável do que ainda **não é real**. Ler no início de toda
> tarefa e de toda sessão com contexto zero; atualizar ao fechar cada onda.
>
> Varredura automática: `npm run auditar:mocks` (falha com código 1 se achar algo fora
> das exceções declaradas em `scripts/auditar-mocks.mjs`).

**Última revisão:** 2026-08-19 · **Versão:** 0.36.0 (Uplink)

---

## Como ler este inventário

| Estado | Significado |
|--------|-------------|
| ✅ **Real** | Vem do banco, ponta a ponta. Sem fallback fabricado |
| 🟡 **Real, sem credencial** | Caminho de produção construído; falha visível enquanto a credencial do cliente não existe. **Não simula resposta** |
| 🔴 **Mockado** | Ainda fabrica dado. É dívida aberta — tem que virar tarefa |

---

## 1. Stores de domínio

Todas saíram de `src/mocks/` entre as Ondas 17 e 21.

| Domínio | Estado | Origem real |
|---------|--------|-------------|
| Equipamentos | ✅ | `equipamentos` |
| Operadores | ✅ | `operadores` + RPC `criar_operador` |
| Clientes | ✅ | `clientes` |
| Ordens de serviço | ✅ | `ordens_servico` |
| Apontamentos | ✅ | `apontamentos` + RPCs do operador |
| Orçamentos | ✅ | `orcamentos` + `orcamento_itens` |
| Preços (hora-máquina, fundação, mobilização) | ✅ | `precos_*` + `precos_historico` |
| Componentes de custo | ✅ | `componentes_custo` |
| Faturamento | ✅ | `faturamentos` + `faturamento_itens` |
| Contas a pagar / receber | ✅ | `contas_pagar` / `contas_receber` |
| Comprovantes | ✅ | `comprovantes` |
| Planos e registros de manutenção | ✅ | `planos_manutencao` / `registros_manutencao` |
| Diesel (abastecimentos, compras, tanque) | ✅ | `abastecimentos` / `compras_diesel` |
| Notificações | ✅ | `notificacoes` + entregas + push |
| Registros de campo | ✅ | `registros_campo` + fila offline |
| Parâmetros da plataforma | ✅ | `parametros` + `parametros_historico` |

## 2. Telas de detalhe (retaguarda)

> ⚠️ **Frente aberta desta onda.** As telas abaixo montam o cabeçalho com dado real do
> cadastro, mas preenchem KPIs, históricos e gráficos com geradores determinísticos por
> `id` (`*-showcase-data.ts`): números plausíveis, sem lastro nenhum no banco.

| Tela | Estado | Origem real |
|------|--------|-------------|
| Detalhe do operador — KPIs, apontamentos, ordens, horas/semana, equipamentos, cadastrais | 🔴 | `operador-showcase-data.ts` |
| Detalhe do operador — **Acesso ao app** | 🔴 | `operador-showcase-data.ts` — `operador_sessoes` não guarda dispositivo nem versão |
| Detalhe do equipamento — KPIs, ficha técnica, leituras de horímetro, utilização | 🔴 | `equipamento-showcase-data.ts` |
| Detalhe do cliente — KPIs financeiros, ordens, recebimentos, cadastrais | 🔴 | `cliente-showcase-data.ts` |
| Aba Análise do faturamento + PDF | 🔴 | `src/mocks/faturamento.ts` — constantes fixas de Jan a Jun/2026 |

## 3. Estados de tela

| Item | Estado | Nota |
|------|--------|------|
| `loading` / `error` / `retry` das telas de dados | 🔴 | 23 telas usam `useMockResource`: `setTimeout` de 400 ms sobre dado já em memória. O estado real do store é ignorado |

## 4. Integrações externas

| Integração | Estado | O que falta |
|------------|--------|-------------|
| **WhatsApp / WAHA** (PRD-009) | 🟡 Real, sem credencial | Edge Functions `waha-sessao` e `waha-enviar-texto` existem e falam com o WAHA de verdade. Falta o cliente prover instância + token em `parametros` |
| **E-mail** | 🟡 Real, sem credencial | Edge Function `enviar-email`. Falta a credencial de SMTP/provedor |
| **Push (Web Push)** | ✅ | `push_subscriptions` + Edge Function `enviar-push` |
| **Gateway de cobrança** (PRD-008) | 🔴 **Mockado** | A cobrança é persistida em `cobrancas_gateway`, mas **`linha_digitavel` e `pix_copia_cola` são gerados localmente** e `simularWebhookPago` faz o papel do webhook. Falta: Edge Function por provedor (Asaas / Mercado Pago), endpoint de webhook, credencial |
| **Suíte de IA embarcada** (PRD-019) | 🔴 **Mockado** | `src/features/ia/mock/*` responde localmente: OCR do horímetro, leitura de cupom, chatbot, sugestão de orçamento/alocação, previsão de caixa, detecção de anomalia. Falta: Edge Function chamando o provedor de LLM/visão + credencial |

### Dívida aberta — detalhamento

#### 4.1 Gateway de cobrança

- **Arquivos:** `src/features/cobranca-gateway/derivacoes.ts` (`gerarLinhaDigitavelMock`,
  `gerarPixCopiaColaMock`), `cobrancas-store.ts` (`simularWebhookPago`).
- **Caminho para virar real:** Edge Function `cobranca-emitir` (por provedor, via adapter),
  Edge Function `cobranca-webhook` recebendo a confirmação do provedor e escrevendo em
  `cobrancas_gateway` + `contas_receber`, credencial em `parametros`.
- **Bloqueio:** conta e chave de API do provedor escolhido pelo cliente.

#### 4.2 Suíte de IA

- **Arquivos:** `src/features/ia/mock/{captura,analitico,comercial,atendimento,perguntas-respostas}.ts`.
- **Caminho para virar real:** Edge Function `ia-completar` com a chave do provedor no
  servidor (nunca no front), roteando por tarefa; OCR de horímetro e cupom por visão.
- **Bloqueio:** chave de API do provedor de LLM.

> As duas dívidas acima dependem de **credencial do cliente**. Ficam **declaradas como
> exceção** em `scripts/auditar-mocks.mjs` — visíveis, não escondidas. Todas as outras
> entradas 🔴 deste inventário dependem só de código nosso e são tarefa aberta.

## 5. `src/mocks/`

| Item | Estado |
|------|--------|
| Importado por código de produção | 🔴 3 pontos: `analise-tab.tsx`, `export-faturamento-pdf.ts` e o shim `shared/lib/cliente-mock-id.ts` |
| Uso legítimo | Fixtures de teste (`*.test.ts`) e geração de seed (`scripts/mocks-to-seed.ts`) |

---

## Checklist de revisão (rodar a cada tarefa nova / sessão zerada)

- [ ] `npm run auditar:mocks` passa
- [ ] Nenhuma entrada 🔴 nova neste arquivo
- [ ] Nenhuma tela exibe valor plausível sem lastro no banco (estado vazio honesto no lugar)
- [ ] Estados `loading`/`error` vêm da consulta real
- [ ] Ondas anteriores não deixaram card, coluna ou KPI para trás
