#!/usr/bin/env node
// Injeta o cross-link oficial para o site de participação (site.boloesdoborges.shop)
// no bloco .trust-links do rodapé de todas as páginas indexáveis.
// Idempotente: ignora páginas que já contêm o link.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const COMMERCIAL_URL = 'https://site.boloesdoborges.shop';
const CROSS_LINK = `        <a href="${COMMERCIAL_URL}" rel="noopener noreferrer">Participação e cadastro</a>`;

function trackedHtmlFiles() {
  return execFileSync('git', ['ls-files', '*.html'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean)
    .filter((file) => !file.startsWith('templates/') && file !== 'index-v1.html');
}

function main() {
  let changed = 0;
  let skipped = 0;
  for (const file of trackedHtmlFiles()) {
    const filePath = path.join(ROOT, file);
    let html = fs.readFileSync(filePath, 'utf8');
    if (/\bnoindex\b/i.test(html)) {
      skipped += 1;
      continue;
    }
    if (html.includes(COMMERCIAL_URL)) {
      skipped += 1;
      continue;
    }
    const regex = /(<div\s+class="trust-links">)([\s\S]*?)(<\/div>)/;
    if (regex.test(html)) {
      html = html.replace(regex, (match, open, inner, close) => {
        const trimmed = inner.trimEnd();
        return `${open}${trimmed}\n${CROSS_LINK}\n      ${close}`;
      });
    } else {
      const footerRegex = /(<p>©\s*\d{4}\s+(?:Comunidade )?Bolões do Borges[\s\S]*?<\/p>)/;
      if (!footerRegex.test(html)) {
        skipped += 1;
        continue;
      }
      html = html.replace(
        footerRegex,
        `<p><a href="${COMMERCIAL_URL}" rel="noopener noreferrer">Participação e cadastro no site oficial</a></p>$1`,
      );
    }
    fs.writeFileSync(filePath, html);
    changed += 1;
  }
  console.log(`Cross-link aplicado em ${changed} página(s); ${skipped} ignorada(s).`);
}

main();
