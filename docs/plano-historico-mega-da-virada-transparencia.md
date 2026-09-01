# Plano final de implementação — Nossa História na Mega da Virada

## 1. Objetivo

Criar uma página pública de caráter histórico e de transparência para a Mega da Virada, baseada no acervo documental sanitizado do Super Bolão (SB), com foco em **controle, continuidade institucional, rastreabilidade, método, evolução operacional e prestação de contas**.

A página não será uma vitrine de performance financeira nem de premiações. Também não deve sugerir capacidade de prever resultados, retorno esperado superior ao da loteria ou vantagem matemática garantida.

A tese central é:

> **Não prometemos sorte. Demonstramos método, controle e prestação de contas.**

A página deve transformar um histórico iniciado em 2010 em evidência verificável de seriedade operacional, sem esconder períodos sem prêmio e sem transformar resultados modestos em argumento defensivo.

Título público recomendado:

> **Nossa História na Mega da Virada**

Linha de apoio recomendada:

> **Uma história iniciada em 2010, construída com organização, registro, conferência e transparência.**

A formulação “iniciada em 2010” é preferível a frases que possam sugerir operação ininterrupta, pois houve suspensão dos projetos entre 2017 e 2022.

---

## 2. Posicionamento estratégico

O valor reputacional desse histórico está no processo documentado, não no resultado aleatório dos sorteios.

A página deve demonstrar aquilo que o projeto efetivamente controla:

1. organização;
2. regras e planejamento definidos antes dos sorteios;
3. controle financeiro;
4. registro e composição das apostas;
5. conferência dos resultados;
6. tratamento documentado de premiações e reinvestimentos quando aplicáveis;
7. prestação de contas;
8. preservação do histórico, inclusive quando não há premiação relevante;
9. evolução dos mecanismos de controle ao longo do tempo.

A distinção editorial fundamental é:

> **Resultado é aleatório. Governança não é.**

A página deve produzir confiança pela coerência entre discurso e documentação, e não pela promessa implícita de sucesso futuro.

---

## 3. Riscos de comunicação a evitar

Não apresentar o histórico como:

- “Resultados históricos” como título principal;
- “Quanto já ganhamos”;
- “Histórico de sucesso”;
- “Estratégia vencedora”;
- “Retorno do bolão”;
- “Taxa de acerto”;
- comparação entre total apostado e total recebido;
- cálculo de ROI;
- prova de maior probabilidade de premiação;
- demonstração de superioridade estatística.

Também evitar frases que possam sugerir continuidade operacional absoluta desde 2010, como “16 anos seguidos de bolão” ou equivalentes.

Não usar “auditado” ou “auditável” para descrever o acervo, salvo se houver auditoria externa formal. Preferir:

- **documentado**;
- **rastreável**;
- **verificável**;
- **com proveniência identificada**.

---

## 4. Princípio de transparência

A página deve aplicar o mesmo padrão documental a resultados favoráveis e desfavoráveis.

Texto recomendado:

> **Nosso histórico não mostra apenas os anos em que houve prêmio. Mantemos também o registro das edições sem premiação relevante, porque transparência significa mostrar o processo completo — não apenas os resultados favoráveis.**

Esse princípio transforma a ausência de grandes prêmios em evidência de consistência: o histórico não é selecionado apenas quando favorece a narrativa comercial.

Mensagem complementar:

> **Nossa história não é uma promessa de prêmio. É uma evidência de compromisso.**

---

## 5. Período histórico e fases do projeto

O histórico público deve cobrir o período de **2010 a 2025**, distinguindo claramente três fases operacionais e um período de suspensão.

### 5.1. 2010–2012 — origem

Fase inicial do Super Bolão, com:

- primeiros controles de participantes;
- planilhas de palpites;
- planejamento de quantidade de apostas;
- registros de arrecadação e aplicação;
- início da cultura de prestação de contas.

### 5.2. 2013–2016 — amadurecimento

Fase de evolução dos controles, com:

- planejamento financeiro mais estruturado;
- composição de apostas com diferentes quantidades de dezenas;
- fechamento consolidado;
- controles mais detalhados de participantes/cotas;
- rotinas de conferência e registro.

### 5.3. 2017–2022 — pausa operacional

Entre **2017 e 2022**, o administrador esteve **fora do país em missão oficial** e os projetos foram suspensos durante o período.

Esses anos não representam perda de documentação de edições realizadas. Representam uma interrupção real da operação.

Texto público recomendado:

> **2017–2022 — pausa operacional**  
> Durante esse período, o administrador esteve fora do Brasil em missão oficial e os projetos foram temporariamente suspensos. A operação foi retomada posteriormente em uma nova fase de organização e tecnologia.

Regras:

- representar 2017–2022 como **um único marco visual** na linha do tempo;
- não criar seis cards vazios;
- não preencher participantes, cotas, apostas ou valores com zero;
- não marcar esses anos como `não_localizado`;
- no dataset, usar `edicaoRealizada: false` e `status: projeto_suspenso`;
- não divulgar órgão, destino, cargo, função ou detalhes pessoais da missão;
- resultados oficiais da Mega da Virada nesses anos só podem aparecer como contexto da loteria, nunca como resultados do projeto.

### 5.4. 2023–2025 — retomada e fase moderna

A retomada deve ser apresentada como evolução do processo, com:

- controles de pagamentos mais estruturados;
- planejamento sistemático de apostas;
- conferência organizada;
- registro de reinvestimentos quando aplicável;
- crescimento da automação;
- integração progressiva com o ecossistema tecnológico atual.

O ponto central não é “apostamos mais”, mas **“passamos a controlar melhor”**.

---

## 6. Fonte de dados pública única

A página não deve consumir planilhas privadas nem incorporar dados históricos manualmente no HTML.

Criar e versionar:

```text
data/historico-mega-virada.json
```

Esse JSON sanitizado será a **fonte única de verdade pública** da página.

Benefícios:

- separação entre origem privada e publicação pública;
- revisão de privacidade antes da exposição;
- histórico versionado no Git;
- possibilidade de testes automatizados;
- atualização independente do layout;
- uso futuro por outros componentes do ecossistema.

---

## 7. Política de privacidade

É proibido publicar no dataset ou HTML:

- nomes de participantes;
- e-mails;
- telefones;
- CPF;
- endereços;
- dados bancários;
- PIX;
- IDs de Google Drive;
- URLs privadas de planilhas;
- IDs de WhatsApp ou Telegram;
- tokens ou chaves;
- nomes de abas ou descrições que permitam identificar participantes;
- qualquer identificador técnico ou pessoal desnecessário.

Somente dados agregados e sanitizados podem ser publicados.

As fontes históricas privadas devem ser representadas publicamente por descrições genéricas, por exemplo:

```json
{
  "tipo": "planilha_historica",
  "descricao": "Resumo de fechamento da edição"
}
```

Nunca publicar identificadores privados da fonte original.

---

## 8. Qualidade e proveniência dos dados

Cada campo histórico deve ter status de evidência.

### `confirmado`

Informação explicitamente encontrada em fonte primária confiável, como fechamento, resumo, planejamento, conferência ou registro de premiação.

### `calculado`

Valor derivado exclusivamente de dados confirmados por operação objetiva e reproduzível.

### `não_localizado`

Usar apenas quando a edição ocorreu, mas o campo específico não pôde ser comprovado documentalmente.

### `projeto_suspenso`

Estado da edição/período, e não de um campo numérico. Usado para 2017–2022.

Exemplo:

```json
{
  "ano": 2019,
  "edicaoRealizada": false,
  "status": "projeto_suspenso",
  "motivoPublico": "Projetos temporariamente suspensos durante período em que o administrador esteve fora do país em missão oficial."
}
```

Nenhum valor `não_localizado` pode ser convertido automaticamente em zero.

---

## 9. Pessoas x cotas

A página deve evitar uma fonte importante de erro histórico: tratar número de cotas como número de pessoas.

Regras:

- usar **participantes** somente quando a fonte permitir afirmar pessoas/participantes;
- usar **cotas pagantes** quando a fonte registrar cotas;
- não somar participantes de anos diferentes como se fossem pessoas únicas;
- não publicar KPI “total de pessoas que já participaram” sem deduplicação confiável;
- quando houver incerteza, usar o termo neutro **participações/cotas registradas**.

Essa distinção deve existir também no schema e nos testes.

---

## 10. Estrutura lógica recomendada para edição realizada

Exemplo:

```json
{
  "ano": 2024,
  "edicaoRealizada": true,
  "nome": {
    "valor": "SB2024",
    "status": "confirmado"
  },
  "participacao": {
    "tipo": "cotas_pagantes",
    "valor": 50,
    "status": "confirmado"
  },
  "valorApostas": {
    "valor": 30485.00,
    "status": "confirmado"
  },
  "apostas": {
    "6dezenas": { "valor": 1085, "status": "confirmado" },
    "7dezenas": { "valor": 150, "status": "confirmado" },
    "8dezenas": { "valor": 50, "status": "confirmado" },
    "9dezenas": { "valor": 13, "status": "confirmado" },
    "10dezenas": { "valor": 7, "status": "confirmado" },
    "total": { "valor": 1305, "status": "calculado" }
  },
  "resultadoOficial": {
    "concurso": { "valor": 2810, "status": "confirmado" },
    "dataSorteio": { "valor": "2024-12-31", "status": "confirmado" },
    "dezenas": { "valor": [1,17,19,29,50,57], "status": "confirmado" }
  },
  "conferenciaProjeto": {
    "status": "concluida",
    "premiacaoRegistrada": {
      "valor": 0,
      "status": "calculado"
    }
  }
}
```

---

## 11. Caso especial da edição 2025

A edição deve permanecer classificada publicamente como **Mega da Virada 2025**, mas o dataset deve registrar a data oficial real do sorteio.

O concurso correspondente foi realizado em **1º de janeiro de 2026**, após adiamento do sorteio originalmente previsto para 31 de dezembro de 2025.

Regras de implementação:

- `anoEdicao: 2025`;
- `dataSorteio` com a data oficial efetiva;
- mostrar nota curta apenas se a data aparecer no card;
- não reclassificar a edição como “2026”;
- não inferir número histórico de participantes/cotas a partir de células atualmente reutilizadas para a edição 2026;
- campos de participação de 2025 devem permanecer `não_localizado` enquanto não houver evidência histórica segura.

---

## 12. Dados históricos recuperados

Há documentação operacional para as edições realizadas em:

- 2010;
- 2011;
- 2012;
- 2013;
- 2014;
- 2015;
- 2016;
- 2023;
- 2024;
- 2025.

O intervalo 2017–2022 corresponde à suspensão dos projetos.

Exemplos já recuperados, sujeitos à validação final do JSON:

- 2010: 61 participantes e 4.270 apostas documentadas;
- 2011: 42 participantes e R$ 3.220,98 de premiação registrada no acervo do SB2011 Premium; faixa não localizada com segurança;
- 2012: 44 participantes e fechamento financeiro detalhado;
- 2013: 38 participantes e planejamento completo das apostas;
- 2014: 57 participantes pagantes e fechamento detalhado;
- 2015: 51 participantes e composição de apostas;
- 2016: 35 participantes e 260 apostas;
- 2023: 75 cotas pagantes, R$ 42.175,00 em apostas e quadra de R$ 3.647,13;
- 2024: 50 cotas pagantes, R$ 30.485,00 em apostas e conferência completa;
- 2025: aproximadamente R$ 41.772,00 em apostas documentadas e conferência preservada; participação/cotas ainda não localizadas com segurança histórica.

Nenhum desses exemplos deve ser hardcoded na página. O front-end deve usar exclusivamente o dataset definitivo.

---

## 13. Indicadores públicos recomendados

Os KPIs devem reforçar longevidade documental e controle.

Priorizar:

- **História iniciada em 2010**;
- **número de edições documentadas e realizadas**;
- **quantidade acumulada de apostas documentadas**;
- **valor acumulado de apostas documentadas**, com metodologia clara;
- **número de edições com conferência preservada**, quando comprovável;
- **percentual/cobertura de campos confirmados**, se for compreensível para o público;
- **evolução dos mecanismos de controle**.

Evitar:

- soma de “participantes” entre anos como pessoas únicas;
- prêmio acumulado como KPI principal;
- percentual recuperado em prêmios;
- ROI;
- taxa de sucesso;
- relação prêmio/aposta;
- métricas que sugiram rentabilidade.

Se um total agregado exigir hipóteses ou misturar conceitos históricos diferentes, ele não deve aparecer no hero.

---

## 14. Arquitetura final da página

### 14.1. Hero

Título:

> **Nossa História na Mega da Virada**

Texto:

> **Uma história iniciada em 2010, construída com organização, registro, conferência e transparência.**

Abaixo do texto, inserir uma faixa curta de confiança:

> **Dados históricos agregados • Sem dados pessoais • Metodologia pública**

CTA principal da página histórica:

> **Ver a linha do tempo**

CTA secundário:

> **Conheça a Mega da Virada 2026**

O hero não deve mostrar prêmio histórico.

### 14.2. Manifesto de transparência

Título:

> **Sorte não se controla. Organização, sim.**

Texto-base:

> Loterias são jogos de probabilidade e nenhum método garante premiação. O compromisso deste projeto está no que pode ser controlado: regras claras, organização financeira, registro das apostas, conferência dos resultados e prestação de contas aos participantes.

Adicionar:

> **Por isso, este histórico inclui também as edições sem premiação relevante.**

### 14.3. Indicadores históricos

Exibir no máximo 3 ou 4 cards.

Exemplos:

- **Desde 2010** / História do projeto;
- **X edições realizadas e documentadas**;
- **17 mil+ apostas documentadas**, somente se confirmado pelo dataset final;
- **R$ X em apostas documentadas**, somente se metodologicamente comparável.

Não usar “volume administrado” se o número representar apenas apostas registradas.

Todas as métricas devem ser calculadas a partir do JSON.

### 14.4. Evolução do controle

Adicionar uma seção visual curta antes da linha do tempo para mostrar amadurecimento:

```text
registro manual
      ↓
planejamento estruturado
      ↓
conferência sistemática
      ↓
automação e dados públicos sanitizados
```

Título sugerido:

> **O que evoluiu ao longo do tempo**

Esse bloco converte a história em demonstração objetiva de melhoria sem sugerir melhora da “sorte”.

### 14.5. Linha do tempo

Quatro marcos visuais:

1. **2010–2012 — origem**;
2. **2013–2016 — amadurecimento**;
3. **2017–2022 — pausa operacional**;
4. **2023–2025 — retomada e fase moderna**.

O intervalo suspenso deve ter tratamento visual neutro, não de erro ou falha.

### 14.6. Edições documentadas

Após a linha do tempo, mostrar cards de cada edição efetivamente realizada.

No desktop, cards em grade; no mobile, sequência vertical.

Cada card deve privilegiar leitura rápida e permitir expansão para detalhes.

Campos primários:

- ano/nome;
- participantes **ou** cotas, com rótulo correto;
- valor em apostas;
- total de apostas;
- status da conferência.

Campos secundários/expansíveis:

- composição por quantidade de dezenas;
- resultado oficial;
- premiação registrada;
- proveniência dos dados.

### 14.7. Premiações

Premiações aparecem dentro dos cards e em uma seção resumida secundária, se editorialmente útil.

Título permitido:

> **Premiações registradas no acervo**

Não usar:

> “Nossos maiores prêmios”

A seção deve conter também contexto explícito:

> **A presença ou ausência de premiação não altera o critério de publicação do histórico.**

### 14.8. Como o controle funciona hoje

Adicionar seção que conecta história e operação atual:

1. definição das regras do projeto;
2. registro das participações/cotas;
3. fechamento financeiro;
4. planejamento e registro das apostas;
5. sorteio oficial;
6. conferência;
7. prestação de contas;
8. tratamento de prêmio ou reinvestimento, quando aplicável.

Essa é uma das principais pontes para a campanha atual.

### 14.9. Metodologia e proveniência

Seção “Como reconstruímos este histórico”.

Explicar que:

1. foram localizadas planilhas históricas do Super Bolão;
2. foram priorizados fechamentos, resumos, controles de pagamentos, planejamento de apostas, conferência e premiações;
3. dados pessoais foram removidos;
4. campos sem comprovação não foram estimados livremente;
5. cálculos publicados derivam apenas de dados confirmados;
6. resultados oficiais da loteria são usados para referência do concurso;
7. o acervo poderá ser atualizado se novos documentos forem recuperados.

Exibir:

- versão do dataset;
- data da última atualização;
- legenda dos estados de evidência;
- link opcional para o JSON público sanitizado.

### 14.10. CTA final

Título:

> **A história continua em 2026.**

Texto curto:

> Conheça as regras, o planejamento e o acompanhamento da edição atual.

CTA:

> **Conheça a Mega da Virada 2026 →**

---

## 15. Linguagem dos cards anuais

Exemplo:

> **2024 — SB2024**  
> 50 cotas pagantes  
> R$ 30.485 em apostas documentadas  
> 1.305 apostas documentadas  
> Conferência concluída  
> Nenhuma aposta com quadra ou premiação superior

Preferir:

- “conferência concluída”;
- “sem premiação registrada nessa faixa”;
- “campo não localizado no acervo disponível”.

Evitar:

- “não ganhamos nada”;
- “ano ruim”;
- “sem sorte”;
- “fracasso”;
- “resultado decepcionante”.

---

## 16. Selos de qualidade da informação

Estados visuais discretos:

- **● Confirmado** — encontrado diretamente na documentação;
- **◐ Calculado** — derivado exclusivamente de dados confirmados;
- **○ Não localizado** — documentação insuficiente para esse campo;
- **‖ Projeto suspenso** — edição não realizada.

Requisitos:

- não depender apenas de cor;
- `aria-label` apropriado;
- tooltip ou legenda simples;
- selos não devem competir visualmente com os dados principais.

---

## 17. Papel na campanha da Mega da Virada 2026

A página histórica é **prova de confiança**, não a landing page principal de aquisição.

Fluxo recomendado:

```text
campanha
   ↓
landing page Mega da Virada 2026
   ↓
provas de confiança
   ├── histórico
   ├── transparência
   ├── metodologia
   └── prestação de contas
```

Bloco recomendado na landing:

> **Um projeto que não começou este ano.**  
> Conheça a história iniciada em 2010 e veja como os controles evoluíram ao longo das edições.

CTA:

> **Conheça nossa história →**

A campanha não deve usar premiações históricas como promessa de conversão.

---

## 18. Integração com a marca

A página deve materializar:

> **DADOS • ESTRATÉGIA • CONFIANÇA**

Correspondência:

- **DADOS** → histórico documentado e proveniência;
- **ESTRATÉGIA** → planejamento e organização das apostas dentro dos recursos disponíveis;
- **CONFIANÇA** → prestação de contas independentemente do resultado do sorteio.

Tecnologia e estratégia devem ser descritas como melhoria de **processo, organização, consistência e cobertura planejada**, nunca como garantia de prêmio.

---

## 19. SEO e indexação

A página tem natureza institucional e de transparência e deve ser considerada indexável, conforme a estratégia geral vigente do site.

Slug recomendado:

```text
/historico/mega-da-virada.html
```

Title:

```text
Nossa História na Mega da Virada | Bolões do Borges
```

Description:

```text
Conheça a história do Super Bolão da Mega da Virada iniciada em 2010: organização, apostas documentadas, conferência de resultados, evolução dos controles e prestação de contas.
```

Evitar em SEO:

- “estratégia vencedora”;
- “mais chances de ganhar”;
- “bolão que mais ganha”;
- “rentabilidade”;
- promessa de prêmio.

Dados estruturados, se utilizados, devem representar página institucional/histórica. Não usar `AggregateRating`, métricas de retorno ou estruturas que possam sugerir avaliação de desempenho financeiro.

---

## 20. Componentes técnicos sugeridos

```text
data/historico-mega-virada.json
historico/mega-da-virada.html
assets/js/historico-mega-virada.js
assets/css/...  # reutilizar sistema atual
```

Antes de criar novos componentes, verificar padrões existentes do repositório.

O JavaScript deve:

1. carregar o JSON;
2. validar `schemaVersion`;
3. validar estados de evidência;
4. separar edições realizadas de período suspenso;
5. calcular KPIs elegíveis;
6. impedir agregação indevida de pessoas/cotas;
7. renderizar evolução do controle;
8. renderizar linha do tempo;
9. renderizar cards anuais;
10. renderizar proveniência;
11. renderizar premiações em posição secundária;
12. falhar de forma segura se o dataset estiver inválido.

Não duplicar os dados históricos no HTML.

---

## 21. Testes obrigatórios

### 21.1. Privacidade

Falhar se o JSON contiver chaves ou padrões como:

```text
nomeParticipante
email
telefone
cpf
endereco
banco
agencia
conta
pix
planilhaId
driveId
whatsappId
telegramId
token
secret
```

Adicionar detecção de e-mail, telefone, CPF e URLs privadas.

### 21.2. Schema

Garantir:

- período esperado;
- ano único por registro;
- `edicaoRealizada` obrigatório;
- estados válidos;
- campos financeiros numéricos ou `null`;
- arrays de dezenas válidos;
- distinção `participantes` x `cotas_pagantes`;
- 2017–2022 como suspensão, não como edições vazias;
- 2025 como edição 2025 com data real do sorteio preservada.

### 21.3. Consistência matemática

Quando um total tiver status `calculado`, verificar fórmula reproduzível.

Quando existirem quantidade, valor unitário e total, validar consistência com tolerância apenas quando houver justificativa histórica explícita.

### 21.4. Agregações

Testar que:

- `não_localizado` nunca entra como zero;
- cotas não são apresentadas como pessoas;
- participantes anuais não são somados como pessoas únicas;
- edições suspensas não entram em contagem de edições realizadas;
- KPIs exibidos possuem dados suficientes para cálculo.

### 21.5. Front-end

Garantir:

- responsividade;
- acessibilidade dos estados;
- funcionamento sem campos opcionais;
- CTA correto para edição 2026;
- ausência de dados privados no DOM;
- degradação segura se JSON falhar;
- navegação por teclado;
- contraste adequado;
- boa leitura em telas pequenas.

---

## 22. Regras editoriais obrigatórias

### Fazer

- usar linguagem factual e segura;
- destacar processo e prestação de contas;
- mostrar resultados favoráveis e desfavoráveis;
- explicar a pausa de 2017–2022 sem dramatização;
- separar pessoas de cotas;
- separar fato confirmado de cálculo;
- usar “documentado”, “rastreável” ou “verificável”;
- tornar a evolução do controle o principal arco narrativo;
- permitir atualização futura do acervo.

### Não fazer

- prometer prêmio;
- sugerir vantagem matemática garantida;
- selecionar apenas anos favoráveis;
- calcular ROI como argumento comercial;
- chamar quadras de “grandes vitórias”;
- usar “auditado” sem auditoria real;
- converter `não_localizado` em zero;
- somar participantes históricos como pessoas únicas;
- publicar dados pessoais;
- apresentar 2017–2022 como falha de documentação;
- dizer que o projeto operou de forma contínua de 2010 a 2026.

---

## 23. Critérios de aceite

A implementação estará pronta quando:

1. existir JSON público sanitizado e versionado;
2. cada campo histórico tiver status de evidência;
3. a distinção entre participantes e cotas estiver modelada;
4. 2017–2022 estiverem representados como pausa operacional;
5. 2025 estiver corretamente associado à edição 2025 e à data real do sorteio;
6. a página consumir apenas o JSON público;
7. KPIs forem derivados automaticamente e metodologicamente válidos;
8. hero enfatizar história, controle e transparência;
9. existir seção “O que evoluiu ao longo do tempo”;
10. linha do tempo refletir as quatro fases/marcos;
11. cards mostrarem edições com e sem prêmio sob o mesmo padrão;
12. premiações estiverem em posição secundária;
13. metodologia e proveniência estiverem visíveis;
14. data de atualização e versão do dataset estiverem disponíveis;
15. nenhuma informação pessoal ou identificador privado estiver presente;
16. a landing da Mega da Virada 2026 possuir link contextual para o histórico;
17. a página histórica possuir CTA de retorno ao projeto atual;
18. testes de schema, privacidade, agregação e consistência estiverem passando;
19. textos não fizerem promessa de resultado ou vantagem garantida;
20. SEO, acessibilidade e responsividade estiverem validados.

---

## 24. Ordem de implementação

1. Congelar o dataset arqueológico atual como evidência de trabalho.
2. Ajustar 2017–2022 para `projeto_suspenso` / `edicaoRealizada: false`.
3. Corrigir o schema para distinguir participantes de cotas.
4. Registrar corretamente o caso especial de 2025.
5. Revisar todos os agregados e remover métricas metodologicamente frágeis.
6. Criar `data/historico-mega-virada.json` sanitizado.
7. Criar schema e testes de privacidade/consistência/agregação.
8. Implementar loader e renderização.
9. Criar hero e manifesto de transparência.
10. Criar seção “O que evoluiu ao longo do tempo”.
11. Criar linha do tempo.
12. Criar cards das edições realizadas.
13. Criar metodologia/proveniência.
14. Criar seção de controle atual.
15. Posicionar premiações como informação secundária.
16. Integrar CTA na Mega da Virada 2026.
17. Integrar navegação, sitemap e `site-index.json` conforme arquitetura vigente.
18. Validar SEO, acessibilidade, responsividade e privacidade.
19. Fazer revisão editorial final orientada a risco reputacional.

---

## 25. Prompt de implementação futura

> Avalie primeiro o estado atual do repositório e preserve seus padrões de arquitetura, componentes, estilos, navegação, SEO e fontes públicas de dados. Implemente a página **“Nossa História na Mega da Virada”** conforme `docs/plano-historico-mega-da-virada-transparencia.md`.
>
> A página deve privilegiar **controle, transparência, rastreabilidade, evolução operacional e prestação de contas**, nunca performance financeira ou promessa de prêmio.
>
> Use uma única fonte pública sanitizada em `data/historico-mega-virada.json`. Cada campo deve ter proveniência (`confirmado`, `calculado`, `não_localizado`). Para 2017–2022, represente explicitamente `projeto_suspenso` / `edicaoRealizada: false`, pois o administrador esteve fora do país em missão oficial e os projetos foram suspensos. Não trate esses anos como perda documental.
>
> Modele participantes e cotas separadamente. Nunca some registros anuais como pessoas únicas sem deduplicação comprovável. Não converta `não_localizado` em zero.
>
> Trate 2025 como edição Mega da Virada 2025, preservando no dataset a data oficial efetiva do sorteio em 1º de janeiro de 2026 e mantendo como `não_localizado` qualquer campo histórico que tenha sido contaminado pela reutilização posterior da planilha.
>
> Não exponha nomes, e-mails, telefones, CPF, dados bancários, IDs de planilhas, Drive, WhatsApp, Telegram, PIX, tokens ou outros dados privados. Adicione testes contra regressões de privacidade.
>
> A página deve conter: hero institucional; manifesto “Sorte não se controla. Organização, sim.”; indicadores metodologicamente seguros; seção “O que evoluiu ao longo do tempo”; linha do tempo; pausa 2017–2022; cards das edições; premiações em posição secundária; seção “Como o controle funciona hoje”; metodologia; proveniência; versão/data do dataset; e CTA para a Mega da Virada 2026.
>
> Não use “auditado” sem auditoria externa real. Prefira “documentado”, “rastreável” e “verificável”. Não use ROI, taxa de sucesso ou comparação prêmio/aposta como argumento comercial.
>
> Integre a página ao sitemap, navegação e índices públicos adequados somente após confirmar a arquitetura atual. Não duplique dados históricos no HTML.
>
> Antes de concluir, execute os testes existentes e os novos testes de schema, privacidade, agregação, consistência, acessibilidade e responsividade. Documente qualquer divergência entre o dataset e o código/site atual.

---

## 26. Síntese estratégica final

O ativo principal do histórico não é demonstrar que o Super Bolão teve mais sorte que outros jogos.

O que ele consegue demonstrar de forma muito mais defensável é que, **nas edições em que o projeto esteve ativo, existiram organização, registros, planejamento, conferência e prestação de contas independentemente do resultado do sorteio**.

A suspensão de 2017–2022 é parte legítima da cronologia, não uma falha a esconder. A retomada posterior permite apresentar uma narrativa clara de evolução: de controles predominantemente manuais para uma operação progressivamente mais estruturada, automatizada e orientada por dados.

A página deve deixar o visitante com três percepções:

1. **este projeto tem história**;
2. **os números publicados têm origem e limites claros**;
3. **a confiança é construída pelo processo, não por promessas de sorte**.

Mensagem final recomendada:

> **Nossa história não é uma promessa de prêmio. É uma evidência de compromisso.**
