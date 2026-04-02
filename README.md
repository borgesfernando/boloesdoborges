# 📌 Projeto Bolões do Borges

**🤝 Sua comunidade confiável de bolões!**
Projetos coordenados com transparência, tecnologia e 15 anos de experiência para multiplicar suas chances nos principais concursos da Caixa.

## 💊 O que oferecemos

- ✨ 15 anos de organização contínua e comunidade engajada
- 🧠 Modelos estatísticos e IA para construir jogos diversificados
- 🔒 Governança, prestação de contas e controle de acesso aos documentos
- 📅 Calendário atualizado com projetos mensais, especiais e estratégicos

## 📑 Linhas de projetos

- **Projetos Mensais**: Lotofácil, Quina e Dupla Sena, com rotinas próprias de sorteio para quem gosta de acompanhar resultados com frequência.
- **Projetos Especiais**: Quina de São João, Lotofácil da Independência, Dupla Sena de Páscoa e Mega da Virada.
- **Projetos Estratégicos (Acumulados)**: ativações pontuais quando Mega-Sena ou Quina atingem prêmios relevantes, com comunicação dedicada e janelas de entrada curtas.

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

- O script `scripts/update-mega-status.js` consulta a API oficial da Caixa (`https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena`) e grava o resultado consolidado em `data/mega-status.json`, incluindo o campo `ativo` calculado a partir do valor mínimo configurado para o projeto `mega-acumulada` em `data/projetos.json`.
- O workflow `.github/workflows/update-mega-status.yml` roda **todos os dias às 01h30 UTC** (22h30 do dia anterior em Brasília) e ao ser disparado manualmente via `workflow_dispatch`. Ele atualiza o JSON sempre após a atualização oficial da Caixa.
- Sempre que `data/mega-status.json` muda, o workflow `.github/workflows/sync-mega-status-novo-site.yml` copia o arquivo para `borgesfernando/novo-site/src/data/mega-status.json` – assim o banner automático aparece tanto na landing antiga (VPS) quanto no novo site Astro.
- A home (`index.html`) e a página `boloes/acumulados/mega-acumulada.html` leem esse JSON e exibem o destaque apenas quando `ativo: true`. No front-end, o alerta é automaticamente ocultado assim que a data/horário de fechamento (18h do dia anterior ao sorteio) é atingida.

## 🚨 Alerta dos projetos mensais

- O script `scripts/update-mensais-alert.js` grava `data/quina-mensal-alert.json`, `data/lf-mensal-alert.json` ou `data/ds-mensal-alert.json` com o campo `ativo`.
- Os workflows `.github/workflows/set-quina-mensal-alert.yml`, `.github/workflows/set-lf-mensal-alert.yml` e `.github/workflows/set-ds-mensal-alert.yml` são disparados via `workflow_dispatch` (normalmente pelo Apps Script) e ativam/desativam o alerta do projeto específico.
- Sempre que os arquivos de alerta mudam, o workflow `.github/workflows/sync-mensais-alert-novo-site.yml` copia os JSONs para `borgesfernando/novo-site/src/data/`, mantendo o destaque sincronizado nos dois sites.
- A home (`index.html`) e as páginas `boloes/mensais/quina-mensal.html`, `boloes/mensais/lf-mensal.html` e `boloes/mensais/dupla-sena-mensal.html` exibem o alerta somente quando `ativo: true` para o projeto chamado.

## 🧭 Estrutura de URLs (SEO)

- Páginas principais: `index.html`, `mensais.html`, `especiais.html`, `acumulados.html`, `faq.html`, `prest.html`, `ia.html`.
- Páginas institucionais: `institucional/sobre.html`, `institucional/termos.html`, `institucional/privacidade.html`, `institucional/contato.html`.
- Páginas de bolões (URLs limpas):
  - Especiais: `boloes/especiais/*.html`
  - Mensais: `boloes/mensais/*.html`
  - Acumulados: `boloes/acumulados/*.html`
- Templates antigos permanecem como fallback e estão marcados com `noindex`.

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
