# Integração real WAHA (WhatsApp) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o mock de aviso WhatsApp (PRD-009) por envio real via WAHA (self-hosted, `https://waha.ailainteligente.com.br`), com Edge Functions do Supabase como intermediário seguro, e uma tela de conexão/QR embutida em `/admin/integracoes`.

**Architecture:** Duas Edge Functions finas (`waha-sessao`, `waha-enviar-texto`) seguram o `WAHA_API_KEY` como secret e repassam chamadas HTTP ao WAHA — o frontend nunca fala com o WAHA diretamente, só invoca as functions via `supabase.functions.invoke`. A store `avisosWhatsAppStore` migra de mock em memória para a tabela real `avisos_whatsapp` (já existe no Supabase), seguindo o mesmo padrão já usado por `ordensStore`/`orcamentosStore` (cache + `useSyncExternalStore` + recarregar após mutação).

**Tech Stack:** React 19 + TypeScript + Vite, Supabase (Postgres + Edge Functions/Deno), Vitest, WAHA (engine GOWS).

## Global Constraints

- Segredo `WAHA_API_KEY` **nunca** no frontend nem em `.env` com prefixo `VITE_` — só como secret de Edge Function.
- Edge Functions exigem JWT válido (`verify_jwt=true`, padrão) **e** checam que o `auth.uid()` existe em `usuarios_retaguarda` — só recepção/proprietário disparam envio, nunca operador.
- Composição de mensagem (`montarMensagemAviso`) continua no frontend, já testada — Edge Functions recebem `chatId`+`text` prontos, nunca conhecem OS/cliente.
- `chatId` do WAHA: `"55" + apenas-dígitos-do-telefone + "@c.us"` (DDI Brasil fixo, único mercado da empresa).
- Não remover os outros 3 provedores mockados (`evolution_api`, `evolution_go`, `meta_cloud_api`, `openwa`) do Select existente — `waha` é um 5º valor, os demais seguem inertes.
- `WAHA_SESSION` fixo em `"default"` — uma única sessão/número por empresa, sem multi-tenant.
- Especificação completa em `docs/superpowers/specs/2026-07-10-waha-integracao-whatsapp-design.md`.

---

### Task 1: Migration — schema de `avisos_whatsapp`

**Files:**
- Create: `supabase/migrations/<timestamp>_waha_avisos_whatsapp.sql` (nome exato gerado pelo `apply_migration`, prefixo de data igual aos existentes)

**Interfaces:**
- Produces: coluna `provedor` aceita `'waha'`; coluna `status` aceita `'falha_sessao_desconectada'` e `'falha_envio'`; constraint `UNIQUE(os_id)` chamada `avisos_whatsapp_os_id_key`.

- [ ] **Step 1: Aplicar a migration via MCP**

Use a tool `mcp__supabase__apply_migration` com:
- `name`: `waha_avisos_whatsapp`
- `query`:

```sql
ALTER TABLE public.avisos_whatsapp DROP CONSTRAINT avisos_whatsapp_provedor_check;
ALTER TABLE public.avisos_whatsapp ADD CONSTRAINT avisos_whatsapp_provedor_check
  CHECK (provedor = ANY (ARRAY['evolution_api', 'evolution_go', 'meta_cloud_api', 'openwa', 'waha']::text[]));

ALTER TABLE public.avisos_whatsapp DROP CONSTRAINT avisos_whatsapp_status_check;
ALTER TABLE public.avisos_whatsapp ADD CONSTRAINT avisos_whatsapp_status_check
  CHECK (status = ANY (ARRAY['enviado', 'falha_telefone_invalido', 'falha_sessao_desconectada', 'falha_envio']::text[]));

ALTER TABLE public.avisos_whatsapp ADD CONSTRAINT avisos_whatsapp_os_id_key UNIQUE (os_id);
```

- [ ] **Step 2: Verificar as constraints aplicadas**

Rode via `mcp__supabase__execute_sql`:

```sql
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.avisos_whatsapp'::regclass;
```

Expected: `avisos_whatsapp_provedor_check` com `'waha'` na lista, `avisos_whatsapp_status_check` com os 4 valores, e `avisos_whatsapp_os_id_key` do tipo `UNIQUE (os_id)`.

- [ ] **Step 3: Puxar a migration aplicada para o repositório**

Rode via `mcp__supabase__list_migrations` pra confirmar o nome/versão exata aplicada, depois baixe o arquivo de migration gerado remotamente para `supabase/migrations/` local (o `apply_migration` já cria a migration no projeto remoto — se o CLI local estiver configurado, `supabase db pull` sincroniza o arquivo; caso não esteja, crie manualmente o arquivo `supabase/migrations/<mesmo timestamp>_waha_avisos_whatsapp.sql` com o SQL do Step 1, para manter o histórico versionado igual aos demais arquivos em `supabase/migrations/`).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: allow waha provider and real failure statuses on avisos_whatsapp"
```

---

### Task 2: Tipos e labels — `waha` e novos status de falha

**Files:**
- Modify: `src/shared/types/index.ts:384-385`
- Modify: `src/features/aviso-whatsapp/labels.tsx`

**Interfaces:**
- Consumes: nenhuma (tipos-base).
- Produces: `ProvedorWhatsApp` inclui `"waha"`; `StatusAvisoWhatsApp` inclui `"falha_sessao_desconectada" | "falha_envio"`; `PROVEDOR_WHATSAPP_LABEL["waha"]`; `STATUS_AVISO_LABEL`/badge cobrindo os 2 novos status.

- [ ] **Step 1: Atualizar os union types**

Em `src/shared/types/index.ts`, troque as linhas 384-385:

```ts
export type ProvedorWhatsApp = "evolution_api" | "evolution_go" | "meta_cloud_api" | "openwa";
export type StatusAvisoWhatsApp = "enviado" | "falha_telefone_invalido";
```

por:

```ts
export type ProvedorWhatsApp =
  | "evolution_api"
  | "evolution_go"
  | "meta_cloud_api"
  | "openwa"
  | "waha";
export type StatusAvisoWhatsApp =
  | "enviado"
  | "falha_telefone_invalido"
  | "falha_sessao_desconectada"
  | "falha_envio";
```

- [ ] **Step 2: Atualizar os labels e o badge**

Em `src/features/aviso-whatsapp/labels.tsx`, troque o conteúdo inteiro do arquivo por:

```tsx
/* eslint-disable react-refresh/only-export-components */
import type { ProvedorWhatsApp, StatusAvisoWhatsApp } from "@/shared/types";
import { cn } from "@/lib/utils";

export const PROVEDOR_WHATSAPP_LABEL: Record<ProvedorWhatsApp, string> = {
  evolution_api: "Evolution API",
  evolution_go: "Evolution GO",
  meta_cloud_api: "WhatsApp Cloud API (Meta)",
  openwa: "OpenWA",
  waha: "WAHA",
};

export const STATUS_AVISO_LABEL: Record<StatusAvisoWhatsApp, string> = {
  enviado: "Enviado",
  falha_telefone_invalido: "Falha — telefone inválido",
  falha_sessao_desconectada: "Falha — sessão do WhatsApp desconectada",
  falha_envio: "Falha ao enviar",
};

const STATUS_AVISO_CLASS: Record<StatusAvisoWhatsApp, string> = {
  enviado: "bg-secondary/25 text-foreground border-secondary/50",
  falha_telefone_invalido: "bg-destructive/10 text-destructive border-destructive/30",
  falha_sessao_desconectada: "bg-destructive/10 text-destructive border-destructive/30",
  falha_envio: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusAvisoBadge({
  status,
  className,
}: {
  status: StatusAvisoWhatsApp;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_AVISO_CLASS[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_AVISO_LABEL[status]}
    </span>
  );
}
```

- [ ] **Step 3: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros novos relacionados a `ProvedorWhatsApp`/`StatusAvisoWhatsApp` (pode haver erros pré-existentes não relacionados — ignore-os; se algum arquivo já usar esses tipos de forma exaustiva, ex. `switch` sem `default`, o TS vai apontar — resolva adicionando os novos casos).

- [ ] **Step 4: Commit**

```bash
git add src/shared/types/index.ts src/features/aviso-whatsapp/labels.tsx
git commit -m "feat: add waha provider and real failure statuses to whatsapp types"
```

---

### Task 3: Helper `telefoneParaChatId`

**Files:**
- Modify: `src/features/aviso-whatsapp/derivacoes.ts`
- Modify: `src/features/aviso-whatsapp/derivacoes.test.ts`

**Interfaces:**
- Produces: `telefoneParaChatId(telefone: string): string` — usado pela Task 6 (store) para montar o `chatId` antes de chamar a Edge Function.

- [ ] **Step 1: Escrever o teste**

Em `src/features/aviso-whatsapp/derivacoes.test.ts`, adicione ao final do arquivo (após o `describe("avisoDaOS", ...)`):

```ts
describe("telefoneParaChatId", () => {
  it("remove formatação e prefixa o DDI 55", () => {
    expect(telefoneParaChatId("(44) 99111-0000")).toBe("5544991110000@c.us");
  });

  it("funciona com telefone já só de dígitos", () => {
    expect(telefoneParaChatId("44999990000")).toBe("5544999990000@c.us");
  });
});
```

E ajuste o import no topo do arquivo:

```ts
import { avisoDaOS, montarMensagemAviso, telefoneParaChatId } from "./derivacoes";
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/features/aviso-whatsapp/derivacoes.test.ts`
Expected: FAIL — `telefoneParaChatId is not a function` (ou erro de import).

- [ ] **Step 3: Implementar**

Em `src/features/aviso-whatsapp/derivacoes.ts`, adicione ao final do arquivo:

```ts
export function telefoneParaChatId(telefone: string): string {
  const digitos = telefone.replace(/\D/g, "");
  return `55${digitos}@c.us`;
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/features/aviso-whatsapp/derivacoes.test.ts`
Expected: PASS (todos os testes do arquivo, incluindo os 2 novos).

- [ ] **Step 5: Commit**

```bash
git add src/features/aviso-whatsapp/derivacoes.ts src/features/aviso-whatsapp/derivacoes.test.ts
git commit -m "feat: add telefoneParaChatId helper for WAHA chatId formatting"
```

---

### Task 4: Edge Functions `waha-sessao` e `waha-enviar-texto`

**Files:**
- Create: `supabase/functions/_shared/retaguarda-auth.ts`
- Create: `supabase/functions/_shared/waha-client.ts`
- Create: `supabase/functions/waha-sessao/index.ts`
- Create: `supabase/functions/waha-enviar-texto/index.ts`

**Interfaces:**
- Consumes: nenhuma do frontend (roda em Deno, isolado).
- Produces: `waha-sessao` — `GET` → `{status, numero}`; `GET ?qr=1` → `{qr}` ou erro; `POST {action:"start"|"logout"}` → `{ok}`. `waha-enviar-texto` — `POST {chatId, text}` → `{ok, motivo?}`. Consumidos pela Task 6 (store) e Task 8 (hook de UI).

Este código roda em Deno (Supabase Edge Functions) — não é validado por `tsc`/`vitest` do projeto principal; a verificação é manual, via `curl` contra a function deployada.

- [ ] **Step 1: Helper de autenticação compartilhado**

Crie `supabase/functions/_shared/retaguarda-auth.ts`:

```ts
import { createClient } from "jsr:@supabase/supabase-js@2";

export async function exigirUsuarioRetaguarda(
  req: Request,
): Promise<{ ok: true } | { ok: false; response: Response }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ ok: false, motivo: "sem_autenticacao" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const clientDoUsuario = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await clientDoUsuario.auth.getUser();
  if (userError || !userData.user) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ ok: false, motivo: "token_invalido" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const clientServico = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: retaguarda } = await clientServico
    .from("usuarios_retaguarda")
    .select("id")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!retaguarda) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ ok: false, motivo: "acesso_negado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  return { ok: true };
}
```

- [ ] **Step 2: Cliente WAHA compartilhado**

Crie `supabase/functions/_shared/waha-client.ts`:

```ts
const WAHA_BASE_URL = Deno.env.get("WAHA_BASE_URL")!;
const WAHA_API_KEY = Deno.env.get("WAHA_API_KEY")!;

export const WAHA_SESSION = Deno.env.get("WAHA_SESSION") ?? "default";

export async function wahaFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${WAHA_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": WAHA_API_KEY,
      ...(init.headers ?? {}),
    },
  });
}
```

- [ ] **Step 3: Function `waha-sessao`**

Crie `supabase/functions/waha-sessao/index.ts`:

```ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { exigirUsuarioRetaguarda } from "../_shared/retaguarda-auth.ts";
import { wahaFetch, WAHA_SESSION } from "../_shared/waha-client.ts";

interface StatusWaha {
  status?: string;
  me?: { id?: string };
}

async function buscarStatusSessao(): Promise<StatusWaha> {
  const resp = await wahaFetch(`/api/sessions/${WAHA_SESSION}`);
  if (!resp.ok) return { status: "STOPPED" };
  return (await resp.json()) as StatusWaha;
}

async function iniciarSessao(): Promise<void> {
  const criar = await wahaFetch("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ name: WAHA_SESSION, start: true }),
  });
  if (criar.ok) return;
  await wahaFetch(`/api/sessions/${WAHA_SESSION}/start`, { method: "POST" });
}

Deno.serve(async (req: Request) => {
  const auth = await exigirUsuarioRetaguarda(req);
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const jsonHeaders = { "Content-Type": "application/json" };

  if (req.method === "GET" && url.searchParams.get("qr") === "1") {
    const statusBody = await buscarStatusSessao();
    if (statusBody.status === "WORKING") {
      return new Response(JSON.stringify({ ok: false, motivo: "sessao_ja_conectada" }), {
        status: 409,
        headers: jsonHeaders,
      });
    }
    const qrResp = await wahaFetch(`/api/${WAHA_SESSION}/auth/qr?format=base64`);
    if (!qrResp.ok) {
      return new Response(JSON.stringify({ ok: false, motivo: "falha_ao_obter_qr" }), {
        status: 502,
        headers: jsonHeaders,
      });
    }
    const qrBody = (await qrResp.json()) as { value?: string };
    return new Response(JSON.stringify({ qr: `data:image/png;base64,${qrBody.value ?? ""}` }), {
      headers: jsonHeaders,
    });
  }

  if (req.method === "GET") {
    const body = await buscarStatusSessao();
    const status = body.status ?? "STOPPED";
    const numero = status === "WORKING" ? (body.me?.id ?? "").replace("@c.us", "") : null;
    return new Response(JSON.stringify({ status, numero }), { headers: jsonHeaders });
  }

  if (req.method === "POST") {
    const { action } = (await req.json()) as { action?: string };
    if (action === "start") {
      await iniciarSessao();
      return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
    }
    if (action === "logout") {
      await wahaFetch(`/api/sessions/${WAHA_SESSION}/logout`, { method: "POST" });
      return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
    }
    return new Response(JSON.stringify({ ok: false, motivo: "acao_invalida" }), {
      status: 400,
      headers: jsonHeaders,
    });
  }

  return new Response(JSON.stringify({ ok: false, motivo: "metodo_nao_suportado" }), {
    status: 405,
    headers: jsonHeaders,
  });
});
```

- [ ] **Step 4: Function `waha-enviar-texto`**

Crie `supabase/functions/waha-enviar-texto/index.ts`:

```ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { exigirUsuarioRetaguarda } from "../_shared/retaguarda-auth.ts";
import { wahaFetch, WAHA_SESSION } from "../_shared/waha-client.ts";

Deno.serve(async (req: Request) => {
  const jsonHeaders = { "Content-Type": "application/json" };

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, motivo: "metodo_nao_suportado" }), {
      status: 405,
      headers: jsonHeaders,
    });
  }

  const auth = await exigirUsuarioRetaguarda(req);
  if (!auth.ok) return auth.response;

  const { chatId, text } = (await req.json()) as { chatId?: string; text?: string };
  if (!chatId || !text) {
    return new Response(JSON.stringify({ ok: false, motivo: "parametros_invalidos" }), {
      status: 400,
      headers: jsonHeaders,
    });
  }

  const resp = await wahaFetch("/api/sendText", {
    method: "POST",
    body: JSON.stringify({ session: WAHA_SESSION, chatId, text }),
  });

  if (resp.ok) {
    return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
  }

  if (resp.status === 400 || resp.status === 422) {
    const corpo = await resp.text();
    if (/not connected|session/i.test(corpo)) {
      return new Response(JSON.stringify({ ok: false, motivo: "sessao_desconectada" }), {
        headers: jsonHeaders,
      });
    }
  }

  return new Response(JSON.stringify({ ok: false, motivo: "falha_envio" }), { headers: jsonHeaders });
});
```

- [ ] **Step 5: Configurar os secrets no projeto Supabase**

Peça ao usuário para rodar (ou rode se tiver CLI configurado e autorização):

```bash
supabase secrets set WAHA_BASE_URL=https://waha.ailainteligente.com.br
supabase secrets set WAHA_API_KEY=<valor de X-Api-Key do .env do WAHA em /opt/stacks/waha/.env>
supabase secrets set WAHA_SESSION=default
```

**Não** rode isso sem o valor real de `WAHA_API_KEY` fornecido pelo usuário — não hardcode nem peça pra colar o valor em texto no chat; confirme que ele já está configurado ou peça para o usuário rodar o comando com o valor.

- [ ] **Step 6: Deploy das duas functions**

Use a tool `mcp__supabase__deploy_edge_function` duas vezes (uma por function), lendo o conteúdo dos arquivos criados nos Steps 1-4:

Para `waha-sessao`: `name: "waha-sessao"`, `entrypoint_path: "index.ts"`, `verify_jwt: true`, `files`: `[{name: "index.ts", content: <conteúdo do Step 3>}, {name: "_shared/retaguarda-auth.ts", content: <conteúdo do Step 1>}, {name: "_shared/waha-client.ts", content: <conteúdo do Step 2>}]`.

Para `waha-enviar-texto`: `name: "waha-enviar-texto"`, `entrypoint_path: "index.ts"`, `verify_jwt: true`, `files`: `[{name: "index.ts", content: <conteúdo do Step 4>}, {name: "_shared/retaguarda-auth.ts", content: <conteúdo do Step 1>}, {name: "_shared/waha-client.ts", content: <conteúdo do Step 2>}]`.

- [ ] **Step 7: Verificação manual (smoke test do usuário)**

Este projeto reserva smoke test manual em navegador para o usuário (não delegar a subagents). Para as Edge Functions especificamente, oriente o usuário a validar com `curl` (ou aguardar a Task 8, que dá uma UI pra isso):

```bash
curl -i https://<projeto>.supabase.co/functions/v1/waha-sessao \
  -H "Authorization: Bearer <jwt de uma sessão de retaguarda>"
```

Expected: JSON `{"status": "STOPPED", "numero": null}` (ou o status real da sessão) — não erro 401/403 se o JWT for de um usuário em `usuarios_retaguarda`.

- [ ] **Step 8: Commit**

```bash
git add supabase/functions/
git commit -m "feat: add waha-sessao and waha-enviar-texto edge functions"
```

---

### Task 5: Harness de testes — `avisos_whatsapp` + `functions.invoke`

**Files:**
- Modify: `vitest.setup.ts`

**Interfaces:**
- Consumes: `avisosWhatsApp` fixture de `src/mocks/avisos-whatsapp.ts` (mesma usada hoje).
- Produces: tabela fake `avisos_whatsapp` no harness; `supabase.functions.invoke` mockado (default: sucesso), sobrescrevível por teste via `vi.mocked`.

- [ ] **Step 1: Adicionar a tabela fake e o mock de `functions.invoke`**

Em `vitest.setup.ts`, adicione o import da fixture (junto aos já existentes no topo):

```ts
import { avisosWhatsApp as avisosWhatsAppFixture } from "./src/mocks/avisos-whatsapp";
```

Adicione `avisos_whatsapp` ao objeto `tabelas` (dentro do `vi.mock("./src/lib/supabase", ...)`):

```ts
    avisos_whatsapp: avisosWhatsAppFixture.map((a) => ({ ...a })),
```

E troque o `return` final do factory de:

```ts
  return {
    supabase: {
      from: (table: string) => new FakeQueryBuilder(table),
    },
  };
```

por:

```ts
  return {
    supabase: {
      from: (table: string) => new FakeQueryBuilder(table),
      functions: {
        invoke: vi.fn().mockResolvedValue({ data: { ok: true }, error: null }),
      },
    },
  };
```

- [ ] **Step 2: Rodar a suíte inteira pra confirmar que nada quebrou**

Run: `npx vitest run`
Expected: todos os testes existentes continuam passando (a tabela nova e o mock de `functions.invoke` são aditivos, não mudam comportamento de nenhum store já migrado).

- [ ] **Step 3: Commit**

```bash
git add vitest.setup.ts
git commit -m "test: add avisos_whatsapp table and functions.invoke mock to fake supabase harness"
```

---

### Task 6: Migrar `avisosWhatsAppStore` para Supabase real

**Files:**
- Modify: `src/features/aviso-whatsapp/avisos-whatsapp-store.ts` (reescrita completa)
- Modify: `src/features/aviso-whatsapp/avisos-whatsapp-store.test.ts` (reescrita completa)
- Modify: `src/features/aviso-whatsapp/index.ts`

**Interfaces:**
- Consumes: `supabase` (`src/lib/supabase.ts`), `montarMensagemAviso`/`telefoneParaChatId` (Task 3), tabela fake do Task 5.
- Produces: `avisosWhatsAppStore = { listar, obter, dispararAviso, useTodas, useEstado, retry }`; `dispararAviso(os: OrdemServico, cliente: Cliente): Promise<ResultadoDispararAviso>` (sem parâmetro `provedor` — usado pela Task 7).

- [ ] **Step 1: Reescrever o teste primeiro (TDD)**

Substitua todo o conteúdo de `src/features/aviso-whatsapp/avisos-whatsapp-store.test.ts` por:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { avisosWhatsAppStore } from "./avisos-whatsapp-store";
import { supabase } from "@/lib/supabase";
import type { Cliente, OrdemServico } from "@/shared/types";

function criarOS(id: string): OrdemServico {
  return {
    id,
    numero: `OS-TESTE-${id}`,
    cliente_id: "cl-teste",
    obra_nome: "Obra Teste Aviso",
    endereco: null,
    modelo_cobranca: "hora_maquina",
    status: "fechada",
    responsavel_id: null,
    observacao: null,
    diametro_broca_mm: null,
    aberta_em: "2026-07-01T00:00:00.000Z",
    fechada_em: "2026-07-02T00:00:00.000Z",
    pendente_sync: false,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-02T00:00:00.000Z",
  };
}

const clienteComTelefone: Cliente = {
  id: "cl-teste",
  nome: "Cliente Teste",
  documento: null,
  telefone: "44999990000",
  ativo: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const clienteSemTelefone: Cliente = { ...clienteComTelefone, id: "cl-teste-sem-tel", telefone: null };

describe("avisosWhatsAppStore", () => {
  beforeEach(() => {
    vi.mocked(supabase.functions.invoke).mockReset();
    vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: { ok: true }, error: null });
  });

  it("cliente sem telefone válido: grava falha_telefone_invalido sem chamar a edge function", async () => {
    const os = criarOS("os-teste-sem-tel");
    const r = await avisosWhatsAppStore.dispararAviso(os, clienteSemTelefone);
    expect(r.ok).toBe(false);
    expect(r.aviso?.status).toBe("falha_telefone_invalido");
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });

  it("telefone válido e envio ok: grava enviado com a mensagem", async () => {
    const os = criarOS("os-teste-ok");
    const r = await avisosWhatsAppStore.dispararAviso(os, clienteComTelefone);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.aviso.status).toBe("enviado");
      expect(r.aviso.provedor).toBe("waha");
      expect(r.aviso.mensagem_preview.length).toBeGreaterThan(0);
    }
  });

  it("edge function reporta sessão desconectada: grava falha_sessao_desconectada", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { ok: false, motivo: "sessao_desconectada" },
      error: null,
    });
    const os = criarOS("os-teste-sessao");
    const r = await avisosWhatsAppStore.dispararAviso(os, clienteComTelefone);
    expect(r.ok).toBe(false);
    expect(r.aviso?.status).toBe("falha_sessao_desconectada");
  });

  it("segunda chamada pra mesma OS é bloqueada sem chamar a edge function de novo", async () => {
    const os = criarOS("os-teste-dedup");
    await avisosWhatsAppStore.dispararAviso(os, clienteComTelefone);
    vi.mocked(supabase.functions.invoke).mockClear();
    const r2 = await avisosWhatsAppStore.dispararAviso(os, clienteComTelefone);
    expect(r2.ok).toBe(false);
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/features/aviso-whatsapp/avisos-whatsapp-store.test.ts`
Expected: FAIL — `dispararAviso` ainda tem assinatura antiga (recebe `provedor` e é síncrona), `avisosWhatsAppStore` ainda lê do mock.

- [ ] **Step 3: Reescrever a store**

Substitua todo o conteúdo de `src/features/aviso-whatsapp/avisos-whatsapp-store.ts` por:

```ts
import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { montarMensagemAviso, telefoneParaChatId } from "@/features/aviso-whatsapp/derivacoes";
import type { AvisoWhatsApp, Cliente, OrdemServico } from "@/shared/types";

// Store reativo respaldado pelo Supabase (mesmo padrão de ordensStore/orcamentosStore) —
// cache em memória + useSyncExternalStore, recarregado do banco após cada mutação.
// dispararAviso chama a edge function waha-enviar-texto (segura o segredo do lado do
// servidor) — nunca fala com o WAHA diretamente daqui.

export type ResultadoDispararAviso =
  | { ok: true; aviso: AvisoWhatsApp }
  | { ok: false; motivo: string; aviso?: AvisoWhatsApp };

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: AvisoWhatsApp[] = [];
let estado: Estado = { isLoading: true, error: null };
const ouvintes = new Set<() => void>();

const notificar = () => ouvintes.forEach((fn) => fn());
const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
};

async function carregar() {
  estado = { isLoading: true, error: null };
  notificar();

  const { data, error } = await supabase
    .from("avisos_whatsapp")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<AvisoWhatsApp[]>();

  if (error) {
    estado = { isLoading: false, error: new Error(error.message) };
  } else {
    itens = data ?? [];
    estado = { isLoading: false, error: null };
  }
  notificar();
}

carregar();

const listar = () => itens;
const obter = (id: string): AvisoWhatsApp | null => itens.find((a) => a.id === id) ?? null;
const useTodas = () => useSyncExternalStore(inscrever, listar, listar);
const useEstado = () =>
  useSyncExternalStore(
    inscrever,
    () => estado,
    () => estado,
  );

async function inserirAviso(
  campos: Omit<AvisoWhatsApp, "id" | "created_at">,
): Promise<AvisoWhatsApp> {
  const { data, error } = await supabase
    .from("avisos_whatsapp")
    .insert(campos)
    .select()
    .single()
    .returns<AvisoWhatsApp>();
  if (error) throw new Error(error.message);
  await carregar();
  return data;
}

async function dispararAviso(
  os: OrdemServico,
  cliente: Cliente,
): Promise<ResultadoDispararAviso> {
  const jaExiste = itens.find((a) => a.os_id === os.id);
  if (jaExiste) return { ok: false, motivo: "Aviso já disparado para esta OS." };

  const agora = new Date().toISOString();

  if (!cliente.telefone) {
    const falha = await inserirAviso({
      os_id: os.id,
      cliente_id: cliente.id,
      provedor: "waha",
      status: "falha_telefone_invalido",
      mensagem_preview: "",
      enviado_em: agora,
    });
    return {
      ok: false,
      motivo: "Cliente sem telefone válido — aviso não enviado.",
      aviso: falha,
    };
  }

  const mensagem = montarMensagemAviso(os, cliente);
  const chatId = telefoneParaChatId(cliente.telefone);

  const { data: resultadoEnvio, error: erroInvoke } = await supabase.functions.invoke<{
    ok: boolean;
    motivo?: string;
  }>("waha-enviar-texto", { body: { chatId, text: mensagem } });

  if (erroInvoke || !resultadoEnvio?.ok) {
    const status = resultadoEnvio?.motivo === "sessao_desconectada"
      ? "falha_sessao_desconectada"
      : "falha_envio";
    const falha = await inserirAviso({
      os_id: os.id,
      cliente_id: cliente.id,
      provedor: "waha",
      status,
      mensagem_preview: "",
      enviado_em: agora,
    });
    return {
      ok: false,
      motivo:
        status === "falha_sessao_desconectada"
          ? "Sessão do WhatsApp desconectada — reconecte em Integrações."
          : "Falha ao enviar a mensagem via WhatsApp.",
      aviso: falha,
    };
  }

  const enviado = await inserirAviso({
    os_id: os.id,
    cliente_id: cliente.id,
    provedor: "waha",
    status: "enviado",
    mensagem_preview: mensagem,
    enviado_em: agora,
  });
  return { ok: true, aviso: enviado };
}

export const avisosWhatsAppStore = {
  listar,
  obter,
  dispararAviso,
  useTodas,
  useEstado,
  retry: carregar,
};
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/features/aviso-whatsapp/avisos-whatsapp-store.test.ts`
Expected: PASS (os 4 testes do Step 1).

- [ ] **Step 5: Atualizar o barrel export**

Substitua `src/features/aviso-whatsapp/index.ts` por:

```ts
export { avisosWhatsAppStore } from "@/features/aviso-whatsapp/avisos-whatsapp-store";
export { avisoDaOS, montarMensagemAviso, telefoneParaChatId } from "@/features/aviso-whatsapp/derivacoes";
export {
  PROVEDOR_WHATSAPP_LABEL,
  STATUS_AVISO_LABEL,
  StatusAvisoBadge,
} from "@/features/aviso-whatsapp/labels";
```

(remove `criarAvisosWhatsAppStore` do export — não existe mais.)

- [ ] **Step 6: Checar tipos e a suíte inteira**

Run: `npx tsc --noEmit && npx vitest run`
Expected: `tsc` sem erros novos; `vitest` com todos os testes passando (algum outro arquivo pode falhar por ainda chamar a assinatura antiga de `dispararAviso` — isso é esperado e resolvido na Task 7).

- [ ] **Step 7: Commit**

```bash
git add src/features/aviso-whatsapp/
git commit -m "feat: migrate avisosWhatsAppStore from mock to real Supabase + WAHA edge function"
```

---

### Task 7: Ajustar `ordem-detalhe-retaguarda.tsx` para a nova assinatura

**Files:**
- Modify: `src/features/ordem-servico/components/ordem-detalhe-retaguarda.tsx:25-38,74-95`

**Interfaces:**
- Consumes: `avisosWhatsAppStore.dispararAviso(os, cliente): Promise<ResultadoDispararAviso>` (Task 6).

- [ ] **Step 1: Remover o import e uso de `useProvedorWhatsAppAtivo`**

Troque a linha 28:

```tsx
import { useProvedorWhatsAppAtivo } from "@/features/integracoes/use-provedor-whatsapp";
```

Remova essa linha inteira (não é mais usada neste arquivo).

- [ ] **Step 2: Remover a leitura do provedor ativo**

Troque a linha 38:

```tsx
  const { provedor: provedorWhatsAppAtivo } = useProvedorWhatsAppAtivo();
```

Remova essa linha inteira.

- [ ] **Step 3: Ajustar a chamada em `fechar`**

Troque:

```tsx
    const cliente = clientesStore.getById(r.ordem.cliente_id);
    if (cliente) {
      const disparo = avisosWhatsAppStore.dispararAviso(r.ordem, cliente, provedorWhatsAppAtivo);
      if (disparo.ok) {
        toast.success(
          `Aviso enviado ao cliente via ${PROVEDOR_WHATSAPP_LABEL[disparo.aviso.provedor]}.`,
        );
      } else if (disparo.aviso) {
        toast.warning(disparo.motivo);
      }
    }
```

por:

```tsx
    const cliente = clientesStore.getById(r.ordem.cliente_id);
    if (cliente) {
      const disparo = await avisosWhatsAppStore.dispararAviso(r.ordem, cliente);
      if (disparo.ok) {
        toast.success(
          `Aviso enviado ao cliente via ${PROVEDOR_WHATSAPP_LABEL[disparo.aviso.provedor]}.`,
        );
      } else if (disparo.aviso) {
        toast.warning(disparo.motivo);
      }
    }
```

(`fechar` já é `async`, então o `await` novo funciona sem outra mudança.)

- [ ] **Step 4: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros no arquivo (a assinatura de `dispararAviso` agora bate com a chamada).

- [ ] **Step 5: Rodar a suíte inteira**

Run: `npx vitest run`
Expected: todos os testes passando (nenhum teste unitário cobre este componente React diretamente hoje — a garantia aqui é de tipos; a verificação funcional é o smoke test manual do usuário).

- [ ] **Step 6: Commit**

```bash
git add src/features/ordem-servico/components/ordem-detalhe-retaguarda.tsx
git commit -m "feat: wire OS-closure whatsapp notice to the real waha-backed store"
```

---

### Task 8: UI de conexão WAHA em `/admin/integracoes`

**Files:**
- Create: `src/features/integracoes/use-waha-sessao.ts`
- Create: `src/features/integracoes/components/painel-conexao-waha.tsx`
- Modify: `src/features/integracoes/use-provedor-whatsapp.ts`
- Modify: `src/features/integracoes/components/integracoes-page.tsx`

**Interfaces:**
- Consumes: `supabase.functions.invoke("waha-sessao", ...)` (Task 4).
- Produces: `useWahaSessao()` hook (`{status, numero, qr, carregando, erro, conectar, desconectar}`); `<PainelConexaoWaha />` componente.

- [ ] **Step 1: Hook `useWahaSessao`**

Crie `src/features/integracoes/use-waha-sessao.ts`:

```ts
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type StatusSessaoWaha = "STOPPED" | "STARTING" | "SCAN_QR_CODE" | "WORKING" | "FAILED";

interface RespostaStatus {
  status: StatusSessaoWaha;
  numero: string | null;
}

interface RespostaQr {
  qr: string;
}

export function useWahaSessao() {
  const [status, setStatus] = useState<StatusSessaoWaha>("STOPPED");
  const [numero, setNumero] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const buscarStatus = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke<RespostaStatus>("waha-sessao", {
      method: "GET",
    });
    if (error || !data) {
      setErro(error?.message ?? "Não foi possível consultar a sessão.");
      setCarregando(false);
      return;
    }
    setStatus(data.status);
    setNumero(data.numero);
    if (data.status === "WORKING") setQr(null);
    setErro(null);
    setCarregando(false);
  }, []);

  useEffect(() => {
    buscarStatus();
  }, [buscarStatus]);

  useEffect(() => {
    if (status === "WORKING") return;
    const id = setInterval(buscarStatus, 3000);
    return () => clearInterval(id);
  }, [status, buscarStatus]);

  const conectar = useCallback(async () => {
    await supabase.functions.invoke("waha-sessao", { body: { action: "start" } });
    const { data } = await supabase.functions.invoke<RespostaQr>("waha-sessao?qr=1", {
      method: "GET",
    });
    if (data) setQr(data.qr);
    await buscarStatus();
  }, [buscarStatus]);

  const desconectar = useCallback(async () => {
    await supabase.functions.invoke("waha-sessao", { body: { action: "logout" } });
    setQr(null);
    await buscarStatus();
  }, [buscarStatus]);

  return { status, numero, qr, carregando, erro, conectar, desconectar };
}
```

- [ ] **Step 2: Componente `PainelConexaoWaha`**

Crie `src/features/integracoes/components/painel-conexao-waha.tsx`:

```tsx
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { useWahaSessao, type StatusSessaoWaha } from "@/features/integracoes/use-waha-sessao";

const STATUS_LABEL: Record<StatusSessaoWaha, string> = {
  STOPPED: "Desconectado",
  STARTING: "Iniciando…",
  SCAN_QR_CODE: "Aguardando leitura do QR code",
  WORKING: "Conectado",
  FAILED: "Falha na conexão",
};

export function PainelConexaoWaha() {
  const { status, numero, qr, carregando, erro, conectar, desconectar } = useWahaSessao();

  if (carregando) {
    return <p className="text-sm text-muted-foreground">Verificando conexão…</p>;
  }

  if (erro) {
    return <p className="text-sm text-destructive">{erro}</p>;
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span
          className={
            status === "WORKING"
              ? "h-2 w-2 rounded-full bg-secondary"
              : "h-2 w-2 rounded-full bg-destructive"
          }
        />
        {STATUS_LABEL[status]}
        {numero ? <span className="text-muted-foreground">— {numero}</span> : null}
      </div>

      {status === "WORKING" ? (
        <Button variant="outline" size="sm" onClick={desconectar} className="gap-1.5">
          <Icon icon="lucide:log-out" className="h-4 w-4" />
          Desconectar
        </Button>
      ) : (
        <div className="space-y-3">
          <Button size="sm" onClick={conectar} className="gap-1.5">
            <Icon icon="lucide:qr-code" className="h-4 w-4" />
            Conectar
          </Button>
          {qr ? (
            <img
              src={qr}
              alt="QR code para conectar o WhatsApp"
              className="h-48 w-48 rounded-lg border"
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Adicionar `waha` como provedor selecionável e padrão**

Em `src/features/integracoes/use-provedor-whatsapp.ts`, troque:

```ts
const PADRAO: ProvedorWhatsApp = "evolution_api";
const VALIDOS: ProvedorWhatsApp[] = ["evolution_api", "evolution_go", "meta_cloud_api", "openwa"];
```

por:

```ts
const PADRAO: ProvedorWhatsApp = "waha";
const VALIDOS: ProvedorWhatsApp[] = [
  "evolution_api",
  "evolution_go",
  "meta_cloud_api",
  "openwa",
  "waha",
];
```

- [ ] **Step 4: Adicionar o painel na página de integrações**

Em `src/features/integracoes/components/integracoes-page.tsx`, adicione o import:

```tsx
import { PainelConexaoWaha } from "@/features/integracoes/components/painel-conexao-waha";
```

E troque:

```tsx
const PROVEDORES_WHATSAPP: ProvedorWhatsApp[] = [
  "evolution_api",
  "evolution_go",
  "meta_cloud_api",
  "openwa",
];
```

por:

```tsx
const PROVEDORES_WHATSAPP: ProvedorWhatsApp[] = [
  "evolution_api",
  "evolution_go",
  "meta_cloud_api",
  "openwa",
  "waha",
];
```

Por fim, na seção "WhatsApp" do JSX, logo após o `</Select>` que fecha o bloco do provedor WhatsApp (antes do `</section>` de fechamento dessa seção), adicione:

```tsx
        {provedorWhatsApp === "waha" ? <PainelConexaoWaha /> : null}
```

- [ ] **Step 5: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros novos.

- [ ] **Step 6: Rodar a suíte inteira**

Run: `npx vitest run`
Expected: todos os testes passando (nenhum teste unitário cobre esta página hoje — verificação funcional é o smoke test manual do usuário, que já tem o WAHA real no ar pra testar o fluxo de QR ponta a ponta).

- [ ] **Step 7: Commit**

```bash
git add src/features/integracoes/
git commit -m "feat: add embedded WAHA connection panel to /admin/integracoes"
```

---

### Task 9: Validação final

**Files:** nenhum (só verificação).

- [ ] **Step 1: Rodar tudo**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: `tsc` 0 erros, `eslint` 0 erros, `vitest` com todos os testes passando (suíte cresceu com os novos testes das Tasks 3 e 6).

- [ ] **Step 2: Lembrete de configuração (não automatizável)**

Confirme com o usuário que os 3 secrets da Task 4 Step 5 (`WAHA_BASE_URL`, `WAHA_API_KEY`, `WAHA_SESSION`) estão configurados no projeto Supabase antes de considerar a feature testável ponta a ponta — sem eles, as Edge Functions respondem erro ao chamar o WAHA.

- [ ] **Step 3: Commit final (se houver qualquer resíduo)**

```bash
git status
```

Se houver arquivos não commitados de ajustes desta task, `git add` + commit com mensagem apropriada. Caso contrário, nada a fazer.
