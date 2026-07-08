create table public.equipamentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null check (tipo in ('escavadeira','carregadeira','caminhao_cacamba','trator_esteira','retroescavadeira','outro')),
  capacidade text not null,
  horimetro_atual numeric(10,1) not null default 0,
  identificador text,
  status text not null default 'disponivel' check (status in ('disponivel','em_uso','manutencao')),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_equipamentos_updated_at before update on public.equipamentos for each row execute function public.set_updated_at();
alter table public.equipamentos enable row level security;
create policy "equipamentos_retaguarda_all" on public.equipamentos for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

create table public.operadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  cpf text not null unique check (cpf ~ '^[0-9]{11}$'),
  pin_hash text not null,
  tentativas_falhas integer not null default 0,
  bloqueado_ate timestamptz,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_operadores_updated_at before update on public.operadores for each row execute function public.set_updated_at();
alter table public.operadores enable row level security;
create policy "operadores_retaguarda_all" on public.operadores for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());
create policy "operadores_anon_login_list" on public.operadores for select to anon using (ativo = true);
revoke select on public.operadores from anon;
grant select (id, nome) on public.operadores to anon;

-- FK left pending from Task 2 (operadores didn't exist yet).
alter table public.operador_sessoes
  add constraint fk_operador_sessoes_operador foreign key (operador_id) references public.operadores (id);

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  documento text,
  telefone text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_clientes_updated_at before update on public.clientes for each row execute function public.set_updated_at();
alter table public.clientes enable row level security;
create policy "clientes_retaguarda_all" on public.clientes for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());
