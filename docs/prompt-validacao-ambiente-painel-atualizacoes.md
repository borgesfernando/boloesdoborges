# Prompt final — validar ambiente e colocar o Painel de Atualizações em condição de implementação

Use este prompt **somente no momento em que as PRs do Painel de Atualizações forem efetivamente revisadas/implantadas**. O ambiente pode ter evoluído desde a criação das PRs; portanto, a primeira obrigação é descobrir o estado real atual e comparar com o código proposto.

---

## PROMPT PARA O AGENTE

Você é o agente responsável pela **validação pré-implementação e integração final** do Painel Público de Atualizações Operacionais da Comunidade Bolões do Borges.

### Objetivo

Verifique o ambiente real atual, confronte-o com o plano e com as PRs existentes e deixe a solução em condição comprovadamente funcional **sem quebrar os fluxos operacionais em produção**.

Não presuma que versões, branches, workflows, caminhos, containers, tokens, deploys, bibliotecas Apps Script ou chamadas existentes continuam iguais ao momento em que as PRs foram criadas.

A fonte funcional de referência é:

- plano: `borgesfernando/boloesdoborges/docs/plano-painel-atualizacoes.md`;
- prompt de validação: `borgesfernando/boloesdoborges/docs/prompt-validacao-ambiente-painel-atualizacoes.md`;
- fonte pública autoritativa: `borgesfernando/boloesdoborges/data/estado-operacional.json`, `schemaVersion: 2`;
- repositórios envolvidos:
  - `borgesfernando/novo-site`;
  - `borgesfernando/boloesdoborges`;
  - `borgesfernando/Apps_Scripts`.

### Regra zero — descobrir antes de alterar

Antes de editar, fazer merge, deploy, `clasp push`, executar workflow manual ou alterar container:

1. obtenha os HEADs atuais das branches de produção (`master`/`main`) dos três repositórios;
2. leia as três PRs do recurso e seus diffs completos;
3. verifique se há commits posteriores à base das PRs;
4. identifique conflitos reais, mudanças de arquitetura e arquivos que foram movidos/renomeados;
5. descubra as versões reais atualmente usadas, sem confiar em README antigo;
6. verifique como o `novo-site` está realmente sendo buildado e publicado hoje;
7. verifique como os Apps Scripts relevantes estão realmente sendo implantados hoje (clasp/workflows/processo manual);
8. identifique os workflows GitHub atuais que recebem os dispatches de cada um dos nove projetos;
9. confirme os nomes atuais dos secrets/properties necessários **sem imprimir seus valores**;
10. confirme as rotas públicas atuais dos nove projetos.

Exemplo importante de drift já observado durante o desenvolvimento: documentação anterior mencionava Astro 5, enquanto o `package.json` observado posteriormente já utilizava Astro 7.2.4. Trate isso como evidência de que versões devem ser lidas do ambiente atual.

### Requisito de segurança operacional

A implementação **não pode** alterar regras de prêmio, calendário, geração de apostas, pagamento, reinvestimento, sorteio, apuração ou comunicação apenas para fazer o painel funcionar.

O painel é consumidor do estado operacional; ele não deve se tornar produtor de regra de negócio.

Não deduza `ABERTA` por:

- prêmio estimado;
- dia da semana;
- calendário CAIXA;
- `mega-status.json`;
- arquivos editoriais;
- `*-alert.json` isoladamente;
- horário aproximado;
- ausência de fechamento.

Somente evento operacional confirmado + contrato completo pode publicar `estado: ABERTA`.

### Primeiro checkpoint obrigatório

Produza, antes de qualquer alteração, uma tabela semelhante a:

| Componente | Esperado pelas PRs | Encontrado agora | Compatível? | Ação necessária |
|---|---|---|---|---|
| Apps_Scripts branch/base | ... | ... | sim/não | ... |
| LoteriasGeral | ... | ... | sim/não | ... |
| workflows dos 9 projetos | ... | ... | sim/não | ... |
| boloesdoborges schema v2 | ... | ... | sim/não | ... |
| sync para novo-site | ... | ... | sim/não | ... |
| Astro/Node | ... | ... | sim/não | ... |
| deploy novo-site | ... | ... | sim/não | ... |
| rotas dos projetos | ... | ... | sim/não | ... |

Se houver incompatibilidade, adapte a PR ao ambiente real com o menor diff possível. Não faça downgrade de tecnologia para adequar o ambiente ao código antigo.

---

## 1. Validar o contrato público v2

Confirme que `data/estado-operacional.json`:

- possui `schemaVersion: 2`;
- contém exatamente os nove projetos canônicos;
- atualiza um projeto sem modificar os outros oito;
- nunca publica `ABERTA` sem `concurso`, `correlationId`, `abreEm` e `fechaEm` válidos;
- diferencia `estado` de `fase`;
- usa `America/Sao_Paulo` quando aplicável;
- não contém segredos ou identificadores internos.

Projetos obrigatórios:

- `lf-mensal`;
- `quina-mensal`;
- `ds-mensal`;
- `lf-independencia`;
- `quina-saojoao`;
- `ds-pascoa`;
- `mega-virada`;
- `mega-50mais`;
- `milionaria`.

Valide explicitamente que não existam no artefato público:

- `planilhaId`;
- IDs de Drive;
- Script IDs;
- container IDs;
- PIX;
- telefone/WhatsApp interno;
- IDs de grupo;
- tokens;
- secrets;
- cookies;
- headers Authorization;
- e-mails pessoais;
- credenciais.

---

## 2. Validar produtores Apps Script

Revise os pontos reais que abrem e fecham cada projeto.

### Estratégicos

Confirme Mega 50+ e +Milionária ponta a ponta:

`evento real → contrato persistido → LoteriasGeral → dispatch → workflow → estado-operacional.json`.

Preserve as regras existentes de concurso/correlação, idempotência, janela, thresholds e fechamento.

### Especiais

Confirme que os quatro Especiais usam o contrato completo produzido pela automação existente e não somente `ativo`.

### Mensais

Este é um checkpoint especialmente importante.

Localize **todos os callsites atuais** de:

- `ativarLfMensal` / `desativarLfMensal`;
- `ativarQuinaMensal` / `desativarQuinaMensal`;
- `ativarDSMensal` / `desativarDSMensal`.

Verifique quais callsites ainda chamam os wrappers sem contexto. O dispatch foi preparado para aceitar contexto v2, porém um chamador legado sem `concurso`, `correlationId`, `abreEm` e `fechaEm` deve continuar funcionando em modo legado e **não pode gerar falso `ABERTA` no agregado**.

Quando a lógica operacional real já possuir essas informações, passe-as ao wrapper de forma cirúrgica. Não fabrique datas no frontend e não invente concurso.

Priorize dados já calculados pelo fluxo real, por exemplo `contextoFechamento`, `prazoPagamento`, concurso corrente/próximo e correlationId já existente. Se o ambiente atual tiver evoluído para outro contrato, adapte o transporte à fonte real atual.

Se não for possível determinar uma janela real com segurança em algum projeto, mantenha-o `INDISPONIVEL` no agregado e registre a pendência; não publique uma abertura estimada.

---

## 3. Validar workflows GitHub

Para os nove `set-*-alert.yml`, confirme:

- compatibilidade com chamadas antigas que enviem apenas `ativo` quando isso ainda for necessário;
- recebimento dos campos v2 quando disponíveis;
- `estado-operacional.json` incluído no commit;
- nenhum secret interpolado em JSON público;
- concorrência/idempotência dos Estratégicos preservada;
- nenhum workflow passou a disparar outro em loop;
- permissões mínimas suficientes.

Valide o workflow de sincronização com `novo-site`:

- cópia de `data/estado-operacional.json` → `src/data/estado-operacional.json`;
- uso do secret atual correto para checkout/push sem mostrar valor;
- push para a branch correta do `novo-site`;
- ausência de loop de sync/deploy;
- comportamento idempotente quando não há diferença.

---

## 4. Validar site GitHub Pages

Confirme:

- home carrega o painel sem erro JS;
- `atualizacoes.html` abre e lista nove projetos;
- `projetos-abertos.html` permanece compatível;
- janela expirada nunca aparece aberta;
- janela futura não aparece aberta antes de `abreEm`;
- `prefers-reduced-motion` remove animações;
- cor nunca é a única informação de estado;
- erro de fetch resulta em fallback discreto;
- nenhuma alteração prejudica as páginas já existentes.

Cheque links de cada slug operacional para a rota pública atual. Se URLs mudaram desde a PR, ajuste somente o adaptador de rotas.

---

## 5. Validar `novo-site`

Leia as versões reais em `package.json`, lockfile, Dockerfile e workflows atuais.

Depois execute no ambiente de validação adequado:

```bash
npm ci
npm run test:operational
npm run test:site-index
npm run build
```

Se existirem novos testes/linters no ambiente atual, execute-os também.

Confirme no build gerado:

- `/` contém o painel compacto;
- `/atualizacoes` é gerada;
- links dos nove projetos são válidos;
- o componente não depende de API privada;
- o JS do navegador corrige o estado temporal após o build, especialmente quando `fechaEm` é ultrapassado;
- o agregado sincronizado não causa rebuild loop.

Não use o README como fonte exclusiva para versão do Astro/Node; use os manifests e workflows atuais.

---

## 6. Testes mínimos por repositório

### `boloesdoborges`

Execute no mínimo:

```bash
node scripts/update-estado-operacional.test.js
```

Execute também toda a suíte Node já existente que seja compatível com o ambiente atual.

Simule em diretório temporário:

1. abertura completa de um projeto;
2. abertura incompleta → `INDISPONIVEL`;
3. fechamento;
4. `FECHADA + AGUARDANDO_SORTEIO`;
5. evento repetido idempotente;
6. atualização de um projeto sem alterar os outros oito;
7. rejeição de contexto sensível.

### `Apps_Scripts`

Execute no mínimo:

```bash
node libs/LoteriasGeral/test/chamadasMensaisSitesV2.test.js
node libs/LoteriasGeral/test/estadoOperacional.test.js
node libs/LoteriasGeral/test/chamadasMensaisSites.test.js
```

Depois rode os testes existentes dos projetos Mensais/Especiais/estratégicos que toquem os fluxos alterados e o `tsc`/checagens existentes no repositório.

Faça `node --check` nos arquivos JS modificados quando aplicável.

### `novo-site`

Execute:

```bash
npm ci
npm run test:operational
npm run test:site-index
npm run build
```

Execute auditorias adicionais existentes no repositório se não tiverem efeitos externos.

---

## 7. Teste de integração seguro

Antes de qualquer dispatch real, faça simulação/harness local dos payloads dos nove projetos.

Para cada projeto, registre apenas:

- nome do workflow;
- chaves dos inputs;
- estado/fase públicos;
- presença/ausência de janela;
- resultado da validação.

Não registre tokens.

Teste que:

- um contrato completo gera os inputs v2;
- um booleano legado continua aceito quando exigido;
- um booleano legado `true` não se converte em `ABERTA` no agregado v2 sem janela completa;
- um Especial completo atravessa a `LoteriasGeral` com todos os campos;
- Mega/+Milionária mantêm suas restrições adicionais.

Somente faça workflow dispatch real se a implantação vigente exigir o teste e houver autorização operacional para isso. Caso contrário, pare na simulação determinística.

---

## 8. Ordem de integração recomendada

Recalcule a ordem caso o ambiente tenha mudado. Se a arquitetura continuar igual, prefira:

1. **`novo-site`** — primeiro, para o consumidor já aceitar o novo arquivo/componente;
2. **`boloesdoborges`** — depois, para publicar/sincronizar o agregado e os workflows novos;
3. **`Apps_Scripts`** — por último, para os produtores começarem a enviar o contrato completo somente depois de os receptores entenderem os novos inputs.

Não faça merge de `Apps_Scripts` antes de confirmar que os workflows no `boloesdoborges/main` aceitam todos os inputs que o Apps Script atual enviará.

---

## 9. Validação pós-deploy

Se e somente se as PRs forem aprovadas/mergeadas e houver autorização para deploy:

1. confirme o deploy real do `novo-site` pelo mecanismo atual;
2. verifique `/health` se ainda existir;
3. faça smoke HTTP de `https://site.boloesdoborges.shop/` e `/atualizacoes`;
4. verifique a página correspondente no GitHub Pages;
5. valide no navegador uma janela de teste somente com dados sanitizados;
6. confirme que o agregado recebido pelos dois sites é semanticamente igual;
7. confirme que nenhum workflow entrou em loop;
8. confirme que os sistemas antigos de alerta continuam funcionando durante o período de compatibilidade.

Não altere produção para “forçar” um estado visual de teste.

---

## 10. Critérios para interromper a implementação

Pare e reporte antes de prosseguir se encontrar qualquer um destes cenários:

- regra operacional de abertura mudou e a PR passou a representar regra antiga;
- workflow de produção foi substituído por outro mecanismo;
- branch de deploy mudou;
- segredo/property obrigatório não existe mais ou mudou de nome e não há substituto confirmado;
- schema público contém dado sensível;
- atualização de um projeto altera outro projeto;
- `novo-site` não builda na versão atual;
- merge exigiria remover proteção operacional existente;
- não é possível garantir que um `ABERTA` deriva de evento real;
- testes de fluxos atuais ficam vermelhos sem causa compreendida.

Não resolva esses casos com bypass, hardcode temporário ou redução de testes.

---

## 11. Relatório final obrigatório

Entregue ao final:

1. HEADs/SHAs efetivamente validados dos três repositórios;
2. versões reais de Node/Astro e demais runtimes relevantes;
3. lista de arquivos alterados após eventual rebase/adaptação;
4. diferenças encontradas entre as PRs e o ambiente atual;
5. testes executados e respectivos resultados;
6. resultado do build;
7. situação dos nove projetos no contrato;
8. confirmação de ausência de segredos no artefato público;
9. confirmação da ordem de merge/deploy;
10. pendências manuais, se houver;
11. rollback claro para cada etapa que alcance produção.

Conclua explicitamente com uma de três decisões:

- **APTO PARA MERGE/DEPLOY**;
- **APTO COM PENDÊNCIAS MANUAIS ESPECÍFICAS**;
- **NÃO APTO — BLOQUEADO**, listando exatamente os bloqueios.

A prioridade é preservar o funcionamento atual. Não declare o recurso pronto apenas porque os arquivos compilam; confirme a cadeia operacional completa no ambiente vigente.
