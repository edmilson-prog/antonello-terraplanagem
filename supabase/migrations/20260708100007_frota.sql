create table public.planos_manutencao (
  id uuid primary key default gen_random_uuid(),
  equipamento_id uuid references public.equipamentos (id),
  tipo_equipamento text check (tipo_equipamento in ('escavadeira','carregadeira','caminhao_cacamba','trator_esteira','retroescavadeira','outro')),
  descricao text not null,
  intervalo_horas numeric(10,1) not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_planos_manutencao_vinculo check (
    (equipamento_id is not null)::int + (tipo_equipamento is not null)::int = 1
  )
);
create trigger trg_planos_manutencao_updated_at before update on public.planos_manutencao for each row execute function public.set_updated_at();
alter table public.planos_manutencao enable row level security;
create policy "planos_manutencao_retaguarda_all" on public.planos_manutencao for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

create table public.registros_manutencao (
  id uuid primary key default gen_random_uuid(),
  equipamento_id uuid not null references public.equipamentos (id),
  plano_id uuid not null references public.planos_manutencao (id),
  horimetro_previsto numeric(10,1) not null,
  horimetro_realizado numeric(10,1),
  status text not null default 'prevista' check (status in ('prevista','realizada')),
  custo numeric(12,2),
  observacao text,
  realizada_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_registros_manutencao_updated_at before update on public.registros_manutencao for each row execute function public.set_updated_at();
alter table public.registros_manutencao enable row level security;
create policy "registros_manutencao_retaguarda_all" on public.registros_manutencao for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

create table public.abastecimentos (
  id uuid primary key default gen_random_uuid(),
  equipamento_id uuid not null references public.equipamentos (id),
  operador_id uuid references public.operadores (id),
  litros numeric(10,2) not null,
  horimetro numeric(10,1) not null,
  preco_litro numeric(10,4),
  custo_total numeric(12,2),
  local text,
  abastecido_em timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_abastecimentos_updated_at before update on public.abastecimentos for each row execute function public.set_updated_at();
alter table public.abastecimentos enable row level security;
create policy "abastecimentos_retaguarda_all" on public.abastecimentos for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

create table public.componentes_custo (
  id uuid primary key default gen_random_uuid(),
  equipamento_id uuid not null references public.equipamentos (id),
  descricao text not null,
  tipo text not null check (tipo in ('fixo_mensal','variavel_hora','diesel','manutencao')),
  valor numeric(12,2) not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_componentes_custo_updated_at before update on public.componentes_custo for each row execute function public.set_updated_at();
alter table public.componentes_custo enable row level security;
create policy "componentes_custo_retaguarda_all" on public.componentes_custo for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());
