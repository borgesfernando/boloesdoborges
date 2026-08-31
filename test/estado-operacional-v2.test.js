const assert = require('node:assert/strict');
const test = require('node:test');
const { emptyAggregate, loadPayload, updateAggregate } = require('../scripts/update-mensais-alert');
const slugs = ['lf-mensal','quina-mensal','ds-mensal','lf-independencia','quina-saojoao','ds-pascoa','mega-virada','mega-50mais','milionaria'];
test('schema v2 contém os nove projetos', () => assert.deepEqual(Object.keys(require('../data/estado-operacional.json').projetos).sort(), slugs.sort()));
test('registro rejeita campos sensíveis', () => assert.throws(() => loadPayload({ ALERTA_PROJETO: 'lf-mensal', ALERTA_ATIVO: 'false', ALERTA_CONTEXTO_PUBLICO: '{"planilhaId":"x"}' }), /inválido/));
test('merge preserva os outros oito projetos', () => { const base = emptyAggregate(); const file = require('node:path').join(require('node:os').tmpdir(), `estado-${Date.now()}.json`); require('node:fs').writeFileSync(file, JSON.stringify(base)); const next = updateAggregate(loadPayload({ ALERTA_PROJETO: 'lf-mensal', ALERTA_ATIVO: 'false' }), file); assert.equal(next.projetos.milionaria.slug, 'milionaria'); assert.equal(next.projetos['lf-mensal'].estado, 'FECHADA'); });

