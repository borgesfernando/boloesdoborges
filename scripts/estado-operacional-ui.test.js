const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const context = {
  window: { location: { pathname: '/boloesdoborges/' } },
  document: {
    readyState: 'loading',
    addEventListener() {},
    getElementById() { return null; },
    querySelector() { return null; },
    createElement() { return {}; },
  },
  fetch: async () => ({ ok: false }),
  Intl,
  Date,
  Number,
  Object,
  String,
  Math,
  console,
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/estado-operacional.js', 'utf8'), context);

const api = context.window.EstadoOperacional;
const now = Date.parse('2026-09-01T10:00:00-03:00');
const open = {
  slug: 'open', nome: 'Aberto', estado: 'ABERTA', ativo: true,
  abreEm: '2026-09-01T08:00:00-03:00', fechaEm: '2026-09-01T18:00:00-03:00', fase: 'INSCRICOES',
};
const upcoming = {
  slug: 'soon', nome: 'Próximo', estado: 'FECHADA', ativo: false,
  abreEm: '2026-09-03T08:00:00-03:00', fechaEm: '2026-09-04T18:00:00-03:00', fase: 'PLANEJAMENTO',
};
const far = {
  slug: 'far', nome: 'Distante', estado: 'FECHADA', ativo: false,
  abreEm: '2026-09-20T08:00:00-03:00', fechaEm: '2026-09-21T18:00:00-03:00', fase: 'PLANEJAMENTO',
};
const unavailable = {
  slug: 'unknown', nome: 'Indisponível', estado: 'INDISPONIVEL', ativo: false,
  abreEm: '2026-09-02T08:00:00-03:00', fechaEm: '2026-09-03T18:00:00-03:00', fase: 'INDISPONIVEL',
};
const progress = {
  slug: 'progress', nome: 'Em apuração', estado: 'FECHADA', ativo: false,
  fase: 'APURACAO', abreEm: '', fechaEm: '',
};

assert.equal(api.isOpen(open, now), true);
assert.equal(api.isUpcoming(upcoming, now), true);
assert.equal(api.isUpcoming(far, now), false);
assert.equal(api.isUpcoming(unavailable, now), false);

const selected = api.selectCompactRecords({ projetos: { open, upcoming, far, unavailable, progress } }, now, 4);
assert.deepEqual(Array.from(selected, (item) => item.slug), ['open', 'soon']);

const empty = api.selectCompactRecords({ projetos: { far, unavailable, progress } }, now, 4);
assert.equal(empty.length, 0);

console.log('estado-operacional-ui.test.js: OK');
