-- Notificações do app de campo (PRD-020).
--
-- Duas tabelas, ambas com RLS ligada e SEM policy para `anon`: o operador não
-- tem sessão nativa do Supabase (token opaco em operador_sessoes, ver
-- 20260708100003_login_operador_rpc.sql), então a fronteira de segurança é a
-- função SECURITY DEFINER, nunca a policy. A retaguarda (Supabase Auth de
-- verdade) enxerga tudo via is_retaguarda().

create table public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null references public.operadores (id) on delete cascade,
  tipo text not null check (tipo in (
    'os_atribuida',
    'manutencao_agendada',
    'apontamento_aprovado',
    'lembrete_apontamento',
    'abastecimento_registrado',
    'correcao_solicitada'
  )),
  titulo text not null,
  mensagem text not null,
  -- Deep link: quando presente, tocar a notificação abre a OS no app.
  os_id uuid references public.ordens_servico (id) on delete set null,
  -- Registro que originou a notificação (apontamento, abastecimento, registro
  -- de manutenção...). Polimórfico de propósito — sem FK — e usado para
  -- deduplicar reprocessamentos (ver idx_notificacoes_origem_unica).
  origem_id uuid,
  lida_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_notificacoes_updated_at before update on public.notificacoes for each row execute function public.set_updated_at();
alter table public.notificacoes enable row level security;
create policy "notificacoes_retaguarda_all" on public.notificacoes for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

-- Leitura da lista: sempre por operador, sempre mais recente primeiro.
create index idx_notificacoes_operador_id_created_at on public.notificacoes (operador_id, created_at desc);
-- Contador do sino: só as não lidas.
create index idx_notificacoes_operador_id_lida_em on public.notificacoes (operador_id) where lida_em is null;

-- Eventos que só podem gerar UM aviso por registro de origem. Deixa de fora
-- 'os_atribuida' (reatribuir a OS deve avisar de novo) e 'correcao_solicitada'
-- (a retaguarda pode pedir correção mais de uma vez no mesmo apontamento).
create unique index idx_notificacoes_origem_unica
  on public.notificacoes (tipo, origem_id)
  where origem_id is not null
    and tipo in (
      'apontamento_aprovado',
      'lembrete_apontamento',
      'abastecimento_registrado',
      'manutencao_agendada'
    );

-- Inscrições de Web Push. Uma linha por dispositivo/navegador: o mesmo
-- operador pode ter o app no celular e no tablet.
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  operador_id uuid not null references public.operadores (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_push_subscriptions_updated_at before update on public.push_subscriptions for each row execute function public.set_updated_at();
alter table public.push_subscriptions enable row level security;
create policy "push_subscriptions_retaguarda_all" on public.push_subscriptions for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

create index idx_push_subscriptions_operador_id on public.push_subscriptions (operador_id);
