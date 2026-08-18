-- Canal escolhido por mensagem (Onda 19).
--
-- A matriz de preferências decide os canais POR EVENTO, que é o certo para o
-- que nasce de trigger. Mas a tela "Nova notificação" do kit tem um seletor de
-- canal na própria mensagem — e faz sentido: "frente parada por chuva" precisa
-- de push agora, enquanto o mesmo `aviso_manual` amanhã pode ser só in-app.
--
-- `canais` nulo (o caso de todo evento automático) significa "use a
-- preferência do evento". Preenchido, manda nela.

alter table public.notificacoes
  add column if not exists canais text[];

alter table public.notificacoes
  add constraint notificacoes_canais_check
  check (canais is null or canais <@ array['app', 'push', 'email', 'whatsapp']::text[]);

create or replace function public.processar_entrega_notificacao(p_notificacao_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n public.notificacoes;
  v_pref public.notificacoes_preferencias_eventos;
  v_prefs public.notificacoes_preferencias;
  v_critica boolean;
  v_silencio boolean;
  v_motivo text;
  v_email text;
  v_usa_app boolean;
  v_usa_push boolean;
  v_usa_email boolean;
begin
  select * into v_n from public.notificacoes where id = p_notificacao_id;
  if not found then
    return;
  end if;

  if v_n.agendada_para is not null and v_n.agendada_para > now() then
    return;
  end if;

  select * into v_pref from public.notificacoes_preferencias_eventos where tipo = v_n.tipo;
  select * into v_prefs from public.notificacoes_preferencias limit 1;
  v_critica := public.notificacao_e_critica(v_n.tipo, v_n.prioridade);
  v_silencio := public.notificacoes_em_silencio();

  -- Canal da mensagem manda; sem ele, vale a preferência do evento.
  v_usa_app := case when v_n.canais is null
                    then coalesce(v_pref.canal_app, true)
                    else 'app' = any (v_n.canais) end;
  v_usa_push := case when v_n.canais is null
                     then coalesce(v_pref.canal_push, false)
                     else 'push' = any (v_n.canais) end;
  v_usa_email := case when v_n.canais is null
                      then coalesce(v_pref.canal_email, false)
                      else 'email' = any (v_n.canais) end;

  update public.notificacoes set enviada_em = coalesce(enviada_em, now()) where id = v_n.id;

  if v_usa_app then
    insert into public.notificacoes_entregas (notificacao_id, canal, status, entregue_em)
    values (v_n.id, 'app', 'entregue', now())
    on conflict do nothing;
  end if;

  if v_n.operador_id is not null and v_usa_push then
    v_motivo := null;

    if v_silencio and not v_critica then
      v_motivo := 'horário silencioso';
    elsif not v_critica
      and v_prefs is not null
      and public.notificacoes_push_na_hora(v_n.operador_id) >= v_prefs.max_push_por_hora
    then
      v_motivo := 'limite de push por hora';
    end if;

    if v_motivo is not null then
      insert into public.notificacoes_entregas (notificacao_id, canal, status, motivo)
      values (v_n.id, 'push', 'suprimido', v_motivo)
      on conflict do nothing;
    else
      insert into public.notificacoes_entregas (notificacao_id, canal, status, destino)
      select v_n.id, 'push', 'pendente', s.endpoint
        from public.push_subscriptions s
       where s.operador_id = v_n.operador_id
      on conflict do nothing;

      perform public.notificacoes_acordar_funcao(
        'notificacoes_push_url', 'notificacoes_push_auth',
        jsonb_build_object('notificacao_id', v_n.id)
      );
    end if;
  end if;

  if v_n.usuario_id is not null and v_usa_email then
    select u.email into v_email from auth.users u where u.id = v_n.usuario_id;

    if v_email is null then
      insert into public.notificacoes_entregas (notificacao_id, canal, status, motivo)
      values (v_n.id, 'email', 'suprimido', 'usuário sem e-mail cadastrado')
      on conflict do nothing;
    else
      insert into public.notificacoes_entregas (notificacao_id, canal, status, destino)
      values (v_n.id, 'email', 'pendente', v_email)
      on conflict do nothing;

      perform public.notificacoes_acordar_funcao(
        'notificacoes_email_url', 'notificacoes_email_auth',
        jsonb_build_object('notificacao_id', v_n.id)
      );
    end if;
  end if;
end;
$$;

revoke execute on function public.processar_entrega_notificacao(uuid)
  from public, anon, authenticated;

-- Abertura do push: o service worker chama isto quando o operador toca na
-- notificação. É o que alimenta "Abertos" e "Tempo médio até abrir" na central.
create or replace function public.marcar_push_aberto(p_token uuid, p_notificacao_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_operador_id uuid;
begin
  v_operador_id := public.operador_do_token(p_token);
  if v_operador_id is null then
    raise exception 'Sessão inválida ou expirada' using errcode = '28000';
  end if;

  update public.notificacoes_entregas e
     set aberta_em = coalesce(e.aberta_em, now())
    from public.notificacoes n
   where e.notificacao_id = n.id
     and n.id = p_notificacao_id
     and n.operador_id = v_operador_id
     and e.canal = 'push'
     and e.status = 'entregue';
end;
$$;

revoke execute on function public.marcar_push_aberto(uuid, uuid) from public, anon, authenticated;
grant execute on function public.marcar_push_aberto(uuid, uuid) to anon;
