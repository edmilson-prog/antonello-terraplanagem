create table public.comprovantes (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,
  os_id uuid not null unique references public.ordens_servico (id),
  cliente_id uuid not null references public.clientes (id),
  resumo_servico text not null,
  assinante_nome text,
  assinatura_url text,
  status text not null default 'pendente' check (status in ('pendente','assinado','recusado')),
  motivo_recusa text,
  gerado_em timestamptz not null default now(),
  assinado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_comprovantes_updated_at before update on public.comprovantes for each row execute function public.set_updated_at();
alter table public.comprovantes enable row level security;
create policy "comprovantes_retaguarda_all" on public.comprovantes for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

create table public.avisos_whatsapp (
  id uuid primary key default gen_random_uuid(),
  os_id uuid not null references public.ordens_servico (id),
  cliente_id uuid not null references public.clientes (id),
  provedor text not null check (provedor in ('evolution_api','evolution_go','meta_cloud_api','openwa')),
  status text not null check (status in ('enviado','falha_telefone_invalido')),
  mensagem_preview text not null default '',
  enviado_em timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.avisos_whatsapp enable row level security;
create policy "avisos_whatsapp_retaguarda_all" on public.avisos_whatsapp for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());
