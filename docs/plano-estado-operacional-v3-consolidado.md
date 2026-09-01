# Plano de evolução — `estado-operacional.json` como fonte pública consolidada

**Status:** plano para reanálise posterior — **não implementar automaticamente a partir deste documento**  
**Data de registro:** 2026-08-31  
**Escopo:** `Apps_Scripts` + `boloesdoborges` + `novo-site` + `fluxos_n8n`  
**Objetivo principal:** evoluir `data/estado-operacional.json` para uma fonte pública única, rica, estruturada, sanitizada e determinística do estado atual dos nove projetos, consumível igualmente pelos sites e pelos agentes WhatsApp/Telegram.

---

## 1. Decisão arquitetural proposta

`estado-operacional.json` deve se tornar a **projeção canônica pública consolidada do estado atual do ecossistema**, mas não deve virar o lugar onde todas as regras são cadastradas manualmente.

As fontes primárias continuam separadas por responsabilidade:

- **Apps Scripts dos projetos:** eventos operacionais reais, abertura, fechamento, fase e contexto do projeto;
- **`LoteriasGeral/calendarioCaixa.js`:** calendário oficial da CAIXA, dias/horários de sorteio e exceções;
- **APIs/mirrors CAIXA:** concurso, prêmio, resultado e demais fatos oficiais correntes;
- **grade operacional dos projetos:** horários usuais de abertura/fechamento, lembretes e cenários normal/especial/tardio/domingo;
- **`verifDataApuracao.js`:** horários técnicos internos de lembrete e conferência/apuração.

O `estado-operacional.json` deve materializar apenas o resultado já resolvido dessas fontes para o projeto/ciclo atual.

### Princípio

```text
FONTES INTERNAS
  │
  ├─ Apps Scripts / estado real
  ├─ Calendário CAIXA
  ├─ APIs CAIXA
  ├─ Grade operacional
  └─ Horários técnicos
       │
       ↓
RESOLVEDOR / AGREGADOR DETERMINÍSTICO
       │
       ↓
estado-operacional.json
       │
       ├─ site público
       ├─ novo-site
       ├─ WhatsApp / n8n
       └─ Telegram / n8n
```

O LLM não deve reconstruir essas relações por inferência.

---

## 2. Estado atual comprovado

### 2.1 O agregado v2 já existe

`data/estado-operacional.json` está em `schemaVersion: 2` e contém os nove projetos canônicos:

- `lf-mensal`
- `quina-mensal`
- `ds-mensal`
- `lf-independencia`
- `quina-saojoao`
- `ds-pascoa`
- `mega-virada`
- `mega-50mais`
- `milionaria`

Campos atuais incluem, em essência:

- `slug`
- `nome`
- `tipo`
- `estado`
- `ativo`
- `fase`
- `concurso`
- `abreEm`
- `fechaEm`
- `timezone`
- `janelaComunidade`
- `contexto`
- `atualizadoEm`
- `correlationId`
- `fonteEstado`

### 2.2 O gerador Node já é generalizado

`scripts/update-mensais-alert.js` já reconhece os nove projetos e consegue atualizar um registro preservando os outros oito, com sanitização e reconstrução segura do esqueleto.

O nome do script é legado; sua responsabilidade já ultrapassa os Mensais.

### 2.3 Os Estratégicos já possuem esteira rica

Mega 50+ e +Milionária já criam contrato operacional com dados reais de janela e enviam ao GitHub, entre outros:

- concurso;
- `correlationId`;
- estado;
- `abreEm`;
- `fechaEm`;
- timezone;
- `atualizadoEm`.

Os workflows `set-mega-50mais-alert.yml` e `set-milionaria-alert.yml` persistem também `data/estado-operacional.json` no commit.

### 2.4 Mensais e Especiais ainda não fecham a esteira consolidada

Os workflows de Mensais e Especiais executam o mesmo atualizador Node, mas em geral fazem commit apenas do `*-alert.json` individual.

Consequência: o script pode modificar `estado-operacional.json` dentro do runner, mas essa alteração é descartada ao final da Action.

Exemplo observado em 2026-08-31/2026-09-01:

- `quina-mensal-alert.json`: `ativo: true`;
- `estado-operacional.json`: `quina-mensal` ainda `INDISPONIVEL`.

Essa divergência comprova que o agregado ainda não é uma fonte viva uniforme para os nove projetos.

### 2.5 Mensais ainda despacham contrato pobre em alguns caminhos

Há caminhos locais dos Mensais que enviam essencialmente apenas `ativo=true/false` ao workflow.

Faltam, conforme o projeto/caminho:

- concurso real;
- `abreEm`;
- `fechaEm`;
- fase;
- contexto público;
- correlação completa;
- data/hora da transição.

### 2.6 Especiais possuem contrato mais rico no Apps Script do que no workflow público

Os quatro Especiais já têm automação de janela pública baseada em `dataLimite` e contrato temporal, normalmente com janela contratual `00:00 → 23:59` no dia configurado, retries e persistência em `ScriptProperties`.

Porém os workflows públicos simplificados ainda recebem principalmente `ativo` e não preservam todo o contrato no agregado.

### 2.7 Calendário CAIXA permanece separado

`data/calendario-caixa.json` existe e é derivado da fonte canônica de `LoteriasGeral`.

Atualmente contém grade oficial, por exemplo:

- Mega-Sena: terça/quinta 21h; domingo 11h;
- +Milionária: quarta 21h; domingo 11h;
- Lotofácil: segunda–sexta 21h; domingo 11h;
- Quina: segunda–sexta 21h; domingo 11h;
- Dupla Sena: segunda/quarta/sexta 21h.

Esse arquivo não deve ser substituído pelo `estado-operacional.json`; o agregado deve apenas receber o **fato resolvido pertinente ao ciclo atual**.

### 2.8 Horários técnicos também estão separados

`verifDataApuracao.js` contém hoje:

- conferência técnica regular: `21:20`;
- conferência técnica dominical: `12:20`;
- lembrete regular: `19:00`;
- lembrete dominical: `10:30`.

Esses horários não são horários oficiais da CAIXA e devem permanecer semanticamente distintos.

---

## 3. Três relógios que nunca podem ser confundidos

### 3.1 CAIXA

- `sorteioCaixaEm`
- `limiteApostaCaixaEm` quando houver fonte oficial confirmada
- eventuais limites específicos por canal CAIXA

### 3.2 Comunidade

- `abreEm`
- `fechaEm`
- `aceitandoAdesoes`
- alertas e última chamada

### 3.3 Processamento interno

- `lembreteSorteioEm`
- `conferenciaResultadoEm`
- outros marcos técnicos internos

Exemplo conceitual:

```text
sábado 12:00  fechamento da Comunidade
sábado 22:00  eventual limite oficial CAIXA para aposta simples
domingo 10:30 lembrete interno
domingo 11:00 sorteio oficial CAIXA
domingo 12:20 conferência técnica do resultado
```

Nenhum desses horários deve ser derivado automaticamente de outro.

---

## 4. Grade operacional existente nos Apps Scripts

Essas regras devem ser centralizadas como fonte interna e depois resolvidas para o agregado, sem duplicação manual.

### 4.1 Mega 50+

**Cenário normal**

- 09:00 aviso
- 12:00 aviso
- 17:00 aviso
- 17:45 alerta final
- 17:55 última chamada
- 18:00 fechamento

**Especial**

- 13:00 aviso
- 17:00 aviso
- 19:00 aviso
- 19:45 alerta final
- 19:55 última chamada
- 20:00 fechamento

**Início tardio**

- abertura real ocorre após o fluxo efetivo;
- lembretes 17:00/19:00;
- fechamento 20:00.

**Importante:** `09:00` não deve virar `abreEm`. O `abreEm` correto é o instante real em que a campanha foi efetivamente aberta.

### 4.2 +Milionária

**Normal**

- 09:00
- 12:00
- 17:00
- 17:45
- 17:55
- 18:00 fechamento

**Sábado visando sorteio dominical**

- 08:00
- 10:00
- 11:00
- 11:45 alerta final
- 11:55 última chamada
- 12:00 fechamento

**Especial/tardio**

- 13:00
- 17:00
- 19:00
- 19:45
- 19:55
- 20:00 fechamento

### 4.3 LF Mensal / Quina Mensal / DS Mensal

Os três projetos compartilham uma matriz operacional muito semelhante.

**Dia normal**

- grupo/comunidade: `08:00 → 12:00`
- individuais: `08:00 → 11:45`

**Véspera / janela noturna**

- grupo/comunidade: `22:00 → 23:59`
- individuais: `22:30 → 23:45`

**Domingo migrado**

- grupo/comunidade: `13:00 → 18:00`
- individuais: `13:00 → 17:55`

Essa matriz deve ser centralizada em perfil compartilhado com overrides explícitos, em vez de permanecer replicada nos três projetos.

### 4.4 Especiais

Os quatro Especiais já trabalham com janela pública contratual baseada em `dataLimite`, atualmente em padrão semelhante a:

- abertura contratual: `00:00`;
- fechamento contratual: `23:59`;
- timezone: `America/Sao_Paulo`.

Essa janela pública não deve ser confundida com qualquer outro horário de processamento interno do projeto.

---

## 5. Proposta de `schemaVersion: 3`

O v3 deve continuar preservando os nove projetos e adicionar uma visão temporal e editorial resolvida.

### 5.1 Estrutura sugerida

```json
{
  "schemaVersion": 3,
  "generatedAt": "...",
  "timezone": "America/Sao_Paulo",
  "resumo": {
    "projetosTotal": 9,
    "abertos": 0,
    "emAndamento": 0,
    "aguardandoSorteio": 0,
    "emApuracao": 0
  },
  "projetos": {
    "milionaria": {
      "slug": "milionaria",
      "nome": "+Milionária",
      "tipo": "ESTRATEGICO",
      "estado": "ABERTA",
      "fase": "INSCRICOES",
      "statusPublico": "ABERTO_PARA_ADESAO",
      "ativo": true,
      "concurso": {
        "numero": "...",
        "modalidade": "maismilionaria"
      },
      "comunidade": {
        "aceitandoAdesoes": true,
        "abreEm": "...",
        "fechaEm": "...",
        "cenario": "SABADO"
      },
      "caixa": {
        "sorteioEm": "...",
        "tipoSorteio": "REGULAR",
        "limiteApostaSimplesEm": null,
        "fonte": "CAIXA"
      },
      "processamento": {
        "lembreteSorteioEm": "...",
        "conferenciaResultadoEm": "..."
      },
      "proximoEvento": {
        "tipo": "FECHAMENTO_ADESOES",
        "em": "...",
        "descricao": "Encerramento das adesões"
      },
      "publicacao": {
        "exibir": true,
        "categoria": "ABERTOS",
        "titulo": "+Milionária aberta para adesões",
        "resumo": "Adesões abertas até hoje às 12h.",
        "ordem": 10
      },
      "fontes": {
        "estado": "Apps_Scripts",
        "calendario": "Calendario_CAIXA",
        "concurso": "API_CAIXA"
      },
      "atualizadoEm": "...",
      "correlationId": "..."
    }
  }
}
```

### 5.2 Regra de segurança

`estado: ABERTA` somente pode existir se houver evento operacional explícito confirmado e janela válida.

Calendário, prêmio, dia da semana, existência do projeto ou véspera nunca podem provar abertura.

---

## 6. Fases e estados públicos

A atual dicotomia `ABERTA/FECHADA` é insuficiente para o site.

### 6.1 Fase operacional proposta

- `PROGRAMADO`
- `PRE_ABERTURA`
- `INSCRICOES`
- `ADESOES_ENCERRADAS`
- `AGUARDANDO_SORTEIO`
- `AGUARDANDO_APURACAO`
- `APURANDO`
- `APURADO`
- `PRESTACAO_CONTAS`
- `CONCLUIDO`
- `INDISPONIVEL`

### 6.2 `statusPublico` proposto

- `ABERTO_PARA_ADESAO`
- `EM_ANDAMENTO`
- `ADESOES_ENCERRADAS`
- `AGUARDANDO_SORTEIO`
- `AGUARDANDO_APURACAO`
- `RESULTADO_EM_PROCESSAMENTO`
- `CONCLUIDO`
- `PROGRAMADO`
- `INDISPONIVEL`

`statusPublico` deve ser derivado por regras determinísticas, não pelo frontend ou LLM.

---

## 7. Seção “Atualizações” dos sites

A futura seção pode consumir exclusivamente o agregado.

Exemplos:

### Abertos para adesão

```text
🟢 +Milionária — inscrições abertas
Adesões até hoje às 12h.
Sorteio da CAIXA: domingo às 11h.
```

### Aguardando sorteio

```text
🔵 Mega 50+
Adesões encerradas.
Sorteio hoje às 21h.
```

### Em apuração

```text
🟣 Lotofácil Mensal
Sorteio realizado.
Conferência automática em andamento.
```

O site deve apenas renderizar o estado resolvido; não deve reimplementar lógica de calendário ou operação.

---

## 8. `proximoEvento`

Adicionar ao contrato um evento futuro já resolvido, por exemplo:

```json
{
  "tipo": "FECHAMENTO_ADESOES",
  "em": "...",
  "descricao": "Encerramento das adesões"
}
```

Após o fechamento, o próximo pode ser:

```json
{
  "tipo": "SORTEIO_CAIXA",
  "em": "...",
  "descricao": "Sorteio da +Milionária"
}
```

Depois do sorteio:

```json
{
  "tipo": "CONFERENCIA_RESULTADO",
  "em": "..."
}
```

Isso permite UI e IA sem inferência temporal.

---

## 9. Fonte interna de grade operacional

Criar no `LoteriasGeral` uma fonte canônica compartilhada para horários operacionais, por exemplo:

`libs/LoteriasGeral/src/gradeOperacionalProjetos.js`

Ela deve representar:

- perfis recorrentes;
- cenários;
- horários planejados;
- regras de fechamento;
- alertas;
- overrides explícitos por projeto.

Não deve produzir `ABERTA` por conta própria.

### API sugerida

```js
resolverGradeOperacionalProjeto(projeto, contexto)
```

Retorno conceitual:

```json
{
  "projeto": "milionaria",
  "cenario": "SABADO",
  "fechaPlanejado": "12:00",
  "avisos": ["08:00", "10:00", "11:00"],
  "alertaFinal": "11:45",
  "ultimaChamada": "11:55"
}
```

O `abreEm` efetivo deve continuar vindo do evento real do projeto.

---

## 10. Evolução do calendário CAIXA

Preservar `calendarioCaixa.js` como fonte primária de calendário.

Completar progressivamente:

- exceções de concursos especiais;
- horários especiais explicitamente confirmados;
- `limiteApostaCaixaEm` quando houver fonte oficial confiável;
- eventual separação por canal (`simples`, `bolaoDigital`, etc.) quando necessário.

Concurso especial sem exceção explícita deve permanecer fail-safe (`NAO_CONFIRMADO`).

---

## 11. Agregador central

Criar um resolvedor determinístico que combine:

1. estado real publicado pelo Apps Script;
2. grade operacional aplicável;
3. calendário CAIXA;
4. APIs/mirrors CAIXA;
5. horários técnicos;
6. contexto público sanitizado.

O resolvedor deve gerar o v3 e nunca chamar LLM.

### Saída principal

`data/estado-operacional.json`

### Possível nome do módulo

- `resolverEstadoPublicoConsolidado`
- `gerarEstadoOperacionalV3`

---

## 12. Padronização dos nove produtores

Todos os nove projetos devem publicar o mesmo envelope operacional mínimo.

### Envelope mínimo sugerido

```json
{
  "projeto": "...",
  "eventoOperacionalConfirmado": true,
  "estado": "ABERTA",
  "fase": "INSCRICOES",
  "concurso": "...",
  "abreEm": "...",
  "fechaEm": "...",
  "timezone": "America/Sao_Paulo",
  "correlationId": "...",
  "atualizadoEm": "...",
  "contextoPublico": {}
}
```

### Requisitos

- Mensais não podem mais despachar apenas `ativo` quando houver contexto suficiente para contrato completo;
- Especiais devem transportar até o GitHub o contrato rico já existente no Apps Script;
- Estratégicos devem preservar o comportamento atual.

---

## 13. Workflows GitHub

### Problema atual

Mensais/Especiais executam o agregador, mas vários workflows fazem commit apenas do `*-alert.json`.

### Evolução

Todos os nove workflows devem:

1. receber o contrato padronizado;
2. executar o gerador;
3. validar o schema;
4. sanitizar;
5. atualizar somente o projeto alvo;
6. preservar os outros oito;
7. adicionar `data/estado-operacional.json` ao commit quando houver mudança;
8. ser idempotentes;
9. usar concorrência adequada para impedir corrida entre atualizações simultâneas.

Avaliar substituir nove implementações repetidas por um workflow reutilizável.

---

## 14. Concorrência e idempotência

O agregado é um arquivo compartilhado. Portanto é necessário proteger contra dois projetos atualizando-o ao mesmo tempo.

Requisitos:

- atualização read-modify-write preservando os demais registros;
- retry de push em caso de conflito;
- `concurrency` por agregado ou mecanismo equivalente;
- correlationId por transição;
- atualizar um projeto nunca pode alterar os outros oito;
- repetir a mesma transição deve produzir o mesmo estado sem ruído de commits desnecessários.

---

## 15. Sanitização

Continuar proibindo qualquer dado sensível ou operacional privado, incluindo:

- token/secret/password;
- IDs de planilhas e Drive;
- PIX;
- IDs/números de WhatsApp;
- IDs internos de grupos;
- credenciais;
- cookies/authorization;
- URLs internas;
- IPs privados;
- dados pessoais.

O schema público deve ser allowlist-first.

---

## 16. Unificação da validação Apps Script ↔ Node

Hoje há diferença de rigor:

- `LoteriasGeral/estadoOperacional.js` exige janela válida e evento confirmado para `ABERTA`;
- o atualizador Node ainda consegue interpretar `ativo=true` como `ABERTA` mesmo com campos temporais vazios.

Isso deve ser eliminado.

### Regra alvo

```text
ABERTA
somente se:
  eventoOperacionalConfirmado = true
  + abreEm válido
  + fechaEm válido
  + agora dentro da janela quando aplicável
```

Falha ou contrato incompleto:

```text
INDISPONIVEL
```

Nunca inferir abertura.

---

## 17. Sites

### Site público

Já consome `estado-operacional.json` v2 e aplica validação temporal/frescor.

No v3 deve:

- consumir o contrato consolidado;
- renderizar `statusPublico`, `fase`, `proximoEvento` e `publicacao`;
- criar seção “Atualizações”;
- evitar lógica de negócio local;
- manter fail-safe quando o arquivo estiver ausente ou stale.

### `novo-site`

Hoje a sincronização copia principalmente `*-alert.json` individuais.

Deve passar a receber e/ou consumir a mesma projeção consolidada.

Objetivo final:

```text
mesmo estado-operacional.json
→ ambos os sites
```

Os arquivos `*-alert.json` podem permanecer temporariamente por compatibilidade e depois ser reavaliados.

---

## 18. n8n / agentes

### Situação atual

Os agentes já distinguem `Estado_Operacional` e `Calendario_CAIXA`.

### Evolução proposta

Após o v3, criar uma ferramenta de leitura consolidada, por exemplo:

- `Estado_Projeto`
- `Agenda_Projeto`
- `Estado_Operacional_V3`

Ela deve responder diretamente a perguntas como:

- está aberto?
- até que horas posso aderir?
- quando fecha?
- quando é o sorteio?
- que horas sorteia?
- quando vocês conferem o resultado?
- qual é o próximo evento do projeto?

Ferramentas especializadas podem continuar disponíveis para diagnóstico, mas o caminho editorial normal deve preferir a projeção consolidada.

### Regras semânticas obrigatórias

- `comunidade.fechaEm` = prazo da Comunidade;
- `caixa.sorteioEm` = horário oficial do sorteio;
- `caixa.limiteAposta...` = prazo da CAIXA;
- `processamento.conferenciaResultadoEm` = rotina interna.

Nunca usar um como substituto do outro.

---

## 19. Histórico de atualizações

`estado-operacional.json` deve representar a fotografia atual.

Se a seção “Atualizações” evoluir para feed histórico, criar artefato separado, por exemplo:

`data/atualizacoes-operacionais.json`

Exemplo:

```json
{
  "eventos": [
    {
      "id": "...",
      "projeto": "mega-50mais",
      "tipo": "ADESOES_ENCERRADAS",
      "ocorridoEm": "...",
      "titulo": "Adesões encerradas"
    }
  ]
}
```

Não transformar `estado-operacional.json` em log infinito.

---

## 20. Plano de execução sugerido

### P1 — congelar e testar o estado atual

- congelar v2 como referência de compatibilidade;
- testes para nove projetos;
- registrar as divergências atuais entre alertas individuais e agregado;
- garantir que produção permaneça intacta.

### P2 — padronizar produtores

- Estratégicos: preservar contrato atual;
- Mensais: migrar de `ativo` para envelope completo;
- Especiais: preservar contrato completo até o workflow;
- testes locais sem executar Apps Script.

### P3 — grade operacional canônica

- criar módulo compartilhado;
- extrair horários hoje duplicados dos projetos;
- manter comportamento exatamente equivalente;
- adicionar testes de matriz temporal.

### P4 — agregador v3

- combinar estado, calendário, grade, APIs e horários técnicos;
- criar `statusPublico`, `fase`, `proximoEvento`, `publicacao`, `fontes`;
- manter sanitização rigorosa.

### P5 — GitHub Actions

- persistir o agregado para os nove projetos;
- tratar concorrência;
- idempotência;
- validar schema antes do commit.

### P6 — calendário CAIXA enriquecido

- completar exceções especiais;
- adicionar limites oficiais de aposta somente quando confirmados;
- validar drift.

### P7 — sites

- migrar os dois sites para o agregado v3;
- criar seção “Atualizações”;
- preservar fallback seguro;
- manter `*-alert.json` apenas se necessário por compatibilidade.

### P8 — agentes n8n

- criar resolvedor/tool consolidado;
- usar o mesmo contrato em WhatsApp e Telegram;
- remover lógica editorial redundante dos prompts.

### P9 — histórico opcional

- avaliar `atualizacoes-operacionais.json` após o v3 estar estável.

### P10 — auditoria final

- end-to-end dos nove projetos;
- dois sites;
- WhatsApp;
- Telegram;
- indisponibilidade de cada fonte;
- corrida simultânea;
- stale data;
- concurso divergente;
- especial sem horário confirmado;
- sanitização completa.

---

## 21. Matriz mínima de testes

### Estado

- ABERTA com janela válida;
- FECHADA;
- INDISPONIVEL;
- contrato incompleto;
- estado stale;
- `abreEm` futuro;
- `fechaEm` passado.

### Projeto

- Mega 50+ normal;
- Mega 50+ tardia/especial;
- +Milionária normal;
- +Milionária sábado;
- +Milionária tardia;
- três Mensais: normal, véspera e domingo migrado;
- quatro Especiais.

### CAIXA

- sorteio noturno 21h;
- sorteio dominical 11h;
- dia sem sorteio;
- especial com override;
- especial sem override → `NAO_CONFIRMADO`.

### Semântica

Perguntas obrigatórias:

- “Está aberto?”
- “Até que horas posso participar?”
- “Já fechou?”
- “Que horas é o sorteio?”
- “Que horas vocês conferem o resultado?”
- “Fecha ao meio-dia; o sorteio também é ao meio-dia?”
- “O prêmio está alto, posso participar?”

### Concorrência

- dois projetos atualizados quase simultaneamente;
- atualização de um projeto não altera os outros oito;
- retry após conflito de push.

### Segurança

Garantir ausência de:

- `planilhaId`;
- IDs Drive;
- PIX;
- WhatsApp IDs;
- tokens;
- secrets;
- URLs internas;
- credenciais;
- PII.

---

## 22. Critérios de aceite final

O projeto só pode ser considerado concluído quando:

1. os nove projetos atualizam automaticamente o agregado;
2. não há divergência entre alerta individual e estado consolidado;
3. `ABERTA` nunca é inferido de calendário/prêmio;
4. horários da Comunidade, CAIXA e processamento são semanticamente separados;
5. calendário oficial do concurso atual está materializado no registro do projeto;
6. os dois sites consomem a mesma fonte pública;
7. a seção “Atualizações” pode ser renderizada sem lógica de negócio local;
8. WhatsApp e Telegram usam o mesmo contrato;
9. atualizações simultâneas não perdem estado de outro projeto;
10. sanitização e fail-safe passam em testes;
11. o v2 permanece compatível durante a migração ou há plano explícito de corte;
12. nenhuma alteração exige expor segredo ou dado interno.

---

## 23. Pontos a reanalisar antes da implementação

Antes de executar este plano, revisar especialmente:

1. se `schemaVersion: 3` deve ser aditivo ao v2 ou introduzir estrutura paralela temporária;
2. se a grade operacional deve viver em `LoteriasGeral` ou em módulo dedicado compartilhado;
3. se os nove workflows devem ser mantidos ou substituídos por workflow reutilizável;
4. estratégia de concorrência no arquivo único;
5. quais fatos da API CAIXA devem ser materializados e por quanto tempo são considerados frescos;
6. política de stale para cada tipo de campo;
7. quais concursos especiais já possuem horário oficial confirmado;
8. se `novo-site` deve copiar o JSON ou consumi-lo diretamente do site público;
9. quando descontinuar os `*-alert.json` individuais;
10. necessidade real e formato do histórico de atualizações.

---

## 24. Resumo da direção proposta

A direção desejada é:

```text
estado-operacional.json v3
= fotografia pública consolidada e confiável do presente

calendarioCaixa.js
= fonte primária das regras oficiais de sorteio

gradeOperacionalProjetos.js
= fonte primária das regras horárias da Comunidade

Apps Scripts
= fonte dos eventos operacionais reais

APIs CAIXA
= fonte de concurso/prêmio/resultado
```

Sites e agentes devem consumir preferencialmente a fotografia consolidada, enquanto as fontes especializadas permanecem independentes, testáveis e auditáveis.

**Este documento registra a proposta para reanálise posterior. Não autoriza alteração automática de produção.**
