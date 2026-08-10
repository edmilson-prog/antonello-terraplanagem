# PRD-020: Notificações e Web Push no App de Campo

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | Plataforma de Gestão — Antonello Terraplanagem |
| **Objetivo** | Dar ao operador uma central de notificações no app de campo (`/app`) — sino com badge, lista agrupada por dia, deep link para a OS — e entregar esses avisos por **Web Push**, de modo que o celular avise mesmo com o app fechado |
| **Tipo** | Feature |
| **Complexidade** | Alta (toca schema, RLS, Edge Function, PWA e frontend) |
| **Ambiente** | App do Operador (`/app/*`). A retaguarda **produz** notificações mas não tem sino — o kit da retaguarda não prevê um |
| **PRDs Relacionados** | Consome: 002 (apontamento), 003 (OS), 010 (manutenção), 012 (diesel), 017 (auth do operador) |
| **Convenções** | Seguir o `CLAUDE.md` do repositório |

---

## Contexto do Problema

O operador só descobre que recebeu uma OS nova, que a manutenção foi agendada ou que a retaguarda confirmou suas horas **abrindo o app e procurando**. Não há nenhum canal de aviso: nem dentro do app, nem no celular.

O protótipo oficial (`ui_kits/app-campo/CampoApp.jsx`, tela `notif`) já resolve isso visualmente — sino no cabeçalho com badge, lista agrupada por dia, ícone-tile por tipo de aviso, ponto de não lida e "Marcar lidas". Faltava a implementação e, principalmente, o backend.

## Restrição que define a arquitetura

O operador **não tem sessão nativa do Supabase**. O login é por PIN e produz um token opaco em `operador_sessoes`; o projeto usa chaves JWT assimétricas, então não há como assinar um JWT que o PostgREST aceite (ver `feedback_auth_custom_sem_supabase_auth`). Consequências diretas:

1. O papel `anon` **não tem policy de RLS** em nenhuma tabela de negócio. A função `SECURITY DEFINER` que recebe o token como parâmetro **é** a fronteira de segurança.
2. **Realtime não funciona para o operador** — Realtime respeita RLS. A atualização in-app é por reconsulta.

Isso não custa nada nesta feature: **quem entrega em tempo real é o próprio Web Push**, não o Realtime. A reconsulta é a rede de segurança para quem estiver com o push desligado.

## Conceito da Solução

### Situação Atual (As-Is)

`/app/*` tem 4 abas fixas e nenhum canal de aviso. Não existe PWA — sem `manifest`, sem service worker.

### Situação Desejada (To-Be)

Duas camadas, uma fonte da verdade:

- **Central in-app** (fonte da verdade): tabela `notificacoes`, lida por RPC, com cache no aparelho.
- **Web Push** (camada de entrega): trigger → Edge Function → serviço de push do navegador.

Se o push falhar, o aviso continua no sino. Se o operador dispensar o push, o histórico continua na lista.

---

## Escopo

### Backend

| Objeto | Papel |
|--------|-------|
| `notificacoes` | `operador_id`, `tipo`, `titulo`, `mensagem`, `os_id` (deep link), `origem_id` (dedup polimórfico), `lida_em`. RLS ligada, sem policy `anon` |
| `push_subscriptions` | Uma linha por aparelho, `endpoint` único |
| `operador_do_token` | Resolve o operador de um token válido; base de todas as RPCs |
| `criar_notificacao_interna` | Sem checagem — só para triggers e outras funções definer. Não exposta |
| `criar_notificacao` | Produção pela retaguarda; exige `is_retaguarda()` |
| `registrar_notificacao_propria` | Produção pelo operador, para si mesmo. Tipo restrito a `abastecimento_registrado` — senão a chave `anon` viraria um megafone |
| `listar_notificacoes` / `marcar_notificacoes_lidas` | Leitura e escrita do app, por token |
| `registrar_push_subscription` / `remover_push_subscription` | Inscrição do aparelho, por token |
| `tg_notificar_os_atribuida` | Trigger em `ordens_servico.responsavel_id` |
| `tg_enviar_push_notificacao` | Trigger em `notificacoes` → `pg_net` → Edge Function |
| `gerar_lembretes_apontamento` | Job `pg_cron` diário às 17h (BRT) |
| `limpar_push_subscriptions_expiradas` | Job `pg_cron` semanal |
| Edge Function `enviar-push` | Assina VAPID e entrega; remove inscrição em 404/410 |

### Os seis tipos e quem os produz

| Tipo | Produtor | Estado |
|------|----------|--------|
| `os_atribuida` | Trigger em `ordens_servico` | **Ativo** |
| `apontamento_aprovado` | Fechamento da OS na retaguarda | **Ativo** |
| `abastecimento_registrado` | Diálogo de abastecimento do operador | **Ativo** |
| `manutencao_agendada` | Cadastro de plano de manutenção | **Ativo** |
| `lembrete_apontamento` | `pg_cron` | **Dormente** — `apontamentos` ainda é lido de `src/mocks/`; acende sozinho na onda mock→real |
| `correcao_solicitada` | — | **Sem produtor** — não existe ação de "pedir correção" na retaguarda; construí-la ficou fora deste PRD |

### Frontend

- `src/features/notificacoes/` — store (cache em `localStorage` + fila offline de "marcar lidas"), derivações de apresentação, página, sino, configuração de push
- Sino no `OperadorShell`, rota `/app/notificacoes`, atalho e controle de push no Perfil
- **Bottom nav inalterado** — segue com 4 itens

### PWA

`public/manifest.webmanifest` + `public/sw.js` estáticos, ícones gerados por `scripts/gerar-icones-pwa.js`. **Sem `vite-plugin-pwa`**: o `vite.config.ts` proíbe plugins manuais (o preset da Lovable já traz os seus e plugin duplicado quebra o build).

O service worker **não intercepta `fetch`** de propósito — sem shell offline, um cache de assets mal calibrado serviria build velha para quem está em campo.

### Fora de escopo

- Sino na retaguarda (o kit não prevê)
- Tela de "pedir correção" na retaguarda
- Cache offline de assets / app shell

---

## Decisões

| Decisão | Porquê |
|---------|--------|
| Central in-app é a fonte da verdade, push é entrega | Push dispensado some; a lista tem histórico. E o push depende de permissão que o operador pode negar |
| Reconsulta em vez de Realtime | Restrição de auth, não escolha. Ver acima |
| Dedup por `(operador_id, tipo, origem_id)` | "Um aviso deste tipo por registro de origem **por operador**" — uma manutenção avisa vários operadores |
| `os_atribuida` e `correcao_solicitada` fora da dedup | Reatribuir a OS deve avisar de novo; pedir correção duas vezes é legítimo |
| Um aviso por operador ao fechar a OS, com o total dele | Quem lançou cinco apontamentos na mesma obra não merece cinco notificações |
| Push some no logout | Aparelho compartilhado — o próximo operador não pode receber aviso do anterior |
| Degradação silenciosa sem segredos do Vault | Notificar é efeito colateral: nunca pode derrubar o apontamento ou o fechamento da OS |

## Limitação conhecida — iOS

No iOS, Web Push só funciona se o operador **instalar o app na tela inicial** (iOS 16.4+). O Perfil detecta iOS fora do modo instalado e mostra a instrução em vez de esconder o recurso.

## Configuração necessária

A chave VAPID **pública** vai no build (`VITE_VAPID_PUBLIC_KEY`, já em `.env.example`) — não é segredo. A **privada** é secret da Edge Function `enviar-push`:

```bash
supabase secrets set --project-ref nbqgujojgdcpkorychoc \
  VAPID_PUBLIC_KEY=<pública> \
  VAPID_PRIVATE_KEY=<privada> \
  VAPID_SUBJECT=mailto:contato@antonelloterraplanagem.com.br
```

Sem isso, a Edge Function responde `vapid_nao_configurado` e apenas o push fica desligado — a central in-app continua funcionando.

## Critérios de Aceite

- [ ] O sino mostra a contagem de não lidas e some quando zera
- [ ] A lista agrupa por Hoje / Ontem / `qua, 09/07`, mais recente primeiro
- [ ] Tocar numa notificação com OS abre a OS
- [ ] "Marcar lidas" zera na hora, mesmo sem sinal, e sobe ao reconectar
- [ ] Sem sinal, a tela abre com o que já havia chegado
- [ ] Atribuir uma OS a um operador cria a notificação dele
- [ ] Fechar a OS avisa cada operador com o total de horas dele
- [ ] Com VAPID configurado, o celular recebe o aviso com o app fechado
- [ ] Nenhuma tela de `/app/*` exibe preço ou valor
