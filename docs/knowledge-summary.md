# Canonical Knowledge Dataset — resumo

A proposta cria uma camada central de conhecimento conversacional para o Bolões do Borges sem alterar o comportamento atual dos sites ou automações.

O desenho preserva três responsabilidades:

- **FAQ**: verdade editorial pública;
- **estado operacional**: verdade mutável dos projetos;
- **knowledge dataset**: intents, variações de linguagem, respostas conversacionais, guardrails e referências.

A fundação inclui schema v1, versionamento, domínios iniciais da campanha, respostas `canonical/dynamic/hybrid/human`, controles para temas sensíveis, validador Node sem dependências, testes e CI dedicado.

A cobertura completa da FAQ e as integrações Telegram/WhatsApp/Facebook/web ficam explicitamente para PRs posteriores. Isso permite validar primeiro o contrato e evita introduzir uma nova fonte de verdade concorrente em produção.
