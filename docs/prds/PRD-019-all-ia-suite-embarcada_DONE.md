# PRD-019: Suíte de IA Embarcada (One-Shot — 12 Features)

> **⚠️ NATUREZA DESTE PRD:** entrega **one-shot** — as 12 features de IA são analisadas, questionadas e implementadas **numa única execução**, seguindo o Protocolo One-Shot (seção própria ao final). Fase atual: **Frontend First (mockado)** — implementa-se a UI + a camada de IA **plugável com respostas simuladas**; os providers reais (APIs de IA) entram na Fase 4 trocando apenas a implementação, sem tocar as telas.

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Implementar, numa única entrega, as 12 features de IA embarcada (4 grupos) como UI mockada sobre uma camada de IA plugável |
| **Tipo** | Feature (suíte) |
| **Complexidade** | Alta |
| **Total de Fases** | 5 (ordem interna do one-shot — entrega única) |
| **Prioridade** | Alta |
| **Ambiente** | Transversal (`all`) — com barreira financeira rigorosa em `/app/*` |
| **Épico** | Pós-roadmap — Suíte de IA |
| **PRDs Relacionados** | Consome/estende: 002, 003, 004, 006, 007, 010, 011, 012, 013, 014, 016. Considerar o **patch Retrofit** aplicado |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

---

## Contexto do Problema

O sistema já captura os dados (horas, diesel, custo, faturamento) — mas toda a inteligência sobre eles é manual: o Leonardo interpreta gráficos, a recepção digita descrições, o operador digita horímetro sob sol. IA embarcada transforma dado capturado em **ação e proteção**: leitura automática em campo (menos erro na origem da cobrança), anomalias detectadas antes de virar prejuízo, insights em linguagem natural, orçamentos sugeridos pelo histórico.

Este PRD consolida as 12 capacidades num documento único porque compartilham **a mesma fundação arquitetural** (camada de IA plugável) e serão implementadas juntas.

---

## Conceito da Solução

### Arquitetura — Camada de IA Plugável (prescrição)

```
        UI (12 features) ──▶ iaService (interface única por capacidade)
                                   │
                    ┌──────────────┴──────────────┐
              MockProvider                  RealProvider (Fase 4)
              (agora: respostas          (Anthropic API / vision /
               simuladas + delay)         speech — troca só aqui)
```

| Regra | Detalhe |
|-------|---------|
| **Interface por capacidade** | `lerHorimetro(foto)`, `detectarAnomalias(apontamentos)`, `gerarInsight(series)`, `transcreverVoz(audio)`, `sugerirOrcamento(contexto)`, `gerarTexto(contexto)`, `responderPergunta(pergunta)`, `preverCaixa(contas)`, `sugerirAlocacao(contexto)` |
| **Mock agora** | Cada função retorna resposta simulada plausível (com delay 0.5–2s), derivada dos mocks existentes |
| **Troca na Fase 4** | Implementar `RealProvider` sem alterar UI/contratos |
| **Resultado sempre editável** | IA **sugere**, humano **confirma** — nenhuma ação de IA é aplicada sem confirmação |
| **Estados padrão** | Todo componente IA trata: `processando` (spinner + "Analisando…") / `resultado` (editável) / `erro` ("IA indisponível — prossiga manualmente") / `indisponivel` (fallback manual sempre presente) |

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| 12 PRDs separados | Fundação comum; entrega fragmentada custaria 12 ciclos — decisão: one-shot |
| Chamar APIs de IA direto na fase mockada | Viola Frontend First; custo antes da validação |
| IA aplicando ações automaticamente | Risco: IA sugere, humano confirma — sempre |

---

## Escopo Geral

### Incluído
- ✅ Camada `src/features/ia/` (providers, contratos, componentes compartilhados: `BotaoIA`, `CardInsight`, `BadgeAnomalia`, `CampoResultadoIA`)
- ✅ As 12 features abaixo (UI + mock provider)
- ✅ Estados de tela padrão de IA em todos os pontos
- ✅ Barreira financeira em todas as features do operador

### Excluído
- ❌ Providers reais (APIs) — Fase 4, mesmo contrato
- ❌ Treinamento/fine-tuning de modelos
- ❌ Envio real de WhatsApp (D11 é simulador — envio real é PRD-009/Fase 4)
- ❌ Qualquer valor financeiro em `/app/*`

---

## As 12 Features

### Grupo A — Captura Inteligente em Campo

**A1. OCR do Horímetro (Must)** — `/app`, no fluxo de apontamento (002)
Consolida a camada plugável já prevista no 002: foto → `lerHorimetro()` → valor em campo **editável** → confirmar. Falha → digitação manual sem travar. Mock: valor plausível (± próximo do horímetro atual) após delay.
Edge: foto ilegível → erro + fallback; valor lido < horímetro atual → aviso de inconsistência.

**A2. Detecção de Anomalias em Apontamentos (Must)** — `/admin/ordens` e listagem de apontamentos (retaguarda)
`detectarAnomalias()` avalia apontamentos e marca com `BadgeAnomalia` + motivo: salto de horímetro atípico, horas/dia acima do padrão do equipamento, apontamento duplicado suspeito. Retaguarda revisa (confirmar ok / marcar para verificação). Mock: 2–3 apontamentos dos mocks marcados com motivos distintos.
Edge: nenhum anômalo → sem badges; anomalia confirmada ok → some da lista de revisão.

**A3. Apontamento por Voz (Should)** — `/app`, iniciar/finalizar apontamento e observação
Botão microfone → `transcreverVoz()` → preenche campo (horímetro/observação) **editável**. Mock: após "gravação" simulada, insere valor/texto plausível.
Edge: sem permissão de microfone / falha → fallback digitação, sem travar.

**A4. OCR de Cupom de Abastecimento (Should)** — registro de abastecimento (012)
Foto do cupom → extrai **litros** (e **valor**, exibido **só na retaguarda**; no `/app` o valor é descartado/oculto). Campos editáveis.
Edge: cupom ilegível → manual; **barreira: valor jamais renderiza em `/app`**.

### Grupo B — Inteligência Analítica

**B5. Insights Gerenciais em Linguagem Natural (Must)** — `/admin/gerencial` (016)
`CardInsight` no topo do painel: `gerarInsight(series)` produz 2–4 frases sobre o período ("margem caiu X% — principal fator: consumo da CAT 320 subiu Y%"). Botão regenerar. Mock: textos coerentes com os dados mockados do 016.
Edge: período sem dados → card oculto; falha → painel segue sem o card.

**B6. Manutenção Preditiva por Anomalia de Consumo (Must)** — painéis 010/012 (retaguarda) + badge no equipamento
Consumo l/h fora da curva histórica do equipamento → alerta "consumo anômalo — possível problema mecânico", distinto do preventivo por horas. Operador vê badge **sem custo**. Mock: 1 equipamento com consumo 30%+ acima da média.
Edge: histórico insuficiente → "dados insuficientes", sem alerta falso.

**B7. Consulta em Linguagem Natural (Should)** — barra "Perguntar à IA" na retaguarda (header ou 016)
`responderPergunta()` responde perguntas sobre os dados ("quantas horas a 18t fez em maio?"). Resposta com números + link para a tela de origem. Mock: 8–10 perguntas exemplo mapeadas; fora delas → "ainda não sei responder isso" + sugestões.
Edge: pergunta ambígua → pedir esclarecimento; nunca inventar número sem fonte.

**B8. Previsão de Caixa e Risco de Inadimplência (Could)** — `/admin/financeiro` (007) e card no 016
Projeção de recebimento (30/60/90d) + badge de risco por cliente (histórico de atraso). Mock: projeção derivada das contas mockadas + 1 cliente "risco alto". Sinalizar "estimativa — base histórica limitada".
Edge: sem histórico → ocultar, não chutar.

### Grupo C — Inteligência Comercial

**C9. Assistente de Orçamento (Should)** — `/admin/orcamentos` (006)
Botão "Sugerir com IA": `sugerirOrcamento()` propõe itens (horas estimadas × equipamento × preço do 005) com base em obras similares do histórico, com justificativa curta ("baseado em 3 obras semelhantes"). Itens entram **como rascunho editável**.
Edge: sem obra similar → informar e não sugerir; nunca sobrescrever itens já digitados sem confirmação.

**C10. Redação Automática (Should)** — comprovante (011) e descrições de OS/faturamento (003/004)
Botão "Gerar texto": `gerarTexto(contexto)` redige resumo do serviço / descrição a partir dos dados reais (obra, período, equipamentos, horas/metros). Sempre editável antes de salvar.
Edge: dados incompletos → gerar parcial + indicar lacunas; **sem valores** quando o destino for visível ao cliente/operador.

### Grupo D — Atendimento e Operação

**D11. Chatbot WhatsApp para Clientes — Simulador (Could)** — `/admin` (config + preview)
Tela de configuração (intents: status da obra, 2ª via de cobrança, confirmação de serviço) + **simulador de conversa** demonstrável ao cliente. Envio real = Fase 4 via n8n (009). Mock: fluxo de conversa respondendo com dados mockados.
Edge: pergunta fora das intents → mensagem de encaminhamento humano.

**D12. Copiloto de Alocação de Frota (Could)** — `/admin` (painel próprio ou aba em ordens)
`sugerirAlocacao()`: dado um novo serviço, sugere equipamento(s) por disponibilidade (OS ativas) × utilização (012) × porte, com justificativa. Sugestão, nunca decisão automática.
Edge: nenhum equipamento disponível → informar conflitos, sugerir datas.

---

## Requisitos Não-Funcionais

- **RNF-001 (Humano no controle):** toda saída de IA é sugestão editável; nenhuma gravação sem confirmação explícita.
- **RNF-002 (Fallback universal):** falha de IA nunca bloqueia o fluxo manual.
- **RNF-003 (Barreira financeira):** A4 (valor), B5, B7, B8, C9 e qualquer saída com R$ são retaguarda-only; componentes de IA financeiros nunca importados em `/app/*`.
- **RNF-004 (Transparência):** saídas de IA identificadas visualmente (ícone/rotulo "IA") e com fonte/justificativa quando houver número.
- **RNF-005 (Performance percebida):** mock com delay 0.5–2s + estado `processando`; UI nunca congela.
- **RNF-006 (Consistência):** shadcn/ui + tokens; light/dark; responsivo (375/768/1280).
- **RNF-007 (LGPD):** voz/fotos tratadas conforme seção LGPD do `CLAUDE.md`; nada de dado pessoal em logs do provider.

---

## Critérios de Aceitação (representativos — a regra geral vale para as 12)

```gherkin
# Regra geral (vale para toda feature de IA)
DADO qualquer ponto de IA da suíte
QUANDO o provider falha ou está indisponível
ENTÃO o fluxo manual segue disponível sem bloqueio
  E o estado de erro é comunicado com clareza

# A1 — OCR do horímetro
DADO o operador capturando o horímetro por foto
QUANDO a leitura retorna um valor
ENTÃO o valor aparece em campo editável para conferência
  E só é gravado após confirmação

# A2 — Anomalias
DADO um apontamento com salto de horímetro atípico
QUANDO a listagem da retaguarda carrega
ENTÃO o apontamento exibe badge de anomalia com o motivo
  E a recepção pode confirmar ok ou marcar para verificação

# B5 — Insight
DADO o painel gerencial com dados no período
QUANDO o card de insight é gerado
ENTÃO o texto referencia números coerentes com os gráficos exibidos

# A4/B — Barreira financeira
DADO o ambiente do operador (/app/*)
QUANDO qualquer feature de IA é usada
ENTÃO nenhum valor em R$ é exibido ou carregado
```

---

## Dados Mockados

Sem mocks de dados novos — as respostas simuladas **derivam dos mocks existentes** das features de origem (002/003/004/006/007/010/012/016). Criar apenas `src/features/ia/mocks/` com: respostas de insight por período, mapa de perguntas→respostas (B7), textos de redação (C10), fluxos do simulador (D11), e cenários de anomalia (A2/B6) referenciando IDs reais dos mocks.

---

## Fases de Implementação (ordem interna do one-shot — entrega única)

| Fase | Objetivo | Estimativa |
|------|----------|------------|
| 1 | **Fundação:** contratos da camada IA + MockProvider + componentes compartilhados (BotaoIA, CardInsight, BadgeAnomalia, CampoResultadoIA) | ~6-8 arquivos |
| 2 | **Grupo A** (A1–A4) nos fluxos de campo/apontamento/abastecimento | ~6-8 |
| 3 | **Grupo B** (B5–B8) nos painéis analíticos/financeiro | ~6-8 |
| 4 | **Grupos C+D** (C9–C10, D11–D12) | ~6-8 |
| 5 | **Revisão integrada:** estados de tela, barreira financeira verificada, responsividade, rótulos "IA" | ~2-3 |

---

## Dependências

| Item | Status |
|------|--------|
| PRDs 002/003/004/006/007/010/011/012 (features de origem) | ✅ Implementados |
| Patch **Retrofit** | ⏳ **Aplicar antes** |
| PRD-015 e PRD-016 (homes/gerencial — B5/B7/B8 vivem lá) | ⏳ **Implementar antes ou junto** (B5 exige o 016) |

### Perguntas em Aberto

- [ ] Provider real pretendido na Fase 4 (Anthropic Claude API + vision/speech?) — não bloqueia o mock, orienta os contratos
- [ ] Quais as 8–10 perguntas exemplo do B7 que o Leonardo realmente faria?
- [ ] Intents prioritárias do chatbot (D11) e tom de voz das mensagens
- [ ] B8: existe histórico suficiente de pagamento para o mock ser crível?
- [ ] Voz (A3): PT-BR only? Precisa funcionar offline (impacta escolha de provider na Fase 4)?

---

## Considerações de Segurança

| Dado | Proteção |
|------|----------|
| Saídas de IA com R$ (A4-valor, B5, B7, B8, C9) | Retaguarda-only; nunca importadas em `/app/*` |
| Fotos (horímetro/cupom) e áudio (voz) | Evidência/insumo — na Fase 4, storage controlado + não logar conteúdo |
| Textos gerados visíveis ao cliente (C10, D11) | Sem valores internos; revisão humana antes de enviar |

---

## Protocolo One-Shot — Notas para o Agente Desenvolvedor

> **Contexto:** Você é o **Claude Sonnet 5** operando via Claude Code CLI. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web). Siga as convenções do `CLAUDE.md` do repositório. **Este PRD é one-shot: as 12 features são implementadas numa única execução.**

### ⚠️ PROTOCOLO OBRIGATÓRIO (nesta ordem, sem pular etapas)

**ETAPA 1 — ANÁLISE TOTAL (antes de qualquer código):**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."
- Ler **este PRD inteiro** e as 12 features.
- Ler o `CLAUDE.md` e explorar o código das features de origem (002/003/004/006/007/010/011/012/015/016).
- Verificar se o **patch Retrofit** foi aplicado e se 015/016 existem — se não, **reportar antes de prosseguir**.

**ETAPA 2 — DÚVIDAS CONSOLIDADAS (uma única rodada):**
- Mapear **todas** as ambiguidades das 12 features e das Perguntas em Aberto.
- Apresentar **todas as perguntas de uma só vez**, agrupadas por feature — **não** perguntar em conta-gotas ao longo da implementação.
- Aguardar as respostas do Arquiteto/usuário.

**ETAPA 3 — PLANO ÚNICO:**
- Apresentar o plano completo (arquivos por fase, ordem, contratos da camada IA) para ciência.

**ETAPA 4 — IMPLEMENTAÇÃO ONE-SHOT:**
- Implementar **as 12 features numa única execução contínua**, na ordem das Fases 1→5.
- Dúvida nova no meio do caminho: **não parar** — adotar o default mais conservador (IA sugere/humano confirma; fallback manual; retaguarda-only quando houver R$), registrar a decisão e seguir.
- Validar cada fase internamente antes da seguinte (testes de compilação/render).

**ETAPA 5 — FECHAMENTO (uma única vez, ao final de tudo):**
- Incrementar a versão: **um único MINOR** para a suíte (codinome sugerido: **"Copilot"**) — [SemVer](https://semver.org/)
- `CHANGELOG.md`: entrada única com as 12 features em **Added** — [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- Renomear este arquivo adicionando `_DONE`
- Atualizar o `INDEX-PRDs-antonello.md`
- Atualizar a seção "Status de Implementação" abaixo, listando as decisões assumidas na Etapa 4

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **IA sugere, humano confirma** | Nenhuma gravação automática de saída de IA |
| **Fallback universal** | IA indisponível → fluxo manual intacto |
| **Não bloquear fluxo principal** | Falha em um componente de IA não derruba a tela |
| **Provider plugável** | Toda chamada via contratos da camada `ia/` — nunca inline na UI |
| **Derivar, não duplicar** | Respostas mockadas coerentes com os mocks/cálculos existentes (013/014 são fonte da verdade) |
| **Documentar decisões** | Defaults assumidos na Etapa 4 registrados no fechamento |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Perguntar em várias rodadas ou parar a implementação para novas dúvidas (Etapa 2 é única) |
| Fragmentar a entrega (implementar só parte das 12 e versionar) |
| Chamar APIs reais de IA nesta fase |
| Exibir/importar qualquer saída de IA com R$ em `/app/*` |
| Aplicar saída de IA sem confirmação humana |
| Lógica de IA inline nos componentes (fora da camada `ia/`) |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-07-07 |
| **Versão do App** | 0.19.0 "Copilot" |
| **Implementado por** | Claude Code (Sonnet 5) |
| **Decisões assumidas (Etapa 4)** | A1 absorveu `ocr.ts` (zero regressão); B7 mora no header global da retaguarda; as 9 perguntas de exemplo do B7 foram geradas pela IA (não fornecidas pelo usuário); D11 usa exatamente as 3 intents do PRD com tom cordial/direto; D12 vive como aba dentro do diálogo de Nova OS, só para `hora_maquina`; C10 reaproveita `montarResumoServico` (011) em vez de um segundo cálculo; provider real de Fase 4 documentado como Anthropic Claude API para texto/insight/perguntas, visão/fala em aberto |
| **Observações** | Verificação via `vitest`/`tsc`/`build` + greps de barreira financeira e rótulo "IA". Checagem visual em navegador (responsividade, light/dark) fica a critério do usuário, que optou por validar pessoalmente esta rodada — mesmo padrão do PRD-016/PRD-019 (Painel Operacional). Por decisão explícita do usuário, `docs/prds/INDEX-PRDs-antonello.md` **não** foi atualizado neste fechamento — fica pendente de revisão manual. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial — suíte one-shot com 12 features de IA |

---

**AILA - Sistemas Inteligentes**
