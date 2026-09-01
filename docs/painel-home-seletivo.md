# Política seletiva do painel da home

A página dedicada `atualizacoes.html` continua exibindo os nove projetos canônicos. A home passa a mostrar somente informações com utilidade imediata para adesão.

## Regra da home

O painel compacto considera, nesta ordem:

1. projetos abertos e próximos do cutoff;
2. demais projetos efetivamente abertos;
3. projetos com abertura futura confirmada em até 7 dias.

Projetos em preparação, aguardando sorteio, encerrados, sem instância, indisponíveis ou com abertura além da janela de 7 dias não ocupam espaço na home. Quando nenhum projeto se enquadrar, o painel compacto não é exibido.

## Próxima abertura

A classificação `Abre em breve` só existe quando `abreEm` é uma data/hora válida, está no futuro, ocorre em até 7 dias, o projeto não está `ABERTA`, não está `INDISPONIVEL` e `ativo` não é `true`. Não há inferência a partir de prêmio, calendário da CAIXA ou próximo concurso.

## Fail-safe

`Adesões abertas` continua exigindo simultaneamente `estado === 'ABERTA'`, `ativo === true`, `abreEm` e `fechaEm` válidos e o instante atual dentro da janela. Um contrato incompleto nunca é promovido a aberto ou próximo de abrir.

## Página completa

`/atualizacoes.html` permanece como visão integral do ecossistema e continua exibindo os nove projetos, inclusive fases de preparação, apuração, encerramento e indisponibilidade.

## Teste

`scripts/estado-operacional-ui.test.js` cobre abertura válida, abertura futura em até 7 dias, exclusão de abertura distante, exclusão de estado indisponível e ausência total de cards quando não houver item relevante.
