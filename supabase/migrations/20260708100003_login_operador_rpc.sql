create or replace function public.login_operador(p_operador_id uuid, p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_operador record;
  v_token uuid;
begin
  select id, nome, ativo, pin_hash, tentativas_falhas, bloqueado_ate
    into v_operador
    from public.operadores
    where id = p_operador_id
    for update;

  if not found or not v_operador.ativo then
    raise exception 'Operador não encontrado ou inativo';
  end if;

  if v_operador.bloqueado_ate is not null and v_operador.bloqueado_ate > now() then
    raise exception 'Muitas tentativas — tente novamente mais tarde';
  end if;

  if extensions.crypt(p_pin, v_operador.pin_hash) <> v_operador.pin_hash then
    update public.operadores
      set tentativas_falhas = tentativas_falhas + 1,
          bloqueado_ate = case
            when tentativas_falhas + 1 >= 5 then now() + interval '15 minutes'
            else bloqueado_ate
          end
      where id = p_operador_id;
    raise exception 'PIN incorreto';
  end if;

  update public.operadores
    set tentativas_falhas = 0, bloqueado_ate = null
    where id = p_operador_id;

  insert into public.operador_sessoes (operador_id, expira_em)
    values (p_operador_id, now() + interval '180 days')
    returning token into v_token;

  return jsonb_build_object(
    'token', v_token,
    'operador', jsonb_build_object('id', v_operador.id, 'nome', v_operador.nome)
  );
end;
$$;

revoke all on function public.login_operador(uuid, text) from public;
grant execute on function public.login_operador(uuid, text) to anon;

create or replace function public.logout_operador(p_token uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.operador_sessoes set revogado = true where token = p_token;
end;
$$;

revoke all on function public.logout_operador(uuid) from public;
grant execute on function public.logout_operador(uuid) to anon;
