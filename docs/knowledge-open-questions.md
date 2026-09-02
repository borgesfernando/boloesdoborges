# Knowledge Dataset — decisões deliberadamente adiadas

A fundação não deve decidir prematuramente:

1. qual classificador de intents será usado;
2. se classificação será determinística, embeddings, LLM ou híbrida;
3. como o dataset chegará ao gateway Telegram/n8n;
4. formato de telemetria e retenção;
5. se respostas por canal serão templates ou instruções de estilo;
6. se, após maturidade, a direção de geração será invertida para `knowledge -> faq.json`;
7. como o futuro dataset histórico será consultado por respostas factuais;
8. quais informações de pagamento podem ser expostas automaticamente e por quais canais autenticados.

Essas decisões devem ser tomadas em PRs posteriores com requisitos e riscos próprios.
