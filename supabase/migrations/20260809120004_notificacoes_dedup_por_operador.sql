-- Corrige a chave de deduplicação das notificações (PRD-020).
--
-- A versão original era (tipo, origem_id), o que assume um destinatário por
-- registro de origem. Falso para 'manutencao_agendada': um registro de
-- manutenção avisa TODOS os operadores habilitados naquele equipamento, e o
-- índice deixava passar só o primeiro.
--
-- A regra certa é "um aviso deste tipo por registro de origem POR OPERADOR".

drop index if exists public.idx_notificacoes_origem_unica;

create unique index idx_notificacoes_origem_unica
  on public.notificacoes (operador_id, tipo, origem_id)
  where origem_id is not null
    and tipo in (
      'apontamento_aprovado',
      'lembrete_apontamento',
      'abastecimento_registrado',
      'manutencao_agendada'
    );
