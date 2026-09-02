# Knowledge Dataset — mapa de fontes

## `borgesfernando/boloesdoborges`

### Editorial

- `faq.json` — FAQ canônica;
- `scripts/generate-faq-html.js` — gera `faq.html`;
- `scripts/summarize-faq.js` — gera `minifaq.json`;
- `.githooks/pre-commit` — mantém derivados locais;
- `.github/workflows/sync-faq-novo-site.yml` — sincroniza FAQ para o site comercial.

### Operacional

- `data/estado-operacional.json` — agregado público schema v2;
- `js/estado-operacional.js` — consumidor do contrato público;
- scripts/workflows de atualização — produtores do estado.

### Estratégia editorial/histórica

- `docs/plano-historico-mega-da-virada-transparencia.md` — princípios de transparência, histórico e alegações a evitar.

## `borgesfernando/novo-site`

Verificado como consumidor, não como autoridade editorial independente:

- `src/data/faq.json` recebe cópia da FAQ canônica;
- `src/pages/faq.astro` importa esse JSON e resolve tokens de rota localmente;
- `src/data/estado-operacional.json` existe como cópia do contrato operacional para o site.

## Consequência arquitetural

A knowledge layer pertence ao repositório público canônico nesta fase. Ela não será copiada para `novo-site` nem consumida por runtime até uma PR específica de integração. Isso impede que a fundação altere silenciosamente contratos de produção existentes.
