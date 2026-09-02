# Knowledge Dataset — governança de mudanças

## Regra principal

O knowledge dataset organiza conhecimento para atendimento; ele não redefine fatos pertencentes a outras fontes de verdade.

## Alterações editoriais

Quando a verdade editorial mudar, alterar primeiro a fonte editorial apropriada (`faq.json`, termos ou documentação aprovada) e depois ajustar intents que a referenciam.

## Alterações operacionais

Nunca atualizar manualmente uma resposta do knowledge dataset para representar abertura, fechamento, concurso ou janela atual. Esses fatos pertencem ao estado operacional e devem ser resolvidos no momento do consumo.

## Alterações sensíveis

Mudanças em intents sobre IA/probabilidade, histórico, premiação, dados financeiros ou legitimidade devem revisar explicitamente `mustInclude` e `mustNotClaim`.

## Novas fontes

Uma nova categoria de fonte exige atualização coordenada do schema, validador, documentação e testes antes de ser usada por intents.

## Compatibilidade

Mudança incompatível no formato exige nova versão de contrato. A versão v1 não deve ser reinterpretada silenciosamente.

## Integrações

Cada consumidor futuro deve ter PR própria, fallback definido e testes que demonstrem que a indisponibilidade do dataset ou do resolver dinâmico não produz informação inventada.
