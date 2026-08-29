#!/usr/bin/env node
// Injeta Open Graph, Twitter Cards e favicon em todas as páginas indexáveis do site
// público. Reutiliza title/description/canonical existentes. Idempotente.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_BASE = 'https://borgesfernando.github.io/boloesdoborges';
const SITE_NAME = 'Bolões do Borges';
const OG_IMAGE = 'https://site.boloesdoborges.shop/images/hero-operations-og.jpg';
const FAVICON_URL = `${PUBLIC_BASE}/favicon-192x192.png`;

function trackedHtmlFiles() {
  return execFileSync('git', ['ls-files', '*.html'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean)
    .filter((file) => !file.startsWith('templates/') && file !== 'index-v1.html' && file !== 'boloes/mensais/ds-mensal.html');
}

function escapeAttr(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function extract(html, expression) {
  return html.match(expression)?.[1]?.trim() ?? null;
}

function main() {
  let applied = 0;
  let skipped = 0;
  for (const file of trackedHtmlFiles()) {
    const filePath = path.join(ROOT, file);
    let html = fs.readFileSync(filePath, 'utf8');
    if (html.includes('property="og:title"')) {
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
    const t = escapeAttr(title);
    const d = escapeAttr(description ?? title);
    const block = [
      `  <link rel="icon" href="${FAVICON_URL}" type="image/svg+xml">`,
      `  <meta property="og:title" content="${t}">`,
      `  <meta property="og:description" content="${d}">`,
      `  <meta property="og:url" content="${canonical}">`,
      `  <meta property="og:type" content="website">`,
      `  <meta property="og:site_name" content="${SITE_NAME}">`,
      `  <meta property="og:image" content="${OG_IMAGE}">`,
      `  <meta property="og:image:width" content="1200">`,
      `  <meta property="og:image:height" content="630">`,
      `  <meta name="twitter:card" content="summary_large_image">`,
      `  <meta name="twitter:title" content="${t}">`,
      `  <meta name="twitter:description" content="${d}">`,
      `  <meta name="twitter:image" content="${OG_IMAGE}">`,
    ].join('\n');
    html = html.replace('</head>', `${block}\n</head>`);
    fs.writeFileSync(filePath, html);
    applied += 1;
  }
  console.log(`OG/favicon aplicado em ${applied} página(s); ${skipped} ignorada(s).`);
}

main();
