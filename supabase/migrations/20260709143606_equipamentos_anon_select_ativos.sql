-- Libera leitura anônima (operador de campo, PWA, role `anon`) da lista de
-- equipamentos ativos — necessário porque o app do operador nunca autentica
-- de verdade no Supabase (token opaco próprio, role fica sempre anon) e
-- precisa listar equipamento para iniciar apontamento. Mesmo padrão já usado
-- em `operadores` (RLS escopada por `ativo = true` + GRANT explícito).
-- Nenhuma coluna de `equipamentos` é dado financeiro, então não há
-- necessidade de column-level grant como em `operadores (id, nome)`.

create policy "equipamentos_anon_select_ativos" on public.equipamentos
  for select to anon using (ativo = true);

grant select on public.equipamentos to anon;
