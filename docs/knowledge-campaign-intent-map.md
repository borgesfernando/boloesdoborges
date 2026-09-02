# Campanha — mapa inicial de intents

Este documento converte as perguntas prováveis da campanha em grupos de intenção. Ele é backlog editorial; não significa que todas as respostas já estejam implementadas no dataset.

## Confiança

- `trust.caixa_relationship` — vínculo/oficialidade Caixa;
- `trust.project_legitimacy` — confiabilidade, histórico, como verificar;
- backlog: identidade do administrador, natureza jurídica/comunitária, termo de participação.

## Participação

- `participation.lifecycle` — funcionamento geral do ciclo;
- `operations.project_availability` — aberto, vaga, prazo atual;
- `conversion.next_step` — próximo passo/cadastro;
- backlog: múltiplas cotas, desistência, transferência, requisitos de participação e canais.

## Pagamentos

- `payments.project_terms` — preço, parcelas, datas e entrada tardia;
- backlog: segregação de recursos, taxa administrativa, destino do orçamento, distribuição/rateio e recebedor do prêmio.

## Apostas e tecnologia

- `bets.composition` — montagem, combinações, repetição e apostas com mais dezenas;
- `strategy.ai_probability` — IA, previsão, probabilidade e garantias;
- backlog: fechamento matemático e detalhes específicos por modalidade.

## Transparência

- `transparency.accountability` — comprovantes, bilhetes, conferência e prestação de contas;
- backlog: momento de publicação, guarda de bilhetes, tratamento de erro e conferência independente.

## Histórico

- `history.past_results` — prêmios anteriores, ausência de prêmio principal, interpretação do histórico;
- backlog: perguntas factuais de valores/faixas devem futuramente consultar o dataset histórico sanitizado, quando publicado.

## Conversão

- `conversion.next_step` — cadastro e orientação inicial;
- backlog: acompanhamento, grupos/canais, contato e regras completas.

## Regra de implementação

Antes de promover um item de backlog para intent ativo:

1. localizar a fonte verificável;
2. definir se a resposta é `canonical`, `dynamic`, `hybrid` ou `human`;
3. não copiar estado mutável para o dataset;
4. adicionar guardrails quando houver risco editorial, financeiro ou de alegação probabilística;
5. validar privacidade;
6. incluir exemplos reais/representativos de linguagem;
7. passar `node scripts/validate-knowledge.js`.
