# Knowledge Dataset — plano de testes

## Contrato

- JSON parseável;
- schema/version coerentes;
- IDs únicos;
- domínio e prefixo coerentes;
- exemplos não vazios e sem duplicidade entre intents.

## Fontes

- referências locais existem;
- `dynamic/hybrid` usam resolver;
- respostas mutáveis dependem de `operational_state`;
- FAQ continua sendo fonte editorial existente.

## Segurança/editorial

- intents sensíveis possuem `mustInclude` e `mustNotClaim`;
- scanner detecta padrões óbvios de segredo/PII;
- respostas não carregam tokens de rota nem scripts;
- nenhum runtime loader é introduzido na fase fundacional.

## Cobertura

- domínios essenciais de descoberta, confiança, participação, pagamento, operação, apostas, IA, transparência, histórico, prêmio, conversão, legal, contato, privacidade e escalonamento humano possuem seeds representativos.

## Execução

`bash scripts/validate-knowledge-local.sh` deve reproduzir localmente a suíte executada no workflow dedicado.
