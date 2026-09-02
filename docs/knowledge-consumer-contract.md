# Knowledge Dataset — contrato para consumidores futuros

Um consumidor do dataset deve:

1. classificar a pergunta em uma intent ou declarar ausência de correspondência;
2. respeitar `answerType`;
3. para `canonical`, responder apenas com fatos/respostas autorizados e contexto verificável;
4. para `dynamic`, executar o resolver antes de afirmar o estado atual;
5. para `hybrid`, combinar conteúdo estável com o resolver, sem deixar o conteúdo estável sobrescrever o estado atual;
6. para `human`, não tentar completar o dado ausente por inferência;
7. aplicar `mustInclude` e `mustNotClaim` em intents sensíveis;
8. tratar falha de resolver como indisponibilidade de informação, não como valor padrão favorável;
9. não persistir dados pessoais apenas para classificação de intent;
10. permitir telemetria futura somente de forma agregada/anonimizada, separada desta fundação.

## Fallback

Ausência de intent ou baixa confiança deve usar o comportamento seguro do consumidor (FAQ, orientação genérica ou atendimento humano), nunca uma resposta inventada.

## Canais

Adaptação de tom/tamanho por canal pode ser adicionada futuramente, mas não pode alterar fatos, guardrails ou autoridade das fontes.
