# Knowledge Dataset — plano de rollout

## PR atual — fundação

Somente contrato, seeds, guardrails, documentação e CI. Nenhum consumidor.

## Próxima PR — cobertura editorial

- mapear sistematicamente `faq.json` para intents;
- incorporar as perguntas previstas da campanha;
- identificar lacunas que exigem atualização editorial da FAQ em vez de criar respostas paralelas;
- adicionar facts históricos somente quando o dataset histórico sanitizado estiver publicado.

## Integração 1 — agente Telegram

Primeiro consumidor recomendado por já existir fluxo de agente. Deve entrar com fallback integral para o comportamento anterior e sem persistência nova de dados pessoais.

## Integrações posteriores

WhatsApp, Facebook e atendimento web devem reutilizar o mesmo contrato, adicionando somente adaptadores de canal.

## Observabilidade futura

Registrar apenas métricas agregadas necessárias: intent reconhecida, intent desconhecida, fallback, resolver indisponível e eventual escalonamento. Conteúdo integral de conversas não faz parte desta proposta.

## Critério para promover a camada

A knowledge layer só deve ser considerada fonte operacional de atendimento depois de cobertura, testes e integração gradual demonstrarem que ela não diverge da FAQ nem do estado operacional.
