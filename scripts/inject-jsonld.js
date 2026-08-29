#!/usr/bin/env node
// Injeta JSON-LD (@graph: Organization + Person + WebSite + WebPage + ImageObject + BreadcrumbList)
// em todas as páginas indexáveis do site público.
// A entidade Organization é compartilhada com o site comercial (site.boloesdoborges.shop),
// reforçando ao Google que se trata da mesma organização. Idempotente.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://borgesfernando.github.io/boloesdoborges';
const ORG_URL = 'https://site.boloesdoborges.shop';
const ORG_DESCRIPTION =
  'Bolões da Mega-Sena, Lotofácil, Quina e Dupla Sena organizados com transparência, 15 anos de histórico e uso responsável de dados e tecnologia.';
const INSTITUTIONAL_NAME = 'Comunidade Bolões do Borges';
const ORG_NAME = 'Bolões do Borges';
const OWNER = 'Fernando Borges';
const EMAIL = 'correiodofernando@gmail.com';
const LOGO_URL = `${ORG_URL}/images/brand/boloes-do-borges-logo.png`;
const OG_IMAGE = `${ORG_URL}/images/hero-operations-og.jpg`;

const LINE_CRUMB = {
  'estrategias/': { name: 'Estratégias', item: '/estrategias.html' },
  'boloes/especiais/': { name: 'Projetos Especiais', item: '/especiais.html' },
  'boloes/mensais/': { name: 'Projetos Mensais', item: '/mensais.html' },
  'boloes/acumulados/': { name: 'Projetos Estratégicos', item: '/acumulados.html' },
};

function trackedHtmlFiles() {
  return execFileSync('git', ['ls-files', '*.html'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean)
    .filter((file) => !file.startsWith('templates/') && file !== 'index-v1.html' && file !== 'boloes/mensais/ds-mensal.html');
}

function extract(html, expression) {
  return html.match(expression)?.[1]?.trim() ?? null;
}

function pageNameFromTitle(title) {
  const main = String(title).split('|')[0].trim();
  return main.length ? main : String(title).trim();
}

function breadcrumbList(file, pageName, canonical) {
  if (file === 'index.html') return null;
  const crumbs = [{ '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` }];
  const line = Object.keys(LINE_CRUMB).find((prefix) => file.startsWith(prefix));
  if (line) {
    crumbs.push({
      '@type': 'ListItem',
      position: 2,
      name: LINE_CRUMB[line].name,
      item: `${SITE_URL}${LINE_CRUMB[line].item}`,
    });
    crumbs.push({ '@type': 'ListItem', position: 3, name: pageName, item: canonical });
  } else {
    crumbs.push({ '@type': 'ListItem', position: 2, name: pageName, item: canonical });
  }
  return { '@type': 'BreadcrumbList', itemListElement: crumbs };
}

function buildGraph(file, title, description, canonical) {
  const pageName = pageNameFromTitle(title);
  return [
    {
      '@type': 'Organization',
      '@id': `${ORG_URL}#organization`,
      name: INSTITUTIONAL_NAME,
      alternateName: ORG_NAME,
      url: ORG_URL,
      email: EMAIL,
      founder: { '@type': 'Person', '@id': `${ORG_URL}#person`, name: OWNER },
      description: ORG_DESCRIPTION,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
      contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', email: EMAIL }],
    },
    { '@type': 'Person', '@id': `${ORG_URL}#person`, name: OWNER, email: EMAIL },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
      url: SITE_URL,
      name: ORG_NAME,
      inLanguage: 'pt-BR',
      publisher: { '@id': `${ORG_URL}#organization` },
    },
    {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: title,
      description: description ?? title,
      inLanguage: 'pt-BR',
      isPartOf: { '@id': `${SITE_URL}#website` },
      about: { '@id': `${ORG_URL}#organization` },
      primaryImageOfPage: { '@id': `${OG_IMAGE}#primaryimage` },
    },
    { '@type': 'ImageObject', '@id': `${OG_IMAGE}#primaryimage`, url: OG_IMAGE },
    breadcrumbList(file, pageName, canonical),
  ].filter(Boolean);
}

function main() {
  let applied = 0;
  let skipped = 0;
  for (const file of trackedHtmlFiles()) {
    const filePath = path.join(ROOT, file);
    let html = fs.readFileSync(filePath, 'utf8');
    if (html.includes('application/ld+json')) {
      skipped += 1;
      continue;
    }
    const title = extract(html, /<title>([^<]+)<\/title>/i);
    const description = extract(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const canonical = extract(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    if (!title || !canonical) {
      console.error(`Aviso: sem title/canonical — ${file}`);
      skipped += 1;
      continue;
    }
    const graph = buildGraph(file, title, description, canonical);
    const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
      .replace(/\u007F/g, '')
      .replace(/</g, '\\u003c');
    const block = `  <script type="application/ld+json">\n${jsonLd}\n  </script>`;
    html = html.replace('</head>', `${block}\n</head>`);
    fs.writeFileSync(filePath, html);
    applied += 1;
  }
  console.log(`JSON-LD aplicado em ${applied} página(s); ${skipped} ignorada(s).`);
}

main();
