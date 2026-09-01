# Plano — Painel público de Atualizações Operacionais

Status: **planejado / não implementado**  
Repositórios envolvidos: `borgesfernando/boloesdoborges`, `borgesfernando/novo-site` e `borgesfernando/Apps_Scripts`  
Fonte pública autoritativa planejada: `boloesdoborges/data/estado-operacional.json` (`schemaVersion: 2`)  
Objetivo: disponibilizar nos dois sites uma seção **Atualizações** com o estado real dos projetos, incluindo adesões abertas, projetos em andamento, preparação de apostas, espera por sorteio e encerramentos, sem criar nova fonte de verdade e sem inferir abertura por prêmio, calendário ou conteúdo editorial.

---

## 1. Objetivo funcional

Criar uma superfície pública única e coerente para responder, em tempo real operacional, perguntas como:

- quais projetos estão com adesões abertas;
- quais estão em andamento, porém já sem novas adesões;
- quais estão em preparação de apostas;
- quais estão aguardando sorteio;
- quais estão em apuração;
- quais foram encerrados recentemente;
- quais não possuem janela operacional ativa no momento.

A solução terá duas apresentações:

1. **Painel compacto na home dos dois sites**, com até 3–5 atualizações mais relevantes e indicadores visuais discretos;
2. **Página dedicada `Atualizações`**, exibindo os nove projetos canônicos e seus estados/fases públicos.

A implementação deve preservar a arquitetura existente e evitar novas fontes paralelas de estado.

---

## 2. Princípio arquitetural central

O arquivo `data/estado-operacional.json` deve ser a **única fonte pública autoritativa para estado operacional**.

Fluxo esperado:

```text
Apps Scripts
    │
    │ evento operacional real
    ▼
LoteriasGeral
    │
    │ contrato sanitizado
    ▼
GitHub Actions
    │
    ▼
boloesdoborges/data/estado-operacional.json
        │
        ├── GitHub Pages
        │     ├── painel compacto na home
        │     └── atualizacoes.html
        │
        └── sincronização
              ▼
        novo-site/src/data/estado-operacional.json
              │
              ├── painel compacto na home
              └── /atualizacoes
```

### 2.1. O que NÃO deve ser fonte de abertura/fechamento

Não inferir abertura de projeto com base isoladamente em:

- prêmio estimado;
- calendário da CAIXA;
- dia da semana;
- data do próximo concurso;
- arquivos editoriais;
- `ecosystem-health.json`;
- `mega-status.json`;
- `*-alert.json` quando houver informação operacional canônica disponível.

Essas fontes podem contextualizar a interface, mas **não podem abrir uma janela pública**.

A regra existente da `LoteriasGeral` deve ser preservada: somente evento operacional explícito pode produzir `estado: ABERTA`.

---

## 3. Situação atual identificada

### 3.1. `boloesdoborges`

Já existe:

- `data/estado-operacional.json` em `schemaVersion: 2`;
- catálogo dos nove projetos canônicos;
- `js/estado-operacional.js`;
- `projetos-abertos.html` como protótipo inicial;
- `scripts/update-mensais-alert.js`, que já possui agregador v2, sanitização e preservação idempotente dos demais projetos;
- testes do agregado;
- workflows individuais dos projetos;
- workflow de sincronização de alertas com `novo-site`.

### 3.2. `Apps_Scripts`

Já existe:

- contrato canônico de estado operacional em `libs/LoteriasGeral/src/estadoOperacional.js`;
- mapa público canônico em `libs/LoteriasGeral/src/mapaProjetosPublicos.js`;
- resolvedores de Mensais em `libs/LoteriasGeral/src/resolvedorEstadoOperacionalMensal.js`;
- testes que garantem os nove projetos e sanitização;
- Mega 50+ e +Milionária já transportando estado operacional mais completo.

### 3.3. `novo-site`

Já existe:

- home Astro com `StrategicOpenAlerts` logo após o Hero;
- arquivos `*-alert.json` sincronizados do repositório público;
- workflow automático de build/deploy em push na branch de produção;
- estrutura de dados centralizada em `src/data`;
- rotas de projetos e navegação já organizadas.

---

## 4. Gap atual que precisa ser fechado antes do painel

O agregado v2 existe, porém a cadeia ponta a ponta ainda não está igualmente completa para os nove projetos.

### 4.1. Estratégicos

Mega 50+ e +Milionária já enviam dados como:

- `ativo`;
- `concurso`;
- `correlation_id`;
- `estado`;
- `abre_em`;
- `fecha_em`;
- `timezone`;
- `atualizado_em`.

Seus workflows já incluem `data/estado-operacional.json` no commit quando alterado.

### 4.2. Mensais e Especiais

Parte dos workflows ainda recebe somente `ativo` e faz commit apenas do respectivo `*-alert.json`.

Isso cria duas limitações:

1. o contrato v2 pode não receber o contexto operacional completo;
2. mesmo quando `scripts/update-mensais-alert.js` altera `estado-operacional.json` localmente na Action, alguns workflows não adicionam esse arquivo ao commit.

### 4.3. Regra obrigatória antes da interface

Antes de considerar o painel pronto para produção, todos os nove projetos precisam satisfazer:

```text
evento operacional real
→ contrato público v2 sanitizado
→ workflow GitHub
→ atualização idempotente de data/estado-operacional.json
→ commit do agregado
→ sincronização com novo-site
```

---

## 5. Contrato público recomendado

Manter `schemaVersion: 2` e evoluir apenas de modo aditivo.

Estrutura recomendada por projeto:

```json
{
  "slug": "lf-mensal",
  "nome": "Lotofácil Mensal",
  "tipo": "MENSAL",
  "estado": "ABERTA",
  "ativo": true,
  "fase": "INSCRICOES",
  "concurso": "1234",
  "abreEm": "2026-09-01T08:00:00-03:00",
  "fechaEm": "2026-09-02T12:00:00-03:00",
  "timezone": "America/Sao_Paulo",
  "janelaComunidade": {
    "abreEm": "2026-09-01T08:00:00-03:00",
    "fechaEm": "2026-09-02T12:00:00-03:00",
    "timezone": "America/Sao_Paulo"
  },
  "contexto": {
    "concurso": "1234",
    "dataOperacao": "2026-09-02",
    "observacaoPublica": ""
  },
  "atualizadoEm": "2026-09-01T08:00:00-03:00",
  "correlationId": "...",
  "fonteEstado": "Apps_Scripts"
}
```

### 5.1. Estados

Manter o estado como conceito de disponibilidade da janela operacional:

- `ABERTA` — novas adesões efetivamente aceitas;
- `FECHADA` — existe/existiu instância, mas novas adesões não estão abertas;
- `SEM_INSTANCIA` — ainda não existe uma instância operacional aplicável;
- `INDISPONIVEL` — informação não confirmada ou inconsistente; nunca converter para aberta.

### 5.2. Fases

Evoluir `fase` de maneira aditiva para representar o ciclo do projeto sem confundir com a janela de adesão.

Valores recomendados:

- `PLANEJAMENTO`;
- `INSCRICOES`;
- `PREPARACAO_APOSTAS`;
- `APOSTAS_REGISTRADAS`;
- `AGUARDANDO_SORTEIO`;
- `APURACAO`;
- `ENCERRADA`;
- `INDISPONIVEL`.

Não é obrigatório que todos os projetos usem todas as fases.

Regra essencial:

```text
estado = ABERTA/FECHADA
→ responde se há adesão

fase = ...
→ responde em que etapa o projeto está
```

Exemplo válido:

```text
estado = FECHADA
fase = AGUARDANDO_SORTEIO
```

Interface:

> Adesões encerradas · aguardando sorteio

---

## 6. Política de frescor e validade temporal

Reavaliar a regra atual de invalidação após 36 horas.

Uma janela pode permanecer legitimamente aberta por vários dias ou semanas. Portanto, `atualizadoEm` não deve sozinho encerrar uma janela válida.

### 6.1. Regra recomendada para exibir `Adesões abertas`

O frontend deve exigir cumulativamente:

```text
estado === 'ABERTA'
ativo === true
abreEm válido e abreEm <= agora
fechaEm válido e agora < fechaEm
```

Se `fechaEm` já passou, nunca exibir aberta, mesmo que o backend ainda não tenha recebido um fechamento explícito.

`atualizadoEm` permanece como metadado de auditoria e pode ser usado para sinalizar informação possivelmente antiga, mas não deve invalidar automaticamente uma janela temporal ainda válida.

### 6.2. Fail-safe

Na dúvida ou em contrato inválido:

```text
não mostrar como aberta
```

Nunca usar fallback otimista.

---

## 7. Painel compacto na Home

Criar nos dois sites um componente chamado conceitualmente de `OperationalUpdates` / `AtualizacoesOperacionais`.

### 7.1. Posição

Preferência:

- logo após o Hero;
- antes das seções institucionais longas;
- no `novo-site`, substituir progressivamente o papel visual de `StrategicOpenAlerts`.

### 7.2. Conteúdo

Mostrar no máximo 3–5 itens prioritários.

Prioridade sugerida:

1. adesões abertas;
2. fechamento próximo;
3. preparação/apostas registradas;
4. aguardando sorteio;
5. apuração;
6. atualização recente relevante.

Não ocupar a home com todos os nove projetos quando nada relevante estiver acontecendo.

### 7.3. Indicadores visuais

Sugestão:

- verde pulsando: `Adesões abertas`;
- amarelo pulsando suavemente: `Encerrando em breve`;
- azul respirando/estático: `Projeto em andamento`;
- cinza: `Aguardando próxima janela`;
- cinza neutro: `Informação indisponível`.

Evitar vermelho para estados normais de indisponibilidade.

### 7.4. Acessibilidade

Obrigatório:

- texto acompanha toda indicação por cor;
- `aria-label` quando necessário;
- `prefers-reduced-motion: reduce` desabilita pulsação/animação;
- sem animações rápidas ou chamativas;
- contraste adequado.

### 7.5. CTA

Sempre oferecer:

```text
Ver todas as atualizações →
```

---

## 8. Página dedicada `Atualizações`

### 8.1. Rotas

GitHub Pages:

```text
/boloesdoborges/atualizacoes.html
```

Site comercial:

```text
/atualizacoes
```

### 8.2. Conteúdo

Mostrar os nove projetos canônicos, preferencialmente agrupados por relevância operacional:

- `Abertos agora`;
- `Em andamento`;
- `Próximos / aguardando janela`;
- `Encerrados / sem janela atual`.

### 8.3. Card do projeto

Campos possíveis, somente quando existentes e públicos:

- nome;
- tipo;
- status textual;
- fase;
- concurso;
- abertura;
- fechamento;
- última atualização;
- observação pública sanitizada;
- link para página do projeto.

Nunca expor:

- `planilhaId`;
- Google Drive IDs;
- tokens;
- secrets;
- PIX;
- IDs de grupos;
- números/IDs de WhatsApp internos;
- dados pessoais;
- URLs internas;
- credenciais;
- stack traces.

---

## 9. Mapeamento de slugs e rotas

Preservar o slug canônico da fonte operacional.

Exemplo:

```text
ds-mensal
```

No `novo-site`, a rota pública atual pode ser:

```text
/projetos/mensais/dupla-sena-mensal
```

Não alterar o ID canônico para acompanhar a URL editorial.

Criar um adaptador de apresentação:

```text
slug operacional → rota pública
```

Esse mapa deve existir somente na camada de site e não no contrato de estado.

---

## 10. Sincronização `boloesdoborges` → `novo-site`

Evoluir o workflow atual de sincronização para copiar também:

```text
data/estado-operacional.json
→ novo-site/src/data/estado-operacional.json
```

O arquivo agregado deve se tornar a fonte preferida da nova interface.

Os `*-alert.json` atuais podem permanecer temporariamente para backward compatibility.

Não removê-los na primeira implementação.

### 10.1. Estratégia de migração

Fase inicial:

```text
estado-operacional.json = novo painel
*-alert.json = consumidores legados
```

Após validação:

- migrar leitores antigos quando fizer sentido;
- remover apenas redundâncias comprovadamente sem consumidores;
- nunca fazer remoção simultânea à primeira implantação do painel.

---

## 11. Alterações previstas por repositório

## 11.1. `Apps_Scripts`

Revisar e completar:

- `libs/LoteriasGeral/src/estadoOperacional.js`;
- `libs/LoteriasGeral/src/mapaProjetosPublicos.js`;
- `libs/LoteriasGeral/src/resolvedorEstadoOperacionalMensal.js`;
- dispatches dos três Mensais;
- dispatches dos quatro Especiais;
- Mega 50+;
- +Milionária;
- testes da `LoteriasGeral`;
- typings públicos quando necessário.

Objetivo: todos os nove projetos serem capazes de produzir/transportar contrato v2 completo e sanitizado.

## 11.2. `boloesdoborges`

Revisar/alterar:

- `scripts/update-mensais-alert.js`;
- `data/estado-operacional.json`;
- nove workflows `set-*-alert.yml`;
- `.github/workflows/sync-mensais-alert-novo-site.yml` ou workflow sucessor;
- `js/estado-operacional.js`;
- `index.html`;
- nova `atualizacoes.html`;
- CSS correspondente;
- `projetos-abertos.html` — decidir se vira redirect, compatibilidade ou é incorporada à nova página;
- testes de estado operacional.

## 11.3. `novo-site`

Revisar/alterar:

- `src/data/estado-operacional.json`;
- novo parser/helper tipado para o schema v2;
- novo componente de atualizações;
- `src/pages/index.astro`;
- nova rota `src/pages/atualizacoes.astro`;
- `src/components/Header.astro` para navegação, se aprovado visualmente;
- adaptador `slug operacional → rota pública`;
- `StrategicOpenAlerts.astro` apenas após transição segura;
- testes/build/lint aplicáveis.

---

## 12. Testes obrigatórios

### 12.1. Contrato

Garantir que:

1. `schemaVersion === 2`;
2. os nove projetos sempre existam;
3. atualizar um projeto não altera os outros oito;
4. estado `ABERTA` sem evento confirmado nunca é aceito;
5. `ABERTA` sem janela temporal completa não é exibida como aberta;
6. fechamento temporal no frontend bloqueia abertura vencida;
7. campos proibidos nunca chegam ao agregado.

### 12.2. Segurança

Teste explícito buscando, inclusive recursivamente, termos/campos como:

```text
planilha
spreadsheet
drive
pix
whatsapp
grupo
token
secret
senha
password
authorization
cookie
invite
convite
```

A allowlist pública deve prevalecer sobre blocklist sempre que possível.

### 12.3. Idempotência

Cenário obrigatório:

```text
estado inicial com 9 projetos
→ atualizar apenas LF_MENSAL
→ comparar os outros 8 byte/logicamente
→ nenhuma alteração fora do projeto alvo
```

### 12.4. Interface

Cobrir pelo menos:

- nenhum projeto aberto;
- um aberto;
- vários abertos;
- aberto fechando em breve;
- fechado + aguardando sorteio;
- apuração;
- indisponível;
- JSON ausente/corrompido;
- horário após `fechaEm`;
- preferência de redução de movimento.

---

## 13. SEO e arquitetura editorial

A nova seção não deve desfazer a separação editorial entre:

- GitHub Pages = presença pública/institucional;
- `site.boloesdoborges.shop` = presença comercial principal.

Antes de tornar a página indexável nos dois domínios, revisar a política SEO vigente.

Preferência arquitetural:

- site comercial: página completa indexável;
- site público: painel funcional e página compatível com a política `noindex` seletiva já adotada para conteúdo de projetos, se essa política continuar vigente.

Não criar conteúdo editorial duplicado desnecessariamente.

---

## 14. Rollout recomendado

### Fase 0 — auditoria antes de alterar

- reler estado atual dos três repositórios;
- identificar todos os consumidores de `*-alert.json`;
- identificar todos os produtores do estado operacional;
- confirmar workflows ativos e seus inputs;
- confirmar ausência de divergências entre `main`/`master` e produção.

### Fase 1 — completar backend/contrato

- fechar dispatch v2 dos nove projetos;
- garantir commit do agregado em todos os workflows;
- preservar backward compatibility;
- testes verdes.

### Fase 2 — sincronização

- sincronizar `estado-operacional.json` com `novo-site`;
- validar que push automático não cria loop entre repositórios;
- validar deploy resultante.

### Fase 3 — GitHub Pages

- evoluir `js/estado-operacional.js`;
- criar painel compacto;
- criar `atualizacoes.html`;
- preservar fallback seguro.

### Fase 4 — site comercial

- criar helper tipado;
- criar componente compacto;
- criar `/atualizacoes`;
- integrar à home;
- manter `StrategicOpenAlerts` apenas se ainda necessário durante transição.

### Fase 5 — validação integrada

Simular pelo menos:

1. abertura de um Mensal;
2. fechamento do Mensal;
3. abertura de Especial;
4. abertura de Mega 50+;
5. abertura de +Milionária;
6. fechamento por horário;
7. estado indisponível.

Confirmar que ambos os sites apresentam a mesma verdade operacional.

### Fase 6 — convergência posterior

Somente depois da estabilidade:

- avaliar consumidores antigos;
- reduzir dependência de `*-alert.json`;
- evitar duas fontes públicas de apresentação para o mesmo conceito.

---

## 15. Critérios de aceite

A implementação só deve ser considerada concluída quando:

- os nove projetos estão presentes no agregado;
- todos os nove conseguem atualizar seu próprio registro;
- nenhum projeto altera o estado dos outros;
- nenhum campo sensível aparece no JSON público;
- `ABERTA` só ocorre com evento operacional real;
- `fechaEm` vencido nunca aparece como adesão aberta;
- os dois sites exibem o mesmo estado lógico;
- home de ambos possui painel compacto;
- ambos possuem página dedicada;
- interface possui fallback seguro;
- animações respeitam `prefers-reduced-motion`;
- slugs canônicos não são alterados por diferenças de rota editorial;
- workflows antigos continuam operacionais durante a migração;
- builds/testes dos três repositórios passam;
- nenhuma mudança exige intervenção manual frequente para manter o painel correto.

---

## 16. Não objetivos desta implementação

Não incluir nesta primeira versão:

- painel técnico de saúde dos containers/VPS;
- status de n8n, Telegram, WhatsApp ou banco de dados;
- métricas internas;
- histórico completo de eventos operacionais em banco;
- notificações push;
- autenticação;
- administração via frontend;
- mudança das regras de negócio que decidem quando cada bolão abre;
- inferência de abertura por IA;
- exposição pública de propriedades internas do Apps Script.

---

# Prompt de implementação para execução posterior

Copiar integralmente o prompt abaixo para o agente responsável pela implementação.

```text
TAREFA: implementar o painel público de “Atualizações” da Comunidade Bolões do Borges nos dois sites, usando exclusivamente o contrato operacional sanitizado v2 já criado no ecossistema.

REPOSITÓRIOS ENVOLVIDOS:
- borgesfernando/Apps_Scripts
- borgesfernando/boloesdoborges
- borgesfernando/novo-site

DOCUMENTO AUTORITATIVO DO PLANO:
- borgesfernando/boloesdoborges/docs/plano-painel-atualizacoes.md

ANTES DE QUALQUER ALTERAÇÃO:
1. Leia integralmente o documento acima.
2. Audite o estado ATUAL dos três repositórios. Não presuma que os arquivos continuam iguais ao momento em que o plano foi escrito.
3. Localize todos os produtores e consumidores de:
   - estado-operacional.json
   - *-alert.json
   - StrategicOpenAlerts
   - js/estado-operacional.js
   - dispatches GitHub dos Mensais, Especiais, Mega 50+ e +Milionária.
4. Confirme branches de produção, workflows ativos e sincronizações existentes.
5. Confirme que a implementação proposta mantém compatibilidade com os fluxos atualmente operacionais.
6. Se identificar que qualquer mudança pode quebrar um fluxo de produção existente e não houver forma segura/backward compatible de executá-la, NÃO remova nem substitua o fluxo atual. Implemente de forma aditiva e documente a pendência.

PRINCÍPIO CENTRAL:
`boloesdoborges/data/estado-operacional.json` schemaVersion 2 deve ser a única fonte pública autoritativa para o novo painel.

NÃO crie outro JSON concorrente de status.
NÃO use ecosystem-health.json como fonte operacional.
NÃO abra projetos por inferência de prêmio, calendário CAIXA, dia da semana, próximo concurso ou texto editorial.
Somente evento operacional explícito pode produzir estado ABERTA.

FASE 1 — FECHAR O CONTRATO PONTA A PONTA
1. Verifique a implementação atual em Apps_Scripts/LoteriasGeral:
   - estadoOperacional.js
   - mapaProjetosPublicos.js
   - resolvedorEstadoOperacionalMensal.js
   - typings/testes relacionados.
2. Preserve todas as APIs v1 ainda consumidas.
3. Faça os 9 projetos canônicos produzirem/transportarem o contrato público v2 completo quando houver informação real disponível:
   - lf-mensal
   - quina-mensal
   - ds-mensal
   - lf-independencia
   - quina-saojoao
   - ds-pascoa
   - mega-virada
   - mega-50mais
   - milionaria
4. Preserve a sanitização. Nunca transporte planilhaId, Drive IDs, PIX, WhatsApp IDs, grupos, tokens, secrets, senhas, cookies, authorization ou dados pessoais.
5. Todos os workflows set-*-alert.yml devem incluir data/estado-operacional.json no commit quando o agregador o alterar.
6. Não quebre os *-alert.json existentes. Mantenha-os durante a migração.
7. Preserve idempotência: atualizar um projeto não pode modificar os outros oito.

FASE 2 — EVOLUIR `fase` DE MODO ADITIVO
Use `estado` exclusivamente para disponibilidade da janela de adesão e `fase` para o estágio operacional.

Valores recomendados, quando realmente produzíveis pelo fluxo operacional:
- PLANEJAMENTO
- INSCRICOES
- PREPARACAO_APOSTAS
- APOSTAS_REGISTRADAS
- AGUARDANDO_SORTEIO
- APURACAO
- ENCERRADA
- INDISPONIVEL

Não invente fases que o sistema não consegue confirmar.
Quando não houver evidência operacional suficiente, use INDISPONIVEL ou mantenha a fase segura existente.

FASE 3 — POLÍTICA TEMPORAL
Remova a dependência de uma expiração cega de 36h para considerar uma janela aberta.
Para exibir “Adesões abertas”, exija:
- estado === ABERTA
- ativo === true
- abreEm válido e <= agora
- fechaEm válido e > agora

Se fechaEm estiver vencido, nunca exiba aberta.
atualizadoEm continua sendo metadado/auditoria e não deve sozinho encerrar uma janela longa ainda válida.
Na dúvida, falhe fechado: nunca aberto por fallback.

FASE 4 — SINCRONIZAÇÃO ENTRE SITES
Evolua a sincronização existente em boloesdoborges para copiar:
- data/estado-operacional.json
para:
- novo-site/src/data/estado-operacional.json

Garanta que isso não cria loop de commits/deploys entre repositórios.
Preserve os arquivos *-alert.json existentes até posterior remoção deliberada.

FASE 5 — GITHUB PAGES
1. Evolua js/estado-operacional.js para consumir schema v2 de forma robusta.
2. Crie um painel compacto “Atualizações” na home.
3. Mostre no máximo 3–5 itens prioritários.
4. Prioridade:
   a) adesões abertas;
   b) encerrando em breve;
   c) preparação/apostas registradas;
   d) aguardando sorteio;
   e) apuração;
   f) atualização recente relevante.
5. Crie atualizacoes.html com os nove projetos.
6. Agrupe, quando adequado, em:
   - Abertos agora
   - Em andamento
   - Próximos / aguardando janela
   - Encerrados / sem janela atual
7. Avalie projetos-abertos.html e preserve compatibilidade. Se houver substituição, prefira redirect/integração segura em vez de remoção abrupta.
8. Adote fallback textual seguro se o JSON não carregar.

FASE 6 — NOVO-SITE ASTRO
1. Crie helper/parser tipado para src/data/estado-operacional.json.
2. Crie componente OperationalUpdates/AtualizacoesOperacionais.
3. Integre o componente compacto logo após o Hero na home.
4. Crie /atualizacoes.
5. Crie adaptador de slug operacional → rota editorial. NÃO altere o slug canônico por diferenças como ds-mensal vs dupla-sena-mensal.
6. Faça a transição de StrategicOpenAlerts de forma segura. Não remova o componente/arquivos legados até confirmar que não existem consumidores necessários.
7. Se houver alertas comerciais específicos ainda não representáveis no agregado, mantenha-os temporariamente e documente a razão.

FASE 7 — DESIGN
Indicadores sugeridos:
- verde pulsando = adesões abertas
- amarelo pulsando suavemente = encerrando em breve
- azul discreto = projeto em andamento
- cinza = aguardando próxima janela
- cinza neutro = informação indisponível

Requisitos:
- não depender somente da cor;
- texto de status obrigatório;
- respeitar prefers-reduced-motion: reduce;
- animações discretas;
- contraste acessível;
- sem vermelho para situações operacionais normais de indisponibilidade.

FASE 8 — SEGURANÇA E TESTES
Crie/ajuste testes garantindo:
1. schemaVersion 2;
2. exatamente os 9 projetos canônicos presentes;
3. ausência recursiva de campos sensíveis;
4. idempotência entre projetos;
5. ABERTA sem evento operacional confirmado é rejeitada;
6. ABERTA sem janela temporal completa não aparece aberta;
7. fechaEm vencido fecha a apresentação no frontend;
8. JSON ausente/corrompido produz fallback seguro;
9. múltiplos projetos abertos são ordenados corretamente;
10. prefers-reduced-motion é respeitado;
11. slugs canônicos continuam estáveis;
12. builds/testes atuais de cada repositório continuam verdes.

FASE 9 — SEO
Respeite a arquitetura editorial atual dos dois sites.
Não reverta noindex/canonical/redirects já implementados sem análise específica.
A página comercial /atualizacoes pode ser indexável se compatível com a política vigente.
No GitHub Pages, preserve a política de noindex seletivo vigente para páginas de projetos, caso ainda esteja ativa.
Não crie conteúdo duplicado desnecessário.

FASE 10 — VALIDAÇÃO INTEGRADA
Antes de considerar concluído, simule ou teste deterministicamente:
- abertura e fechamento de um Mensal;
- abertura/fechamento de um Especial;
- Mega 50+;
- +Milionária;
- fechamento por horário;
- estado indisponível;
- mais de um projeto simultaneamente em fases distintas.

Confirme que os dois sites apresentam a mesma verdade operacional.

RESTRIÇÕES IMPORTANTES:
- Não mudar as regras de negócio de abertura dos bolões.
- Não criar nova fonte de verdade.
- Não expor segredos ou IDs internos.
- Não remover compatibilidade existente sem prova de ausência de consumidores.
- Não hardcodar estado operacional no frontend.
- Não usar IA para inferir abertura/fechamento.
- Não alterar produção de forma destrutiva.
- Priorizar mudanças pequenas, aditivas, testáveis e reversíveis.

ENTREGA ESPERADA:
1. implementação completa das fases aplicáveis;
2. commits separados logicamente por repositório/fase;
3. testes executados e resultados informados;
4. lista final de arquivos alterados;
5. descrição de qualquer compatibilidade temporária mantida;
6. confirmação explícita de que nenhum dado sensível foi publicado;
7. confirmação explícita de que os dois sites consomem a mesma fonte operacional;
8. resumo de rollout e rollback;
9. nenhuma publicação destrutiva ou remoção legada sem necessidade comprovada.

CRITÉRIO DE PARADA:
Se, durante a auditoria inicial, o estado atual dos repositórios tiver evoluído e parte deste plano já estiver implementada, NÃO duplique a solução. Reaproveite o que existe, compare com os critérios de aceite e implemente somente os gaps restantes.
```

---

## 17. Decisão registrada

A implementação é recomendada, mas deve começar pelo fechamento do transporte do contrato v2 para os nove projetos antes da camada visual.

O painel não deve criar arquitetura nova: deve ser uma camada de leitura e apresentação sobre o estado operacional sanitizado que já existe no ecossistema.
