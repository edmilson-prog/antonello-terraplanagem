-- Histórico de preços (Onda 20).
--
-- O card "Tabelas anteriores" (Onda 9) já existia, mas o histórico vivia numa
-- lista em memória alimentada pela própria tela: alterar um preço registrava a
-- versão anterior, e o F5 apagava tudo. Como a tabela de preços em si também
-- era mock, ninguém notou — as duas pontas eram fictícias.
--
-- Mesmo desenho de `parametros_historico` (Onda 13), e pelo mesmo motivo: o
-- registro é feito por TRIGGER, não pela tela. Assim uma alteração feita por
-- SQL, por importação ou por qualquer caminho futuro também entra no histórico,
-- em vez de depender de quem chamou a função certa na hora certa.

create table if not exists public.precos_historico (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('hora_maquina', 'fundacao', 'mobilizacao')),
  preco_id uuid not null,
  -- Snapshot do estado ANTERIOR, inteiro. jsonb porque as três tabelas de
  -- preço têm colunas diferentes e o card só precisa reexibir o que era.
  snapshot jsonb not null,
  alterado_em timestamptz not null default now(),
  alterado_por uuid references public.usuarios_retaguarda (id)
);

create index if not exists idx_precos_historico_alterado_em
  on public.precos_historico (alterado_em desc);
create index if not exists idx_precos_historico_preco_id
  on public.precos_historico (tipo, preco_id);

alter table public.precos_historico enable row level security;

create policy precos_historico_retaguarda_all on public.precos_historico
  for all to authenticated using (public.is_retaguarda()) with check (public.is_retaguarda());

-- Um trigger só para as três tabelas: o tipo sai do nome da tabela, então
-- adicionar uma quarta modalidade de preço no futuro é uma linha de `case`.
create or replace function public.tg_registrar_historico_preco()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tipo text;
begin
  v_tipo := case tg_table_name
    when 'precos_hora_maquina' then 'hora_maquina'
    when 'precos_fundacao' then 'fundacao'
    when 'precos_mobilizacao' then 'mobilizacao'
  end;

  if v_tipo is null then
    return null;
  end if;

  -- Só guarda quando algo mudou de fato. Um update que reescreve os mesmos
  -- valores (ou que só mexe em updated_at) não vira linha de histórico.
  if to_jsonb(old) - 'updated_at' = to_jsonb(new) - 'updated_at' then
    return null;
  end if;

  insert into public.precos_historico (tipo, preco_id, snapshot, alterado_por)
  values (v_tipo, old.id, to_jsonb(old), auth.uid());

  return null;
end;
$$;

revoke execute on function public.tg_registrar_historico_preco() from public, anon, authenticated;

create trigger trg_precos_hora_maquina_historico
  after update on public.precos_hora_maquina
  for each row execute function public.tg_registrar_historico_preco();

create trigger trg_precos_fundacao_historico
  after update on public.precos_fundacao
  for each row execute function public.tg_registrar_historico_preco();

create trigger trg_precos_mobilizacao_historico
  after update on public.precos_mobilizacao
  for each row execute function public.tg_registrar_historico_preco();
