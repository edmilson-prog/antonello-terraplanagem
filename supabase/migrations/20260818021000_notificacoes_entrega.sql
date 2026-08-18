-- Pipeline de entrega das notificações (Onda 19).
--
-- Antes desta migration o caminho era: insert em `notificacoes` → trigger →
-- POST para a Edge Function de push. Sem preferência, sem horário silencioso,
-- sem limite, e sem ninguém anotar o que aconteceu depois.
--
-- Agora toda notificação passa por `processar_entrega_notificacao`, que decide
-- canal a canal e grava uma linha em `notificacoes_entregas` para CADA decisão
-- — inclusive para o que decidiu NÃO enviar (`suprimido`). Essa distinção entre
-- suprimido e falhou é o que impede o KPI de falhas de mentir: silêncio noturno
-- não é erro de entrega.
--
-- Fuso: a empresa opera em horário de Brasília e o banco roda em UTC. Toda
-- comparação de horário silencioso converte para America/Sao_Paulo, senão o
-- silêncio de 22:00 cairia às 19:00 na prática.

-- Um evento é crítico por natureza (matriz de preferências) ou por decisão de
-- quem escreveu o aviso (prioridade da linha). Crítico ignora silêncio e limite.
create or replace function public.notificacao_e_critica(p_tipo text, p_prioridade text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_prioridade = 'critico'
      or coalesce(
           (select critico from public.notificacoes_preferencias_eventos where tipo = p_tipo),
           false
         );
$$;

revoke execute on function public.notificacao_e_critica(text, text) from public, anon, authenticated;

-- Estamos dentro da janela de silêncio? Trata a virada de meia-noite
-- (22:00→06:00) e o fim de semana só-críticos.
create or replace function public.notificacoes_em_silencio()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_prefs public.notificacoes_preferencias;
  v_agora timestamp;
  v_hora time;
  v_dia integer;
begin
  select * into v_prefs from public.notificacoes_preferencias limit 1;
  if not found then
    return false;
  end if;

  v_agora := now() at time zone 'America/Sao_Paulo';
  v_hora := v_agora::time;
  v_dia := extract(isodow from v_agora); -- 6 = sábado, 7 = domingo

  if v_prefs.fim_de_semana_so_criticos and v_dia >= 6 then
    return true;
  end if;

  if v_prefs.silencio_inicio <= v_prefs.silencio_fim then
    return v_hora >= v_prefs.silencio_inicio and v_hora < v_prefs.silencio_fim;
  end if;

  -- Janela que atravessa a meia-noite.
  return v_hora >= v_prefs.silencio_inicio or v_hora < v_prefs.silencio_fim;
end;
$$;

revoke execute on function public.notificacoes_em_silencio() from public, anon, authenticated;

-- Quantos push já saíram para este operador na última hora. Suprimidos não
-- contam: o teto é de mensagens que chegaram ao aparelho, não de tentativas.
create or replace function public.notificacoes_push_na_hora(p_operador_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
    from public.notificacoes_entregas e
    join public.notificacoes n on n.id = e.notificacao_id
   where n.operador_id = p_operador_id
     and e.canal = 'push'
     and e.status in ('pendente', 'entregue')
     and e.created_at > now() - interval '1 hour';
$$;

revoke execute on function public.notificacoes_push_na_hora(uuid) from public, anon, authenticated;

-- Dispara um POST assíncrono para uma Edge Function, lendo URL e token do
-- Vault. Sem segredo configurado, não faz nada — e a notificação in-app
-- continua valendo. Nenhum fluxo do app pode falhar porque a entrega falhou.
create or replace function public.notificacoes_acordar_funcao(p_secret_url text, p_secret_auth text, p_body jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url text;
  v_auth text;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = p_secret_url;
  select decrypted_secret into v_auth from vault.decrypted_secrets where name = p_secret_auth;

  if v_url is null or v_auth is null then
    return;
  end if;

  begin
    perform net.http_post(
      url := v_url,
      body := p_body,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_auth
      ),
      timeout_milliseconds := 5000
    );
  exception when others then
    raise warning 'Falha ao acordar %: %', p_secret_url, sqlerrm;
  end;
end;
$$;

revoke execute on function public.notificacoes_acordar_funcao(text, text, jsonb)
  from public, anon, authenticated;

-- O coração: decide os canais de uma notificação e registra cada decisão.
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
begin
  select * into v_n from public.notificacoes where id = p_notificacao_id;
  if not found then
    return;
  end if;

  -- Agendada para o futuro: quem entrega é liberar_notificacoes_agendadas().
  if v_n.agendada_para is not null and v_n.agendada_para > now() then
    return;
  end if;

  select * into v_pref from public.notificacoes_preferencias_eventos where tipo = v_n.tipo;
  select * into v_prefs from public.notificacoes_preferencias limit 1;
  v_critica := public.notificacao_e_critica(v_n.tipo, v_n.prioridade);
  v_silencio := public.notificacoes_em_silencio();

  update public.notificacoes set enviada_em = coalesce(enviada_em, now()) where id = v_n.id;

  -- ---- in-app: sempre entregue, é só a linha existir na caixa ----
  if coalesce(v_pref.canal_app, true) then
    insert into public.notificacoes_entregas (notificacao_id, canal, status, entregue_em)
    values (v_n.id, 'app', 'entregue', now())
    on conflict do nothing;
  end if;

  -- ---- push: só para operador, e só se sobreviver às três checagens ----
  if v_n.operador_id is not null and coalesce(v_pref.canal_push, false) then
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
      -- Uma linha por aparelho: é assim que "5 falhas · 1 token expirado"
      -- consegue apontar QUAL aparelho falhou.
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

  -- ---- e-mail: só para a retaguarda, que é quem tem endereço ----
  if v_n.usuario_id is not null and coalesce(v_pref.canal_email, false) then
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

-- O trigger de push da 20260809120002 é substituído por este, que chama o
-- pipeline inteiro em vez de ir direto ao POST.
create or replace function public.tg_enviar_push_notificacao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.processar_entrega_notificacao(new.id);
  return new;
end;
$$;

-- Libera o que foi agendado e já venceu. Roda de 5 em 5 minutos: o kit agenda
-- por data e hora, então precisão de minutos basta.
create or replace function public.liberar_notificacoes_agendadas()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_total integer := 0;
begin
  for v_id in
    select id from public.notificacoes
     where agendada_para is not null
       and agendada_para <= now()
       and enviada_em is null
     order by agendada_para
     limit 200
  loop
    perform public.processar_entrega_notificacao(v_id);
    v_total := v_total + 1;
  end loop;
  return v_total;
end;
$$;

revoke execute on function public.liberar_notificacoes_agendadas() from public, anon, authenticated;

-- Limpeza pela retenção configurada. Substitui a ideia de guardar tudo para
-- sempre; `notificacoes_entregas` cai junto por ON DELETE CASCADE.
create or replace function public.limpar_notificacoes_antigas()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dias integer;
  v_total integer;
begin
  select retencao_dias into v_dias from public.notificacoes_preferencias limit 1;
  if v_dias is null then
    return 0;
  end if;

  delete from public.notificacoes
   where created_at < now() - make_interval(days => v_dias);
  get diagnostics v_total = row_count;
  return v_total;
end;
$$;

revoke execute on function public.limpar_notificacoes_antigas() from public, anon, authenticated;

select cron.schedule(
  'notificacoes-liberar-agendadas',
  '*/5 * * * *',
  $cron$select public.liberar_notificacoes_agendadas()$cron$
);

select cron.schedule(
  'notificacoes-limpar-antigas',
  '15 4 * * *',
  $cron$select public.limpar_notificacoes_antigas()$cron$
);
