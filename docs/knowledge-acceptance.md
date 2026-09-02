# Knowledge Dataset — critérios de aceite da fundação

A fundação está pronta para PR quando:

1. `main` é ancestral direto da branch e a branch não está atrás;
2. `faq.json`, geradores e sync existentes permanecem inalterados;
3. `data/estado-operacional.json` permanece autoridade de estado mutável;
4. schema v1, VERSION e documentos seed são coerentes;
5. os quatro modos de resposta têm representação no desenho (`canonical`, `dynamic`, `hybrid`, `human`);
6. domínios fundacionais de campanha estão representados;
7. guardrails cobrem Caixa, IA/probabilidade, histórico, premiação, privacidade e dados financeiros;
8. não existe runtime wiring de produção;
9. CI dedicado executa toda a suíte local;
10. documentação registra backlog e decisões adiadas.

O merge desta PR aprova a arquitetura e o contrato inicial; não declara cobertura completa da FAQ nem ativa atendimento automatizado baseado no dataset.
