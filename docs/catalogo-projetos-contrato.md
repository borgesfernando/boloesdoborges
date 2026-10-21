# Contrato do catálogo de projetos — semântica dos estratégicos

## Fonte e consumidores

O objeto `PROJETOS` em `js/config.js` é a fonte editável. O artefato público `data/projetos.json` é gerado por `scripts/extract-projetos.js`; não edite apenas esse JSON, pois o hook de Git e o workflow de atualização podem regenerá-lo. Os campos existentes permanecem estáveis para os consumidores atuais (site, alertas, scripts de estado e agentes).

Os projetos estratégicos utilizam os campos numéricos abaixo:

| Campo | Unidade | Significado |
| --- | --- | --- |
| `valor` | reais (BRL) | valor **individual da cota** por concurso; `20` significa R$ 20 |
| `minimo` | milhões de reais (BRL) | **patamar de prêmio acumulado** que condiciona a abertura do bolão; `50` representa R$ 50 milhões, não R$ 50 |

Exemplos vigentes no catálogo:

- `mega-acumulada`: `valor: 20`, `minimo: 50` — cota de R$ 20 e gatilho de prêmio acumulado de R$ 50 milhões.
- `milionaria`: `valor: 20`, `minimo: 80` — cota de R$ 20 e gatilho de prêmio acumulado de R$ 80 milhões.

**Regra de interpretação:** `minimo` **não** indica aporte mínimo, entrada, depósito, pagamento, quantidade mínima de cotas ou valor mínimo a pagar pelo participante. Não converter `50` ou `80` em reais de contribuição.

**Separação de autoridades:** o catálogo descreve regras dos projetos e **não** comprova que um bolão está aberto, fechado ou dentro de uma janela de participação agora. Respostas sobre status e prazo atuais devem ser baseadas na fonte operacional autorizada pelo consumidor; não inferir abertura automaticamente ao atingir o gatilho. Mega da Virada é projeto especial, distinto da Mega Acumulada estratégica.

## Compatibilidade

Este documento **não modifica** campos, tipos, nomes, valores ou ordem de `PROJETOS`; `valor` e `minimo` continuam legados obrigatórios dos estratégicos. Consumidores como `js/project-loader.js`, `js/landing.js`, `templates/acumulados.html`, `scripts/update-mega-status.js` e `js/acumulados-alert.js` já interpretam o gatilho em milhões. A interpretação de ferramentas de IA deve obedecer à mesma semântica, sem criar outro catálogo.

A evolução desse contrato (nomes, unidades, aliases ou formato) exige revisão de compatibilidade dos consumidores antes de implementação.
