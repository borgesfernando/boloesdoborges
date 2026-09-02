# Knowledge Dataset — fluxo de dados

```text
                    conteúdo estável
faq.json / termos / docs ───────────────┐
                                        │
                                        v
                                  data/knowledge
                                        │
pergunta do usuário -> classificador -> intent
                                        │
                     canonical ─────────┤──> resposta guardada
                                        │
                     dynamic/hybrid ────┤
                                        v
                           estado-operacional.json
                                        │
                                        v
                              resposta contextual

human -> canal oficial / atendimento humano
```

O fluxo acima é contrato de arquitetura para integrações futuras. A PR fundacional não implementa o classificador nem conecta consumidores de produção.
