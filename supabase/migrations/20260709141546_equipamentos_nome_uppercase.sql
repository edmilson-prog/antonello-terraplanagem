-- Normaliza `nome` de equipamentos para uppercase em toda escrita futura,
-- e corrige os registros já existentes.

create or replace function public.normalizar_nome_equipamento()
returns trigger
language plpgsql
as $$
begin
  new.nome := upper(new.nome);
  return new;
end;
$$;

create trigger trg_equipamentos_nome_uppercase
  before insert or update on public.equipamentos
  for each row execute function public.normalizar_nome_equipamento();

update public.equipamentos set nome = upper(nome);
