const assert = require('node:assert/strict');
const test = require('node:test');

const { loadPayload, parseBoolean } = require('../scripts/update-mensais-alert');

const SPECIAL_PROJECT_IDS = ['lf-independencia', 'quina-saojoao', 'ds-pascoa', 'mega-virada'];

function withAlertEnvironment(projeto, ativo, callback) {
  const previousProject = process.env.ALERTA_PROJETO;
  const previousActive = process.env.ALERTA_ATIVO;
  process.env.ALERTA_PROJETO = projeto;
  process.env.ALERTA_ATIVO = ativo;
  try {
    callback();
  } finally {
    if (previousProject === undefined) delete process.env.ALERTA_PROJETO;
    else process.env.ALERTA_PROJETO = previousProject;
    if (previousActive === undefined) delete process.env.ALERTA_ATIVO;
    else process.env.ALERTA_ATIVO = previousActive;
  }
}

for (const projeto of SPECIAL_PROJECT_IDS) {
  test(`gera payload ativo para ${projeto}`, () => {
    withAlertEnvironment(projeto, 'true', () => {
      const payload = loadPayload();
      assert.equal(payload.projeto, projeto);
      assert.equal(payload.ativo, true);
      assert.match(payload.ultimaAtualizacao, /^\d{4}-\d{2}-\d{2}T/);
    });
  });

  test(`gera payload inativo para ${projeto}`, () => {
    withAlertEnvironment(projeto, 'false', () => {
      assert.equal(loadPayload().ativo, false);
    });
  });
}

for (const value of ['', '1', 'yes', 'sim', 'verdadeiro', 'falsey']) {
  test(`rejeita valor inválido de alerta: ${JSON.stringify(value)}`, () => {
    assert.throws(() => parseBoolean(value), /true ou false/);
  });
}
