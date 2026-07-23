alter table public.equipamentos
  add column marca text,
  add column ano text,
  add column propriedade text check (propriedade in ('propria', 'locada'));
