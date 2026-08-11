-- Produção de eventos e entrega do push (PRD-020).

-- pg_net dá ao Postgres um POST assíncrono, usado para acordar a Edge Function
-- que assina e envia o Web Push. As funções da extensão ficam no schema `net`,
-- que não é exposto pelo PostgREST — nenhum papel do app alcança http_post.
create extension if not exists pg_net with schema extensions;

-- Evento 1 — nova OS atribuída. Único dos seis que já tem tabela real para um
-- trigger escutar: ordens_servico.responsavel_id aponta para operadores.
create or replace function public.tg_notificar_os_atribuida()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cliente text;
begin
  if new.responsavel_id is null then
    return new;
  end if;

  -- Só avisa quando o responsável realmente mudou; um update que reescreve o
  -- mesmo valor (ou mexe noutra coluna) não deve notificar de novo.
  if tg_op = 'UPDATE' and new.responsavel_id is not distinct from old.responsavel_id then
    return new;
  end if;

  select nome into v_cliente from public.clientes where id = new.cliente_id;

  perform public.criar_notificacao_interna(
    new.responsavel_id,
    'os_atribuida',
    'Nova OS atribuída a você',
    new.numero || ' · ' || new.obra_nome || coalesce(' — ' || v_cliente, ''),
    new.id,
    null
  );

  return new;
end;
$$;

create trigger trg_ordens_servico_notificar_atribuicao
  after insert or update of responsavel_id on public.ordens_servico
  for each row execute function public.tg_notificar_os_atribuida();

-- Entrega — uma única saída para o push. Toda notificação inserida, venha de
-- trigger, da retaguarda ou do app, passa por aqui.
--
-- Degrada com elegância: sem os segredos no Vault (ou com a Edge Function
-- fora do ar), a notificação in-app continua valendo e só o push deixa de
-- sair. O apontamento nunca deve falhar porque o push falhou.
create or replace function public.tg_enviar_push_notificacao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url text;
  v_auth text;
begin
  select decrypted_secret into v_url
    from vault.decrypted_secrets where name = 'notificacoes_push_url';
  select decrypted_secret into v_auth
    from vault.decrypted_secrets where name = 'notificacoes_push_auth';

  if v_url is null or v_auth is null then
    return new;
  end if;

  begin
    perform net.http_post(
      url := v_url,
      body := jsonb_build_object('notificacao_id', new.id),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_auth
      ),
      timeout_milliseconds := 5000
    );
  exception when others then
    raise warning 'Falha ao enfileirar push da notificação %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

create trigger trg_notificacoes_enviar_push
  after insert on public.notificacoes
  for each row execute function public.tg_enviar_push_notificacao();
