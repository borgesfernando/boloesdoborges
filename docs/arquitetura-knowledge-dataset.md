# Arquitetura — Knowledge Dataset Canônico

## Objetivo

Adicionar uma camada estruturada de conhecimento conversacional ao ecossistema Bolões do Borges sem substituir nem duplicar as fontes de verdade já existentes.

A camada deve permitir que futuros consumidores — Telegram, WhatsApp, Facebook, atendimento web e outros agentes — reconheçam intenções, variações de linguagem, respostas editoriais e guardrails, mantendo rastreabilidade até as fontes existentes.

## Estado atual verificado

### FAQ editorial

`faq.json` é a fonte de verdade editorial da FAQ.

Derivados atuais:

- `faq.html`, gerado por `scripts/generate-faq-html.js`;
- `minifaq.json`, gerado por `scripts/summarize-faq.js`;
- `src/data/faq.json` do repositório `borgesfernando/novo-site`, sincronizado por `.github/workflows/sync-faq-novo-site.yml`.

A nova camada não altera essa relação nesta fase.

### Estado operacional

`data/estado-operacional.json`, atualmente em `schemaVersion: 2`, é a fonte pública para fatos operacionais mutáveis dos projetos, como estado, fase, concurso e janelas temporais quando disponíveis.

A knowledge layer não deve copiar valores mutáveis desse contrato. Intents que dependam deles devem ser `dynamic` ou `hybrid` e declarar um resolver/fonte operacional.

### Dados históricos

Datasets históricos sanitizados e versionados, como o planejado `data/historico-mega-virada.json`, são fontes específicas para fatos históricos. O knowledge dataset deve referenciá-los, não reproduzir bases históricas inteiras.

## Precedência das fontes

| Tipo de informação | Autoridade | Papel do knowledge dataset |
| --- | --- | --- |
| Texto/regras editoriais estáveis | `faq.json` e documentos institucionais aplicáveis | Referenciar, classificar e adaptar para conversa |
| Estado atual de um projeto | `data/estado-operacional.json` | Resolver dinamicamente; não duplicar |
| Histórico sanitizado | dataset histórico público específico | Referenciar fatos necessários |
| Política editorial/guardrails | documentação aprovada | Codificar `mustInclude` e `mustNotClaim` |
| Variações de perguntas/intents | `data/knowledge/` | Fonte canônica |

Em caso de conflito, o knowledge dataset nunca deve tornar um dado operacional ou editorial divergente em uma nova verdade paralela. O conflito deve falhar na validação ou ser encaminhado para revisão humana.

## Requisitos funcionais

1. IDs de intent estáveis, únicos e independentes do texto da pergunta.
2. Múltiplos exemplos de linguagem natural por intent.
3. Classificação de resposta: `canonical`, `dynamic`, `hybrid` ou `human`.
4. Respostas editoriais curta e padrão; detalhada opcional.
5. Lista opcional de fatos autorizados.
6. Guardrails explícitos com `mustInclude` e `mustNotClaim`.
7. Referências obrigatórias às fontes de autoridade.
8. Relações opcionais entre intents.
9. Resolver obrigatório para intents dinâmicas/híbridas que dependam de estado mutável.
10. Versionamento explícito do schema.
11. Estrutura modular por domínio.
12. Evolução compatível com consumidores multicanal sem acoplamento a Telegram, WhatsApp ou Facebook.

## Requisitos de segurança e privacidade

O dataset deve conter somente informação pública/sanitizada. É proibido inserir:

- tokens, chaves ou segredos;
- IDs privados de WhatsApp/Telegram;
- dados bancários ou chaves PIX;
- CPF, telefone, endereço ou e-mail privado de participante;
- URLs/IDs privados de Drive;
- nomes ou outros identificadores de participantes;
- qualquer informação que permita reconstruir dados privados a partir de metadados.

## Guardrails editoriais

Assuntos de loteria, estratégia, IA, histórico e premiação devem impedir afirmações de:

- previsão de dezenas;
- garantia de prêmio;
- estratégia vencedora;
- retorno esperado superior;
- vantagem matemática garantida;
- ROI/taxa de sucesso usados como argumento promocional;
- vínculo ou autorização institucional da Caixa quando inexistente.

Princípios editoriais herdados da documentação da campanha:

- não prometer sorte;
- separar resultado aleatório de governança;
- mostrar processo e transparência, não performance selecionada;
- preferir `documentado`, `rastreável` e `verificável` a `auditado` quando não houver auditoria externa formal.

## Informação dinâmica

Perguntas como "ainda tem vaga?", "está aberto?", "qual concurso?" e "até quando posso entrar?" não devem receber respostas estáticas no knowledge dataset quando a resposta puder variar.

Exemplo conceitual:

```json
{
  "id": "project.availability",
  "answerType": "dynamic",
  "resolver": "operational_state",
  "sources": [
    { "type": "operational_state", "reference": "data/estado-operacional.json" }
  ]
}
```

O consumidor deve consultar a fonte operacional no momento da resposta. Estado ausente, indisponível ou inválido deve produzir resposta conservadora, nunca inferência de disponibilidade.

## Compatibilidade com a FAQ existente

Nesta fase:

- `faq.json` continua sendo fonte editorial;
- `faq.html` continua sendo gerado a partir de `faq.json`;
- `minifaq.json` continua sendo derivado de `faq.json`;
- o workflow atual continua sincronizando `faq.json` para `novo-site`;
- nenhuma página pública passa a depender do knowledge dataset;
- nenhuma integração de produção é ativada.

Uma eventual inversão futura (`knowledge -> FAQ`) exige projeto e migração próprios, pois alteraria contratos e automações existentes.

## Validação mínima

O validador deve verificar, sem dependências externas:

1. JSON válido em todos os arquivos do dataset;
2. `schemaVersion` suportado;
3. IDs únicos;
4. exemplos não vazios;
5. respostas mínimas presentes;
6. fontes declaradas;
7. `resolver` para `dynamic`/`hybrid` quando aplicável;
8. referências locais existentes para FAQ/documentação/estado operacional;
9. `relatedIntents` apontando para IDs existentes;
10. ausência de padrões óbvios de segredos e dados privados;
11. guardrails obrigatórios nos intents marcados como sensíveis.

## Fases

### Fase 1 — fundação

Schema, documentação, validador e pequeno conjunto de intents representativos. Sem integração de produção.

### Fase 2 — cobertura

Mapear a FAQ e as perguntas de campanha para intents agrupados por confiança, participação, pagamentos, transparência, apostas, IA, histórico e premiação.

### Fase 3 — consumidores

Integrar consumidores um a um, com fallback para comportamento atual e telemetria anonimizada de intent/falha de classificação.

### Fase 4 — aprendizado editorial

Usar perguntas não classificadas e métricas agregadas para propor novas variações/intents, sempre com revisão humana antes da publicação.
