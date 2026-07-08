# Spec de Design — PRD-017 + PRD-018: Auth Real + Schema/Seed (Backend)

> **Data:** 2026-07-08
> **PRDs:** `docs/prds/INDEX-PRDs-antonello.md` reserva PRD-017 ("Auth real + perfis + RLS") e
> PRD-018 ("Schema + migrations + mock→seed") como os dois primeiros PRDs da Fase 4 (backend).
> Este spec cobre os dois juntos — são interdependentes (o schema de usuários é parte do
> modelo de auth; a RLS depende do schema existir).
> **Projeto Supabase:** `nbqgujojgdcpkorychoc` (já conectado via MCP/CLI; `public` vazio hoje).
> **Marca a virada de fase:** `CLAUDE.md` sai de "Frontend First (mockado)" para a Fase 4
> (backend real) a partir da implementação deste spec.

---

## 1. Decisões de Design (aprovadas em brainstorming)

| Decisão | Escolha | Razão |
|---------|---------|-------|
| **Escopo** | Um spec único cobrindo Auth (017) + Schema/Seed (018) | Interdependentes; um plano de implementação, fases internas |
| **PIN do operador** | 4 primeiros dígitos do CPF, **fixo** (não muda) | Simplicidade — operador nunca precisa lembrar de trocar |
| **Entrada do PIN** | Selecionar nome da lista + digitar PIN | Rápido em campo, sem digitar CPF/telefone completo |
| **Mecanismo do PIN** | Função Postgres própria + JWT customizado (`pgjwt`), **sem** `auth.users`/GoTrue para operador | Ver [[feedback_auth_custom_sem_supabase_auth]] — usuário rejeitou explicitamente criar usuários sintéticos no Supabase Auth |
| **Auth retaguarda** | Supabase Auth padrão (e-mail + senha) | Recepção/proprietário já usam e-mail de verdade; sem motivo pra fugir do padrão |
| **Provisionamento retaguarda** | Só o proprietário cria contas (sem auto-cadastro) | Time pequeno, controle manual é suficiente |
| **Rotas de login** | `/login` (e-mail+senha, retaguarda) e `/app/entrar` (PIN, operador) — duas telas distintas | Cada ambiente com sua porta de entrada; `/login` perde o seletor de perfil |
| **Sessão do operador** | Persistente por dispositivo (token de validade longa) | Combina com offline-first do ADR-001; sem re-autenticar toda hora sem sinal |
| **Projeto Supabase** | `nbqgujojgdcpkorychoc` (já existente) | Confirmado pelo usuário |
| **IDs no schema** | `uuid` real; seed usa `uuid_generate_v5(namespace, id_do_mock)` | Determinístico — reseed estável sem tabela de mapeamento manual |
| **Barreira financeira** | Coluna a coluna (RLS + `REVOKE`), não só disciplina de frontend | Defesa em profundidade — bug de UI ou chamada direta à API não vaza preço/custo |
| **Recepção vs. proprietário** | Mesmo nível de acesso na retaguarda (v1) | Confirmado no código atual — nenhuma tela distingue os dois hoje |

---

## 2. Arquitetura Geral

Dois caminhos de autenticação convergindo numa única base de RLS:

| | Recepção / Proprietário (`/admin`) | Operador (`/app`) |
|---|---|---|
| Login | `/login` — e-mail + senha | `/app/entrar` — nome da lista + PIN |
| Mecanismo | Supabase Auth padrão (`auth.users`, GoTrue) | Função Postgres `login_operador()` + JWT assinado com `pgjwt` |
| Sessão | Nativa do Supabase (JWT + refresh token) | Token de validade longa (~180 dias), guardado no dispositivo |
| Provisionamento | Só o proprietário cria contas | Automático — todo operador cadastrado já pode logar (PIN = 4 primeiros dígitos do CPF) |

O PostgREST do Supabase valida qualquer JWT assinado com o segredo do projeto, independente de vir do GoTrue — por isso a RLS funciona igual para os dois caminhos. As policies checam `auth.jwt() ->> 'role'` e, para operador, também `auth.jwt() ->> 'operador_id'` e `auth.jwt() ->> 'jti'` (revogação).

**Camada de aplicação:** `src/lib/supabase.ts` com dois clientes lógicos — um padrão (`supabase-js`, sessão nativa, usado pela retaguarda) e um wrapper fino para o app do operador que anexa o header `Authorization: Bearer <token>` manualmente e chama `realtime.setAuth(token)` para os canais do ADR-001. A maior parte do código de features não precisa saber qual caminho autenticou o usuário — só as duas camadas de login e os dois wrappers de cliente.

---

## 3. Modelo de Dados

**Estratégia de ID:** `uuid primary key default gen_random_uuid()`. Seed usa `uuid_generate_v5()` (extensão `uuid-ossp`, já disponível) com namespace fixo do projeto, aplicado sobre o id de texto do mock (`"op-001"` → mesmo UUID sempre).

**Tabelas — mapeamento quase 1:1 de `src/shared/types/index.ts`** (o arquivo já foi desenhado como contrato futuro do banco). Agrupamento por domínio (mesmo agrupamento de menu do `CLAUDE.md`):

- **Cadastros:** `equipamentos`, `operadores`, `clientes`
- **Operação:** `ordens_servico`, `apontamentos`
- **Comercial:** `precos_hora_maquina`, `precos_fundacao`, `precos_mobilizacao`, `orcamentos`, `orcamento_itens`
- **Financeiro:** `faturamentos`, `faturamento_itens`, `contas_pagar`, `contas_receber`, `cobrancas_gateway`
- **Frota:** `planos_manutencao`, `registros_manutencao`, `abastecimentos`, `componentes_custo`
- **Outros:** `comprovantes`, `avisos_whatsapp`

**Diferenças em relação a espelhar o type ao pé da letra:**

1. `orcamentos.itens` e `faturamentos.itens` (arrays embutidos no type/mock) viram tabelas filhas `orcamento_itens` / `faturamento_itens` (FK `orcamento_id` / `faturamento_id`) — dado relacional, não JSON solto.
2. `operadores` ganha 4 colunas novas: `cpf` (não existe no type hoje), `pin_hash` (via `pgcrypto`, já instalado), `tentativas_falhas` (int, default 0), `bloqueado_ate` (timestamptz, nullable).
3. Nova tabela `usuarios_retaguarda`: `id` (= `auth.users.id`, FK), `nome`, `perfil` (`recepcao` \| `proprietario`) — hoje esse "perfil" só existe na UI mockada, sem tabela real.
4. Nova tabela `operador_sessoes_revogadas` (`jti` uuid, `revogado_em` timestamptz) para suportar logout/troca de operador no dispositivo — o token customizado não passa por refresh nativo do Supabase, então revogação é manual.

**Proteção de dado financeiro (regra do `CLAUDE.md`: nunca exibir preço/valor pro operador):** colunas como `valor`, `preco_litro`, `custo_total`, `valor_unitario`, `custo` recebem `REVOKE` explícito do papel usado pelo JWT do operador — além da RLS de linha, proteção coluna a coluna.

---

## 4. RLS (Row Level Security)

Eixo único: **operador vs. retaguarda** (recepção e proprietário têm o mesmo nível de acesso hoje). RLS habilitada em toda tabela, **negar por padrão**; duas funções auxiliares: `is_retaguarda()` (existe linha em `usuarios_retaguarda` para `auth.uid()`) e `current_operador_id()` (lê `operador_id` do JWT customizado, validando que `jti` não está em `operador_sessoes_revogadas`).

| Grupo | Retaguarda | Operador |
|---|---|---|
| **Cadastros** (`equipamentos`, `operadores`, `clientes`) | CRUD completo | `SELECT` apenas; `clientes.documento` (CPF/CNPJ) bloqueado por `REVOKE` |
| **`ordens_servico`** | CRUD completo, inclusive fechar (`status → fechada`) | `SELECT` das abertas/atribuídas + `UPDATE` só do cabeçalho (LWW, ADR-001); `status = 'fechada'` bloqueado por trigger/check — nunca via policy/UI apenas |
| **`apontamentos`** | `SELECT` completo (sem editar — append-only, dono é o operador) | `INSERT`/`UPDATE` só dos próprios (`operador_id = current_operador_id()`), sem `DELETE` |
| **Comercial** (`precos_*`, `orcamentos`) | CRUD completo | Sem acesso (nenhuma policy) |
| **Financeiro** (`faturamentos`, `contas_pagar/receber`, `cobrancas_gateway`) | CRUD completo | Sem acesso |
| **Frota** (`planos_manutencao`, `registros_manutencao`, `abastecimentos`) | CRUD completo, todas colunas | `SELECT`/`INSERT` operacional (litros, horímetro, status); `custo`, `preco_litro`, `custo_total` bloqueados por `REVOKE` |
| **`componentes_custo`** | CRUD completo | Sem acesso (custo estratégico, PRD-013) |
| **`comprovantes` / `avisos_whatsapp`** | CRUD completo | Sem acesso (geridos no fechamento da OS, ação da retaguarda) |

**Exceção pré-login:** `operadores` precisa de uma policy adicional liberando `SELECT (id, nome)` para o papel `anon` onde `ativo = true` (necessário para a tela `/app/entrar` listar nomes antes de autenticar) — todas as outras colunas (`cpf`, `pin_hash`, `telefone`, `tentativas_falhas`...) permanecem bloqueadas por `REVOKE` para `anon`.

**Ponto em aberto (não bloqueia a implementação):** `clientes.telefone` — liberado para operador por padrão (dado operacional, não financeiro); avisar se deve ser restrito também.

---

## 5. Fluxos de Autenticação

### 5.1 Retaguarda (`/login`, e-mail+senha)

1. `supabase.auth.signInWithPassword({ email, senha })`.
2. Sucesso → verifica linha em `usuarios_retaguarda` para `auth.uid()`; se não existir, desloga imediatamente e mostra "conta não configurada, fale com o proprietário".
3. Recuperação de senha: fluxo padrão do Supabase (e-mail com link).
4. Guarda de rota: layout de `/admin/*` verifica sessão ativa; sem sessão, redireciona pra `/login`.
5. `/login` perde o seletor de perfil (operador sai dessa tela).

### 5.2 Operador (`/app/entrar`, PIN)

1. Tela lista operadores ativos (`id`, `nome`) via `SELECT` anônimo liberado (seção 4).
2. Operador escolhe nome, digita PIN → `rpc('login_operador', { operador_id, pin })` com a chave `anon`.
3. **Sucesso:** função zera `tentativas_falhas`, gera JWT (`role: operador`, `operador_id`, `jti` único, validade ~180 dias), devolve `{ token, operador: { id, nome } }`. App guarda o token (localStorage) e recria o cliente Supabase do operador com `Authorization: Bearer <token>` + `realtime.setAuth(token)`.
4. **Falha:** incrementa `tentativas_falhas`; ao atingir **5 tentativas**, seta `bloqueado_ate = now() + 15min`. Mensagens: `"PIN incorreto"` (tentativas normais) / `"Muitas tentativas — tente novamente em Xmin"` (bloqueado) — sem revelar contagem restante antes do bloqueio.
5. **Logout/troca de operador:** insere `jti` em `operador_sessoes_revogadas`; toda policy que usa `current_operador_id()` também nega se o `jti` estiver ali.
6. Guarda de rota: layout de `/app/*` decodifica o token localmente (sem rede) e checa a expiração do claim `exp`; sem token ou expirado, redireciona pra `/app/entrar`. A revogação por `jti` (logout remoto/troca de operador) só é aplicada pela RLS quando há rede — coerente com o offline-first do ADR-001: o dispositivo pode continuar "visualmente logado" offline mesmo após uma revogação registrada em outro lugar, até a próxima chamada online, que aí sim é negada pela RLS.

---

## 6. Migração Mock → Seed

**Fonte única:** `src/mocks/*.ts` (nada re-digitado em SQL). Script `scripts/mocks-to-seed.ts` (rodado uma vez via `tsx`) importa os arrays TS e gera `supabase/seed.sql`.

**IDs consistentes:** `uuid.v5(idDoMock, NAMESPACE_FIXO)` (pacote `uuid`, mesmo algoritmo do `uuid_generate_v5` do Postgres) — `"op-001"` sempre vira o mesmo UUID.

**Ordem de inserção** (respeita FK): `equipamentos` / `operadores` / `clientes` → `precos_*` / `planos_manutencao` → `ordens_servico` → `apontamentos` → `orcamentos` (+itens) → `faturamentos` (+itens) → `contas_receber` / `contas_pagar` → `cobrancas_gateway` → `registros_manutencao` / `abastecimentos` / `componentes_custo` → `comprovantes` / `avisos_whatsapp`.

**Furos que os mocks não cobrem, preenchidos na seed:**
1. `operadores.cpf` não existe nos mocks hoje — gerar 5 CPFs fake-mas-válidos (mesmo padrão dos CPF/CNPJ válidos já usados em `mocks/clientes.ts`) e derivar `pin_hash` dos 4 primeiros dígitos.
2. `usuarios_retaguarda` não tem mock (a tela de login hoje é só um seletor visual, sem conta real). Não entra no `seed.sql` — `auth.users` não é populado por INSERT direto. Script separado `scripts/seed-usuarios-retaguarda.ts` (service role) cria 1-2 contas demo via `supabase.auth.admin.createUser()` (`recepcao@antonello.com.br`, `proprietario@antonello.com.br`, senha temporária) + insere a linha em `usuarios_retaguarda`.

Edge cases já presentes nos mocks (lista vazia, nome longo, sem telefone/documento) são preservados como estão — viram dado de demonstração real, sem necessidade de limpeza.

---

## 7. Riscos e Pontos em Aberto

| Risco/questão | Mitigação / decisão |
|---|---|
| PIN de 4 dígitos é baixa entropia (10.000 combinações) | Lockout de 5 tentativas / 15min (função `login_operador`); nunca usado como único fator pra dado financeiro (operador já não vê preço/valor em lugar nenhum) |
| Token do operador não tem refresh nativo | Validade longa fixa (~180 dias) + tabela de revogação (`jti`) para logout manual |
| Realtime (ADR-001) com JWT customizado | Precisa validar cedo que `realtime.setAuth()` com token customizado autoriza canais normalmente — não assumir sem checar na implementação |
| `clientes.telefone` visível pro operador | Decisão default: liberado (operacional); avisar se deve virar `REVOKE` também |
| CPF de operador agora é dado pessoal obrigatório | Minimização LGPD: só 4 primeiros dígitos derivam o PIN; CPF completo nunca aparece em `/app/*` (RLS já bloqueia a coluna pro papel operador via `anon`/JWT customizado) |

## 8. Fora de Escopo (deste spec)

- Distinção fina de permissão entre recepção e proprietário (hoje idênticos — revisar se aparecer necessidade real).
- Troca de PIN pelo próprio operador (PIN é fixo = CPF, por decisão explícita).
- Migração de dados reais do legado (`Gerencial.fdb`) para este schema — assunto de uma iniciativa separada (fora do PRD-017/018).
- n8n / integrações WhatsApp e gateway de cobrança reais (seguem mockadas — fora do escopo deste spec).
