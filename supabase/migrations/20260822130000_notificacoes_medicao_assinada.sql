-- Medição assinada pelo cliente entra na matriz de notificações.
--
-- A matriz de preferências (Onda 19, v0.33.0) desenhou "Medição assinada pelo
-- cliente" na categoria Operação a partir do UI kit, mas `registros_campo` só
-- nasceu na Onda 22, no mesmo dia — depois da matriz já fechada. O evento é
-- real desde então (`registros_campo.tipo = 'medicao_assinada'`, com
-- assinatura do cliente e horas do período), só nunca virou notificação.
--
-- Gatilho imediato, no mesmo padrão de `tg_notificar_comprovante_recebido` e
-- `tg_notificar_orcamento_status`: fan-out para o escritório via
-- `criar_notificacao_retaguarda`, dedup por (usuario_id, tipo, origem_id) já
-- garantido pelo índice único da Onda 19.

alter table public.notificacoes drop constraint if exists notificacoes_tipo_check;
alter table public.notificacoes
  add constraint notificacoes_tipo_check
  check (tipo in (
    -- Operação
    'os_atribuida',
    'apontamento_aprovado',
    'apontamento_aguardando',
    'lembrete_apontamento',
    'os_sem_apontamento',
    'os_concluida',
    'correcao_solicitada',
    'medicao_assinada',
    -- Frota
    'manutencao_agendada',
    'manutencao_vencida',
    'consumo_anomalo',
    'abastecimento_registrado',
    -- Financeiro
    'titulo_vencido',
    'titulo_a_vencer',
    'comprovante_recebido',
    -- Comercial
    'orcamento_aprovado',
    'orcamento_perdido',
    'orcamento_a_vencer',
    -- Sistema
    'aviso_manual'
  ));

-- Canais padrão, espelhando a linha do kit (app + e-mail; sem push, sem
-- crítico — a assinatura não exige ação imediata do escritório).
insert into public.notificacoes_preferencias_eventos (tipo, canal_app, canal_push, canal_email, critico)
values ('medicao_assinada', true, false, true, false)
on conflict (tipo) do nothing;

create or replace function public.tg_notificar_medicao_assinada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_responsavel text;
  v_horas numeric;
begin
  if new.tipo <> 'medicao_assinada' then
    return new;
  end if;

  v_responsavel := new.dados ->> 'responsavel';
  v_horas := (new.dados ->> 'horas_periodo')::numeric;

  perform public.criar_notificacao_retaguarda(
    'medicao_assinada', 'operacao',
    'Medição assinada pelo cliente',
    coalesce(v_responsavel, 'Cliente')
      || case when v_horas is not null
              then ' · ' || to_char(v_horas, 'FM999G990D0') || ' h no período'
              else '' end,
    'normal', new.os_id, new.id
  );

  return new;
end;
$$;

drop trigger if exists trg_registros_campo_notificar_medicao on public.registros_campo;
create trigger trg_registros_campo_notificar_medicao
  after insert on public.registros_campo
  for each row execute function public.tg_notificar_medicao_assinada();
