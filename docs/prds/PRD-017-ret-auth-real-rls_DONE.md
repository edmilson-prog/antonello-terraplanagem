# PRD-017 — Auth Real + Perfis + RLS

| Campo | Valor |
|-------|-------|
| **Status** | ✅ Implementado |
| **Versão** | 0.20.0 "Ignition" |
| **Spec de design** | `docs/superpowers/specs/2026-07-08-prd-017-018-auth-backend-design.md` |
| **Plano de implementação** | `docs/superpowers/plans/2026-07-08-prd-017-018-auth-backend.md` |

## O que foi implementado

Autenticação dupla, real, para os dois ambientes da plataforma:

- **Retaguarda** (`/login`, recepção/proprietário): Supabase Auth padrão (e-mail+senha), perfil
  gerido em `usuarios_retaguarda`, RLS habilitada em toda tabela via `is_retaguarda()`.
- **Operador** (`/app/entrar`, PIN de 4 dígitos = 4 primeiros dígitos do CPF): **sem** Supabase
  Auth — token opaco emitido por `login_operador()` (função Postgres `SECURITY DEFINER`),
  validado por `logout_operador()`/pela própria tabela `operador_sessoes`. Decisão registrada
  porque o projeto usa JWT Signing Keys assimétricas (não o segredo HS256 legado), o que
  inviabiliza assinar um JWT customizado que o PostgREST aceitaria nativamente.

Escopo desta PRD: só login/logout do operador são reais. O acesso operacional (apontamentos, OS,
abastecimento) via função `SECURITY DEFINER` fica para as PRDs futuras de "conexão mock→real, por
onda" — as telas do app continuam lendo `src/mocks/*` para os dados de negócio.

Ver o spec de design (link acima) para o detalhamento completo de arquitetura, riscos aceitos
(operador sem Realtime nativo) e pontos em aberto (`clientes.telefone`).
