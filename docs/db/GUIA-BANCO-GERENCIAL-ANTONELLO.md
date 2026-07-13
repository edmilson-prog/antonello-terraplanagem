# Guia de Consultas — Banco Legado da Antonello (`Gerencial.fdb`, ERP FarolTI)

> **Objetivo:** permitir que qualquer agente, **sem contexto prévio**, conecte ao banco
> `Gerencial.fdb` e faça consultas corretas sem precisar reinvestigar o schema.
> Leia as seções **2 (Ambiente)**, **4 (Regras de ouro)** antes de qualquer query.
>
> Este banco usa o **mesmo motor e o mesmo ERP genérico (FarolTI)** do banco documentado em
> `docs/db/GUIA-BANCO-TURBO-DIESEL.md` — reaproveite o passo a passo de conexão de lá. Este
> guia documenta apenas o que é **específico** deste banco (schema da Antonello Terraplanagem).

---

## 1. O que é este banco

- Banco de um **ERP genérico FarolTI** (o mesmo produto usado por lojas, clínicas, rádios, óticas
  etc.) que a Antonello Terraplanagem **adaptou na marra** para controlar horas de máquina, sem
  nenhum campo nativo do produto para "equipamento" ou "horímetro" — os módulos de Obra e
  Funcionário foram reaproveitados para isso (ver Seção 4, regra 2).
- Motor: **Firebird 4.0.0**, mesmo binário `Firebird_4_0_FarolTI`.
- Volume: **855 tabelas de usuário** (schema genérico gigantesco, mas só ~10 tabelas têm dados reais
  de uso). ~1.066 clientes, 326 OS, 1.398 itens de serviço (apontamentos), 22 "funcionários"
  (na prática, quase todos são máquinas duplicadas — ver regra 2), 43 "obras" (também máquinas).
- **Tratar como SOMENTE LEITURA por padrão.** Confirmar com o usuário antes de qualquer
  `INSERT/UPDATE/DELETE`.
- Uso pretendido nesta fase do projeto: **fonte de verdade para desenhar os `types` e os mocks**
  em `src/mocks/` (fase Frontend First — ver `CLAUDE.md` do projeto). Não é para virar conexão
  de app; quando o backend real for implementado (Supabase), o schema novo é modelado do zero,
  só inspirado nestes dados.

---

## 2. Ambiente e pré-requisitos

| Item | Caminho / valor |
|---|---|
| Banco | `D:\claude\antonello-terraplanagem\docs\db\Gerencial.fdb` |
| Backup / rar | `docs\db\Gerencial.rar` (não extraído; o `.fdb` já está pronto para uso) |
| Binários Firebird 4 (isql/gbak) | `C:\Program Files (x86)\Firebird\Firebird_4_0_FarolTI\` |
| Usuário / senha | `SYSDBA` / `masterkey` (ignorados em modo embedded) |
| **Charset obrigatório** | `WIN1252` (sem ele os acentos saem corrompidos — ex.: "ca╬amba") |

Mesmas armadilhas de porta/instalação do Firebird descritas no guia do Turbo Diesel (Seção 2 lá):
use sempre os binários de `Firebird_4_0_FarolTI`, nunca os de `Firebird_2_5`.

---

## 3. Como rodar uma consulta (passo a passo)

Idêntico ao guia do Turbo Diesel — método **embedded**, via `isql` lendo um script `.sql`:

```bash
FIREBIRD="/c/Program Files (x86)/Firebird/Firebird_4_0_FarolTI"
"$FIREBIRD/isql.exe" -user SYSDBA -password masterkey -ch WIN1252 \
  -i "CAMINHO\\DO\\SCRIPT.sql" "D:\\claude\\antonello-terraplanagem\\docs\\db\\Gerencial.fdb" 2>&1
```

Comece o script com `SET LIST ON;` para saída legível em formato chave/valor.

---

## 4. Regras de ouro (armadilhas que vão te pegar)

1. **Acentos:** sempre `-ch WIN1252`. Sem isso, "ç"/"ã" saem como `╬`/`�`.
2. **⚠️ O "equipamento" (máquina) NÃO tem tabela própria.** O ERP genérico não tem conceito de
   "máquina/equipamento com horímetro" — a Antonello reaproveitou **dois módulos diferentes** do
   ERP para representar a frota, de forma inconsistente:
   - **`OBRA`** (43 linhas) — pensada pelo ERP como "canteiro de obra", mas usada aqui como
     **cadastro de equipamento**: `OB_DESCRICAO` = nome da máquina + operador padrão entre
     parênteses (ex.: `"RETROESCAVADEIRA 416 F2 (ZICO)"`, `"MINI CARREGADEIRA S 650 (BOLA)"`).
   - **`FUNCIONARIO`** (22 linhas) — pensada pelo ERP como "funcionário/vendedor", mas as mesmas
     máquinas foram cadastradas de novo aqui (`FUNC_NOME` repete os nomes de `OBRA`).
   - **`SERVICO`** (125 linhas) — é de fato a fonte **mais usada na prática**: cada linha de
     `OSSERVICO` (o "apontamento" real) referencia `SERVICO` via `SE_CODIGO`, e é `SE_DESCRICAO`
     que carrega o nome do equipamento/serviço no dia a dia (ex.: `"RETROESCAVADEIRA"`,
     `"LC 180 CONCHA"`, `"LC 180(  ROMPEDOR)"`, `"CAÇAMBA EJC5G41"`, `"BROCA 60"`,
     `"MINICARREGADEIRA S650"`). **Nomes duplicados e grafias inconsistentes são a norma**
     (o mesmo equipamento aparece com várias descrições ao longo do tempo — ex. `"VIO 55"`,
     `"ESCAVADEIRA VIO55"`, `"vio 55 dani"`, `"ESCAVADEIRA VIO 55 01 (JULIANO)"` são
     provavelmente a mesma máquina).
   - **`OS.OB_CODIGO`** (o campo que ligaria a OS à tabela `OBRA`) está preenchido em **apenas
     1 de 326** OS — não confiar nele. **`OS.OS_MAQUINAHORAS`/`OS_MAQUINAVLRHORA`/`OS_MAQUINATOTAL`**
     também estão sempre `NULL` — são campos do ERP genérico nunca usados pela Antonello.
   - **Conclusão para desenhar `types`/mocks:** ao modelar `Equipamento` no novo sistema, use o
     catálogo de `SERVICO.SE_DESCRICAO` como inspiração de nomenclatura real da frota (tipos:
     retroescavadeira, escavadeiras VIO 35/55/80, miniescavadeiras, PC 210, LC 180, trator de
     esteira, rolo compactador, rompedor hidráulico, minicarregadeiras, caminhões
     truck/toco/traçado, caçambas identificadas por placa), mas **não** tente reconstruir um
     cadastro único de equipamento a partir daqui — os dados são desnormalizados e sujos.
3. **Apontamento (horímetro) real está em `OSSERVICO`, não em `OS`:**
   `OSSERVICO.OSS_HORIMETROINICIAL` / `OSS_HORIMETROFINAL` — preenchidos em **931 dos 1.398**
   itens de serviço (~67%). `OSS_QUANTIDADE` é a diferença (horas trabalhadas); confere com
   `HORIMETROFINAL - HORIMETROINICIAL` na maioria dos casos. `OSS_VALOR` = valor/hora,
   `OSS_TOTAL` = valor final do item. `OSSERVICO.OSS_DATA` é a data do apontamento específico —
   **uma OS pode ter vários `OSSERVICO` em datas diferentes**, o que já é evidência real de OS
   **colaborativa/plurianual** (o mesmo padrão que o ADR-001 do projeto endereça).
   `OSSERVICO.FUNC_CODIGO` (quem apontou) está **sempre `NULL`** na prática — não confiar nele
   para identificar o operador; a Antonello não usava esse campo.
4. **Cliente tem nome próprio aqui** (diferente do Turbo Diesel): `CLIENTE.CLI_NOME` /
   `CLI_RAZAOSOCIAL` estão preenchidos normalmente — não precisa do fallback via nota fiscal.
   Alguns "clientes" na verdade representam obras/projetos internos de controle
   (ex.: `"CONTROLE DE HORAS OBRA RAFAEL BERNARDI"`, `"OBRA CRELUZ LIMPEZA DE VIAS"`) — cuidado
   ao tratar isso como cliente PF/PJ real.
5. **Tabelas que parecem úteis mas estão VAZIAS ou quase vazias:**
   `CONTASPAGAR`, `CONTASRECEBER`, `MANUTENCAOPATRIMONIO`, `NF`, `NFS`, `VEICULOS` (1 linha) —
   o financeiro e a manutenção **não foram usados** neste ERP pela Antonello. Não modelar
   nenhuma suposição de fluxo de caixa/manutenção a partir deste banco.
6. **`CONTROLECOMBUSTIVEL` (diesel) tem só 8 linhas de teste, dados inconsistentes**
   (km rodado não bate com litros abastecidos, tipo de combustível "Gasolina" num registro de
   caminhão a diesel, valores redondos suspeitos como 2.000 L). **Não usar como referência de
   volume real de abastecimento** — tratar como dado de teste/exploração do sistema, não como
   histórico real de diesel.
7. **`PATRIMONIO` (6 linhas) também não é cadastro de máquina** — são categorias genéricas de
   custo (`"combustivel"`, `"maquinas"`, `"caçamba"`, `"disel"`), não instâncias de equipamento.
8. Regras 1, 7, 8, 9, 10, 11 do guia do Turbo Diesel (isql padroniza largura de linha, `OUTPUT`
   só grava ao final, queries pesadas rodar em background, `NFISCAL`/`VALOR` FLOAT vs NUMERIC,
   datas via `EXTRACT`) **aplicam-se igualmente** a este banco — não repetidas aqui.

---

## 5. Mapa das tabelas essenciais

### `OS` — Ordem de Serviço (cabeçalho), 326 linhas
Colunas-chave: `OS_CODIGO` (PK), `CLI_CODIGO` (cliente), `OS_DATAABERTURA`, `OS_DATAENCERRAMENTO`,
`OS_SITUACAO` (`'Aberta'`/...), `OS_TOTALGERAL` (valor total da OS). **Ignorar**
`OB_CODIGO`/`OS_MAQUINAHORAS`/`OS_MAQUINAVLRHORA`/`OS_MAQUINATOTAL` (vazios/não confiáveis — regra 2).

### `OSSERVICO` — itens de serviço da OS = **o "apontamento" real**, 1.398 linhas
Colunas-chave: `OSS_CODIGO` (PK), `OS_CODIGO` (FK → OS), `SE_CODIGO` (FK → SERVICO, nome do
equipamento/serviço), `OSS_DESCRICAO`, `OSS_HORIMETROINICIAL`, `OSS_HORIMETROFINAL`,
`OSS_QUANTIDADE` (horas), `OSS_VALOR` (valor/hora), `OSS_TOTAL`, `OSS_DATA`.
Uma OS tem 1:N `OSSERVICO` — é aqui que mora a evidência de "OS colaborativa" (vários apontamentos
em datas diferentes na mesma OS).

### `SERVICO` — catálogo de "serviços" = na prática, **nomenclatura real da frota**, 125 linhas
Colunas-chave: `SE_CODIGO` (PK), `SE_DESCRICAO`. Nomes duplicados/inconsistentes são esperados
(ver regra 2). Inclui também modelos de cobrança por diâmetro de broca (`"BROCA 60"`,
`"BROCA 1 METRO"`, `"BROCA 80 CM"`, `"furos broca 30"`) — confirma o modelo "por metro/estaca"
do glossário do projeto.

### `CLIENTE` — cadastro de clientes, 1.066 linhas
Colunas úteis: `CLI_CODIGO` (PK), `CLI_NOME`, `CLI_RAZAOSOCIAL`, `CLI_CPF`, `CLI_CNPJ`,
`CLI_TELEFONE`, `CLI_CEL`, `CLI_EMAIL`, `CLI_CEP`, `CLI_DATACADASTRO`, `CLI_SITUACAO`.
Diferente do Turbo Diesel, aqui `CLI_NOME` normalmente já vem preenchido.

### `OBRA` — reaproveitada como cadastro de equipamento (não usar como projeto/canteiro), 43 linhas
Ver regra 2. `OB_CODIGO` (PK), `OB_DESCRICAO` (nome da máquina + operador entre parênteses),
`OB_SITUACAO` (sempre `'Aberta'` — não reflete uso real).

### `FUNCIONARIO` — reaproveitada com os mesmos nomes de `OBRA`, 22 linhas
Ver regra 2. Não é uma fonte confiável de operadores reais — os nomes entre parênteses em
`OB_DESCRICAO`/`FUNC_NOME` (ex. "ZICO", "JULIANO", "DANI", "ERIVELTON", "BOLA", "LUCIANO",
"LEONARDO", "ORLANDO", "ERIK", "ADELAR", "DILSON") são o melhor indício de nomes reais de
operadores da empresa, mas não há tabela estruturada `Operador` no legado.

### Tabelas vazias/não confiáveis para este domínio (não perder tempo nelas)
`PATRIMONIO`, `CONTASPAGAR`, `CONTASRECEBER`, `MANUTENCAOPATRIMONIO`, `NF`, `NFS`, `VEICULOS`,
`CONTROLECOMBUSTIVEL` (dados de teste, ver regra 6).

---

## 6. Receitas prontas (copie e adapte)

### 6.1 Apontamentos (horímetro) de uma OS, em ordem cronológica
```sql
SET LIST ON;
SELECT os.OS_CODIGO, os.CLI_CODIGO, oss.OSS_DATA, oss.SE_CODIGO, se.SE_DESCRICAO,
       oss.OSS_HORIMETROINICIAL, oss.OSS_HORIMETROFINAL, oss.OSS_QUANTIDADE,
       oss.OSS_VALOR, oss.OSS_TOTAL
FROM OSSERVICO oss
JOIN OS os ON os.OS_CODIGO = oss.OS_CODIGO
LEFT JOIN SERVICO se ON se.SE_CODIGO = oss.SE_CODIGO
WHERE os.OS_CODIGO = 213
ORDER BY oss.OSS_DATA, oss.OSS_CODIGO;
```

### 6.2 Todo o histórico de apontamentos de um "equipamento" (por nome, via SERVICO)
```sql
SET LIST ON;
SELECT oss.OSS_DATA, os.OS_CODIGO, os.CLI_CODIGO, se.SE_DESCRICAO,
       oss.OSS_HORIMETROINICIAL, oss.OSS_HORIMETROFINAL, oss.OSS_QUANTIDADE, oss.OSS_TOTAL
FROM OSSERVICO oss
JOIN OS os ON os.OS_CODIGO = oss.OS_CODIGO
JOIN SERVICO se ON se.SE_CODIGO = oss.SE_CODIGO
WHERE UPPER(se.SE_DESCRICAO) LIKE '%RETROESCAVADEIRA%'
ORDER BY oss.OSS_DATA;
```

### 6.3 Faturamento por cliente (equivalente a LTV)
```sql
SET LIST ON;
SELECT os.CLI_CODIGO, c.CLI_NOME, COUNT(DISTINCT os.OS_CODIGO) AS QTD_OS,
       SUM(os.OS_TOTALGERAL) AS TOTAL_FATURADO
FROM OS os
JOIN CLIENTE c ON c.CLI_CODIGO = os.CLI_CODIGO
GROUP BY os.CLI_CODIGO, c.CLI_NOME
ORDER BY TOTAL_FATURADO DESC;
```

### 6.4 Catálogo de nomes de equipamento/serviço (para inspirar o cadastro novo)
```sql
SET LIST OFF;
SELECT SE_CODIGO, SE_DESCRICAO FROM SERVICO ORDER BY SE_DESCRICAO;
```

---

## 7. Como descobrir o que não está documentado

Mesmas receitas de discovery do guia do Turbo Diesel (Seção 8 lá — listar colunas de uma
tabela via `RDB$RELATION_FIELDS`, procurar tabelas/colunas por palavra-chave via `rdb$relations`).
Sempre `SELECT COUNT(*)` antes de assumir que uma tabela tem dados — neste banco a esmagadora
maioria das 855 tabelas do ERP genérico está vazia; só um punhado (`OS`, `OSSERVICO`, `SERVICO`,
`CLIENTE`, `OBRA`, `FUNCIONARIO`, `PRODUTOOBRA`, `CONTROLECOMBUSTIVEL`) tem uso real.

---

*Última revisão do schema: sessão de investigação que mapeou OS/OSSERVICO/SERVICO como núcleo
real de apontamento de horímetro, e identificou o reaproveitamento de OBRA/FUNCIONARIO como
cadastro de equipamento (achado não-óbvio, documentado na regra 2 acima).*
