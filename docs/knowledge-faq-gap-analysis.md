# FAQ x campanha — análise de lacunas para o knowledge dataset

## O que a FAQ já cobre bem

- definição do projeto e das linhas de bolões;
- ciclo operacional completo;
- regras gerais de projetos especiais, mensais e estratégicos;
- pagamentos e planejamento em diferentes projetos;
- prestação de contas e registro das apostas;
- conteúdo sobre estratégia/IA e organização.

## O que muda na campanha

A FAQ foi escrita principalmente para documentação de quem já conhece ou está avaliando o funcionamento. A campanha traz perguntas de pré-confiança e conversão em linguagem mais curta, direta e cética.

Exemplos: vínculo com a Caixa, golpe/confiabilidade, por que confiar, histórico de resultados, por que não houve prêmio principal, IA prevê números, ainda há vaga, qual o próximo passo e onde consultar regras antes de pagar.

## Como o dataset resolve sem duplicar a FAQ

- agrupa várias formulações sob IDs estáveis;
- referencia `faq.json` quando a resposta editorial já existe;
- usa documentação aprovada para guardrails que não são uma pergunta da FAQ;
- usa estado operacional para disponibilidade/janelas;
- marca dúvidas financeiras sensíveis não publicadas para atendimento humano;
- mantém backlog explícito quando falta uma fonte verificável.

## Regra para lacunas reais

Se uma pergunta revelar que falta uma regra pública necessária, não preencher silenciosamente apenas no knowledge dataset. Primeiro decidir qual fonte pública deve possuir essa regra (FAQ, termos, política, dataset histórico ou estado operacional); depois referenciá-la no intent.
