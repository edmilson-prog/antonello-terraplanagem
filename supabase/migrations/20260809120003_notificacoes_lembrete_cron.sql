-- Lembrete de apontamento e faxina das inscrições mortas (PRD-020).
--
-- Único dos seis eventos que ninguém consegue disparar em reação a uma ação:
-- ele nasce da AUSÊNCIA de uma ação (o operador abriu o horímetro de manhã e
-- não fechou). Por isso é o único que precisa de agendador.
--
-- Nasce dormente: apontamentos ainda é lido de src/mocks/ pelo app, então a
-- tabela está vazia e a função devolve 0. Quando a onda mock→real do
-- apontamento chegar, ela acende sozinha, sem alterar nada aqui.

create extension if not exists pg_cron;

create or replace function public.gerar_lembretes_apontamento()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_registro record;
  v_id uuid;
  v_criadas integer := 0;
begin
  for v_registro in
    select a.id, a.operador_id, a.os_id, a.iniciado_em, o.numero
      from public.apontamentos a
      left join public.ordens_servico o on o.id = a.os_id
     where a.status = 'em_andamento'
       -- Só o que começou HOJE no fuso da obra: um apontamento esquecido há
       -- três dias é problema de outro alerta, não deste lembrete diário.
       and (a.iniciado_em at time zone 'America/Sao_Paulo')::date
           = (now() at time zone 'America/Sao_Paulo')::date
  loop
    -- idx_notificacoes_origem_unica garante um lembrete por apontamento,
    -- mesmo se o job rodar duas vezes; criar_notificacao_interna devolve
    -- null quando a duplicata foi barrada.
    v_id := public.criar_notificacao_interna(
      v_registro.operador_id,
      'lembrete_apontamento',
      'Lembrete de apontamento',
      'Você iniciou '
        || coalesce('a ' || v_registro.numero, 'um apontamento')
        || ' às '
        || to_char(v_registro.iniciado_em at time zone 'America/Sao_Paulo', 'HH24:MI')
        || ' e ainda não fechou o horímetro.',
      v_registro.os_id,
      v_registro.id
    );

    if v_id is not null then
      v_criadas := v_criadas + 1;
    end if;
  end loop;

  return v_criadas;
end;
$$;

revoke all on function public.gerar_lembretes_apontamento() from public;

-- Aparelho trocado, app desinstalado, permissão revogada no sistema: a
-- inscrição vira lixo. O app reescreve a sua a cada abertura (upsert por
-- endpoint), então o que não é reescrito há 180 dias — mesma janela da sessão
-- do operador — está morto.
create or replace function public.limpar_push_subscriptions_expiradas()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_removidas integer;
begin
  delete from public.push_subscriptions
   where updated_at < now() - interval '180 days';

  get diagnostics v_removidas = row_count;
  return v_removidas;
end;
$$;

revoke all on function public.limpar_push_subscriptions_expiradas() from public;

-- 20:00 UTC = 17:00 no horário de Brasília, a hora do mock ("não apontou até
-- as 17h"). A faxina roda de madrugada, domingo.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'notificacoes-lembrete-apontamento') then
    perform cron.unschedule('notificacoes-lembrete-apontamento');
  end if;
  perform cron.schedule(
    'notificacoes-lembrete-apontamento',
    '0 20 * * *',
    $cron$select public.gerar_lembretes_apontamento()$cron$
  );

  if exists (select 1 from cron.job where jobname = 'notificacoes-limpar-push') then
    perform cron.unschedule('notificacoes-limpar-push');
  end if;
  perform cron.schedule(
    'notificacoes-limpar-push',
    '30 6 * * 0',
    $cron$select public.limpar_push_subscriptions_expiradas()$cron$
  );
end;
$$;
