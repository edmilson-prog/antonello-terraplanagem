-- Localização da obra.
--
-- O mapa "Operacional em tempo real" plotava pins a partir de um arquivo de
-- coordenadas fictícias (`mock-posicoes-equipamentos.ts`), chaveado pelos ids
-- mock "eq-001". Desde que os equipamentos foram para o Supabase, a junção era
-- UUID contra "eq-001": o mapa nunca desenhou um pin sequer, e ficava centrado
-- num ponto do Paraná — a 400 km da base da empresa, em Santo Ângelo/RS.
--
-- A posição real de uma máquina é a obra em que ela está trabalhando agora.
-- Isso o sistema sabe: apontamento em andamento -> OS -> obra. Só faltava a
-- obra ter coordenada.
--
-- Continua sem rastreamento de GPS do aparelho do operador (RF-003 do PRD-019):
-- a coordenada é do CANTEIRO, informada uma vez no cadastro da OS, não da
-- pessoa. Nada é coletado do celular em campo.

alter table public.ordens_servico
  add column if not exists local_lat numeric(9, 6),
  add column if not exists local_lng numeric(9, 6);

comment on column public.ordens_servico.local_lat is
  'Latitude do canteiro. Do local da obra, nunca do aparelho do operador (LGPD).';
comment on column public.ordens_servico.local_lng is
  'Longitude do canteiro.';

-- Meia coordenada não localiza nada, e plotaria a obra no meridiano de
-- Greenwich ou na linha do Equador.
alter table public.ordens_servico
  drop constraint if exists chk_ordens_servico_local_completo;

alter table public.ordens_servico
  add constraint chk_ordens_servico_local_completo check (
    (local_lat is null and local_lng is null)
    or (local_lat is not null and local_lng is not null)
  );

alter table public.ordens_servico
  drop constraint if exists chk_ordens_servico_local_no_mundo;

alter table public.ordens_servico
  add constraint chk_ordens_servico_local_no_mundo check (
    (local_lat is null or (local_lat between -90 and 90))
    and (local_lng is null or (local_lng between -180 and 180))
  );
