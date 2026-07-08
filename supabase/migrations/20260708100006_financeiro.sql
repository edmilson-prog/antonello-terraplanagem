create table public.faturamentos (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,
  os_id uuid not null references public.ordens_servico (id),
  cliente_id uuid not null references public.clientes (id),
  modelo_cobranca text not null check (modelo_cobranca in ('hora_maquina','por_metro')),
  desconto numeric(12,2) not null default 0,
  valor_total numeric(12,2) not null default 0,
  observacao text,
  status text not null default 'rascunho' check (status in ('rascunho','faturado')),
  gerado_em timestamptz not null default now(),
  faturado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_faturamentos_updated_at before update on public.faturamentos for each row execute function public.set_updated_at();
alter table public.faturamentos enable row level security;
create policy "faturamentos_retaguarda_all" on public.faturamentos for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

create table public.faturamento_itens (
  id uuid primary key default gen_random_uuid(),
  faturamento_id uuid not null references public.faturamentos (id) on delete cascade,
  tipo text not null check (tipo in ('hora_maquina','por_metro','mobilizacao')),
  descricao text not null,
  origem_id uuid,
  hora_tipo text check (hora_tipo in ('seca','operada')),
  quantidade numeric(12,2) not null,
  valor_unitario numeric(12,2),
  valor_total numeric(12,2) not null default 0,
  sem_preco boolean not null default false
);
alter table public.faturamento_itens enable row level security;
create policy "faturamento_itens_retaguarda_all" on public.faturamento_itens for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

create table public.contas_pagar (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  fornecedor text,
  categoria text not null check (categoria in ('diesel','manutencao','folha','fornecedor','outro')),
  valor numeric(12,2) not null,
  vencimento date not null,
  status text not null default 'aberta' check (status in ('aberta','liquidada')),
  pago_em date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_contas_pagar_updated_at before update on public.contas_pagar for each row execute function public.set_updated_at();
alter table public.contas_pagar enable row level security;
create policy "contas_pagar_retaguarda_all" on public.contas_pagar for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

create table public.contas_receber (
  id uuid primary key default gen_random_uuid(),
  faturamento_id uuid not null references public.faturamentos (id),
  cliente_id uuid not null references public.clientes (id),
  valor numeric(12,2) not null,
  vencimento date not null,
  status text not null default 'aberta' check (status in ('aberta','liquidada')),
  recebido_em date,
  forma_recebimento text check (forma_recebimento in ('dinheiro','pix','transferencia','boleto','cheque','outro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_contas_receber_updated_at before update on public.contas_receber for each row execute function public.set_updated_at();
alter table public.contas_receber enable row level security;
create policy "contas_receber_retaguarda_all" on public.contas_receber for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

create table public.cobrancas_gateway (
  id uuid primary key default gen_random_uuid(),
  conta_receber_id uuid not null references public.contas_receber (id),
  provedor text not null check (provedor in ('mercado_pago','asaas')),
  status text not null default 'pendente' check (status in ('pendente','paga','cancelada')),
  linha_digitavel text,
  pix_copia_cola text not null,
  valor numeric(12,2) not null,
  emitida_em timestamptz not null default now(),
  paga_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_cobrancas_gateway_updated_at before update on public.cobrancas_gateway for each row execute function public.set_updated_at();
alter table public.cobrancas_gateway enable row level security;
create policy "cobrancas_gateway_retaguarda_all" on public.cobrancas_gateway for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());
