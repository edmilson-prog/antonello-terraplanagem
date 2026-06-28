# Changelog

Todas as mudanças notáveis deste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adota [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.1.0] - 2026-06-28 - Registry

### Added
- Cadastro de Equipamentos com busca, filtros por tipo e status operacional,
  criação/edição e inativação (soft-delete) — PRD-001.
- Cadastro de Operadores com busca e inativação.
- Cadastro de Clientes com validação de CPF/CNPJ e busca por nome/documento.
- Kit de CRUD compartilhado: store em memória genérico, lista responsiva
  (tabela ↔ cards), diálogos de formulário e confirmação, e envelope de
  estados (loading/empty/error/success).
- Testes unitários (vitest) para a lógica pura: store, validadores e formatadores.
- Ícones de aplicação via Iconify e toasts via sonner.

### Changed
- Contrato de `types` estendido (Equipamento/Operador/Cliente) com status de
  ciclo de vida (`ativo`) separado do status operacional, documento, telefone
  e timestamps de auditoria. Mocks atualizados com edge cases.

### Fixed
- Links de "voltar" do app do operador passam os parâmetros de busca exigidos
  pela rota (type-check).
