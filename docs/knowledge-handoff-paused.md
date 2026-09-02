# Canonical Knowledge Dataset — handoff completo (PAUSADO)

> **Status:** PAUSADO por decisão do mantenedor em 2026-09-02.  
> **Não abrir PR, não fazer merge e não integrar esta branch em produção até retomada explícita.**

## 1. Objetivo original

Criar uma camada canônica de conhecimento conversacional reutilizável pelo ecossistema Bolões do Borges — especialmente futuros agentes Telegram, WhatsApp, Facebook e web — sem criar uma nova fonte de verdade concorrente e sem alterar os consumidores existentes durante a fase fundacional.

A necessidade surgiu da análise conjunta da FAQ pública e das perguntas esperadas durante a campanha da Mega da Virada. A FAQ atual é adequada como documentação editorial, mas o atendimento de campanha exige reconhecer múltiplas formulações de uma mesma intenção, distinguir fatos estáveis de fatos operacionais mutáveis e aplicar guardrails em temas sensíveis.

## 2. Decisão arquitetural principal

A arquitetura proposta preserva três responsabilidades:

1. **`faq.json`** — autoridade editorial pública para respostas/regras estáveis já documentadas;
2. **`data/estado-operacional.json`** — autoridade para fatos mutáveis, como abertura, fechamento, disponibilidade e demais estados atuais;
3. **`data/knowledge/`** — camada conversacional para intents, exemplos linguísticos, respostas adaptadas, guardrails, metadados e referências às fontes autoritativas.

A knowledge layer **não deve redefinir silenciosamente fatos pertencentes à FAQ, termos, políticas, histórico sanitizado ou estado operacional**.

## 3. Por que não transformar `data/knowledge` imediatamente na fonte da FAQ

Essa alternativa foi deliberadamente rejeitada na fase fundacional porque `faq.json` já possui consumidores, geradores e sincronização para o novo site. Inverter imediatamente a direção para `knowledge -> faq.json` ampliaria o escopo e o risco antes de validar o contrato conversacional.

A possibilidade pode ser reavaliada depois que a camada estiver madura e tiver consumidores reais.

## 4. Tipos de resposta projetados

### `canonical`
Para conteúdo estável sustentado por FAQ, termos, políticas ou documentação aprovada.

### `dynamic`
Para perguntas cujo fato atual precisa ser resolvido no momento da resposta. Exemplos: disponibilidade, abertura, fechamento e outras condições operacionais. Não copiar esses valores como texto estático.

### `hybrid`
Combina explicação estável com informação operacional resolvida no momento do consumo. O conteúdo estável nunca deve sobrescrever o estado atual.

### `human`
Para informação que não deve ser inventada ou exposta automaticamente sem fonte/contexto apropriado, especialmente dados financeiros sensíveis, exceções não documentadas ou solicitações que exigem atendimento humano.

## 5. Domínios fundacionais trabalhados

A branch recebeu seeds para categorias representativas da campanha e atendimento, incluindo:

- identidade do projeto (`about`);
- confiança e legitimidade (`trust`);
- participação (`participation`);
- pagamentos (`payments`);
- operação (`operations`);
- apostas (`bets`);
- estratégia/IA (`strategy`);
- transparência (`transparency`);
- histórico (`history`);
- premiação (`prizes`);
- conversão/próximo passo (`conversion`);
- escalonamento humano (`human`);
- termos/regras (`legal`);
- contato (`contact`);
- privacidade (`privacy`).

Os seeds demonstram o contrato. **Eles não significam cobertura completa da FAQ ou das perguntas da campanha.**

## 6. Perguntas de campanha que motivaram o desenho

O levantamento anterior identificou grupos de dúvidas recorrentes:

- o que é o Bolões do Borges e quem organiza;
- vínculo ou não com a Caixa;
- como verificar legitimidade e evitar golpe;
- histórico e continuidade do projeto;
- como participar da Mega da Virada;
- valor, parcelas, vagas e prazo atual;
- PIX, segregação de recursos, taxas e prestação de contas;
- como números/apostas são definidos;
- papel da IA e estatística;
- se IA aumenta chances ou prevê números;
- quantidade e composição de apostas;
- registro na Caixa e acesso a comprovantes;
- resultados históricos, quadras/quinas e ausência de prêmio principal;
- ROI, taxa de retorno e taxa de acerto;
- cadastro, canais, acompanhamento e termos antes do pagamento.

A principal conclusão editorial foi que a FAQ atual atende principalmente quem já está avaliando o funcionamento, enquanto a campanha receberá perguntas de **pré-confiança e conversão**, frequentemente mais curtas, diretas e céticas.

## 7. Guardrails editoriais fundamentais

### Caixa

Nunca afirmar vínculo, autorização, chancela ou representação da Caixa que não exista. O projeto é privado/independente conforme as fontes públicas vigentes.

### IA, estatística e probabilidade

Nunca afirmar que IA prevê números sorteados, garante prêmio, elimina aleatoriedade ou produz vantagem matemática não demonstrada. Diferenciar organização/cobertura/seleção de combinações de capacidade preditiva.

### Histórico

A comunicação histórica deve privilegiar governança, documentação, continuidade, rastreabilidade e prestação de contas, não performance financeira.

Princípios editoriais já definidos:

- **“Não prometemos sorte. Demonstramos método, controle e prestação de contas.”**
- **“Resultado é aleatório. Governança não é.”**
- mostrar também edições sem premiação relevante;
- não usar ROI, taxa de sucesso ou prêmio acumulado como argumento promocional;
- não transformar ausência de dado em zero;
- usar `confirmado`, `calculado`, `não_localizado` e, quando aplicável, `projeto_suspenso`;
- 2017–2022: projeto suspenso porque o administrador esteve fora do Brasil em missão oficial; não expor detalhes profissionais desnecessários.

### Privacidade

Não colocar no knowledge dataset nomes/listas de participantes, CPF, telefone, e-mail, dados bancários/PIX, IDs privados, tokens, links privados ou outros dados pessoais/segredos. Perguntas reais usadas para evolução futura devem ser sanitizadas e convertidas em formulações genéricas.

## 8. Histórico Mega da Virada relacionado

A documentação existente `docs/plano-historico-mega-da-virada-transparencia.md` permanece referência para a futura camada histórica.

O knowledge dataset não deve inventar fatos históricos nem absorver diretamente planilhas privadas. A arquitetura prevista é publicar primeiro um dataset histórico sanitizado/versionado e somente depois permitir que intents históricas o consultem como fonte factual.

## 9. Validação implementada/projetada na branch

Foi preparada uma suíte Node sem dependências externas, adequada ao fato de o repositório não possuir `package.json` raiz. A intenção é validar:

- JSON parseável;
- coerência de `schemaVersion`/VERSION;
- IDs únicos;
- coerência entre nome do arquivo, `domain` e prefixo do ID;
- exemplos válidos e ausência de exemplos duplicados entre intents;
- existência e autoridade das referências locais;
- uso de resolver/fonte operacional para `dynamic`/`hybrid`;
- presença de `mustInclude`/`mustNotClaim` em intents sensíveis;
- ausência de padrões óbvios de segredo/PII;
- ausência de tokens de rota/scripts em respostas;
- cobertura dos domínios fundacionais;
- ausência de wiring de produção nesta fase.

O entrypoint local preparado é:

```bash
bash scripts/validate-knowledge-local.sh
```

Também foi preparado workflow dedicado `.github/workflows/validate-knowledge.yml`.

## 10. Documentação produzida na branch

Durante a preparação foram criados documentos para registrar a arquitetura e facilitar a retomada, incluindo temas como:

- arquitetura do knowledge dataset;
- requisitos/matriz de requisitos;
- autoridade e precedência das fontes;
- política editorial/guardrails;
- governança de mudanças;
- contrato de consumidores futuros;
- rollout gradual;
- análise de lacunas FAQ × campanha;
- ADR da arquitetura;
- fluxo de dados;
- checklist de revisão;
- decisões adiadas;
- critérios de aceite;
- resumo executivo;
- registro de riscos;
- plano de testes;
- notas de implementação;
- manutenção;
- gates de integração futura;
- descrição planejada da PR;
- não objetivos;
- versionamento.

Este arquivo é o ponto de entrada recomendado para a retomada.

## 11. O que NÃO foi feito

Na pausa atual:

- **nenhuma PR deve ser aberta**;
- nada deve ser mergeado em `main`;
- nenhum consumidor de produção deve ler `data/knowledge`;
- Telegram não foi integrado;
- WhatsApp não foi integrado;
- Facebook não foi integrado;
- n8n não foi alterado por esta iniciativa;
- páginas públicas não devem ser alteradas por esta fundação;
- `faq.json` não deve ser substituído;
- `data/estado-operacional.json` não deve perder sua autoridade;
- não há banco/telemetria/persistência de conversas como parte desta proposta.

## 12. Estado da branch ao pausar

Branch de trabalho:

`feat/canonical-knowledge-dataset`

A branch contém muitos commits pequenos porque a construção foi realizada incrementalmente pelo conector GitHub. Antes de qualquer PR futura, **não assumir que o histórico atual deve ser enviado como está**.

Na retomada, revisar o diff integral contra `main` e considerar reconstruir/squashar a implementação em uma branch limpa para obter histórico legível e auditável.

## 13. Procedimento obrigatório para retomada

Quando o trabalho for retomado:

1. buscar o `main` atual e verificar mudanças ocorridas durante a pausa;
2. reler este handoff e os documentos de arquitetura;
3. comparar `feat/canonical-knowledge-dataset` com o novo `main`;
4. verificar se FAQ, estado operacional, novo site ou contratos relacionados mudaram;
5. revisar todos os arquivos da branch, não apenas os últimos commits;
6. executar/validar a suíte completa;
7. corrigir inconsistências encontradas;
8. decidir entre manter a branch ou reconstruir uma branch limpa/squashada;
9. somente então completar a cobertura editorial planejada;
10. abrir PR fundacional separada, ainda sem integração de produção;
11. revisar CI/diff da PR;
12. após merge e período de validação, iniciar integrações em PRs independentes.

## 14. Próxima fase planejada após a fundação

### Fase A — cobertura editorial

Mapear sistematicamente a FAQ e as perguntas previstas da campanha para intents. Quando uma pergunta revelar regra pública ausente, atualizar primeiro a fonte competente, em vez de criar uma resposta paralela apenas no knowledge dataset.

### Fase B — histórico sanitizado

Publicar/validar dataset histórico público sanitizado antes de responder automaticamente fatos históricos detalhados.

### Fase C — primeiro consumidor

O agente Telegram é o primeiro consumidor recomendado porque já existe fluxo de agente. A integração deve ter fallback integral para o comportamento anterior e não introduzir persistência de dados pessoais.

### Fase D — demais canais

WhatsApp, Facebook e web devem reutilizar o mesmo contrato e acrescentar apenas adaptadores de canal/tom, sem alterar fatos ou guardrails.

## 15. Gates mínimos para uma futura integração

Uma integração deverá demonstrar:

- pergunta conhecida -> intent correta;
- pergunta ambígua/baixa confiança -> fallback seguro;
- `canonical` -> fonte/guardrails respeitados;
- `dynamic` -> resolver consultado antes de afirmar estado atual;
- resolver indisponível -> nenhuma suposição favorável;
- `hybrid` -> parte estável não sobrescreve estado atual;
- `human` -> escalonamento sem inventar informação;
- nenhuma exposição de dados privados em logs;
- rollback/desligamento simples;
- comportamento anterior preservado durante rollout.

## 16. Decisões deliberadamente adiadas

Não decidir até haver requisitos concretos de integração:

- classificador determinístico, embeddings, LLM ou híbrido;
- mecanismo de entrega do dataset ao gateway/n8n;
- telemetria, retenção e métricas;
- templates/adaptação por canal;
- eventual inversão futura `knowledge -> faq.json`;
- consulta ao dataset histórico;
- quais informações financeiras podem ser automatizadas e em quais contextos autenticados.

## 17. Critério para considerar a fundação pronta no futuro

O merge fundacional só deve ocorrer quando:

- branch estiver atualizada contra `main`;
- diff integral tiver sido revisado;
- FAQ/site/sync/estado existentes permanecerem compatíveis;
- schema, VERSION, seeds, validador e documentação estiverem coerentes;
- suíte local e CI passarem;
- guardrails sensíveis estiverem cobertos;
- não houver wiring de produção;
- estiver claro na PR que o merge aprova **arquitetura/contrato**, não cobertura completa nem ativação do atendimento.

## 18. Instrução final de pausa

Até nova decisão explícita do mantenedor, esta iniciativa deve permanecer congelada na branch `feat/canonical-knowledge-dataset` como material de pesquisa e implementação futura.

**Não abrir PR automaticamente a partir desta branch. Não integrar. Não mergear.**
