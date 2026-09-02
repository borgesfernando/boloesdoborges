# ADR — introduzir knowledge layer sem substituir a FAQ

## Status

Proposto nesta PR fundacional.

## Contexto

O repositório já possui `faq.json` como fonte editorial e `data/estado-operacional.json` como fonte operacional. Ambos têm consumidores e automações existentes. Criar um terceiro repositório de respostas independentes produziria risco de divergência.

## Decisão

Criar `data/knowledge/` como camada de intenção e governança conversacional. Ela referencia as fontes existentes, acrescenta variações linguísticas, tipos de resposta, guardrails e metadados necessários a agentes.

## Consequências positivas

- reutilização multicanal;
- menor risco de respostas improvisadas;
- tratamento explícito de estado dinâmico;
- guardrails verificáveis;
- evolução sem quebrar FAQ/site existentes.

## Trade-off

Na fase inicial existe alguma repetição controlada nas respostas curta/padrão. Essa repetição é tratada como adaptação conversacional, não como autoridade factual independente; mudanças de verdade devem nascer na fonte competente e ser propagadas ao dataset.

## Alternativa rejeitada

Transformar imediatamente `data/knowledge` na fonte que gera `faq.json`. Foi rejeitado nesta fase porque alteraria contratos, hooks, geradores e sincronização com `novo-site` antes de a camada conversacional ser validada.
