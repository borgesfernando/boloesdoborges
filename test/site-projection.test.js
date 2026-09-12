const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const projection = JSON.parse(fs.readFileSync(path.join(root, 'data/site-projection.json'), 'utf8'));
const runtime = fs.readFileSync(path.join(root, 'js/estado-operacional.js'), 'utf8');
const page = fs.readFileSync(path.join(root, 'atualizacoes.html'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/sync-publisher-site-projection.yml'), 'utf8');

const forbidden = /(?:token|secret|senha|password|planilha|spreadsheet|drive|pix|whatsapp|authorization|cookie)/i;

test('fallback Site Projection v1 é público e válido', () => {
  assert.equal(projection.schemaVersion, 1);
  assert.equal(projection.projectionVersion, 'site-projection.v1');
  assert.deepEqual(projection.current, {});
  assert.deepEqual(projection.updates, []);
  assert.equal(forbidden.test(JSON.stringify(projection)), false);
});

test('painel usa Site Projection e não estado-operacional.json', () => {
  assert.match(runtime, /data\/site-projection\.json/);
  assert.match(runtime, /project\.status === 'OPEN' \|\| project\.status === 'ACTIVE'/);
  assert.match(runtime, /Nenhum projeto ativo hoje/);
  assert.match(runtime, /Próximo projeto especial/);
  assert.match(runtime, /Atualizações confirmadas hoje/);
  assert.doesNotMatch(runtime, /data\/estado-operacional\.json/);
});

test('próximo especial é calendário futuro sem virar abertura', () => {
  assert.match(runtime, /data\/calendario-caixa\.json/);
  assert.match(runtime, /item\.drawDate >= today/);
  assert.match(page, /Uma abertura só é apresentada quando foi publicada pelo projeto/);
});

test('sync recebe exatamente o contrato público do Publisher', () => {
  assert.match(workflow, /publisher-site-projection-sync/);
  assert.match(workflow, /projectionVersion !== 'site-projection\.v1'/);
  assert.match(workflow, /sha256sum/);
  assert.match(workflow, /forbidden_content/);
  assert.match(workflow, /node --test test\/site-projection\.test\.js/);
});
