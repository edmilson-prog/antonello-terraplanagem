alter table public.ordens_servico
  add column tipo_servico text check (tipo_servico in (
    'terraplenagem', 'drenagem', 'nivelamento',
    'fundacao_estacas', 'cascalhamento', 'limpeza_terreno'
  )),
  add column equipamento_previsto_id uuid references public.equipamentos (id),
  add column inicio_previsto date;
