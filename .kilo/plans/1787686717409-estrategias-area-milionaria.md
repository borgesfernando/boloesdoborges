# Plano — Nova área "Estratégias" (+Milionária / Matriz+)

## Objetivo

Adicionar uma área "Estratégias" nos **dois sites** (`boloesdoborges` legado e
`novo-site-boloes` Astro), onde serão publicadas as estratégias de cada modalidade.
Nesta primeira entrega, publicar apenas a estratégia da **+Milionária** (o sistema
"Matriz+"), com o conteúdo do arquivo `test.txt`.

## Decisões já acordadas

- **Escopo:** os dois sites.
- **URL/navegação:** slug sem acento `estrategias`; item "Estratégias" no menu principal.
  - Novo site: `/estrategias` (listagem) + `/estrategias/milionaria` (detalhe); link no `Header.astro` e no `Footer.astro`.
  - Legado: `estrategias.html` (listagem) + `estrategias/milionaria.html` (detalhe); link no menu de **todas** as páginas.
- **Origem do conteúdo:** nativo por site (converter `test.txt` uma vez para HTML no legado e para markup Astro no novo site). Sem scripts de geração nem workflows novos.

## Fonte do conteúdo

`/home/borges/websites_boloes/boloesdoborges/test.txt` — documento Markdown "Matriz+ —
Gerador Estratégico da +Milionária". Seções a reproduzir:

1. Intro: "O Matriz+ é o sistema utilizado para construir as carteiras…" (análise do conjunto como carteira).
2. Mais cobertura, menos redundância (unidades atômicas 6 dezenas + 2 trevos; exemplo 46 apostas → 113 combinações).
3. Distribuição equilibrada das dezenas e dos trevos (50 dezenas, 6 trevos, 15 pares de trevos).
4. Controle de sobreposição entre apostas (1.225 pares possíveis de dezenas).
5. Seleção orientada pela contribuição marginal.
6. Otimização após a geração (busca local / substituições).
7. Controle estrutural das apostas (concentração, sequências, distribuição).
8. Histórico como referência, não como previsão (375 concursos; geometria/diversidade).
9. O que o Matriz+ realmente otimiza (eficiência da carteira, não previsão).
10. Em resumo ("O que este jogo acrescenta a tudo aquilo que já estamos cobrindo?").

Manter os números/dados factuais do texto (46 apostas, 113 combinações, 50 dezenas,
6 trevos, 15 pares, 1.225 pares, 375 concursos, 1 de 46 concentrada, zero sequências de 3+).

## SEO / metadados

- **Listagem**
  - Título: `Estratégias` (novo site: `Estratégias · Super Bolão` via BaseLayout).
  - Description: "Metodologias e geradores estratégicos usados para montar as carteiras de cada modalidade, com foco em cobertura, diversidade e transparência — sem promessa de acerto."
- **Detalhe +Milionária**
  - Título: `Matriz+ — Gerador Estratégico da +Milionária`.
  - Description: "Como o Matriz+ monta carteiras de apostas da +Milionária: cobertura ampla, distribuição equilibrada e controle de sobreposição, sem promessas de acerto."
- Incluir em ambas o aviso legal padrão (sem vínculo com a Caixa, sem promessa de ganho, maiores de 18 anos), como já existe nas demais páginas.

---

## Mudanças no legado (`boloesdoborges`)

### 1. Criar `estrategias.html` (listagem)

Clonar a estrutura de uma página simples como `acumulados.html` (nav + header + main + footer):
- `<title>Estratégias | Super Bolão</title>` e `<meta name="description">` conforme acima.
- `<link rel="canonical" href="https://borgesfernando.github.io/boloesdoborges/estrategias.html">`.
- Header: `<h1>Estratégias</h1>` + subtítulo explicando que cada modalidade tem sua metodologia de geração.
- `main` com uma `card` contendo uma lista/grade de estratégias. Inicialmente 1 card:
  - Título: `+Milionária — Matriz+`
  - Resumo curto + link para `estrategias/milionaria.html`.
  - Nota de que novas modalidades serão adicionadas.
- Rodapé padrão (idêntico ao de `acumulados.html`).

### 2. Criar `estrategias/milionaria.html` (detalhe)

Clonar a estrutura de `ia.html` (que já usa `.card`, `<h2>`, `<ul>`, `<p>`, `<strong>`, `<em>`):
- `<title>Matriz+ — Gerador Estratégico da +Milionária</title>`.
- `<link rel="canonical" href="https://borgesfernando.github.io/boloesdoborges/estrategias/milionaria.html">`.
- CSS: `<link rel="stylesheet" href="../css/styles.css">` (está em subpasta).
- Header: `<h1>Matriz+ — Gerador Estratégico da +Milionária</h1>` + subtítulo.
- Corpo: uma `card` por seção do `test.txt`, convertendo Markdown → HTML semântico
  (`**negrito**` → `<strong>`, `*itálico*` → `<em>`, listas `-` → `<ul><li>`,
  títulos `##` → `<h2>`, `###` → `<h3>`, blocos inline mantidos como texto).
- CTA final (reutilizar bloco de botões de `ia.html`: "Entrar na Comunidade" + "Perguntas Frequentes" + "Voltar").
- Aviso legal no rodapé.

### 3. Atualizar o menu (nav) em todas as páginas

Adicionar o link `Estratégias` no bloco `<nav class="site-nav">` de **todas** as 25 páginas
listadas abaixo. Posição sugerida: logo após "Linhas de Projetos" (antes de "Mensais"),
mantendo "Estratégias" separado de "Estratégicos" para evitar confusão visual.

Arquivos que possuem `<nav class="site-nav">` (grep confirmado):

- Raiz: `index.html`, `linhas-de-projetos.html`, `mensais.html`, `especiais.html`, `acumulados.html`, `faq.html`, `prest.html`, `ia.html`, `sitemap.html`
- Institucional: `institucional/sobre.html`, `institucional/termos.html`, `institucional/privacidade.html`, `institucional/contato.html`
- Bolões especiais: `boloes/especiais/mega-virada.html`, `boloes/especiais/lf-independencia.html`, `boloes/especiais/quina-saojoao.html`, `boloes/especiais/ds-pascoa.html`
- Bolões mensais: `boloes/mensais/quina-mensal.html`, `boloes/mensais/lf-mensal.html`, `boloes/mensais/dupla-sena-mensal.html`
- Bolões estratégicos: `boloes/acumulados/mega-acumulada.html`, `boloes/acumulados/milionaria.html`
- Templates (fallback/noindex): `templates/acumulados.html`, `templates/mensais.html`, `templates/especiais.html`

**Caminhos relativos por profundidade** (o link deve usar a profundidade correta):
- Raiz: `href="estrategias.html"`
- `institucional/*`: `href="../estrategias.html"`
- `boloes/*/*`: `href="../../estrategias.html"`
- `templates/*`: `href="estrategias.html"`

Não editar: `boloes/mensais/ds-mensal.html` (é redirect para `dupla-sena-mensal.html`,
sem nav) e `index-v1.html` (fallback antigo, sem nav e já `noindex`).

### 4. Atualizar sitemap do legado

- `sitemap.html`: adicionar na lista "Páginas Principais" o link `estrategias.html` (Estratégias)
  e, opcionalmente, uma entrada para `estrategias/milionaria.html`.
- `sitemap.xml`: adicionar:
  - `https://borgesfernando.github.io/boloesdoborges/estrategias.html`
  - `https://borgesfernando.github.io/boloesdoborges/estrategias/milionaria.html`

### 5. (Sem mudança) `robots.txt`

`test.txt` já está em `Disallow`. As novas páginas `estrategias*` devem permanecer indexáveis (não bloquear).

---

## Mudanças no novo site (`novo-site-boloes`)

### 1. Criar `src/pages/estrategias/index.astro` (listagem)

Modelo: `src/pages/linhas-de-projetos/index.astro` + `src/pages/ia.astro`.
- `import BaseLayout from '../../layouts/BaseLayout.astro';`
- Props: `title="Estratégias"`, `description="..."` (acima), `breadcrumbLabel="Estratégias"`.
- Hero com `badge-pill` "Estratégias", `<h1>` e parágrafo introdutório.
- Grade com um card (`glow-card border border-white/10 p-6`) por modalidade. Inicialmente:
  - Título `+Milionária — Matriz+`, resumo curto, link `href="/estrategias/milionaria"`.
  - Nota de que novas modalidades serão adicionadas.

### 2. Criar `src/pages/estrategias/milionaria.astro` (detalhe)

Modelo: `src/pages/ia.astro` (padrão visual `glow-card`, `badge-pill`, seções).
- `title="Matriz+ — Gerador Estratégico da +Milionária"`, `description="..."` (acima).
- Reproduzir as seções do `test.txt` em markup Astro/Tailwind (uma seção por tópico,
  usando `glow-card border border-white/10 p-6`, `<h2>`, listas `list-disc`, `<strong>`).
- Manter aviso legal (sem vínculo com a Caixa, sem promessa de acerto).
- `CallToAction` no final (como em `ia.astro`), se desejado.

### 3. Atualizar `src/components/Header.astro`

Adicionar `{ href: '/estrategias', label: 'Estratégias' }` ao array `navLinks`.
Sugestão: após "Linhas de projetos". O `isActive` já cobre `/estrategias/*` via `startsWith`.

### 4. Atualizar `src/components/Footer.astro`

Na seção "Navegação", adicionar `<a href="/estrategias" class="footer-link">Estratégias</a>`.
Recomendação opcional (evitar ambiguidade): renomear o link existente
"IA & Estratégia" (`/ia`) para "IA nos projetos", já que agora "Estratégias" é uma área própria.

### 5. Sitemap

`@astrojs/sitemap` gera o sitemap automaticamente no build; `/estrategias` e
`/estrategias/milionaria` entram sem ação manual (com `trailingSlash: 'never'`).

---

## Ordem de execução sugerida

1. Novo site: criar as duas páginas + editar `Header.astro` e `Footer.astro`.
2. Legado: criar `estrategias.html` e `estrategias/milionaria.html`.
3. Legado: aplicar o link "Estratégias" no nav das 25 páginas (caminhos relativos por profundidade).
4. Legado: atualizar `sitemap.html` e `sitemap.xml`.
5. Validar (abaixo).

## Validação

- **Novo site:** `npm run build` (sem erros de build/tipagem; gera `dist/estrategias/index.html` e `dist/estrategias/milionaria/index.html`) e `npm run dev` para conferência visual. Conferir sitemap gerado.
- **Legado:** abrir `estrategias.html` e `estrategias/milionaria.html` localmente; conferir que o CSS carrega, que os links do nav apontam para os caminhos corretos em cada profundidade e que as âncoras internas funcionam.
- **Consistência:** conferir título/description/canonical das 4 novas páginas; conferir que o conteúdo reproduz fielmente os dados do `test.txt`.

## Riscos / atenção

- O nav do legado é duplicado; é a parte mais mecânica e propensa a erro de caminho relativo (`./` vs `../` vs `../../`). Validar uma página de cada profundidade.
- Não criar scripts de geração nem workflows de sync (decisão: conteúdo nativo por site).
- Não tocar em `faq.json`/`faq.html`/`data/*` nem em `projects.ts`/`config.json` — a área é independente das linhas de projetos.
- Preservar o aviso legal e o tom "sem promessa de acerto" do conteúdo original.
