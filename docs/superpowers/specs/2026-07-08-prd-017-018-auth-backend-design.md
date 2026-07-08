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
| **Mecanismo do PIN** | Função Postgres própria + **token opaco (UUID)** em `operador_sessoes`, **sem** `auth.users`/GoTrue e **sem JWT** | Ver [[feedback_auth_custom_sem_supabase_auth]] — usuário rejeitou criar usuários sintéticos no Supabase Auth. Revisado em 2026-07-08: o projeto usa **JWT Signing Keys assimétricas** (confirmado no painel), não o segredo compartilhado legado — não dá pra assinar um JWT que o PostgREST valide sem esse segredo. Token opaco + funções `SECURITY DEFINER` é a alternativa mais simples que não depende de segredo nenhum do Supabase |
| **Acesso a dados do operador** | 100% mediado por funções Postgres `SECURITY DEFINER` que recebem o token como parâmetro explícito — nenhuma tabela de negócio tem policy de RLS para o papel `anon`/operador | Sem JWT, o Postgres não sabe "quem" é o operador via `auth.uid()`/`auth.jwt()` — a função é que valida o token e decide |
| **Realtime (ADR-001) para o operador** | Fora deste PRD — operador atualiza por reconsulta, não por push ao vivo | Realtime do Supabase depende de sessão nativa (JWT reconhecido); sem ela, só a retaguarda (Supabase Auth de verdade) recebe push. Fila offline + flush idempotente do ADR-001 continuam garantidos; só o "tempo real com rede" fica assimétrico |
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
| Mecanismo | Supabase Auth padrão (`auth.users`, GoTrue) | Função Postgres `login_operador()` — devolve um **token opaco** (UUID), não um JWT |
| Sessão | Nativa do Supabase (JWT + refresh token) | Token de validade longa (~180 dias) guardado no dispositivo; validado a cada chamada dentro da própria função Postgres |
| Acesso a dados | RLS de tabela normal, via `auth.uid()`/`is_retaguarda()` | Nenhum acesso direto a tabela — só funções `SECURITY DEFINER` que recebem `p_token` como parâmetro e validam contra `operador_sessoes` internamente |
| Provisionamento | Só o proprietário cria contas | Automático — todo operador cadastrado já pode logar (PIN = 4 primeiros dígitos do CPF) |

**Por que não dá pra unificar num JWT só:** o Supabase deste projeto assina com **JWT Signing Keys assimétricas** (chave atual ECC P-256) — não temos (nem devemos ter) a chave privada, então não é possível forjar um token que o PostgREST valide como se viesse do GoTrue. Por isso o caminho do operador vira **token opaco + função `SECURITY DEFINER`**: a função É a fronteira de segurança (recebe o token, confere em `operador_sessoes` que é válido/não expirou/não foi revogado, e só então executa a operação), em vez de depender de RLS de tabela.

**Camada de aplicação:** `src/lib/supabase.ts` com dois clientes lógicos — um padrão (`supabase-js`, sessão nativa, usado pela retaguarda, RLS de tabela normal) e um cliente do operador que só chama `supabase.rpc(...)` (nunca `.from(tabela)`), sempre passando o token guardado localmente como argumento. A maior parte do código de features não precisa saber qual caminho autenticou o usuário — só as duas camadas de login e os dois clientes.

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
4. Nova tabela `operador_sessoes` (`token uuid primary key default gen_random_uuid()`, `operador_id` FK, `criado_em`, `expira_em`, `revogado boolean default false`) — substitui qualquer noção de JWT/refresh nativo; é a própria fonte de verdade da sessão do operador, checada dentro de cada função `SECURITY DEFINER`.

**Proteção de dado financeiro (regra do `CLAUDE.md`: nunca exibir preço/valor pro operador):** como o operador não tem policy de RLS em tabela nenhuma de negócio (seção 4), a barreira financeira hoje é automática — não há acesso a linha nenhuma dessas tabelas para negar coluna. Isso vira responsabilidade explícita de cada função `SECURITY DEFINER` futura (ex.: uma função de abastecimento nunca deve `SELECT`/retornar `preco_litro`/`custo_total`) — documentado aqui como regra de implementação, não como `REVOKE` de coluna.

---

## 4. RLS (Row Level Security)

**Retaguarda:** RLS habilitada em toda tabela, **negar por padrão**, com policies usando `is_retaguarda()` (existe linha em `usuarios_retaguarda` para `auth.uid()`) — CRUD completo em todas as tabelas de negócio para recepção/proprietário (mesmo nível de acesso, seção 1).

**Operador:** como não há JWT nem `auth.uid()` (o operador usa a chave `anon`, sem sessão nativa do Supabase — seção 2), ele **não recebe nenhuma policy de RLS em tabela de negócio nenhuma**. O acesso do operador é 100% mediado por funções `SECURITY DEFINER` que recebem o token como parâmetro e fazem a validação/filtragem manualmente dentro do corpo da função — a função é a fronteira de segurança, a tabela em si fica fechada pro papel `anon`.

**Neste PRD (017/018), as únicas funções operador-facing implementadas são login e logout** (seção 5.2) — o restante do acesso operacional (criar apontamento, ler OS, registrar abastecimento etc.) é implementado **incrementalmente**, PRD a PRD, nas futuras iniciativas de "conexão mock→real" já reservadas no `INDEX-PRDs-antonello.md` (ver Seção 8, Fora de Escopo). Até lá, as telas do app do operador continuam lendo de `src/mocks/*`/stores locais como hoje — só o login/logout passam a ser reais.

**Regra para quando essas funções futuras forem escritas** (documentada aqui para não se perder): nunca `SELECT`/retornar colunas financeiras (`valor`, `preco_litro`, `custo_total`, `valor_unitario`, `custo`) nem `clientes.documento` (CPF/CNPJ) para o operador — a barreira financeira do `CLAUDE.md` se aplica dentro de cada função, já que não há RLS de coluna para reforçar isso automaticamente neste modelo.

**Exceção pré-login:** `operadores` recebe uma policy liberando `SELECT (id, nome)` para o papel `anon` onde `ativo = true` (necessário para a tela `/app/entrar` listar nomes antes de autenticar) — todas as outras colunas (`cpf`, `pin_hash`, `telefone`, `tentativas_falhas`...) continuam fechadas pra `anon` (sem policy que as exponha).

**Ponto em aberto (não bloqueia a implementação):** `clientes.telefone` — quando a função de leitura de cliente for escrita (PRD futuro), por padrão planejo liberar pro operador (dado operacional, não financeiro); avisar se deve ser restrito também.

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
3. **Sucesso:** função zera `tentativas_falhas`, insere uma linha em `operador_sessoes` (`token` novo, `expira_em = now() + 180 dias`), devolve `{ token, operador: { id, nome } }` (JSON puro, não um JWT). App guarda `{ token, operadorId, operadorNome, expiraEm }` no dispositivo (localStorage) — esse token é enviado como argumento explícito em toda chamada `rpc(...)` seguinte, nunca como header de autenticação.
4. **Falha:** incrementa `tentativas_falhas`; ao atingir **5 tentativas**, seta `bloqueado_ate = now() + 15min`. Mensagens: `"PIN incorreto"` (tentativas normais) / `"Muitas tentativas — tente novamente em Xmin"` (bloqueado) — sem revelar contagem restante antes do bloqueio.
5. **Logout/troca de operador:** `rpc('logout_operador', { token })` marca `revogado = true` na linha de `operador_sessoes`; toda função futura que recebe esse token volta a rejeitar (`"sessão inválida"`).
6. Guarda de rota: layout de `/app/*` checa localmente se existe `{ token, expiraEm }` salvo e se `expiraEm` não passou; sem isso, redireciona pra `/app/entrar`. A revogação remota (logout feito em outro lugar/expiração real) só é conferida pelo Postgres na próxima chamada `rpc(...)` que exigir o token — coerente com o offline-first do ADR-001: o dispositivo pode continuar "visualmente logado" offline mesmo após uma revogação, até a próxima chamada online, que aí sim é rejeitada pela função.

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
| Token do operador não tem refresh nativo | Validade longa fixa (~180 dias) + coluna `revogado` em `operador_sessoes` para logout manual |
| Operador não usa Realtime do Supabase | Aceito como trade-off explícito (seção 1) — atualiza por reconsulta; retaguarda mantém Realtime nativo normalmente |
| `clientes.telefone` visível pro operador | Só relevante quando a função de leitura de cliente for escrita (PRD futuro); decisão default: liberado (operacional) |
| CPF de operador agora é dado pessoal obrigatório | Minimização LGPD: só 4 primeiros dígitos derivam o PIN; CPF completo nunca é retornado por nenhuma função/policy acessível ao operador |
| Funções operacionais do operador (apontamento, OS, abastecimento) ainda não existem | Por desenho (seção 4) — ficam para as PRDs de "conexão mock→real, por onda"; este PRD só entrega login/logout reais + schema/RLS prontos para recebê-las |

## 8. Fora de Escopo (deste spec)

- Distinção fina de permissão entre recepção e proprietário (hoje idênticos — revisar se aparecer necessidade real).
- Troca de PIN pelo próprio operador (PIN é fixo = CPF, por decisão explícita).
- Migração de dados reais do legado (`Gerencial.fdb`) para este schema — assunto de uma iniciativa separada (fora do PRD-017/018).
- n8n / integrações WhatsApp e gateway de cobrança reais (seguem mockadas — fora do escopo deste spec).
- **Funções `SECURITY DEFINER` operacionais do operador** (ler/criar apontamento, ler/atualizar OS, registrar abastecimento, etc.) — ficam para as PRDs futuras de "conexão mock→real, por onda" (`INDEX-PRDs-antonello.md`, item "Backend por feature"). Este PRD entrega o schema completo + RLS da retaguarda + login/logout do operador; as telas do app do operador continuam lendo `src/mocks/*`/stores locais até cada feature migrar na sua própria onda — exceto a própria tela de login/perfil, que passa a refletir a sessão real.
- **Realtime para o operador** (ver seção 7) — fica assimétrico: retaguarda com Realtime nativo, operador por reconsulta, até (se algum dia for necessário) uma iniciativa separada de "Third-Party Auth" ser avaliada.
