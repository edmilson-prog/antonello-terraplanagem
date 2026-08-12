-- Fecha de fato o acesso às funções internas.
--
-- As migrations anteriores (incluindo a das RPCs do operador, logo antes desta)
-- protegiam as funções internas com `revoke all on function ... from public`.
-- Isso não basta no Supabase: o projeto vem com
--
--   alter default privileges in schema public grant all on functions to anon, authenticated
--
-- então toda função criada em `public` já nasce com EXECUTE concedido
-- explicitamente a `anon` e `authenticated`. Revogar de PUBLIC não mexe nesses
-- grants — o efeito era zero, e todas as funções `security definer` do projeto
-- estavam chamáveis por qualquer visitante com a anon key.
--
-- Consequências reais que isso deixava abertas:
--   - `criar_operador` — criar operador (com CPF) sem autenticação nenhuma;
--   - `criar_notificacao_interna` — mandar notificação para qualquer operador,
--     pulando a checagem de permissão que `criar_notificacao` faz;
--   - `ordens_do_operador_ids` — enumerar as OS de um operador informando só o
--     id dele, que a tela de login já expõe;
--   - as rotinas de manutenção agendadas, executáveis à vontade.
--
-- Funções SECURITY DEFINER rodam como o dono, então uma função interna
-- continua chamável de dentro das RPCs públicas mesmo sem grant para anon —
-- nada do fluxo do app depende destes grants. Nenhuma policy referencia estas
-- funções, e o frontend só chama `criar_operador` (da retaguarda, autenticada).

-- Resolve o operador de um token: só faz sentido chamada de dentro das RPCs.
revoke execute on function public.operador_do_token(uuid) from anon, authenticated;

-- Regra de "minhas OS": recebe o operador_id pronto, sem validar token.
revoke execute on function public.ordens_do_operador_ids(uuid) from anon, authenticated;

-- Cria notificação sem checar permissão — existe só para triggers e para outras
-- funções SECURITY DEFINER que já validaram quem está pedindo.
revoke execute on function public.criar_notificacao_interna(uuid, text, text, text, uuid, uuid)
  from anon, authenticated;

-- Cadastro de operador é da retaguarda, nunca do app de campo.
revoke execute on function public.criar_operador(text, text, text, boolean, text, date, text, date, text, uuid[])
  from anon;
grant execute on function public.criar_operador(text, text, text, boolean, text, date, text, date, text, uuid[])
  to authenticated;

-- Notificar operador é ação da retaguarda. Esta já se defendia sozinha com
-- is_retaguarda() por dentro; o revoke só alinha o grant à intenção, para que a
-- lista do que `anon` alcança seja exatamente a API do app de campo.
revoke execute on function public.criar_notificacao(uuid, text, text, text, uuid, uuid) from anon;

-- Rotinas agendadas: quem chama é o pg_cron, como postgres.
revoke execute on function public.gerar_lembretes_apontamento() from anon, authenticated;
revoke execute on function public.limpar_push_subscriptions_expiradas() from anon, authenticated;

-- Funções de trigger: o disparo não passa por checagem de EXECUTE. Estas duas
-- nunca tiveram o revoke de PUBLIC, então mantinham o EXECUTE que o Postgres dá
-- a todo mundo por padrão — daí precisarem também do `from public`. Chamá-las
-- fora de um trigger dá erro, mas não há motivo para deixá-las expostas.
revoke execute on function public.tg_enviar_push_notificacao() from public, anon, authenticated;
revoke execute on function public.tg_notificar_os_atribuida() from public, anon, authenticated;
