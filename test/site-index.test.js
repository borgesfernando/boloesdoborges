const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { PUBLIC_ORIGIN, PUBLIC_BASE_PATH, COMMERCIAL_ORIGIN, assertPage, publicPageFromFile, sameStructure, validateIndex } = require('../scripts/generate-site-index');

test('extrai metadados de uma página pública e ignora noindex', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-index-'));
  fs.writeFileSync(path.join(root, 'pagina.html'), '<title>Página &amp; teste</title><meta name="description" content="Descrição">');
  fs.writeFileSync(path.join(root, 'oculta.html'), '<title>Oculta</title><meta name="robots" content="noindex">');
  assert.deepEqual(publicPageFromFile(root, 'pagina.html'), { title: 'Página & teste', url: `${PUBLIC_ORIGIN}${PUBLIC_BASE_PATH}/pagina.html`, path: `${PUBLIC_BASE_PATH}/pagina.html`, type: 'page', description: 'Descrição' });
  assert.equal(publicPageFromFile(root, 'oculta.html'), null);
  fs.rmSync(root, { recursive: true, force: true });
});

test('rejeita URL duplicada, domínio externo e rota privada', () => {
  const page = { title: 'Início', url: `${COMMERCIAL_ORIGIN}/`, path: '/', type: 'page' };
  assert.throws(() => assertPage({ ...page, url: 'https://example.com/', path: '/' }, COMMERCIAL_ORIGIN));
  assert.throws(() => assertPage({ ...page, url: `${COMMERCIAL_ORIGIN}/admin`, path: '/admin' }, COMMERCIAL_ORIGIN));
  const index = { version: 1, generated_at: '2026-01-01T00:00:00.000Z', page_count: 2, sites: [
    { id: 'public', name: 'Público', base_url: `${PUBLIC_ORIGIN}${PUBLIC_BASE_PATH}`, pages: [] },
    { id: 'commercial', name: 'Comercial', base_url: COMMERCIAL_ORIGIN, pages: [page, { ...page }] },
  ] };
  assert.throws(() => validateIndex(index));
});

test('generated_at não altera a comparação estrutural', () => {
  const base = { version: 1, generated_at: '2026-01-01T00:00:00.000Z', page_count: 0, sites: [] };
  assert.equal(sameStructure(base, { ...base, generated_at: '2026-02-01T00:00:00.000Z' }), true);
});
