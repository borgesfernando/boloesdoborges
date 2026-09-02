# Knowledge Dataset — versionamento

`data/knowledge/VERSION` e `schemaVersion` iniciam em `1`.

## Compatível dentro da v1

- adicionar novo intent;
- adicionar exemplos;
- adicionar resposta detalhada opcional;
- ajustar texto sem mudar semântica do contrato;
- adicionar guardrails;
- adicionar documentação/testes.

## Exige avaliação de nova versão

- remover/renomear campos obrigatórios;
- mudar significado de `answerType`;
- alterar formato de `sources`;
- mudar regra de resolução dinâmica;
- renomear IDs já consumidos em produção;
- tornar campo opcional obrigatório para consumidores existentes.

Antes de existir consumidor de produção, a v1 pode ser refinada, mas toda alteração ainda deve manter schema, VERSION, validador e seeds coerentes.
