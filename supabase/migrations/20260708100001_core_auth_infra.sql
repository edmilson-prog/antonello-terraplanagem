-- Extensions already enabled on this project; no-ops if already present.
create extension if not exists pgcrypto with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;

-- Reusable trigger: keeps updated_at current on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Retaguarda (recepção/proprietário) profile — one row per auth.users account.
create table public.usuarios_retaguarda (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  perfil text not null check (perfil in ('recepcao', 'proprietario')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_usuarios_retaguarda_updated_at
  before update on public.usuarios_retaguarda
  for each row execute function public.set_updated_at();

alter table public.usuarios_retaguarda enable row level security;

create policy "usuarios_retaguarda_self_select"
  on public.usuarios_retaguarda for select
  to authenticated
  using (id = auth.uid());

-- Helper reused by every RLS policy from Task 3 onward.
create or replace function public.is_retaguarda()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.usuarios_retaguarda where id = auth.uid()
  );
$$;

-- Operador sessions (token opaco — spec seção 2/5.2). Sem policy nenhuma:
-- só acessível via funções SECURITY DEFINER (Task 4). FK para operadores
-- é adicionada na Task 3, quando a tabela operadores existir.
create table public.operador_sessoes (
  token uuid primary key default gen_random_uuid(),
  operador_id uuid not null,
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null,
  revogado boolean not null default false
);

alter table public.operador_sessoes enable row level security;
-- Nenhuma policy — nem authenticated nem anon têm acesso direto a esta tabela.
