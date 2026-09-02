# Knowledge Dataset — manutenção

Fluxo recomendado para uma nova dúvida recorrente:

1. verificar se já existe intent compatível;
2. se existir, adicionar a nova formulação em `examples` somente quando não criar ambiguidade;
3. se não existir, localizar a fonte de verdade apropriada;
4. se a fonte estiver incompleta, corrigir primeiro a fonte editorial/operacional competente;
5. criar a intent e definir `answerType`;
6. adicionar guardrails se sensível;
7. executar a suíte local;
8. revisar o diff para garantir ausência de wiring ou dados privados;
9. integrar em consumidores somente por PR específica.

Perguntas reais da campanha podem alimentar essa manutenção, mas devem ser sanitizadas e convertidas em formulações genéricas antes de entrarem no repositório.
