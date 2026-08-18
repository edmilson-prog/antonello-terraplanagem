-- Notificações da retaguarda (Onda 19).
--
-- O PRD-020 construiu a notificação como coisa DO OPERADOR: `operador_id` é
-- NOT NULL e os seis tipos existentes são todos de campo. O UI kit da central
-- da retaguarda desenha cinco categorias — Operação, Frota, Financeiro,
-- Comercial e Sistema — e as duas últimas são assunto do escritório: título
-- vencido, orçamento aprovado. Não existe operador para recebê-las.
--
-- Então o destinatário passa a ser um dos dois, nunca ambos:
--   operador_id → cai na caixa do app de campo (comportamento de hoje)
--   usuario_id  → cai na central da retaguarda
--
-- O resto do que o kit pede e não existia: categoria (para os filtros),
-- prioridade (crítico ignora horário silencioso e limite por hora), ação no
-- app, e agendamento.

alter table public.notificacoes
  alter column operador_id drop not null,
  add column if not exists usuario_id uuid references public.usuarios_retaguarda (id) on delete cascade,
  add column if not exists categoria text not null default 'operacao',
  add column if not exists prioridade text not null default 'normal',
  -- Rótulo do botão que o app de campo mostra na notificação ("Abrir OS",
  -- "Confirmar leitura"). Texto livre: quem interpreta é a tela, não o banco.
  add column if not exists acao text,
  -- Quando preenchido e no futuro, a notificação existe mas ainda não foi
  -- entregue — quem libera é `liberar_notificacoes_agendadas()`.
  add column if not exists agendada_para timestamptz,
  add column if not exists enviada_em timestamptz;

-- Backfill: tudo que já existe é do campo, já foi entregue e é de operação —
-- menos manutenção, que é frota.
update public.notificacoes
   set enviada_em = coalesce(enviada_em, created_at),
       categoria = case when tipo = 'manutencao_agendada' then 'frota' else 'operacao' end
 where enviada_em is null;

alter table public.notificacoes
  add constraint notificacoes_destinatario_check
  check (num_nonnulls(operador_id, usuario_id) = 1);

alter table public.notificacoes
  add constraint notificacoes_categoria_check
  check (categoria in ('operacao', 'frota', 'financeiro', 'comercial', 'sistema'));

alter table public.notificacoes
  add constraint notificacoes_prioridade_check
  check (prioridade in ('normal', 'alta', 'critico'));

-- Os tipos crescem de 6 para 17 — um por evento da matriz de preferências do
-- kit. `aviso_manual` é o da tela "Nova notificação", que não nasce de evento
-- nenhum: alguém do escritório escreveu à mão.
alter table public.notificacoes drop constraint if exists notificacoes_tipo_check;
alter table public.notificacoes
  add constraint notificacoes_tipo_check
  check (tipo in (
    -- Operação
    'os_atribuida',
    'apontamento_aprovado',
    'apontamento_aguardando',
    'lembrete_apontamento',
    'os_sem_apontamento',
    'os_concluida',
    'correcao_solicitada',
    -- Frota
    'manutencao_agendada',
    'manutencao_vencida',
    'consumo_anomalo',
    'abastecimento_registrado',
    -- Financeiro
    'titulo_vencido',
    'titulo_a_vencer',
    'comprovante_recebido',
    -- Comercial
    'orcamento_aprovado',
    'orcamento_perdido',
    'orcamento_a_vencer',
    -- Sistema
    'aviso_manual'
  ));

-- A central filtra por categoria e ordena por data em toda carga; a caixa do
-- operador continua filtrando por operador.
create index if not exists idx_notificacoes_usuario_id on public.notificacoes (usuario_id);
create index if not exists idx_notificacoes_categoria on public.notificacoes (categoria);
create index if not exists idx_notificacoes_agendada_para
  on public.notificacoes (agendada_para) where agendada_para is not null;

-- ---------------------------------------------------------------------------
-- Entregas por canal
-- ---------------------------------------------------------------------------
-- Sem isto, os KPIs do kit ("98,4% entregues", "69,7% abertos", "tempo médio
-- até abrir", "5 falhas") não teriam de onde sair: hoje o push é disparado e
-- ninguém anota o que aconteceu. Uma linha por (notificação, canal).
create table if not exists public.notificacoes_entregas (
  id uuid primary key default gen_random_uuid(),
  notificacao_id uuid not null references public.notificacoes (id) on delete cascade,
  canal text not null check (canal in ('app', 'push', 'email', 'whatsapp')),
  status text not null default 'pendente'
    check (status in ('pendente', 'entregue', 'falhou', 'suprimido')),
  -- `suprimido` é entrega que o sistema decidiu não fazer: horário silencioso,
  -- limite por hora, canal desligado nas preferências. Não é falha — e separar
  -- os dois é o que impede o KPI de falhas de mentir.
  motivo text,
  destino text, -- endpoint do push ou e-mail, para rastrear a falha
  entregue_em timestamptz,
  aberta_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_notificacoes_entregas_unica
  on public.notificacoes_entregas (notificacao_id, canal, coalesce(destino, ''));
create index if not exists idx_notificacoes_entregas_notificacao
  on public.notificacoes_entregas (notificacao_id);
create index if not exists idx_notificacoes_entregas_created_at
  on public.notificacoes_entregas (created_at);

create trigger trg_notificacoes_entregas_updated_at
  before update on public.notificacoes_entregas
  for each row execute function public.set_updated_at();

alter table public.notificacoes_entregas enable row level security;

create policy notificacoes_entregas_retaguarda_all on public.notificacoes_entregas
  for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

-- ---------------------------------------------------------------------------
-- Preferências — uma linha para a empresa inteira
-- ---------------------------------------------------------------------------
-- Mesma escolha da tabela `parametros` (Onda 13), pelo mesmo motivo prático: o
-- app de campo não tem tela de preferências, então preferência por pessoa
-- deixaria o operador sem como mudar a dele. Decisão do usuário.
create table if not exists public.notificacoes_preferencias (
  id uuid primary key default gen_random_uuid(),
  -- Horário silencioso: nada de push entre estas horas, exceto crítico.
  silencio_inicio time not null default '22:00',
  silencio_fim time not null default '06:00',
  -- No fim de semana, só o que for crítico.
  fim_de_semana_so_criticos boolean not null default true,
  -- Resumo diário por e-mail.
  resumo_email_ativo boolean not null default true,
  resumo_email_hora time not null default '18:00',
  -- Teto de push por operador por hora; crítico não conta.
  max_push_por_hora integer not null default 6 check (max_push_por_hora > 0),
  -- Dias que a notificação fica no histórico antes da limpeza.
  retencao_dias integer not null default 90 check (retencao_dias > 0),
  atualizado_por uuid references public.usuarios_retaguarda (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_notificacoes_preferencias_singleton
  on public.notificacoes_preferencias ((true));

create trigger trg_notificacoes_preferencias_updated_at
  before update on public.notificacoes_preferencias
  for each row execute function public.set_updated_at();

alter table public.notificacoes_preferencias enable row level security;

create policy notificacoes_preferencias_retaguarda_all on public.notificacoes_preferencias
  for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

insert into public.notificacoes_preferencias default values on conflict do nothing;

-- A matriz evento × canal do kit. Tabela filha em vez de 68 colunas: os tipos
-- crescem com o produto, e cada tipo novo vira uma linha, não uma migration de
-- ALTER TABLE.
create table if not exists public.notificacoes_preferencias_eventos (
  tipo text primary key,
  canal_app boolean not null default true,
  canal_push boolean not null default false,
  canal_email boolean not null default false,
  canal_whatsapp boolean not null default false,
  -- Crítico ignora silêncio e limite por hora. É atributo do EVENTO, não da
  -- notificação avulsa — a prioridade da linha em `notificacoes` cobre o caso
  -- pontual (um aviso manual marcado como crítico).
  critico boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_notificacoes_preferencias_eventos_updated_at
  before update on public.notificacoes_preferencias_eventos
  for each row execute function public.set_updated_at();

alter table public.notificacoes_preferencias_eventos enable row level security;

create policy notificacoes_preferencias_eventos_retaguarda_all
  on public.notificacoes_preferencias_eventos
  for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

-- Padrões espelhando a matriz desenhada no kit.
insert into public.notificacoes_preferencias_eventos (tipo, canal_app, canal_push, canal_email, critico)
values
  ('apontamento_aguardando', true, true, false, false),
  ('os_sem_apontamento', true, true, true, false),
  ('os_concluida', true, false, true, false),
  ('os_atribuida', true, true, false, false),
  ('apontamento_aprovado', true, true, false, false),
  ('lembrete_apontamento', true, true, false, false),
  ('correcao_solicitada', true, true, false, false),
  ('manutencao_vencida', true, true, true, true),
  ('manutencao_agendada', true, true, false, false),
  ('consumo_anomalo', true, false, true, false),
  ('abastecimento_registrado', true, false, false, false),
  ('titulo_vencido', true, false, true, true),
  ('titulo_a_vencer', true, false, true, false),
  ('comprovante_recebido', true, false, false, false),
  ('orcamento_aprovado', true, false, true, false),
  ('orcamento_perdido', true, false, false, false),
  ('orcamento_a_vencer', true, false, true, false),
  ('aviso_manual', true, true, false, false)
on conflict (tipo) do nothing;
