# Avaliação futura — workflow único do estado operacional

## Estado atual

**NÃO AUTORIZADO PARA IMPLEMENTAÇÃO.**

Durante a migração permanecem obrigatoriamente os nove workflows `set-*.yml`. O arquivo `set-estado-operacional.yml` não deve ser criado antes do gate abaixo.

## Gate mínimo

A avaliação só pode começar depois de pelo menos **um ciclo operacional real validado** usando a API única da LoteriasGeral, com evidência de:

1. `ABRIR` aceito no momento operacional correto;
2. `ATUALIZAR` sem abertura implícita;
3. fechamento no cutoff correto;
4. retry/idempotência sem duplicação;
5. `estado-operacional.json` correto;
6. sincronização dos dois sites correta;
7. nenhum uso residual de `GITHUB_TOKEN` local nos consumidores para esse fluxo;
8. os nove workflows atuais ainda funcionais.

Idealmente a evidência deve cobrir mais de uma categoria (Mensal, Especial e Estratégico) antes de decisão definitiva.

## Dados a registrar durante o ciclo

- projeto e categoria;
- workflow acionado;
- quantidade de dispatches por evento;
- status HTTP do `workflow_dispatch`;
- ocorrência de retry;
- latência até atualização de `estado-operacional.json`;
- conflitos/serialização de commits;
- falhas de concorrência;
- drift entre alert individual e agregado;
- impacto das sincronizações para `novo-site`;
- necessidade real de lógica específica por workflow.

Não registrar tokens, payloads sensíveis ou identificadores privados desnecessários.

## Hipóteses a comparar

### Opção A — manter os nove workflows

Vantagens esperadas:
- isolamento por projeto;
- rollback granular;
- menor blast radius;
- histórico de Actions fácil de atribuir.

Custos esperados:
- repetição de YAML;
- manutenção de nove contratos de input semelhantes.

### Opção B — criar `set-estado-operacional.yml`

Somente avaliar se o ciclo demonstrar que os nove workflows executam efetivamente a mesma lógica.

Possíveis vantagens:
- contrato único de workflow;
- menos YAML repetido;
- evolução centralizada.

Riscos a medir:
- aumento do blast radius;
- concorrência de commits de projetos distintos;
- perda de isolamento/observabilidade por workflow;
- necessidade de roteamento e allowlist de projeto dentro da Action;
- rollback menos granular.

## Critério para recomendar consolidação

Só recomendar um workflow único se, após o ciclo real:

- a lógica específica dos nove workflows estiver reduzida a metadados declarativos;
- concorrência e idempotência estiverem comprovadas;
- o novo workflow puder usar allowlist estrita dos nove slugs;
- testes cobrirem todos os projetos;
- rollback para os nove workflows estiver documentado;
- a mudança reduzir complexidade líquida sem aumentar risco operacional relevante.

Caso qualquer um desses pontos não seja comprovado, a decisão padrão é **manter os nove workflows**.

## Procedimento se a consolidação for aprovada

Apenas em uma PR nova, posterior a esta avaliação:

1. criar `set-estado-operacional.yml` em paralelo, sem apagar os nove;
2. testar com `workflow_dispatch` manual/fixture;
3. migrar um projeto de baixa criticidade primeiro;
4. observar ciclo real;
5. migrar os demais gradualmente;
6. manter rollback imediato para workflow específico;
7. remover os nove somente após validação completa e decisão explícita.

## Registro da decisão

Preencher somente depois do gate:

```text
Ciclo validado em: PENDENTE
Projetos observados: PENDENTE
Incidentes/duplicações: PENDENTE
Concorrência: PENDENTE
Complexidade comparada: PENDENTE
Decisão: PENDENTE
Justificativa: PENDENTE
```
