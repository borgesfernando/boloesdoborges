# Knowledge Dataset — Matriz de requisitos verificados

| ID | Requisito | Fonte/contrato verificado | Implementação nesta PR | Teste/controle |
| --- | --- | --- | --- | --- |
| K-01 | Preservar `faq.json` como fonte editorial | README, gerador FAQ, pre-commit e workflow de sync | Knowledge referencia `faq.json`; não altera geração | referência local validada |
| K-02 | Não quebrar `faq.html` | `scripts/generate-faq-html.js` | arquivo e gerador permanecem intocados | escopo da PR |
| K-03 | Não quebrar `minifaq.json` | `scripts/summarize-faq.js`, pre-commit | fluxo permanece intocado | escopo da PR |
| K-04 | Manter sincronização com `novo-site` | `sync-faq-novo-site.yml`; `novo-site/src/data/faq.json` e `faq.astro` | workflow existente permanece intocado | inspeção de compatibilidade |
| K-05 | Não duplicar estado operacional | `data/estado-operacional.json` schema v2 | intent dinâmica usa `resolver: operational_state` | resolver obrigatório + referência existente |
| K-06 | IDs estáveis e únicos | requisito da nova camada | `id` separado da pergunta | validador detecta duplicatas |
| K-07 | Variações linguísticas | objetivo conversacional | `examples[]` | mínimo 1, strings não vazias |
| K-08 | Diferenciar resposta estável/dinâmica | coexistência FAQ/estado operacional | `canonical`, `dynamic`, `hybrid`, `human` | enum + resolver para dynamic/hybrid |
| K-09 | Rastreabilidade | múltiplas fontes públicas já existentes | `sources[]` | referências locais existentes |
| K-10 | Guardrails de IA/loteria | plano histórico/campanha | `sensitive`, `mustInclude`, `mustNotClaim` | arrays obrigatórios para sensitive |
| K-11 | Sem promessas preditivas | plano histórico/campanha | intent `strategy.ai_probability` | guardrails explícitos |
| K-12 | Sem falsa vinculação à Caixa | FAQ/disclaimers | intent `trust.caixa_relationship` | guardrails explícitos |
| K-13 | Privacidade por padrão | plano histórico | somente conteúdo público/sanitizado | scanner conservador de padrões sensíveis |
| K-14 | Sem dependência nova | repo não possui `package.json` na raiz | validador Node puro | CI Node 24 |
| K-15 | Sem ativação em produção | fase fundacional | nenhum consumidor é alterado | escopo da PR |
| K-16 | Evolução multicanal | Telegram/WhatsApp/Facebook/web futuros | contrato independente de canal | documentação arquitetural |
| K-17 | CI proporcional | novo contrato versionado | workflow dedicado por paths | validator + smoke test |

## Decisões de escopo

Esta PR é de **fundação arquitetural**, não de migração completa da FAQ.

Ela deliberadamente não:

- converte todas as perguntas atuais em intents;
- muda o formato de `faq.json`;
- muda `faq.html` ou `minifaq.json`;
- altera o workflow de sincronização da FAQ;
- modifica `novo-site`;
- integra Telegram, WhatsApp, Facebook ou n8n;
- publica respostas dinâmicas sem consultar o estado operacional;
- cria telemetria ou armazenamento de conversas.

A cobertura completa das perguntas de campanha deve ser uma etapa posterior, construída sobre este contrato após validação da fundação.
