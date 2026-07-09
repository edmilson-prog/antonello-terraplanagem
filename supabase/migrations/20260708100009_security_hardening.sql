-- Defense-in-depth: revoke anon's coarse schema-default SELECT grant on all
-- non-operadores public tables.
--
-- Context (Task 15 security review, docs/superpowers/plans/2026-07-08-prd-017-018-auth-backend.md):
-- Supabase grants `anon`/`authenticated` SELECT/INSERT/UPDATE/REFERENCES on
-- every new table in `public` by default. RLS is enabled on every one of
-- these tables and has zero anon-facing policies (only an
-- `authenticated`-scoped policy gated by is_retaguarda()), so this grant is
-- NOT currently exploitable — verified empirically via `set role anon`,
-- every business table returns 0 rows for anon despite the grant.
--
-- Only `operadores` received an explicit `revoke select / grant select
-- (id, nome)` treatment (Task 3), because it needs a narrow, intentional
-- anon-visible slice (pre-login operator name list). The other 22 tables
-- never got an equivalent narrowing, leaving an inconsistent posture
-- relative to this project's stated design principle (see
-- docs/superpowers/specs/2026-07-08-prd-017-018-auth-backend-design.md,
-- "Barreira financeira": RLS + REVOKE, not RLS alone).
--
-- This migration closes that gap. It does not change any runtime behavior
-- for legitimate callers — anon never relied on this SELECT grant, RLS
-- already did all the work. It only touches `anon`; `authenticated`'s
-- access via is_retaguarda()-gated policies is untouched.

revoke select on table
  public.abastecimentos,
  public.apontamentos,
  public.avisos_whatsapp,
  public.clientes,
  public.cobrancas_gateway,
  public.componentes_custo,
  public.comprovantes,
  public.contas_pagar,
  public.contas_receber,
  public.equipamentos,
  public.faturamento_itens,
  public.faturamentos,
  public.operador_sessoes,
  public.orcamento_itens,
  public.orcamentos,
  public.ordens_servico,
  public.planos_manutencao,
  public.precos_fundacao,
  public.precos_hora_maquina,
  public.precos_mobilizacao,
  public.registros_manutencao,
  public.usuarios_retaguarda
from anon;

-- Prevent this coarse grant from silently re-appearing on tables created
-- after this point in the same schema.
alter default privileges in schema public revoke select on tables from anon;
