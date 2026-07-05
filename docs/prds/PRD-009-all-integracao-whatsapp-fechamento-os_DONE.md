# PRD-009: Integração — Aviso ao Cliente por WhatsApp (via n8n)

> **✅ Provedor definido (2026-07-04):** **múltiplos provedores** — **Evolution API**, **Evolution GO**, **WhatsApp Cloud API (Meta)** e **OpenWA**, com arquitetura de adapter/seleção de provedor (ver "Arquitetura Multi-Provedor" abaixo). Os servidores já estão em produção (fora deste repositório). A orquestração permanece no **n8n**.
>
> **⚠️ Escopo desta versão (MVP mockado — Frontend First):** o `CLAUDE.md` do projeto mantém a fase atual como **Frontend First** ("NÃO conectar backend real... backend só será implementado após aprovação do projeto"). A definição de provedor acima **não** revoga essa fase — o que muda é que a spec deixa de ter campos `[a definir]` de provedor, mas a implementação **desta versão** é mockada em `src/mocks/`: seleção de provedor ativo, simulação do disparo ao fechar a OS e log de avisos, sem nenhum webhook real para o n8n nem mensagem real enviada. A seção "Especificação Técnica" abaixo documenta o formato real de cada provedor como **referência para a Fase 4** (backend/n8n real), não como algo chamado por este MVP.

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Repositório** | [a definir — repo único / monorepo] |
| **Objetivo** | Avisar o cliente por WhatsApp quando um serviço (OS) é concluído, usando o n8n como camada de orquestração |
| **Tipo** | Integração |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Média |
| **Ambiente** | Backend / Automação (evento do app → n8n → WhatsApp) |
| **Épico** | Onda 2 — Estrutura |
| **PRDs Relacionados** | PRD-003 (OS — gatilho do aviso), PRD-004 (faturamento), PRD-008 (cobrança — pode enviar o link), PRD-011 (comprovante) |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

---

## Informações do Serviço Externo

### Dados do Provedor

| Campo | Valor |
|-------|-------|
| **Nome do Serviço** | **Evolution API**, **Evolution GO**, **WhatsApp Cloud API (Meta)** e **OpenWA** (multi-provedor — servidores já em produção) |
| **Orquestração** | **n8n** (webhook + fluxo de automação), que já desacopla o app de qual provedor está ativo |
| **Documentação** | Evolution API: https://doc.evolution-api.com · Meta Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api · OpenWA/Evolution GO: docs internas do provedor |
| **Tipo de API** | REST (via nó do n8n, para todos os provedores) |
| **Ambiente** | Teste (número/instância de homologação) → Produção |

### Arquitetura Multi-Provedor

O app nunca fala diretamente com o provedor de WhatsApp — sempre via **n8n**, que abstrai qual dos quatro está ativo. No app, o que existe é um **seletor de provedor ativo** (config da retaguarda) que só decide **qual fluxo do n8n** é chamado, e o texto de log/preview da mensagem:

```typescript
type ProvedorWhatsApp = "evolution_api" | "evolution_go" | "meta_cloud_api" | "openwa";

interface AdapterWhatsApp {
  provedor: ProvedorWhatsApp;
  enviarAviso(payload: EventoOSFechada): EnvioWhatsApp; // mock: gera log de envio simulado
}
```

Trocar de provedor = trocar qual fluxo n8n é acionado (ou, no MVP mockado, qual "adapter mock" gera o log) — nunca reescrever a lógica de disparo do app.

### Credenciais Necessárias (referência para Fase 4)

| Credencial | Tipo | Onde Obter |
|------------|------|------------|
| Token/API Key (por provedor ativo) | Acesso ao provedor | Painel do provedor (Evolution API / Evolution GO / Meta / OpenWA) |
| Instância / Phone Number ID | Identificação do remetente | Config do provedor |
| Secret do webhook n8n | Proteção do gatilho | Config do n8n |

> ⚠️ **NUNCA** incluir credenciais reais neste documento. Ficam no **n8n** (credenciais nativas) e/ou variáveis de ambiente do backend — nunca no frontend. No MVP mockado desta versão, não há nenhuma credencial real envolvida.

### Limites e Quotas (referência para Fase 4)

| Limite | Valor | Consequência |
|--------|-------|--------------|
| Janela de mensagem / templates (Meta Cloud API) | Mensagens proativas fora da janela de 24h exigem template pré-aprovado | Enviar via template ou adiar |
| Evolution API / Evolution GO / OpenWA | Não-oficiais — sem janela de template, mas sujeitos a bloqueio por uso indevido | Rate limit e boas práticas de envio |

> **Nota:** a regra de janela/template é **específica de cada provedor** — por isso o seletor de provedor ativo importa mesmo no MVP: o preview da mensagem deve indicar quando o provedor selecionado exige template (Meta) e quando não exige (Evolution/OpenWA).

---

## Contexto da Integração

### Por que Integrar?

Hoje o cliente fica sem retorno até alguém ligar ou passar no local. Um **aviso automático** ao concluir o serviço melhora a percepção, adianta a confirmação/pagamento e reduz ligações. O disparo natural é o **fechamento da OS** (PRD-003) — e o aviso pode carregar o **comprovante** (PRD-011) ou o **link de cobrança** (PRD-008).

### Fluxo de Dados

```
┌─────────────┐  evento: OS fechada   ┌──────────┐  enviar msg   ┌─────────────┐
│   NOSSO     │ ───(webhook)────────▶ │   n8n    │ ────────────▶ │  WhatsApp   │
│  BACKEND    │                        │ (fluxo)  │               │ (provedor)  │
│ (PRD-003)   │ ◀── status (opcional) ─│          │ ◀──────────── │             │
└─────────────┘                        └──────────┘  entrega       └─────────────┘
                                                                          │
                                                                          ▼
                                                                      Cliente
```

### Direção da Integração

| Direção | Uso |
|---------|-----|
| **Outbound** | App → n8n → WhatsApp: enviar o aviso (MVP) |
| **Inbound (opcional)** | Status de entrega / resposta do cliente → n8n → app (escopo futuro) |

---

## Escopo da Integração

### Operações Incluídas

| Operação | Onde | Prioridade |
|----------|------|------------|
| Disparar evento "OS fechada" para o n8n (webhook) | Backend do app | Alta |
| Formatar e enviar mensagem de aviso | Fluxo n8n → provedor | Alta |
| Anexar link do comprovante/cobrança (se houver) | Fluxo n8n | Média |
| Registrar status de envio | n8n (log) / app (opcional) | Baixa |

### Operações Excluídas (Escopo Futuro)

| Operação | Motivo |
|----------|--------|
| Conversa bidirecional / atendimento | Fora do MVP |
| Chatbot de respostas | Escopo futuro |

---

## Especificação Técnica

### Gatilho (App → n8n)

- Ao **fechar uma OS** (PRD-003), o backend chama um **webhook do n8n** com o payload do evento.
- O webhook é protegido por **secret**; o n8n valida antes de processar.

**Payload do evento (shape ilustrativo):**

```json
{
  "evento": "os_fechada",
  "os_numero": "OS-2026-0042",
  "cliente": { "nome": "...", "telefone": "55DDDNUMERO" },
  "obra": "...",
  "link_comprovante": "https://... (opcional)",
  "link_cobranca": "https://... (opcional)"
}
```

### Envio (n8n → WhatsApp)

- O fluxo n8n monta a mensagem (texto ou template) e chama o provedor.
- Telefone normalizado para o formato internacional (`55` + DDD + número).
- Tratar retorno do provedor; em falha, **retry** no próprio fluxo e log.

**Mensagem (exemplo de conteúdo — sem valores internos por padrão):**

> "Olá, [cliente]! O serviço da obra [obra] (OS [número]) foi concluído. Segue o comprovante: [link]. Qualquer dúvida, estamos à disposição — Antonello Terraplanagem."

---

## Mapeamento de Dados

| Campo Nosso Sistema | Uso no n8n / WhatsApp | Transformação |
|--------------------|------------------------|---------------|
| `cliente.telefone` | Destinatário | Normalizar p/ E.164 (`55DDDNUMERO`) |
| `cliente.nome` | Saudação | Nenhuma |
| `os.numero`, `obra` | Corpo da mensagem | Nenhuma |
| `link_comprovante` (PRD-011) | Anexo/link | Opcional |
| `link_cobranca` (PRD-008) | Anexo/link | Opcional |

> **Barreira financeira:** o aviso **não** expõe preços/valores internos; no máximo, um **link** de cobrança gerado pelo PRD-008.

---

## Tratamento de Erros

### Retry / Fallback

| Cenário | Estratégia |
|---------|-----------|
| Provedor WhatsApp indisponível | Retry no fluxo n8n com backoff; após N tentativas, marcar falha e notificar a retaguarda |
| Telefone inválido/ausente | Não enviar; sinalizar na retaguarda para correção do cadastro |
| Fora da janela / template requerido (Meta) | Usar template aprovado ou adiar; registrar motivo |
| Evento duplicado | Idempotência por `os_numero` + tipo de evento |

### Monitoramento

| Métrica | Como |
|---------|------|
| Avisos enviados × falhos | Log do n8n |
| Latência do envio | Tempo entre evento e entrega |
| Telefones inválidos | Relatório para higienização do cadastro |

---

## Fases de Implementação

> **Nota:** as fases 1–4 abaixo descrevem o alcance final (Fase 4, backend/automação real via n8n). **A versão implementada agora é um MVP mockado** (ver nota no topo do documento): seletor de provedor ativo + simulação do disparo ao fechar a OS + log de avisos, tudo em `src/mocks/`/`src/features/`, sem webhook real nem envio real. A tabela abaixo permanece como guia para quando o backend real (n8n) for aprovado.

| Fase | Objetivo | Onde |
|------|----------|------|
| 1 | Webhook do app → n8n + secret + evento "OS fechada" | Backend + n8n |
| 2 | Fluxo n8n: formatar e enviar mensagem (provedor de teste) | n8n |
| 3 | Anexar links (comprovante/cobrança) + retry/fallback + normalização de telefone | n8n |
| 4 | Log de status + validação teste→produção | n8n + app |

---

## Critérios de Aceitação

### Envio ao fechar OS

```gherkin
DADO uma OS fechada com cliente que tem telefone válido
QUANDO o evento é disparado ao n8n
ENTÃO o cliente recebe a mensagem de conclusão no WhatsApp
  E, se houver, o link do comprovante/cobrança acompanha
  E nenhum valor interno é exposto
```

### Telefone inválido

```gherkin
DADO um cliente sem telefone válido
QUANDO o evento é disparado
ENTÃO a mensagem não é enviada
  E a retaguarda é sinalizada para corrigir o cadastro
```

### Falha do provedor

```gherkin
DADO que o provedor WhatsApp está indisponível
QUANDO o fluxo tenta enviar
ENTÃO faz retry conforme a estratégia
  E registra a falha, sem quebrar o fechamento da OS
```

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Onda 2 — Estrutura"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| — | PRD-003 | Ordem de Serviço | ⏳ (documentado) | Gatilho (OS fechada) |
| — | PRD-011 | Comprovante Assinado | ⏳ (documentado) | Link opcional na mensagem |
| — | PRD-008 | Gateway de Cobrança | ⏳ (documentado) | Link de cobrança opcional |
| **N** | **PRD-009** | **Aviso por WhatsApp (n8n)** | **🔄 ATUAL** | Depende de PRD-003 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Credenciais

| Item | Requisito |
|------|-----------|
| Armazenamento | Credenciais no **n8n** e/ou env do backend; nunca no frontend |
| Webhook | Protegido por **secret**; rejeitar chamadas não autenticadas |

### Dados em Trânsito e Privacidade

| Item | Requisito |
|------|-----------|
| Protocolo | HTTPS obrigatório |
| Dados pessoais | Enviar o mínimo necessário (nome, telefone, dados da OS); sem valores internos |
| Consentimento | Confirmar base para envio de mensagens ao cliente (LGPD) |

### Logs

| Logar | NÃO logar |
|-------|-----------|
| Evento, status de envio, timestamps | Tokens/credenciais |
| Id da OS | Conteúdo sensível além do necessário |

---

## Perguntas em Aberto

- [x] **Qual provedor de WhatsApp?** — **Resolvido (2026-07-04):** múltiplos — Evolution API, Evolution GO, WhatsApp Cloud API (Meta) e OpenWA, via adapter selecionável (ver "Arquitetura Multi-Provedor"). Servidores já em produção.
- [ ] O disparo é **só** ao fechar a OS, ou também no faturamento/emissão de cobrança?
- [ ] A mensagem leva **comprovante** (PRD-011), **link de cobrança** (PRD-008), ambos ou nenhum?
- [ ] Confirmar **base legal (LGPD)** e opt-in do cliente para receber mensagens.
- [ ] O status de entrega precisa **voltar** para o app, ou basta o log no n8n?
- [ ] Este PRD substitui ou **coexiste** com o comprovante assinado (PRD-011) como forma de confirmação? (decisão do discovery)

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web). Siga as convenções do `CLAUDE.md`. **Provedor já definido (multi-provedor: Evolution API, Evolution GO, Meta Cloud API, OpenWA) — implemente como MVP mockado (Frontend First), não como integração real.**

### Esclarecimento de Dúvidas

> **💬 A implementação real (Fase 4, via n8n) só ocorre após aprovação do backend; o MVP mockado usa apenas dados simulados em `src/mocks/`, sem webhook nem envio real.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. CREDENCIAIS:**
> - Credenciais no n8n/backend; nunca no frontend.
> - Validar o secret do webhook; usar instância de teste antes de produção.

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

**Codinomes:** Para MINOR/MAJOR, gerar codinome em inglês baseado no contexto (sugestão: **"Messenger"**).

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Falha no aviso **nunca** trava o fechamento da OS |
| **Fail gracefully** | Retry no n8n; sinalizar falha sem quebrar o app |
| **Idempotência** | Não enviar o mesmo aviso duas vezes |
| **Desacoplar via n8n** | Trocar provedor = mudar o fluxo, não o app |
| **Documentar decisões** | Registrar decisões técnicas durante a implementação |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Expor valores internos na mensagem (no máximo, link de cobrança) |
| Colocar credenciais no frontend |
| Acoplar o app diretamente à API do WhatsApp (usar n8n) — vale também no mock: nunca importar SDK de provedor no frontend |
| Enviar mensagem sem base LGPD / opt-in (Fase 4) |
| Deixar a falha do aviso quebrar o fechamento da OS |
| Fazer qualquer chamada de rede real ou usar credencial real no MVP mockado |

---

## Troubleshooting

| Problema | Causa provável | Solução |
|----------|----------------|---------|
| Mensagem não chega | Fora da janela / template ausente (Meta) | Usar template aprovado; conferir provedor |
| 401 no provedor | Token/instância errada | Verificar credenciais no n8n |
| Telefone rejeitado | Formato incorreto | Normalizar para E.164 (`55DDDNUMERO`) |
| Aviso duplicado | Falta de idempotência | Dedup por `os_numero` + evento |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ CONCLUÍDO (MVP mockado — Frontend First) |
| **Data de Implementação** | 2026-07-05 |
| **Versão do App** | 0.16.0 (Messenger) |
| **Implementado por** | Claude Code (Subagent-Driven Development — 4 tasks + revisão final) |
| **Ambiente Testado** | Teste (dados mockados, sem integração real com nenhum provedor) |
| **Observações** | MVP 100% mockado, multi-provedor (Evolution API, Evolution GO, WhatsApp Cloud API/Meta, OpenWA) selecionável em `/admin/integracoes`. Nenhuma chamada de rede real, nenhuma credencial. Pendência conhecida e não resolvida nesta sessão: `docs/prds/INDEX-PRDs-antonello.md` não foi atualizado — outra sessão concorrente ("Agente Arquiteto") tinha uma edição não commitada nesse arquivo (com um PRD-016 "Dashboard Gerencial" proposto) no momento do fechamento deste PRD, sem confirmação do usuário sobre reconciliação; rascunho externo preservado em `docs/prds/INDEX-PRDs-antonello.ARQUITETO-DRAFT-2026-07-04.md`. Reconciliar o índice antes de considerar o roadmap numerado (000-014) + PRDs 008/009 totalmente documentado no índice. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| Jun/2026 | v1 | Criação inicial (provisória — provedor em aberto) |
| 2026-07-04 | v2 | Provedor definido (multi-provedor: Evolution API + Evolution GO + Meta Cloud API + OpenWA, servidores já em produção); escopo desta versão redefinido como MVP mockado (Frontend First) |
| 2026-07-05 | v3 | Implementado como MVP mockado (v0.16.0 "Messenger") via Subagent-Driven Development, 4 tasks + revisão final aprovada sem Critical/Important |

---

**AILA - Sistemas Inteligentes**
