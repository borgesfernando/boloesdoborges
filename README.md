# 📌 Projeto Bolões do Borges

**🤝 Sua comunidade confiável de bolões!**
Projetos coordenados com transparência, tecnologia e experiência desde 2009 para multiplicar suas chances nos principais concursos da Caixa.

## 💊 O que oferecemos

- ✨ Organização contínua desde 2009 e comunidade engajada
- 🧠 Modelos estatísticos e IA para construir jogos diversificados
- 🔒 Governança, prestação de contas e controle de acesso aos documentos
- 📅 Calendário atualizado com projetos mensais, especiais e estratégicos

## 📑 Linhas de projetos

- **Projetos Mensais**: Lotofácil, Quina e Dupla Sena, com rotinas próprias de sorteio para quem gosta de acompanhar resultados com frequência.
- **Projetos Especiais**: Quina de São João, Lotofácil da Independência, Dupla Sena de Páscoa e Mega da Virada.
- **Projetos Estratégicos (Acumulados)**: ativações pontuais quando Mega-Sena ou +Milionária atingem prêmios relevantes, com comunicação dedicada e janelas de entrada curtas.

## 📈 Como funciona

1. Realize o cadastro pelo [formulário oficial](https://docs.google.com/forms/d/e/1FAIpQLSeGURdHgTYpsLF4hcW45xlHJGkdqv4ubCNr3lvGk4dGCcTqxw/viewform).
2. Receba as instruções e ingresse na comunidade WhatsApp.
3. Escolha os projetos em que deseja participar e confirme as cotas nos prazos divulgados.
4. Acompanhe avisos, comprovantes, resultados e prestações de contas enviadas aos participantes.

## 📲 Comunidade WhatsApp

A comunidade “Bolões do Borges” no WhatsApp integra todos os projetos em um ambiente organizado.

- **Grupo de avisos**: o administrador centraliza comunicados e abertura de oportunidades dos bolões estratégicos, mensais e especiais.
- **Subgrupos por projeto**: cada linha possui grupos específicos apenas com os participantes confirmados, mantendo foco total.
- **Interações pontuais**: os subgrupos ficam silenciados e abrem em momentos-chave para feedbacks, reações, eventos e compartilhamento de arquivos.

⚠️ Importante: fique atento aos avisos para não perder oportunidades. [Cadastre-se aqui](https://docs.google.com/forms/d/e/1FAIpQLSeGURdHgTYpsLF4hcW45xlHJGkdqv4ubCNr3lvGk4dGCcTqxw/viewform).

## 📚 Transparência e segurança

- Comprovantes, relações de jogos e rateios ficam disponíveis aos participantes autenticados.
- Auditoria voluntária ao final de cada projeto e trilhas auditáveis de todo o fluxo financeiro.
- Dados pessoais tratados conforme a LGPD, com acesso restrito e registro das operações.
- Resultados significativos rateados proporcionalmente ao número de cotas.

## ❗ Por que participar

- Mais chances com jogos coletivos e técnicas de desdobramento.
- Custo-benefício melhor que apostar sozinho.
- Planejamento constante: prêmios menores podem ser reinvestidos para fortalecer a base.
- Comunidade com histórico comprovado e comunicação ativa.

## 👨‍💻 Quem organiza

Fernando Borges é profissional de Segurança da Informação, especialista em cibersegurança e entusiasta de IA aplicada às loterias. Ele coordena os bolões, define métodos, cuida da prestação de contas e atende os participantes.

## 🔄 FAQ como fonte de verdade

- O arquivo `faq.json` na raiz deste repositório é a **fonte principal** de perguntas e respostas.
- O novo site (repositório `borgesfernando/novo-site`) consome exatamente o mesmo `faq.json`, sincronizado por GitHub Actions.
- Para links internos (rotas de páginas), o `faq.json` usa identificadores neutros como `ROTA_ESPECIAL_MEGA_VIRADA`, `ROTA_MENSAL_LF`, `ROTA_PRESTACAO_CONTAS`, etc.; cada projeto mapeia esses identificadores para suas próprias URLs.

### Fluxo de sincronização

1. Você atualiza o conteúdo de `faq.json` neste repositório e faz `git push` na branch `main`.
2. O workflow `.github/workflows/sync-faq-novo-site.yml` é acionado e:
   - faz checkout do repositório `borgesfernando/novo-site`;
   - copia o `faq.json` para `novo-site/src/data/faq.json`;
   - comita e faz push na branch `master` do `novo-site`.
3. O push no `novo-site` dispara o workflow de deploy daquele repositório, que atualiza a FAQ na VPS.

### Requisitos para o workflow

- No repositório **boloesdoborges**, é necessário um secret `NOVO_SITE_SYNC_TOKEN` com um Personal Access Token do GitHub que tenha permissão de escrita no repositório `borgesfernando/novo-site`.
- Não é preciso configurar nada no `novo-site` além do workflow de deploy já existente.

Em resumo: **edite apenas este `faq.json`** e deixe o workflow cuidar de manter o novo site e a VPS sincronizados.

## 🚨 Alerta automático da Mega acumulada

- O script `scripts/update-mega-status.js` consulta a API oficial da Caixa em `https://servicebus3.caixa.gov.br/portaldeloterias/api/megasena`, grava o resultado consolidado em `data/mega-status.json` e o snapshot bruto em `data/megasena-api.json`. Também salva a resposta integral da +Milionária, obtida em `https://servicebus3.caixa.gov.br/portaldeloterias/api/maismilionaria`, em `data/maismilionaria-api.json`. O campo `ativo` é calculado a partir do valor mínimo configurado para o projeto `mega-acumulada` em `data/projetos.json`.
- O workflow `.github/workflows/update-mega-status.yml` faz uma recuperação diária às 06h BRT e, nas janelas críticas de apuração, a cada 5 minutos até 30 minutos após o sorteio e depois a cada 15 minutos até o fim da janela. O commit só ocorre se um snapshot realmente mudou.
- `data/loterias-health.json` é o contrato público sanitizado de frescor: registra a última atualização confirmada e, por modalidade, a apuração, concurso e próximo concurso vistos no snapshot. Consumidores devem combinar esse arquivo com `calendario-caixa.json`; snapshot sem atualização não pode ser tratado como resultado atual.
- Sempre que `data/mega-status.json` muda, o workflow `.github/workflows/sync-mega-status-novo-site.yml` copia o arquivo para `borgesfernando/novo-site/src/data/mega-status.json` – assim o banner automático aparece tanto na landing antiga (VPS) quanto no novo site Astro.
- A home (`index.html`) e a página `boloes/acumulados/mega-acumulada.html` leem esse JSON e exibem o destaque apenas quando `ativo: true`. No front-end, o alerta é automaticamente ocultado assim que a data/horário de fechamento (18h do dia anterior ao sorteio) é atingida.

## 🚨 Alerta dos projetos mensais

- O script `scripts/update-mensais-alert.js` grava `data/quina-mensal-alert.json`, `data/lf-mensal-alert.json` ou `data/ds-mensal-alert.json` com o campo `ativo`.
- Os workflows `.github/workflows/set-quina-mensal-alert.yml`, `.github/workflows/set-lf-mensal-alert.yml` e `.github/workflows/set-ds-mensal-alert.yml` são disparados via `workflow_dispatch` (normalmente pelo Apps Script) e ativam/desativam o alerta do projeto específico.
- Inputs esperados (via `workflow_dispatch`):
  - `ativo`: `true|false` (abre ou fecha a janela pública do projeto mensal correspondente).
- Sempre que os arquivos de alerta mudam, o workflow `.github/workflows/sync-mensais-alert-novo-site.yml` copia os JSONs para `borgesfernando/novo-site/src/data/`, mantendo o destaque sincronizado nos dois sites.
- A home (`index.html`) e as páginas `boloes/mensais/quina-mensal.html`, `boloes/mensais/lf-mensal.html` e `boloes/mensais/dupla-sena-mensal.html` exibem o alerta somente quando `ativo: true` para o projeto chamado.

## 📅 Calendário oficial CAIXA

- `data/calendario-caixa.json` é a **API estática pública** do dia e horário oficial de sorteio por modalidade (Mega-Sena, +Milionária, Lotofácil, Quina e Dupla Sena), consumível por site, n8n e agentes.
- A **fonte canônica é única**: o módulo `libs/LoteriasGeral/src/calendarioCaixa.js` do repositório `Apps_Scripts`. Não existe segunda grade editável manualmente.
- O espelho `scripts/vendor/loterias-geral/calendarioCaixa.js` é cópia verbatim da fonte canônica (sincronizada pelo workflow, nunca editada à mão).
- O gerador `scripts/generate-calendario-caixa.js` transforma o espelho na representação pública (`versions[].modalidades[].sorteios[]` com `weekday` `MON..SUN` e `time` `HH:MM`, metadados `fonte: CAIXA`, `referencia`, `generatedAt` e `verificadoEm`) e grava `data/calendario-caixa.json`.
- O validador `scripts/validate-calendario-caixa.js` aplica validações determinísticas (schemaVersion, timezone, weekdays permitidos, formato `HH:MM`, vigências sem sobreposição, modalidades conhecidas, exceções duplicadas e sanitização) e **detecta drift** contra a fonte canônica, retornando `exit 1` em divergência.
- Os textos de apresentação de sorteios dos projetos mensais em `js/config.js` (e em `data/projetos.json`) são apenas **catálogo/apresentação** — não são fonte autoritativa. O validador `scripts/validate-projetos-sorteios.js` garante que eles continuem cobrindo os fatos do calendário canônico, falhando a CI em caso de drift (executado em `.github/workflows/update-projetos.yml`).
- O workflow `.github/workflows/calendario-caixa.yml`:
  - em **push/PR** nos arquivos do calendário: clona `Apps_Scripts` (público), espelha a fonte canônica, roda testes e validação — **falha a CI quando há drift**;
  - em **schedule diário (00h00 UTC) / `workflow_dispatch`**: regenera e **commita automaticamente** quando a fonte canônica mudou.
- Testes locais: `node test/calendario-caixa.test.js`.
- URL pública: `https://borgesfernando.github.io/boloesdoborges/data/calendario-caixa.json`.

## 🌐 Estratégia entre domínios (SEO)

Os dois domínios fazem parte de um único ecossistema (Bolões do Borges), com papéis complementares:

- **`borgesfernando.github.io/boloesdoborges`** — presença pública e arquivo institucional (este repositório).
- **`site.boloesdoborges.shop`** — site comercial/participação: cadastro, cotas, PIX e conversão (repositório `borgesfernando/novo-site`).

Regras de ouro:

1. **Nunca** usar canonical cruzado entre os dois domínios (cada domínio declara seu próprio canonical). Canonical cruzado é sinal de "mesmo dono" e pode causar desindexação.
2. **Cross-links recíprocos e contextuais** são os únicos elos entre os sites: o site público aponta para o comercial no rodapé (`Participação e cadastro`) e o comercial aponta para o público (`Site público e arquivo do projeto`).
3. Conteúdo duplicado entre os domínios é evitado por **diferenciação ou `noindex` seletivo**, decidido por intenção de busca — nunca por canonicalização cruzada.
4. O script `scripts/inject-crosslink.js` mantém os cross-links no rodapé das páginas públicas (idempotente).

## 🧭 Estrutura de URLs (SEO)

- Páginas principais: `index.html`, `linhas-de-projetos.html`, `faq.html`, `prest.html`, `sitemap.html`.
- Páginas institucionais: `institucional/sobre.html`, `institucional/termos.html`, `institucional/privacidade.html`, `institucional/contato.html`.
- Páginas de bolões (URLs limpas) e estratégias/IA têm `noindex,follow` — o conteúdo comercial pertence ao site `site.boloesdoborges.shop`.
- Templates antigos permanecem como fallback e estão marcados com `noindex`.

## 🔍 Search Console

- O site público **não possui verificação** no Google Search Console. Adicionar a propriedade `https://borgesfernando.github.io/boloesdoborges` (prefixo de URL) e validar que, após a arquitetura de domínios, apenas as páginas institucionais permanecem indexadas.

## 🤖 Índice público de páginas

- A API estática oficial é [`site-index.json`](https://borgesfernando.github.io/boloesdoborges/site-index.json), publicada na raiz do GitHub Pages.
- O schema estável usa `version`, `generated_at`, `page_count` e `sites`; cada página contém `title`, `url`, `path`, `type` e `description` somente quando já existe no HTML publicado.
- Gere localmente com `node scripts/generate-site-index.js`. O comando descobre HTMLs rastreados pelo Git, exclui `templates/`, `index-v1.html` e documentos com `noindex`, e valida URLs, domínios, duplicatas e rotas privadas.
- O workflow `.github/workflows/update-projetos.yml` executa o gerador a cada alteração relevante na `main` e só faz commit quando a estrutura mudou. Commits que alteram apenas o índice não reexecutam o workflow.
- O site comercial contribui com `.generated/site-commercial.json`: ele é produzido a partir do `dist/` do Astro, após o build/deploy, e contém exclusivamente metadados allowlisted de páginas indexáveis. O repositório público consolida esse manifesto; não acessa o código privado.
- Para adicionar uma página, publique um HTML com `<title>` (e descrição opcional) no site público, ou uma rota Astro com canonical absoluto no site comercial. Para excluir uma rota pública, marque-a com `noindex`; rotas administrativas e internas são rejeitadas pela validação.
- O secret `NOVO_SITE_SYNC_TOKEN` também deve existir no repositório privado, com permissão mínima `Contents: Read and write` nos dois repositórios, para atualizar o manifesto comercial.
- Verifique a publicação com `curl -I https://borgesfernando.github.io/boloesdoborges/site-index.json`; a resposta deve ser `200` com `Content-Type: application/json`.

## ❓ FAQ (HTML estático)

- `faq.json` continua como fonte de verdade.
- `faq.html` é gerado em HTML estático para indexação e não depende de JavaScript.
- Sempre que `faq.json` for atualizado, regenere `faq.html` antes do deploy.
- Script oficial: `node scripts/generate-faq-html.js`


## 👀 Pronto para entrar?

- Cadastre-se no [formulário de interesse](https://docs.google.com/forms/d/e/1FAIpQLSeGURdHgTYpsLF4hcW45xlHJGkdqv4ubCNr3lvGk4dGCcTqxw/viewform).
- Acompanhe as redes e fique por dentro de novas cotas.
- Junte-se aos projetos que combinam com seu perfil.

## 💌 Contato

Dúvidas ou sugestões? Escreva para [correiodofernando@gmail.com](mailto:correiodofernando@gmail.com).

---

**⚠️ Importante**: Projeto em formato de ação entre amigos, sem qualquer ligação com a Caixa Econômica Federal. Participação voluntária e exclusiva para maiores de 18 anos.
