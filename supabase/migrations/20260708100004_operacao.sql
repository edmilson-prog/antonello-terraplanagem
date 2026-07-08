create table public.ordens_servico (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,
  cliente_id uuid not null references public.clientes (id),
  obra_nome text not null,
  endereco text,
  modelo_cobranca text not null check (modelo_cobranca in ('hora_maquina','por_metro')),
  status text not null default 'aberta' check (status in ('aberta','em_andamento','fechada')),
  responsavel_id uuid references public.operadores (id),
  observacao text,
  diametro_broca_mm integer,
  aberta_em timestamptz not null default now(),
  fechada_em timestamptz,
  pendente_sync boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_ordens_servico_updated_at before update on public.ordens_servico for each row execute function public.set_updated_at();
alter table public.ordens_servico enable row level security;
create policy "ordens_servico_retaguarda_all" on public.ordens_servico for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

create table public.apontamentos (
  id uuid primary key default gen_random_uuid(),
  equipamento_id uuid not null references public.equipamentos (id),
  operador_id uuid not null references public.operadores (id),
  os_id uuid references public.ordens_servico (id),
  horimetro_inicial numeric(10,1) not null,
  horimetro_final numeric(10,1),
  horas_trabalhadas numeric(10,1),
  foto_inicial_url text,
  foto_final_url text,
  observacao text,
  modalidade text check (modalidade in ('seca','operada')),
  metros_executados numeric(10,2),
  status text not null default 'em_andamento' check (status in ('em_andamento','finalizado')),
  pendente_sync boolean not null default false,
  iniciado_em timestamptz not null default now(),
  finalizado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_apontamentos_updated_at before update on public.apontamentos for each row execute function public.set_updated_at();
alter table public.apontamentos enable row level security;
create policy "apontamentos_retaguarda_all" on public.apontamentos for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());
