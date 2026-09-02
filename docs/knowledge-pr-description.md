# PR — Canonical Knowledge Dataset foundation

## Resumo

Cria a fundação versionada de uma camada de conhecimento conversacional para o ecossistema Bolões do Borges, preservando `faq.json` como fonte editorial e `data/estado-operacional.json` como fonte de estado mutável.

## Mudanças

- JSON Schema v1 + `VERSION`;
- intents seed por domínio com exemplos de linguagem natural;
- respostas `canonical`, `dynamic`, `hybrid` e `human`;
- guardrails `mustInclude` / `mustNotClaim` para temas sensíveis;
- referências explícitas às fontes autoritativas;
- validador Node sem dependências externas;
- testes de contrato, fontes, privacidade, domínios, exemplos e ausência de wiring;
- GitHub Action dedicada;
- documentação de requisitos, ADR, riscos, campanha, rollout e governança.

## Compatibilidade

Não altera `faq.json`, `faq.html`, `minifaq.json`, o sync para `novo-site`, o estado operacional, páginas públicas ou integrações Telegram/WhatsApp/Facebook/n8n.

## Validação

```bash
bash scripts/validate-knowledge-local.sh
```

## Próximos passos fora desta PR

1. cobertura sistemática da FAQ/perguntas da campanha;
2. publicação/integração do dataset histórico sanitizado;
3. integração gradual do agente Telegram com fallback;
4. demais canais após validação.
