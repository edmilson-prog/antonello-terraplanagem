# Spec de Design — Integração real WAHA (WhatsApp HTTP API)

> **Data:** 2026-07-10
> **PRD relacionado:** `docs/prds/PRD-009-all-integracao-whatsapp-fechamento-os_DONE.md` — hoje 100% mockado.
> Este spec conecta a arquitetura já decidida no PRD-009 a um provedor real (WAHA), substituindo
> o mock de `avisos-whatsapp` por envio de verdade, sem esperar o n8n existir.
> **Projeto Supabase:** já usado pelo restante da plataforma (real desde PRD-017/018).
> **Infra WAHA:** já em produção em `https://waha.ailainteligente.com.br` (stack `/opt/stacks/waha/`,
> engine GOWS/whatsmeow). Credenciais (API key, basic auth do dashboard) fornecidas pelo usuário —
> tratadas como segredo, nunca hardcodadas no código nem versionadas.

---

## 1. Decisões de Design (aprovadas em brainstorming)

| Decisão | Escolha | Razão |
|---------|---------|-------|
| **Escopo** | Configuração + envio real end-to-end (não só a tela de config) | Escolhido explicitamente pelo usuário — WAHA já está no ar, sem motivo pra parar só na config |
| **Papel do n8n** | Edge Function assume o papel de intermediário **por ora** | PRD-009 exige App → n8n → provedor (nunca direto); n8n ainda não existe. A Edge Function preserva o espírito da regra (frontend nunca fala com o provedor) sem bloquear o envio real hoje. Quando o n8n existir, ele substitui ou envolve a Edge Function sem mudar o contrato do frontend |
| **Onde fica a config de conexão** (URL base, sessão, API key) | Env vars / secrets da Edge Function — **sem tabela no Supabase** | Instância única, single-tenant (uma empresa, um número) — uma tabela+RLS só pra guardar 3 valores fixos é overengineering |
| **UI de sessão/QR** | Embutir o QR code dentro de `/admin/integracoes` | Escolhido explicitamente — evita que o proprietário precise acessar o dashboard separado do WAHA pra reconectar |
| **Provedor no Select existente** | Mantém o Select multi-provedor (não remove os outros 3 mockados); adiciona `waha` como 5º valor | Não remove feature existente sem necessidade (regra do `CLAUDE.md`); os outros seguem mockados/inertes |
| **Composição da mensagem** | Continua no frontend (`montarMensagemAviso`, já testado) — Edge Function só recebe `chatId`+`text` prontos | Mantém a lógica de negócio testável em vitest; Edge Function fica genérica e burra, reutilizável |
| **Dedup "um aviso por OS"** | `UNIQUE(os_id)` na tabela (hoje só é checagem em memória) | Trava no banco contra corrida de duplo clique — antes só existia porque a store era um array em memória |
| **Autenticação nas Edge Functions** | `verify_jwt` padrão do Supabase + checagem de `usuarios_retaguarda` dentro da function | Só recepção/proprietário disparam envio real (nunca operador); retaguarda já usa Supabase Auth padrão (confirmado em `is_retaguarda()`), então `auth.uid()` funciona sem tocar no esquema de PIN do operador |
| **Chatbot / D11 (IA)** | Fora de escopo — continua mockado | Receber mensagens (webhook de entrada) é feature maior, não pedida aqui; PRD-019 já previa "envio real = Fase 4 via n8n (009)" |

---

## 2. Arquitetura Geral

```
/admin/integracoes (React) ──┐
                              ├─→ Edge Function `waha-sessao`      ──→ WAHA (status / QR / start / logout)
Fechar OS (retaguarda) ───────┤
                              └─→ Edge Function `waha-enviar-texto` ──→ WAHA (POST /api/sendText)
```

Duas Edge Functions **finas** — seguram o segredo (`WAHA_API_KEY`) e repassam para o WAHA. O
frontend nunca chama `waha.ailainteligente.com.br` diretamente; sempre passa pela Edge Function
(`supabase.functions.invoke(...)`), que roda com o secret do lado do servidor.

**Variáveis de ambiente da Edge Function** (Supabase secrets, `supabase secrets set`):

| Nome | Valor | Observação |
|------|-------|------------|
| `WAHA_BASE_URL` | `https://waha.ailainteligente.com.br` | Sem barra final |
| `WAHA_API_KEY` | (a chave já gerada, ver notas de deploy do usuário) | Nunca em `.env` do frontend, nunca prefixo `VITE_` |
| `WAHA_SESSION` | `default` | Nome da sessão única da empresa |

---

## 3. Modelo de Dados (migration nova)

Altera a tabela `avisos_whatsapp` já existente (criada em `20260708100008_outros.sql`):

```sql
-- Ampliar o provedor real
ALTER TABLE public.avisos_whatsapp DROP CONSTRAINT avisos_whatsapp_provedor_check;
ALTER TABLE public.avisos_whatsapp ADD CONSTRAINT avisos_whatsapp_provedor_check
  CHECK (provedor = ANY (ARRAY['evolution_api', 'evolution_go', 'meta_cloud_api', 'openwa', 'waha']::text[]));

-- Ampliar os status de falha reais (antes só existiam 2, pensados pro mock)
ALTER TABLE public.avisos_whatsapp DROP CONSTRAINT avisos_whatsapp_status_check;
ALTER TABLE public.avisos_whatsapp ADD CONSTRAINT avisos_whatsapp_status_check
  CHECK (status = ANY (ARRAY['enviado', 'falha_telefone_invalido', 'falha_sessao_desconectada', 'falha_envio']::text[]));

-- Um aviso por OS, garantido no banco (hoje só era checado em memória pelo mock)
ALTER TABLE public.avisos_whatsapp ADD CONSTRAINT avisos_whatsapp_os_id_key UNIQUE (os_id);
```

Sem tabela nova. `usuarios_retaguarda`, `is_retaguarda()` e a policy `avisos_whatsapp_retaguarda_all`
já existem e cobrem select/insert/update/delete para recepção/proprietário — a store real só passa
a usá-los (mesmo padrão de `ordensStore`/`orcamentosStore`).

**Tipos TypeScript:** `ProvedorWhatsApp` (`src/shared/types`) ganha `"waha"`; `StatusAvisoWhatsApp`
(ou o union equivalente) ganha `"falha_sessao_desconectada"` e `"falha_envio"`.

---

## 4. Edge Functions

### 4.1 `waha-sessao`

`supabase/functions/waha-sessao/index.ts`

| Método | Uso | Repassa para WAHA |
|--------|-----|---------------------|
| `GET` | Status atual da sessão | `GET /api/sessions/{WAHA_SESSION}` → devolve `{ status, numero? }` (extrai `me.id` quando `status === "WORKING"`, formatado sem o sufixo `@c.us`) |
| `GET ?qr=1` | QR code para escanear | `GET /api/{WAHA_SESSION}/auth/qr?format=base64` → devolve `{ qr: "data:image/png;base64,...." }`. Se a sessão já estiver `WORKING`, devolve erro 409 (nada pra escanear) |
| `POST { action: "start" }` | Inicia a sessão (idempotente) | `POST /api/sessions/{WAHA_SESSION}/start` |
| `POST { action: "logout" }` | Desconecta o número atual | `POST /api/sessions/{WAHA_SESSION}/logout` |

Fluxo de autenticação (ambas as functions): a function extrai o usuário do JWT (`supabase.auth.getUser()`
usando o client server-side com o header `Authorization` repassado), confere que existe uma linha em
`usuarios_retaguarda` para esse `id` — se não existir, devolve 403 antes de tocar no WAHA.

Toda chamada ao WAHA usa o header `X-Api-Key: <WAHA_API_KEY>` e `Content-Type: application/json`.

### 4.2 `waha-enviar-texto`

`supabase/functions/waha-enviar-texto/index.ts`

`POST { chatId: string, text: string }` → `POST {WAHA_BASE_URL}/api/sendText` com body
`{ session: WAHA_SESSION, chatId, text }`.

Resposta ao frontend: `{ ok: true }` ou `{ ok: false, motivo: string }`. Mapeamento de erro:

| Situação no WAHA | `motivo` devolvido |
|-------------------|---------------------|
| Sessão não está `WORKING` (WAHA responde 422/ "session not connected") | `"sessao_desconectada"` |
| Qualquer outro erro HTTP/rede | `"falha_envio"` |

A function **não** conhece OS, cliente ou a tabela `avisos_whatsapp` — só sabe enviar texto para um
`chatId`. Isso mantém a function genérica e reutilizável fora do fluxo de aviso de fechamento de OS.

---

## 5. Migração da store (`avisosWhatsAppStore`)

Segue exatamente o padrão já estabelecido por `ordensStore`/`orcamentosStore` nesta sessão: cache em
memória + `estado {isLoading, error}` + `useSyncExternalStore`, recarregando após cada mutação.

`src/features/aviso-whatsapp/avisos-whatsapp-store.ts` deixa de ler `src/mocks/avisos-whatsapp.ts`.

`dispararAviso(os: OrdemServico, cliente: Cliente): Promise<ResultadoDispararAviso>` — perde o
parâmetro `provedor` (sempre `"waha"`, único provedor real hoje):

1. Consulta se já existe aviso para `os.id` (select com `.eq("os_id", os.id)`) — se existir, retorna
   `{ ok: false, motivo: "Aviso já disparado para esta OS." }` sem tocar no WAHA.
2. Sem `cliente.telefone` → insere linha com `status: "falha_telefone_invalido"`, **sem** chamar a
   Edge Function (evita gasto de request por um erro que já sabemos de antemão).
3. Monta `chatId` via novo helper `telefoneParaChatId(telefone: string): string` em
   `src/features/aviso-whatsapp/derivacoes.ts` — remove não-dígitos, prefixa `"55"` (DDI Brasil,
   único mercado da empresa), sufixo `"@c.us"`. Monta `mensagem` via `montarMensagemAviso` (já
   existe, já testado, nunca cita valores).
4. Chama `supabase.functions.invoke("waha-enviar-texto", { body: { chatId, text: mensagem } })`.
5. Grava o resultado: `enviado` (sucesso) / `falha_sessao_desconectada` / `falha_envio`, com
   `mensagem_preview: mensagem` quando enviado, `""` quando falha.
6. Recarrega o cache (`carregar()`) e retorna `{ ok, aviso }` ou `{ ok: false, motivo, aviso? }` —
   mesma forma de retorno de hoje, pra não precisar reescrever quem consome.

`src/features/ordem-servico/components/ordem-detalhe-retaguarda.tsx` (função `fechar`, já `async`):
troca a chamada síncrona `avisosWhatsAppStore.dispararAviso(r.ordem, cliente, provedorWhatsAppAtivo)`
por `await avisosWhatsAppStore.dispararAviso(r.ordem, cliente)` — o parâmetro `provedorWhatsAppAtivo`
some (não faz mais sentido escolher provedor por disparo já que só um é real); a leitura
`use-provedor-whatsapp.ts` deixa de ser usada nesse componente (segue existindo pra alimentar o
Select em `/admin/integracoes`).

---

## 6. UI — `/admin/integracoes`

A seção "WhatsApp" existente mantém o Select de provedor (`PROVEDORES_WHATSAPP` ganha `"waha"`).
Quando o provedor selecionado é `"waha"`, um novo painel de conexão aparece abaixo do Select:

- **Status ao vivo**: busca `GET waha-sessao` ao montar a página; enquanto `status !== "WORKING"`,
  faz polling a cada 3s (para de perguntar assim que conectar).
- **Desconectado/parado**: botão "Conectar" → `POST waha-sessao {action:"start"}`, depois busca o QR
  (`GET waha-sessao?qr=1`) e exibe `<img src={qr} />`. Continua o polling de status; assim que virar
  `WORKING`, esconde o QR.
- **Conectado**: mostra "Conectado como {número}" + botão "Desconectar" (`POST {action:"logout"}`),
  útil se for preciso trocar o número vinculado.
- Estados de loading/erro seguem o mesmo padrão visual das outras seções da página (skeleton simples,
  mensagem de erro com retry).

Para outros provedores (`evolution_api`, `evolution_go`, `meta_cloud_api`, `openwa`) nada muda — o
painel de conexão só aparece para `waha`, os demais seguem só cosméticos/mockados como já eram.

---

## 7. Testes

`vitest.setup.ts` (fake harness): estender a tabela mockada `avisos_whatsapp` (já vai existir com o
padrão de `ordens_servico`/`orcamentos`) e adicionar um mock de `supabase.functions.invoke` — por
padrão resolve `{ data: { ok: true }, error: null }`, sobrescrito por teste quando precisar simular
falha de envio ou sessão desconectada.

Casos a cobrir em `avisos-whatsapp-store.test.ts` (reescrita, mesmo espírito da reescrita de
`orcamentos-store.test.ts` nesta sessão):
- cliente sem telefone → `falha_telefone_invalido`, `functions.invoke` **não** é chamado.
- `functions.invoke` retorna `{ok:true}` → grava `enviado`, mensagem preenchida.
- `functions.invoke` retorna `{ok:false, motivo:"sessao_desconectada"}` → grava `falha_sessao_desconectada`.
- segunda chamada pra mesma OS → retorna erro de duplicidade sem tocar na Edge Function.

As Edge Functions em si (Deno) não entram no vitest — ficam fora do escopo de teste automatizado
deste spec; validação é manual (smoke test do usuário no navegador, como já é convenção do projeto).

---

## 8. Fora de Escopo

- **Chatbot/D11 (IA)** — receber mensagens do WhatsApp (webhook de entrada do WAHA) e responder via
  `responderChatbotCliente` continua mockado. Vira dois-vias real é um projeto separado.
- **n8n** — quando existir, decide-se então se ele chama a Edge Function, a envolve, ou a substitui.
  Nenhuma mudança de contrato é esperada no frontend quando isso acontecer.
- **Outros provedores** (`evolution_api`, `evolution_go`, `meta_cloud_api`, `openwa`) seguem 100%
  mockados — nenhum ganha integração real neste spec.
- **Multi-sessão / múltiplos números** — a empresa tem um único WhatsApp; `WAHA_SESSION=default`
  fixo é suficiente.
