create table public.precos_hora_maquina (
  id uuid primary key default gen_random_uuid(),
  equipamento_id uuid references public.equipamentos (id),
  tipo_equipamento text check (tipo_equipamento in ('escavadeira','carregadeira','caminhao_cacamba','trator_esteira','retroescavadeira','outro')),
  valor_hora_seca numeric(12,2) not null,
  valor_hora_operada numeric(12,2) not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_precos_hora_maquina_vinculo check (
    (equipamento_id is not null)::int + (tipo_equipamento is not null)::int = 1
  )
);
create trigger trg_precos_hora_maquina_updated_at before update on public.precos_hora_maquina for each row execute function public.set_updated_at();
alter table public.precos_hora_maquina enable row level security;
create policy "precos_hora_maquina_retaguarda_all" on public.precos_hora_maquina for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

create table public.precos_fundacao (
  id uuid primary key default gen_random_uuid(),
  diametro_broca_mm integer not null,
  valor_metro numeric(12,2) not null,
  descricao text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_precos_fundacao_updated_at before update on public.precos_fundacao for each row execute function public.set_updated_at();
alter table public.precos_fundacao enable row level security;
create policy "precos_fundacao_retaguarda_all" on public.precos_fundacao for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

create table public.precos_mobilizacao (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  valor numeric(12,2) not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_precos_mobilizacao_updated_at before update on public.precos_mobilizacao for each row execute function public.set_updated_at();
alter table public.precos_mobilizacao enable row level security;
create policy "precos_mobilizacao_retaguarda_all" on public.precos_mobilizacao for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

create table public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,
  cliente_id uuid not null references public.clientes (id),
  descricao_obra text not null,
  desconto numeric(12,2) not null default 0,
  valor_total numeric(12,2) not null default 0,
  validade date,
  observacao text,
  status text not null default 'rascunho' check (status in ('rascunho','enviado','aprovado','recusado')),
  os_id uuid references public.ordens_servico (id),
  enviado_em timestamptz,
  decidido_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_orcamentos_updated_at before update on public.orcamentos for each row execute function public.set_updated_at();
alter table public.orcamentos enable row level security;
create policy "orcamentos_retaguarda_all" on public.orcamentos for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

create table public.orcamento_itens (
  id uuid primary key default gen_random_uuid(),
  orcamento_id uuid not null references public.orcamentos (id) on delete cascade,
  tipo text not null check (tipo in ('hora_maquina','por_metro','mobilizacao')),
  descricao text not null,
  origem_id uuid,
  hora_tipo text check (hora_tipo in ('seca','operada')),
  quantidade_estimada numeric(12,2) not null,
  valor_unitario numeric(12,2),
  valor_total numeric(12,2) not null default 0,
  sem_preco boolean not null default false
);
alter table public.orcamento_itens enable row level security;
create policy "orcamento_itens_retaguarda_all" on public.orcamento_itens for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());
