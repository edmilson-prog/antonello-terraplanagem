-- Normaliza o campo `nome` para uppercase em todos os cadastros com nome
-- digitado por usuário — mesma convenção já aplicada no formulário de
-- Equipamentos (ver 20260709141546_equipamentos_nome_uppercase.sql) e agora
-- estendida a Clientes e Operadores (pedido do usuário).
-- equipamentos já estava 100% uppercase; incluído por segurança/idempotência.
update public.clientes set nome = upper(nome) where nome <> upper(nome);
update public.operadores set nome = upper(nome) where nome <> upper(nome);
update public.equipamentos set nome = upper(nome) where nome <> upper(nome);
