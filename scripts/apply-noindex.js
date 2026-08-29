#!/usr/bin/env node
// Aplica <meta name="robots" content="noindex, follow"> nas páginas comerciais do site
// público (github.io), mantendo o site.boloesdoborges.shop como domínio principal
// para projetos, estratégias e IA. Idempotente.
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ROBOTS_META = '<meta name="robots" content="noindex, follow">';

const NOINDEX_FILES = [
  // projetos
  'boloes/especiais/lf-independencia.html',
  'boloes/especiais/quina-saojoao.html',
  'boloes/especiais/ds-pascoa.html',
  'boloes/especiais/mega-virada.html',
  'boloes/mensais/quina-mensal.html',
  'boloes/mensais/lf-mensal.html',
  'boloes/mensais/dupla-sena-mensal.html',
  'boloes/acumulados/mega-acumulada.html',
  'boloes/acumulados/milionaria.html',
  // linhas de projetos
  'mensais.html',
  'especiais.html',
  'acumulados.html',
  // estratégias
  'estrategias.html',
  'estrategias/mega-sigma.html',
  'estrategias/mega-synapse.html',
  'estrategias/mega-mosaico.html',
  'estrategias/milionaria.html',
  'estrategias/lotofacil.html',
  'estrategias/quina-mensal.html',
  'estrategias/dupla-sena-mensal.html',
  // IA
  'ia.html',
];

function main() {
  let applied = 0;
  let already = 0;
  for (const file of NOINDEX_FILES) {
    const filePath = path.join(ROOT, file);
    if (!fs.existsSync(filePath)) {
      console.error(`Aviso: arquivo não encontrado — ${file}`);
      continue;
    }
    let html = fs.readFileSync(filePath, 'utf8');
    if (/name=["']robots["']/i.test(html)) {
      already += 1;
      continue;
    }
    const viewportRegex = /(<meta\s+name=["']viewport["'][^>]*>)/i;
    if (!viewportRegex.test(html)) {
      console.error(`Aviso: sem meta viewport para inserir after — ${file}`);
      continue;
    }
    html = html.replace(viewportRegex, `$1\n  ${ROBOTS_META}`);
    fs.writeFileSync(filePath, html);
    applied += 1;
  }
  console.log(`noindex aplicado em ${applied} página(s); ${already} já tinham robots meta.`);
}

main();
