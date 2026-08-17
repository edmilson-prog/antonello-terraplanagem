-- O revoke anterior tirou os grants nominais de anon/authenticated, mas estas
-- três nunca tiveram o revoke de PUBLIC — e o EXECUTE que o Postgres concede a
-- PUBLIC por padrão continuava valendo. Mesmo tratamento das trigger functions
-- de push (20260812130000).
--
-- Auditado com has_function_privilege('anon', oid, 'execute') antes e depois:
-- as três saíram de true para false.
revoke execute on function public.parametros_registrar_historico() from public, anon, authenticated;
revoke execute on function public.parametros_antes_update() from public, anon, authenticated;
revoke execute on function public.parametros_campos_de_negocio(public.parametros)
  from public, anon, authenticated;
