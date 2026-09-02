# PR scope — Canonical Knowledge Dataset foundation

## Incluído

- contrato JSON Schema v1;
- dataset modular inicial cobrindo confiança, participação, pagamentos, operações, apostas, estratégia/IA, transparência, histórico, premiação, conversão e escalonamento humano;
- distinção `canonical` / `dynamic` / `hybrid` / `human`;
- guardrails para intents sensíveis;
- referências explícitas às fontes existentes;
- validador sem dependências externas;
- suíte de verificações e workflow CI dedicado;
- documentação de arquitetura, requisitos, campanha e validação.

## Não incluído

- mudança de `faq.json` ou de seus derivados;
- mudança do sync para `novo-site`;
- runtime loader;
- integração Telegram/WhatsApp/Facebook/n8n;
- alteração de páginas públicas;
- publicação de dados bancários/PIX;
- migração completa das perguntas da FAQ;
- telemetria de conversas.

## Critério de merge

- branch atualizada contra `main` sem divergência;
- CI do knowledge dataset verde;
- diff restrito ao escopo fundacional;
- nenhuma alteração nos contratos de produção existentes.
