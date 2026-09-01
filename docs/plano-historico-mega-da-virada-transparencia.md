# Plano de implementação — Nossa História na Mega da Virada

## 1. Objetivo

Criar uma página pública de caráter histórico e de transparência para a Mega da Virada, baseada no acervo documental do Super Bolão (SB), com foco em **controle, continuidade, rastreabilidade, método e prestação de contas**.

A página não deve ser tratada como uma vitrine de performance financeira ou de premiações. O objetivo não é sugerir que o projeto possui capacidade de prever resultados ou produzir retorno acima da aleatoriedade própria das loterias.

A tese central é:

> **Não prometemos sorte. Demonstramos método, controle e prestação de contas.**

A página deve transformar o histórico de mais de uma década em evidência verificável de seriedade operacional.

Título público recomendado:

> **Nossa História na Mega da Virada — desde 2010**

Subtítulo sugerido:

> **Mais de uma década de organização, controle, conferência e transparência.**

---

## 2. Problema de comunicação que a página precisa resolver

Os resultados financeiros históricos encontrados no acervo são modestos quando comparados ao volume acumulado de apostas. Portanto, a publicação do histórico precisa ser cuidadosamente enquadrada.

O erro estratégico seria apresentar a página como:

- “Resultados históricos”;
- “Quanto já ganhamos”;
- “Histórico de sucesso”;
- “Estratégia vencedora”;
- “Retorno do bolão”;
- comparação de total apostado versus total recebido;
- cálculo de ROI;
- qualquer narrativa que sugira superioridade estatística comprovada.

Esse enquadramento faria o visitante julgar o projeto pela variável que o organizador não controla: **o resultado aleatório dos sorteios**.

O enquadramento correto é demonstrar aquilo que o projeto efetivamente controla:

1. organização;
2. definição prévia das regras;
3. controle financeiro;
4. registro das apostas;
5. conferência dos resultados;
6. tratamento de premiações e reinvestimentos;
7. prestação de contas;
8. preservação do histórico, inclusive quando não há prêmio relevante.

A distinção editorial fundamental deve ser:

> **Resultado é aleatório. Governança não é.**

---

## 3. Princípio de transparência

A página deve mostrar resultados favoráveis e desfavoráveis com o mesmo padrão documental.

Uma formulação recomendada para a própria página:

> **Nosso histórico não mostra apenas os anos em que houve prêmio. Mantemos também o registro das edições sem premiação relevante, porque transparência significa mostrar o processo completo — não apenas os resultados favoráveis.**

Esse princípio é um ativo reputacional. A ausência de seleção oportunista de resultados ajuda a demonstrar que a transparência não depende de o sorteio ter sido favorável.

Outra formulação central possível:

> **Nossa história não é uma promessa de prêmio. É uma evidência de compromisso.**

---

## 4. Período histórico e pausa operacional de 2017 a 2022

O histórico público deve cobrir o período de **2010 a 2025**.

### 4.1. 2010 a 2016 — primeira fase documentada

Esse período representa a fase original do Super Bolão, com evolução gradual das planilhas de apostas, controles de participantes, planejamento financeiro e registros de fechamento.

### 4.2. 2017 a 2022 — projetos suspensos

Entre **2017 e 2022**, o administrador esteve **fora do país em missão oficial**, razão pela qual os projetos de bolão foram suspensos durante esse período.

Portanto, esses anos **não devem ser apresentados como uma lacuna decorrente de perda de dados ou falha de documentação**. A ausência de planilhas operacionais equivalentes é coerente com uma interrupção real da operação.

Texto público recomendado:

> **2017–2022 — pausa operacional**  
> Durante esse período, o administrador esteve fora do Brasil em missão oficial e os projetos foram temporariamente suspensos. A operação foi retomada posteriormente, já em uma nova fase de organização e automação.

Regras editoriais para esse período:

- não criar cartões anuais simulando edições que não ocorreram;
- não preencher participantes, valores ou apostas com `0`, pois `0` poderia ser interpretado como uma edição realizada sem movimento;
- representar o intervalo como um **marco único na linha do tempo**;
- não utilizar a classificação `não_localizado` para campos operacionais como se uma edição tivesse ocorrido;
- no dataset público, usar um estado explícito como `projeto_suspenso` ou `edicao_realizada: false`;
- manter, se desejado, os resultados oficiais da Mega da Virada do período apenas como contexto da loteria, claramente separados do histórico do projeto.

A informação sobre a missão oficial é declaratória do administrador e deve ser apresentada apenas no nível necessário para explicar a pausa, sem divulgar órgão, local, função ou outros detalhes pessoais/profissionais desnecessários.

### 4.3. 2023 a 2025 — fase moderna

A retomada apresenta controles mais estruturados, maior capacidade operacional, planilhas de conferência, registros de reinvestimento e, posteriormente, automações e integração com o ecossistema atual.

A página deve usar essa evolução como narrativa de amadurecimento, e não apenas como uma sequência de números.

---

## 5. Fonte de dados pública

A página **não deve consumir diretamente as planilhas privadas**.

Deve existir um arquivo público sanitizado, versionado no repositório, recomendado em:

```text
data/historico-mega-virada.json
```

Esse arquivo será a única fonte de dados históricos consumida pelo front-end.

### 5.1. Política de privacidade

É proibido publicar no dataset:

- nomes de participantes;
- e-mails;
- telefones;
- CPF;
- dados bancários;
- PIX;
- IDs de Google Drive;
- URLs privadas de planilhas;
- IDs de WhatsApp/Telegram;
- tokens;
- chaves;
- nomes de abas que contenham nomes pessoais quando isso puder identificar participantes;
- qualquer outro identificador pessoal ou técnico desnecessário.

Somente dados agregados podem ser publicados.

---

## 6. Qualidade e proveniência dos dados

Cada campo histórico deve conter, além do valor, um indicador de qualidade da evidência.

Estados recomendados:

### `confirmado`

Valor explicitamente encontrado em fonte primária confiável, como fechamento, resumo, planejamento, conferência ou registro de premiação.

### `calculado`

Valor derivado exclusivamente de dados confirmados, utilizando operação objetiva e reproduzível.

Exemplo:

```json
{
  "totalApostas": {
    "valor": 260,
    "status": "calculado",
    "nota": "Soma das quantidades confirmadas de apostas de 6 a 10 dezenas."
  }
}
```

### `não_localizado`

Usar somente quando uma edição ocorreu, mas determinado campo não pôde ser comprovado documentalmente.

### `projeto_suspenso`

Usar para o intervalo 2017–2022 ou em estrutura equivalente que torne explícito que **não houve operação do projeto naquele ano**.

Exemplo recomendado:

```json
{
  "ano": 2019,
  "edicaoRealizada": false,
  "status": "projeto_suspenso",
  "motivoPublico": "Projetos temporariamente suspensos durante período em que o administrador esteve fora do país em missão oficial."
}
```

---

## 7. Estrutura lógica recomendada para cada edição

Exemplo:

```json
{
  "ano": 2024,
  "edicaoRealizada": true,
  "nome": {
    "valor": "SB2024",
    "status": "confirmado"
  },
  "participantesOuCotas": {
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
  "resultado": {
    "concurso": { "valor": 2810, "status": "confirmado" },
    "dezenas": { "valor": [1,17,19,29,50,57], "status": "confirmado" }
  },
  "premiacaoProjeto": {
    "faixa": {
      "valor": "sem premiação de quadra ou superior",
      "status": "calculado"
    },
    "valor": {
      "valor": 0,
      "status": "calculado"
    }
  }
}
```

---

## 8. Dados históricos já recuperados

A reconstrução documental identificou material operacional forte para:

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

O intervalo 2017–2022 corresponde à suspensão real dos projetos.

Entre os dados já recuperados estão, entre outros:

- 2010: 61 participantes e 4.270 apostas documentadas;
- 2011: 42 participantes e R$ 3.220,98 de premiação posteriormente identificada no acervo;
- 2012: 44 participantes e fechamento financeiro detalhado;
- 2013: 38 participantes e planejamento completo das apostas;
- 2014: 57 participantes pagantes e fechamento detalhado;
- 2015: 51 participantes e composição de apostas;
- 2016: 35 participantes e 260 apostas;
- 2023: 75 cotas pagantes, R$ 42.175,00 em apostas e quadra de R$ 3.647,13;
- 2024: 50 cotas pagantes e R$ 30.485,00 em apostas;
- 2025: fechamento preservado com aproximadamente R$ 41.772,00 em apostas e conferência do concurso correspondente.

Os números devem ser validados novamente contra o JSON definitivo antes da publicação.

---

## 9. Indicadores públicos recomendados

Os KPIs principais **não devem ser premiações**.

Priorizar:

- ano de início do Super Bolão;
- número de edições efetivamente realizadas;
- número de anos de operação ativa;
- quantidade acumulada de apostas documentadas;
- valores administrados/aplicados documentalmente comprovados;
- número de edições com conferência preservada;
- evolução do processo de controle;
- quantidade de dados com status `confirmado` versus `calculado`.

Evitar como KPI principal:

- total de prêmios;
- percentual recuperado em prêmios;
- retorno sobre o valor apostado;
- “taxa de sucesso”;
- relação prêmio/aposta;
- qualquer indicador que possa sugerir rentabilidade ou vantagem matemática.

---

## 10. Arquitetura da página

### 10.1. Hero

Título:

> **Nossa História na Mega da Virada**

Texto:

> **Desde 2010, organizamos participações coletivas com planejamento, registro das apostas, conferência e prestação de contas.**

CTA secundário:

> **Conheça a Mega da Virada 2026**

A página histórica não deve disputar a função da landing page comercial do projeto atual.

---

### 10.2. Manifesto de transparência

Título sugerido:

> **Sorte não se controla. Organização, sim.**

Texto-base:

> Loterias são jogos de probabilidade e nenhum método garante premiação. O compromisso deste projeto está no que pode ser controlado: regras claras, organização financeira, registro das apostas, conferência dos resultados e prestação de contas aos participantes.

Esse texto deve aparecer antes de qualquer número de premiação.

---

### 10.3. Indicadores históricos

Cards possíveis:

- **Desde 2010**;
- **X edições realizadas**;
- **17 mil+ apostas documentadas**, se confirmado pelo dataset definitivo;
- **R$ 190 mil+ em apostas documentadas**, se confirmado pelo dataset definitivo;
- **histórico preservado e auditável**.

Toda métrica agregada deve ser calculada automaticamente a partir do JSON, nunca duplicada manualmente no HTML.

Inserir link para metodologia.

---

### 10.4. Linha do tempo

A linha do tempo deve contar a evolução do projeto em três fases:

#### 2010–2012 — origem

- primeiras edições;
- participação coletiva;
- planilhas de palpites e controle;
- início da cultura de prestação de contas.

#### 2013–2016 — amadurecimento

- planejamento financeiro mais estruturado;
- diversidade de bilhetes;
- fechamento consolidado;
- evolução das rotinas de controle.

#### 2017–2022 — pausa operacional

Um único bloco visual, não seis edições vazias.

Texto:

> **Durante esse período, o administrador esteve fora do Brasil em missão oficial e os projetos foram temporariamente suspensos.**

#### 2023–2025 — retomada e nova fase

- aumento de escala;
- controles de pagamentos mais estruturados;
- conferência sistemática;
- reinvestimentos registrados;
- evolução para automação e integração tecnológica.

---

## 11. Cards anuais

Para cada edição realizada, exibir no máximo:

- ano/nome da edição;
- participantes ou cotas;
- valor aplicado;
- quantidade total de apostas;
- composição resumida por quantidade de dezenas;
- dezenas sorteadas;
- situação da conferência;
- premiação registrada, quando houver;
- selo da qualidade dos dados.

Não exibir nomes individuais.

Exemplo de linguagem:

> **2024 — SB2024**  
> 50 cotas pagantes  
> R$ 30.485 em apostas  
> 1.305 apostas documentadas  
> Conferência concluída  
> Nenhuma aposta com quadra ou premiação superior

Preferir **“conferência concluída”** a frases como “não ganhamos nada”.

---

## 12. Premiações

As premiações devem aparecer como parte do histórico, mas **não devem ocupar o hero nem ser o eixo narrativo da página**.

Título sugerido:

> **Premiações encontradas no acervo**

Não usar:

> “Nossos maiores prêmios”

Registros atualmente relevantes incluem:

- SB2011 Premium — R$ 3.220,98 em premiação registrada no acervo; faixa ainda não confirmada;
- SB2023 — quadra de R$ 3.647,13 registrada no controle de reinvestimento.

Se houver prêmio de outro concurso realizado durante a operação anual, mas que não corresponda à Mega da Virada, ele não deve ser classificado como prêmio da Mega da Virada.

---

## 13. Selos de qualidade da informação

Transformar os estados do dataset em elementos visuais discretos:

- **● Confirmado** — encontrado diretamente na documentação;
- **◐ Calculado** — derivado de dados confirmados;
- **○ Não localizado** — documentação insuficiente para esse campo.

Para 2017–2022, usar elemento próprio:

- **‖ Projeto suspenso** — edição não realizada.

Esses estados devem ter `aria-label` e não podem depender apenas de cor.

---

## 14. Metodologia pública

A página deve ter uma seção curta “Como reconstruímos este histórico”.

Explicar que:

1. foram localizadas planilhas históricas do Super Bolão;
2. foram priorizados fechamentos, resumos, controles de pagamentos, planejamento de apostas, conferência e premiações;
3. dados pessoais foram removidos;
4. campos sem comprovação não foram estimados livremente;
5. cálculos publicados derivam apenas de dados confirmados;
6. os resultados oficiais da loteria são usados apenas para completar a referência do concurso;
7. a página poderá ser atualizada se novos documentos históricos forem recuperados.

Opcionalmente, disponibilizar um link para o JSON público sanitizado.

---

## 15. Papel da página na campanha da Mega da Virada 2026

A página histórica deve ser **prova de confiança**, não a landing page principal de aquisição.

Fluxo recomendado:

```text
campanha
   ↓
landing page Mega da Virada 2026
   ↓
provas de confiança
   ├── transparência
   ├── histórico
   ├── metodologia
   └── prestação de contas
```

CTA recomendado na campanha/landing:

> **Um projeto que não começou este ano. Conheça nosso histórico de organização e prestação de contas desde 2010.**

Link:

> **Conheça nossa história →**

A página histórica, por sua vez, deve fechar com CTA de retorno ao projeto atual:

> **A história continua em 2026.**

> **Conheça a Mega da Virada 2026 →**

---

## 16. Integração com a marca

A página é especialmente adequada para materializar a assinatura:

> **DADOS • ESTRATÉGIA • CONFIANÇA**

Correspondência conceitual:

- **DADOS** → histórico documentado e dataset auditável;
- **ESTRATÉGIA** → planejamento e composição das apostas;
- **CONFIANÇA** → prestação de contas, inclusive quando o resultado não é favorável.

A mensagem deve deixar claro que tecnologia e estratégia melhoram o **processo de organização e cobertura dentro dos recursos disponíveis**, mas não eliminam a aleatoriedade do sorteio nem garantem prêmio.

---

## 17. SEO e indexação

A página histórica tem valor institucional e pode ser indexável, desde que alinhada à estratégia geral de indexação do site.

Slug recomendado:

```text
/historico/mega-da-virada.html
```

Alternativa:

```text
/mega-da-virada/historico.html
```

Title sugerido:

```text
Nossa História na Mega da Virada desde 2010 | Bolões do Borges
```

Description sugerida:

```text
Conheça o histórico do Super Bolão da Mega da Virada desde 2010: organização, apostas documentadas, conferência de resultados e prestação de contas.
```

Evitar metadados que contenham “estratégia vencedora”, “mais chances de ganhar” ou promessas de premiação.

---

## 18. Componentes técnicos sugeridos

### 18.1. Arquivos

```text
data/historico-mega-virada.json
historico/mega-da-virada.html
assets/js/historico-mega-virada.js
assets/css/... (preferir componentes/estilos já existentes)
```

Adaptar aos padrões reais do repositório antes da implementação.

### 18.2. Renderização

O JavaScript deve:

1. carregar o JSON;
2. validar `schemaVersion`;
3. separar edições realizadas de períodos suspensos;
4. calcular KPIs agregados;
5. renderizar linha do tempo;
6. renderizar cards anuais;
7. renderizar selos de proveniência;
8. renderizar premiações documentadas;
9. falhar de forma segura se o JSON estiver inválido.

Não duplicar os dados históricos diretamente no HTML.

---

## 19. Testes obrigatórios

### 19.1. Privacidade

Falhar se o JSON contiver chaves ou padrões como:

```text
nomeParticipante
email
telefone
cpf
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

Complementar com detecção de e-mail, telefone, CPF e URLs privadas.

### 19.2. Schema

Garantir:

- período esperado;
- ano único por registro;
- `edicaoRealizada` obrigatório;
- `status` válido;
- campos financeiros numéricos ou `null`;
- arrays de dezenas válidos quando presentes;
- 2017–2022 marcados como suspensão e não como edições vazias.

### 19.3. Consistência matemática

Quando `totalApostas.status === "calculado"`, validar a soma das categorias disponíveis.

Quando existirem valor unitário, quantidade e total, validar consistência com tolerância para diferenças históricas documentadas.

### 19.4. Front-end

Garantir:

- ausência de quebra quando campos estiverem `não_localizado`;
- acessibilidade dos estados;
- responsividade;
- CTA correto para Mega da Virada 2026;
- nenhuma exposição de dados privados no HTML gerado.

---

## 20. Regras editoriais obrigatórias

### Fazer

- usar linguagem factual;
- deixar clara a natureza aleatória da loteria;
- destacar processo e prestação de contas;
- mostrar anos sem premiação relevante;
- mostrar dados ausentes com transparência;
- explicar a pausa operacional de 2017–2022;
- separar fatos confirmados de cálculos;
- permitir atualização futura do acervo.

### Não fazer

- prometer prêmio;
- sugerir vantagem matemática comprovada;
- esconder anos desfavoráveis;
- calcular ROI como argumento comercial;
- chamar quadras de “grandes vitórias”;
- usar depoimentos para inferir maior chance de ganhar;
- converter `não_localizado` em zero;
- publicar qualquer dado pessoal;
- apresentar 2017–2022 como falha de documentação.

---

## 21. Critérios de aceite

A implementação estará pronta quando:

1. existir um JSON público sanitizado versionado;
2. todos os campos do dataset tiverem proveniência/status;
3. 2017–2022 estiverem documentados como período de suspensão operacional;
4. a página consumir apenas o JSON público;
5. os KPIs forem derivados automaticamente;
6. o hero enfatizar histórico, controle e transparência — não prêmio;
7. a página mostrar anos com e sem premiação;
8. existir seção metodológica;
9. existir indicação visual de `confirmado`, `calculado` e `não_localizado`;
10. nenhuma informação pessoal ou identificador privado estiver presente;
11. a landing page da Mega da Virada 2026 possuir link contextual para o histórico;
12. a página histórica possuir CTA de retorno para o projeto atual;
13. testes automatizados de schema, privacidade e consistência estiverem passando;
14. os textos não fizerem promessa de resultado nem criarem impressão de vantagem garantida.

---

## 22. Ordem de implementação recomendada

1. Revisar e congelar o dataset arqueológico 2010–2025.
2. Ajustar 2017–2022 para `projeto_suspenso`/`edicaoRealizada: false`.
3. Revisar os totais agregados após a retirada desses anos da categoria de lacuna operacional.
4. Publicar `data/historico-mega-virada.json` sanitizado.
5. Criar schema e testes de privacidade.
6. Criar componente de carregamento/renderização.
7. Criar a página histórica.
8. Implementar linha do tempo em três fases + pausa operacional.
9. Implementar seção de metodologia e proveniência.
10. Implementar seção de premiações em posição secundária.
11. Integrar CTA na Mega da Virada 2026.
12. Integrar a nova página a navegação, sitemap e `site-index.json`, conforme a arquitetura vigente.
13. Validar SEO, acessibilidade e responsividade.
14. Fazer revisão editorial final com foco em risco reputacional.

---

## 23. Prompt de implementação futura

> Avalie primeiro o estado atual do repositório e preserve seus padrões de arquitetura, componentes, estilos, navegação, SEO e fontes públicas de dados. Implemente a página **“Nossa História na Mega da Virada — desde 2010”** conforme `docs/plano-historico-mega-da-virada-transparencia.md`.
>
> A implementação deve privilegiar **controle, transparência, rastreabilidade e evolução operacional**, e nunca vender o histórico como performance ou promessa de prêmio.
>
> Crie e use um único dataset público sanitizado em JSON, com proveniência por campo (`confirmado`, `calculado`, `não_localizado`). Para 2017–2022, represente explicitamente **projeto suspenso / edição não realizada**, pois o administrador esteve fora do país em missão oficial e os projetos foram suspensos durante o período. Não trate esses anos como falha ou perda documental.
>
> Não exponha nomes, e-mails, telefones, CPF, dados bancários, IDs de planilhas, Drive, WhatsApp, Telegram, PIX, tokens ou qualquer dado privado. Adicione testes que impeçam regressão de privacidade.
>
> A página deve conter hero institucional, manifesto “Sorte não se controla. Organização, sim.”, KPIs históricos derivados automaticamente, linha do tempo, pausa 2017–2022, cards das edições, premiações em seção secundária, metodologia, legenda de proveniência e CTA para a Mega da Virada 2026.
>
> Integre a página ao sitemap, navegação e índices públicos adequados somente após confirmar a arquitetura atual do repositório. Não duplique dados históricos no HTML; a fonte única deve ser o JSON.
>
> Antes de concluir, execute os testes existentes e os novos testes de schema, consistência e privacidade. Documente qualquer divergência encontrada entre o dataset histórico e o código/site atual.

---

## 24. Síntese estratégica

O valor desse histórico não está em tentar provar que o Super Bolão teve mais sorte do que o esperado.

Ele demonstra algo mais defensável e relevante para confiança:

> **edição após edição, quando o projeto esteve ativo, houve organização, registro, conferência e continuidade — independentemente do resultado do sorteio.**

A pausa de 2017–2022 faz parte dessa história e deve ser explicada de forma simples e factual, pois decorreu da suspensão voluntária dos projetos enquanto o administrador esteve fora do país em missão oficial.

A página histórica deve funcionar como uma **prova documental de maturidade e compromisso**, apoiando a campanha atual sem substituir a landing page comercial.

Mensagem final recomendada:

> **Nossa história não é uma promessa de prêmio. É uma evidência de compromisso.**
