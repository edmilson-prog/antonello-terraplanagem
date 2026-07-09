# PRD-018 — Schema + Migrations + Mock→Seed

| Campo | Valor |
|-------|-------|
| **Status** | ✅ Implementado |
| **Versão** | 0.20.0 "Ignition" |
| **Spec de design** | `docs/superpowers/specs/2026-07-08-prd-017-018-auth-backend-design.md` |
| **Plano de implementação** | `docs/superpowers/plans/2026-07-08-prd-017-018-auth-backend.md` |

## O que foi implementado

Schema completo do Supabase (`nbqgujojgdcpkorychoc`), mapeado quase 1:1 de
`src/shared/types/index.ts` — 23 tabelas em 9 migrations (`supabase/migrations/20260708100001`
a `20260708100009`), todas com RLS habilitada e policy de retaguarda (`is_retaguarda()`).

A 9ª migration (`20260708100009_security_hardening.sql`, adicionada durante a revisão de
segurança da Task 15) é hardening defesa-em-profundidade: revoga o grant padrão de `SELECT`
que o Supabase concede a `anon` em toda tabela nova de `public`, nas 22 tabelas que não são
`operadores` — a RLS já bloqueava toda leitura, mas o grant de schema-default deixava a
postura inconsistente com o princípio "RLS + REVOKE" do projeto. A migration também adiciona
um `alter default privileges` para que tabelas futuras em `public` não reaquiram esse grant
silenciosamente.

`scripts/mocks-to-seed.ts` gera `supabase/seed.sql` a partir dos arrays existentes em
`src/mocks/*.ts` — fonte única de verdade, sem dado redigitado à mão. IDs de mock (`"op-001"`)
mapeiam deterministicamente para UUIDs via `uuid.v5` com um namespace fixo do projeto.

`scripts/seed-usuarios-retaguarda.ts` cria as 2 contas demo de retaguarda via Admin API
(`recepcao@antonello.com.br`, `proprietario@antonello.com.br`) — `auth.users` não é populado
por INSERT direto.

Ver o spec de design (link acima) para o mapeamento completo de tabelas e as diferenças em
relação a espelhar os `types` ao pé da letra (itens de orçamento/faturamento viram tabelas
filhas; colunas novas em `operadores` para o PIN).
