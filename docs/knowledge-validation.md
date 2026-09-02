# Knowledge Dataset — validação

Execute:

```bash
bash scripts/validate-knowledge-local.sh
```

O conjunto cobre:

- validade estrutural básica do dataset;
- IDs únicos e referências locais existentes;
- resolver obrigatório em respostas dinâmicas/híbridas;
- alinhamento dos documentos com enums do schema;
- guardrails obrigatórios em intents sensíveis;
- autoridade de `operational_state` para respostas mutáveis;
- controles conservadores contra segredos/dados privados;
- preservação da fase fundacional sem runtime loader/integração de produção.

A mesma suíte é executada por `.github/workflows/validate-knowledge.yml` no escopo relevante.
