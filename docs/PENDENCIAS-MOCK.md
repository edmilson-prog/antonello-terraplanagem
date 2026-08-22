# Inventário de Pendências Mock

> **Diretriz D1** ([`CLAUDE.md`](../CLAUDE.md)): nada mockado chega em produção.
> Este arquivo é a lista auditável do que ainda **não é real**. Ler no início de toda
> tarefa e de toda sessão com contexto zero; atualizar ao fechar cada onda.
>
> Varredura automática: `npm run auditar:mocks` (falha com código 1 se achar algo fora
> das exceções declaradas em `scripts/auditar-mocks.mjs`).

**Última revisão:** 2026-08-22 · **Versão:** 0.39.0 (Signoff)

---

## Como ler este inventário

| Estado                      | Significado                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ✅ **Real**                 | Vem do banco, ponta a ponta. Sem fallback fabricado                                                                |
| 🟡 **Real, sem credencial** | Caminho de produção construído; falha visível enquanto a credencial do cliente não existe. **Não simula resposta** |
| 🔴 **Mockado**              | Ainda fabrica dado. É dívida aberta — tem que virar tarefa                                                         |

---

## 1. Stores de domínio

Todas saíram de `src/mocks/` entre as Ondas 17 e 21.

| Domínio                                      | Estado | Origem real                                                     |
| -------------------------------------------- | ------ | --------------------------------------------------------------- |
| Equipamentos                                 | ✅     | `equipamentos`                                                  |
| Operadores                                   | ✅     | `operadores` + RPC `criar_operador`                             |
| Clientes                                     | ✅     | `clientes`                                                      |
| Ordens de serviço                            | ✅     | `ordens_servico`                                                |
| Apontamentos                                 | ✅     | `apontamentos` + RPCs do operador                               |
| Orçamentos                                   | ✅     | `orcamentos` + `orcamento_itens`                                |
| Preços (hora-máquina, fundação, mobilização) | ✅     | `precos_*` + `precos_historico`                                 |
| Componentes de custo                         | ✅     | `componentes_custo`                                             |
| Faturamento                                  | ✅     | `faturamentos` + `faturamento_itens`                            |
| Contas a pagar / receber                     | ✅     | `contas_pagar` / `contas_receber`                               |
| Comprovantes                                 | ✅     | `comprovantes`                                                  |
| Planos e registros de manutenção             | ✅     | `planos_manutencao` / `registros_manutencao`                    |
| Diesel (abastecimentos, compras, tanque)     | ✅     | `abastecimentos` / `compras_diesel`                             |
| Notificações                                 | ✅     | `notificacoes` + entregas + push                                |
| Registros de campo                           | ✅     | `registros_campo` + fila offline                                |
| Parâmetros da plataforma                     | ✅     | `parametros` + `parametros_historico`                           |
| Habilitações operador → equipamento          | ✅     | `operadores_equipamentos` + RPC `definir_equipamentos_operador` |

## 2. Telas de detalhe (retaguarda) — resolvido na Onda 22

Os três geradores `*-showcase-data.ts` foram removidos. Eram determinísticos por `id`:
o mesmo operador via sempre os mesmos números, o que os fazia parecer estáveis e reais.

| Tela                                                                                     | Estado | Origem real                                                                                       |
| ---------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| Detalhe do operador — KPIs, apontamentos, ordens, horas/semana, equipamentos, cadastrais | ✅     | `apontamentos`, `ordens_servico`, `operadores_equipamentos`, `operadores`                         |
| Detalhe do operador — **Acesso ao app**                                                  | ✅     | `operador_sessoes` (`dispositivo`, `app_versao`, `ultimo_uso_em`) via RPC `acesso_app_operadores` |
| Detalhe do equipamento — KPIs, ficha técnica, leituras de horímetro, utilização, diesel  | ✅     | `apontamentos`, `registros_manutencao`, `abastecimentos`, `faturamento_itens`, `equipamentos`     |
| Detalhe do cliente — KPIs financeiros, ordens, recebimentos, cadastrais                  | ✅     | `ordens_servico`, `faturamentos`, `contas_receber`, `orcamentos`, `clientes`                      |
| Aba Análise do faturamento + PDF                                                         | ✅     | `faturamentos` + `faturamento_itens`                                                              |
| Mapa do painel operacional                                                               | ✅     | apontamento em andamento → `ordens_servico.local_lat/lng`                                         |

## 3. Estados de tela

| Item                                             | Estado | Nota                                                                                                                                                                       |
| ------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `loading` / `error` / `retry` das telas de dados | ✅     | `combinarEstados()` cruza o estado real das stores. O antigo `useMockResource` (setTimeout de 400 ms, que declarava "carregado" mesmo com a consulta falhada) foi removido |
| Mini-tendências dos cards operacionais           | ✅     | `serieSuavizada()` interpola os valores reais. A ondulação senoidal que somava movimento ao traçado foi removida                                                           |

## 4. Integrações externas

| Integração                          | Estado                  | O que falta                                                                                                                                                           |
| ----------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WhatsApp / WAHA** (PRD-009)       | 🟡 Real, sem credencial | Edge Functions `waha-sessao` e `waha-enviar-texto` falam com o WAHA de verdade; a mensagem gravada é a efetivamente enviada. Falta o cliente prover instância + token |
| **E-mail**                          | 🟡 Real, sem credencial | Edge Function `enviar-email`. Falta a credencial de SMTP/provedor                                                                                                     |
| **Push (Web Push)**                 | ✅                      | `push_subscriptions` + Edge Function `enviar-push`                                                                                                                    |
| **Clima do painel**                 | ✅                      | Open-Meteo em runtime (API pública, sem chave)                                                                                                                        |
| **Gateway de cobrança** (PRD-008)   | 🔴 **Mockado**          | Ver 4.1                                                                                                                                                               |
| **Suíte de IA embarcada** (PRD-019) | 🔴 **Mockado**          | Ver 4.2                                                                                                                                                               |

### Dívida aberta — as duas únicas entradas 🔴

Ambas dependem de **credencial do cliente**. Nenhuma depende de código que possamos
escrever sozinhos hoje. Ficam **declaradas como exceção** em `scripts/auditar-mocks.mjs`
— visíveis, não escondidas.

#### 4.1 Gateway de cobrança

- **O que é falso:** a cobrança é persistida em `cobrancas_gateway` de verdade, mas
  `linha_digitavel` e `pix_copia_cola` são gerados localmente
  (`cobranca-gateway/derivacoes.ts`) e o pagamento é confirmado por `simularWebhookPago`,
  que faz o papel do webhook do provedor. **Um boleto emitido aqui não cobra ninguém.**
- **Caminho para virar real:** Edge Function `cobranca-emitir` (adapter por provedor),
  Edge Function `cobranca-webhook` recebendo a confirmação e escrevendo em
  `cobrancas_gateway` + `contas_receber`, credencial em `parametros`.
- **Bloqueio:** conta e chave de API do provedor (Asaas / Mercado Pago).

#### 4.2 Suíte de IA

- **O que é falso:** `src/features/ia/mock/*` responde localmente — OCR do horímetro,
  leitura de cupom, chatbot, sugestão de orçamento e de alocação, previsão de caixa,
  detecção de anomalia. As respostas são plausíveis e não vêm de modelo nenhum.
- **Caminho para virar real:** Edge Function `ia-completar` com a chave do provedor no
  servidor (nunca no bundle), roteando por tarefa; horímetro e cupom por visão.
- **Bloqueio:** chave de API do provedor de LLM.

## 4-bis. Deriva de schema (achado na validação de 2026-08-19)

As migrações **não reproduziam a produção**: `cli_codigo_legado` e as colunas
`legado_*` de `clientes` eram lidas pelo código e estavam nos types, mas nenhuma
migração as criava — foram adicionadas à mão no painel do Supabase.

Corrigido por `20260819122500_clientes_snapshot_farolti.sql`. A lição vale como
regra: **coluna que o código lê tem que estar numa migração**. Alteração feita
pelo painel é deriva, e só aparece quando um ambiente novo nasce sem ela.

Verificação disponível sem tocar a produção: subir um Postgres local, aplicar o
andaime do Supabase (papéis, `auth.users`, `auth.uid()`, pgcrypto, dublês de
`pg_net`/`pg_cron`) e rodar `supabase/migrations/*.sql` em ordem. As únicas
falhas esperadas são as duas migrações que dependem de `pg_net`/`pg_cron` — e a
cascata de uma delas.

## 5. `src/mocks/`

| Item                             | Estado                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Importado por código de produção | ✅ Nenhum — a regra `import-mocks` da varredura trava a reintrodução                                                |
| Uso legítimo restante            | Fixtures de teste (`*.test.ts`) e geração de seed (`scripts/mocks-to-seed.ts`), conforme "Mock → Seed" no CLAUDE.md |

---

## O que a varredura procura

`scripts/auditar-mocks.mjs`, seis regras. As três últimas nasceram de coisas que passaram
por várias ondas sem serem vistas.

| Regra                 | Pega                                                                     |
| --------------------- | ------------------------------------------------------------------------ |
| `import-mocks`        | Código de produção importando `src/mocks/`                               |
| `showcase-data`       | Gerador de dado de exemplo alimentando tela                              |
| `loading-falso`       | Estado de carregamento fabricado por `setTimeout`                        |
| `store-em-memoria`    | Store mock em vez de Supabase                                            |
| `aleatorio-em-tela`   | `Math.random()` compondo dado exibido                                    |
| `id-mock`             | Tradução de id real para id fixture                                      |
| `nome-suspeito`       | **Nome de arquivo** que se declara exemplo (`mock-*`, `*-decorativa`, …) |
| `pool-de-exemplos`    | Lista `*_POOL` sorteada para preencher tela                              |
| `coordenada-ficticia` | Coordenada geográfica escrita à mão fora de configuração                 |

Linhas de comentário são ignoradas: citar um padrão pelo nome ao explicar o que foi
removido não é fabricar dado — e apagar essa memória é o que permitiria reintroduzir o
mesmo mock daqui a três ondas.

---

## Checklist de revisão (rodar a cada tarefa nova / sessão zerada)

- [ ] `npm run auditar:mocks` passa
- [ ] Nenhuma entrada 🔴 nova neste arquivo
- [ ] Nenhuma tela exibe valor plausível sem lastro no banco (estado vazio honesto no lugar)
- [ ] Estados `loading`/`error` vêm da consulta real
- [ ] Ondas anteriores não deixaram card, coluna ou KPI para trás
- [ ] Formulários **gravam** todos os campos que exibem (o furo de edição já apareceu duas vezes: operador e equipamento)
