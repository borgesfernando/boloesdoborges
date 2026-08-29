#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const PUBLIC_ORIGIN = 'https://borgesfernando.github.io';
const PUBLIC_BASE_PATH = '/boloesdoborges';
const PUBLIC_BASE_URL = `${PUBLIC_ORIGIN}${PUBLIC_BASE_PATH}`;
const COMMERCIAL_ORIGIN = 'https://site.boloesdoborges.shop';
const PAGE_KEYS = new Set(['title', 'url', 'path', 'type', 'description']);

function trackedHtmlFiles(root) {
  return execFileSync('git', ['ls-files', '*.html'], { cwd: root, encoding: 'utf8' })
    .split('\n').filter(Boolean)
    .filter((file) => !file.startsWith('templates/') && file !== 'index-v1.html');
}

function findValue(html, expression) {
  return html.match(expression)?.[1]?.trim() ?? null;
}

function decodeHtml(value) {
  return value.replaceAll('&quot;', '"').replaceAll('&#34;', '"').replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
}

function assertPage(page, expectedOrigin, requiredPathPrefix = '') {
  if (!page || typeof page !== 'object' || Object.keys(page).some((key) => !PAGE_KEYS.has(key))) throw new Error('Campos de página inválidos');
  if (!page.title || !page.url || !page.path || page.type !== 'page' || Object.values(page).some((value) => value == null)) throw new Error('Página incompleta');
  const url = new URL(page.url);
  if (url.origin !== expectedOrigin || url.pathname !== page.path || !url.pathname.startsWith(requiredPathPrefix)) throw new Error(`URL fora do domínio permitido: ${page.url}`);
  if (/^\/(?:boloesdoborges\/)?(?:admin|internal)(?:\/|$)/i.test(url.pathname)) throw new Error(`Rota privada encontrada: ${page.path}`);
}

function publicPageFromFile(root, file) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  if (/\bnoindex\b/i.test(html)) return null;
  const title = findValue(html, /<title>([^<]+)<\/title>/i);
  if (!title) throw new Error(`Página sem title: ${file}`);
  const description = findValue(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/i);
  const relativePath = `/${file}`;
  const page = { title: decodeHtml(title), url: `${PUBLIC_BASE_URL}${relativePath}`, path: `${PUBLIC_BASE_PATH}${relativePath}`, type: 'page' };
  if (description) page.description = decodeHtml(description);
  return page;
}

function publicSite(root) {
  const pages = trackedHtmlFiles(root).map((file) => publicPageFromFile(root, file)).filter(Boolean).sort((a, b) => a.url.localeCompare(b.url));
  return { id: 'public', name: 'Bolões do Borges — GitHub Pages', base_url: PUBLIC_BASE_URL, pages };
}

function commercialSite(root) {
  const manifestPath = path.join(root, '.generated', 'site-commercial.json');
  if (!fs.existsSync(manifestPath)) throw new Error(`Manifesto comercial ausente: ${manifestPath}`);
  const site = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!site || site.id !== 'commercial' || site.base_url !== COMMERCIAL_ORIGIN || !Array.isArray(site.pages)) throw new Error('Manifesto comercial inválido');
  site.pages.forEach((page) => assertPage(page, COMMERCIAL_ORIGIN));
  return { ...site, pages: [...site.pages].sort((a, b) => a.url.localeCompare(b.url)) };
}

function validateIndex(index) {
  if (!index || index.version !== 1 || !Array.isArray(index.sites) || index.sites.length !== 2 || !Number.isInteger(index.page_count)) throw new Error('Índice inválido');
  const expected = new Map([['public', PUBLIC_BASE_URL], ['commercial', COMMERCIAL_ORIGIN]]);
  const urls = new Set();
  let count = 0;
  for (const site of index.sites) {
    if (!expected.has(site.id) || site.base_url !== expected.get(site.id) || !Array.isArray(site.pages)) throw new Error(`Site inválido: ${site.id}`);
    for (const page of site.pages) {
      assertPage(page, new URL(site.base_url).origin, site.id === 'public' ? PUBLIC_BASE_PATH : '');
      if (urls.has(page.url)) throw new Error(`URL duplicada encontrada: ${page.url}`);
      urls.add(page.url);
      count += 1;
    }
  }
  if (count !== index.page_count) throw new Error('page_count inválido');
  return index;
}

function structuralIndex(index) {
  const { generated_at, ...structural } = index;
  return structural;
}

function sameStructure(left, right) {
  return JSON.stringify(structuralIndex(left)) === JSON.stringify(structuralIndex(right));
}

function generate(root) {
  const sites = [publicSite(root), commercialSite(root)];
  const index = { version: 1, generated_at: new Date().toISOString(), page_count: sites.reduce((sum, site) => sum + site.pages.length, 0), sites };
  return validateIndex(index);
}

function main() {
  const root = path.resolve(__dirname, '..');
  const output = path.join(root, 'site-index.json');
  const generated = generate(root);
  const previous = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : null;
  if (previous && sameStructure(previous, generated)) {
    console.log('site-index.json já representa a estrutura atual');
    return;
  }
  fs.writeFileSync(output, `${JSON.stringify(generated, null, 2)}\n`);
  console.log(`site-index.json gerado com ${generated.page_count} páginas`);
}

if (require.main === module) main();

module.exports = { PUBLIC_BASE_URL, PUBLIC_BASE_PATH, PUBLIC_ORIGIN, COMMERCIAL_ORIGIN, assertPage, publicPageFromFile, validateIndex, sameStructure, generate };
