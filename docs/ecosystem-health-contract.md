# Estado sanitizado do ecossistema

O schema `data/ecosystem-health.schema.json` é uma preparação e não cria/publica `ecosystem-health.json`.

Quando aprovado, o gerador deve validar o schema e uma allowlist. É proibido incluir segredo, URL interna, IP, ID de script/container, stack trace, dados pessoais ou credencial. O artefato não abre nem fecha projetos: `estado-operacional.json` continua autoritativo.