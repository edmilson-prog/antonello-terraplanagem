-- Snapshot do ERP legado (FarolTI) — colunas que faltavam no controle de versão.
--
-- ACHADO: `cli_codigo_legado` e as colunas `legado_*` são lidas pelo código
-- (`FaroltiSnapshotCard` decide se renderiza a partir de `cli_codigo_legado`)
-- e estão nos types gerados, mas NENHUMA migração as criava. Foram adicionadas
-- à mão no painel do Supabase em algum momento da importação.
--
-- Isso quer dizer que as migrações não reproduziam a produção: um ambiente novo
-- (staging, ou o banco local de validação) nascia sem essas colunas, e qualquer
-- migração que as referenciasse quebrava. Foi assim que este arquivo apareceu —
-- a migração de dados comerciais falhou ao rodar contra um Postgres limpo.
--
-- `if not exists` em todas: em produção, onde elas já existem, isto é no-op.
-- O objetivo não é criar de novo, é passar a versionar.

alter table public.clientes
  add column if not exists cli_codigo_legado integer,
  add column if not exists legado_frequencia_os integer,
  add column if not exists legado_ltv numeric(14, 2),
  add column if not exists legado_ticket_medio numeric(14, 2),
  add column if not exists legado_primeira_os date,
  add column if not exists legado_ultima_os date,
  add column if not exists legado_recencia_dias integer,
  add column if not exists legado_curva_abc text;

-- A curva ABC é uma classificação fechada. Sem o CHECK, um "D" digitado por
-- engano passaria e o card renderizaria uma categoria que não existe.
alter table public.clientes
  drop constraint if exists chk_clientes_legado_curva_abc;

alter table public.clientes
  add constraint chk_clientes_legado_curva_abc check (
    legado_curva_abc is null or legado_curva_abc in ('A', 'B', 'C')
  );

comment on column public.clientes.cli_codigo_legado is
  'Código do cliente no ERP FarolTI. Não nulo = veio da migração; é o que faz o card do snapshot aparecer.';
comment on column public.clientes.legado_ltv is
  'Snapshot CONGELADO na importação. O sistema não recalcula — ver FaroltiSnapshotCard.';
