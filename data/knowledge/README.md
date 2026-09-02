# Knowledge Dataset

Camada estruturada de conhecimento conversacional do ecossistema Bolões do Borges.

## Autoridade

Este diretório **não substitui** `faq.json` nem `data/estado-operacional.json`.

- `faq.json`: fonte editorial da FAQ pública;
- `data/estado-operacional.json`: fonte de fatos operacionais mutáveis;
- `data/knowledge/`: intents, variações linguísticas, respostas conversacionais, guardrails e referências às fontes autorizadas.

Consulte `docs/arquitetura-knowledge-dataset.md` para a matriz de precedência e requisitos.

## Estrutura

- `schema.json`: contrato v1;
- `intents/*.json`: intents agrupadas por domínio.

## Validação

```bash
node scripts/validate-knowledge.js
```

A validação é executada também pela GitHub Action `validate-knowledge.yml` quando arquivos relacionados mudam.

## Política de evolução

A fase inicial é deliberadamente pequena e não ativa nenhum consumidor de produção. Novos intents devem ser adicionados a partir de fontes verificáveis, evitando duplicar dados dinâmicos e preservando guardrails para temas sensíveis.
