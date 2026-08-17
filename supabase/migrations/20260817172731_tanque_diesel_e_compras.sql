-- Controle de estoque do tanque interno de diesel.
--
-- Contexto: a Onda 10 tinha removido "origem do diesel" e a baixa de estoque
-- do formulário de abastecimento, porque o controle não existia. Decisão de
-- 2026-08-17: criar o controle de verdade, e não só a tela.
--
-- Saldo e custo médio NÃO são persistidos — derivam de compras e
-- abastecimentos processados em ordem cronológica (média móvel ponderada),
-- pelo mesmo princípio do custo/hora (PRD-013).

create table public.compras_diesel (
  id uuid primary key default gen_random_uuid(),
  litros numeric(10,2) not null check (litros > 0),
  preco_litro numeric(10,4) not null check (preco_litro >= 0),
  valor_total numeric(12,2) not null check (valor_total >= 0),
  fornecedor text,
  documento text, -- nº da nota/cupom
  observacao text,
  comprado_em timestamptz not null default now(),
  -- Conta a pagar gerada por esta compra. Guardar o vínculo evita duplicar o
  -- lançamento se a compra for reprocessada.
  conta_pagar_id uuid references public.contas_pagar (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_compras_diesel_comprado_em on public.compras_diesel (comprado_em desc);

create trigger trg_compras_diesel_updated_at
  before update on public.compras_diesel
  for each row execute function public.set_updated_at();

alter table public.compras_diesel enable row level security;

create policy "compras_diesel_retaguarda_all" on public.compras_diesel
  for all to authenticated
  using (public.is_retaguarda()) with check (public.is_retaguarda());

-- De onde saiu o diesel deste abastecimento. Default 'externo' para não
-- reescrever o histórico: os abastecimentos já registrados não passaram pelo
-- controle de tanque, e marcá-los como 'tanque' criaria baixas retroativas.
alter table public.abastecimentos
  add column origem text not null default 'externo'
  check (origem in ('tanque', 'externo'));

-- Capacidade do tanque, para o card mostrar "x de y litros".
alter table public.parametros
  add column tanque_capacidade_litros numeric(10,2) not null default 2000;
