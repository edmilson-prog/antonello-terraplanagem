-- Libera leitura anônima (operador de campo, PWA, role `anon`) do nome do
-- cliente ativo — necessário porque o app do operador nunca autentica de
-- verdade no Supabase (token opaco próprio, role fica sempre anon) e precisa
-- exibir o nome do cliente na lista/detalhe de OS. Mesmo padrão já usado em
-- `operadores` (RLS escopada por `ativo = true` + GRANT de coluna explícito):
-- documento e telefone são dados pessoais (LGPD) e NÃO são liberados ao anon.
-- Confirmado explicitamente pelo usuário (AskUserQuestion) antes de aplicar.

create policy "clientes_anon_select_ativos" on public.clientes
  for select to anon using (ativo = true);

grant select (id, nome) on public.clientes to anon;
