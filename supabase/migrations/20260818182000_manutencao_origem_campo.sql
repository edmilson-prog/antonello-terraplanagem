-- Liga a solicitação feita em campo à ordem de manutenção que ela gerou.
--
-- A Onda 18 criou a manutenção corretiva na retaguarda e a Onda 22 fez a
-- solicitação do operador chegar ao escritório — mas as duas pontas não se
-- conheciam. Sem este vínculo, a tela de Manutenção não teria como distinguir
-- "o operador pediu e ninguém abriu ordem" de "já está resolvido", que é
-- justamente a informação que faz a lista valer alguma coisa.
--
-- Nullable porque a maioria das manutenções continua nascendo no escritório:
-- só as que vieram de um chamado do campo carregam a origem.

alter table public.registros_manutencao
  add column if not exists origem_registro_campo_id uuid
    references public.registros_campo (id) on delete set null;

-- Uma solicitação gera no máximo uma ordem. Sem isto, dois cliques em "Abrir
-- corretiva" produziriam duas ordens para o mesmo chamado, e a lista de
-- pendentes esvaziaria do mesmo jeito — escondendo o erro.
create unique index if not exists idx_registros_manutencao_origem_campo
  on public.registros_manutencao (origem_registro_campo_id)
  where origem_registro_campo_id is not null;

comment on column public.registros_manutencao.origem_registro_campo_id is
  'Solicitacao de manutencao feita em campo (registros_campo) que originou esta ordem. Nulo quando a ordem nasceu na retaguarda.';
