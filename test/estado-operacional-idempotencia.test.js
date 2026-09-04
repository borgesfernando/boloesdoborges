const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

const { aplicarEstadoOperacionalComCursor } = require('../scripts/update-mensais-alert');

function pathsTemporarios() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'estado-operacional-'));
  return {
    dir,
    estado: path.join(dir, 'estado-operacional.json'),
    cursor: path.join(dir, '.github', 'state', 'estado-operacional-applied.json'),
  };
}

function payload(overrides = {}) {
  return {
    projeto: 'ds-mensal',
    ativo: true,
    concurso: '3006',
    correlationId: 'corr-1',
    eventType: 'ABRIR',
    revision: '1',
    estado: 'ABERTA',
    fase: 'INSCRICOES',
    abreEm: '2026-09-04T08:00:00-03:00',
    fechaEm: '2026-09-04T13:00:00-03:00',
    timezone: 'America/Sao_Paulo',
    atualizadoEm: '2026-09-04T11:00:00.000Z',
    contextoPublico: { concurso: '3006' },
    ultimaAtualizacao: '2026-09-04T11:00:00.000Z',
    ...overrides,
  };
}

function snapshot(paths) {
  return {
    estado: fs.existsSync(paths.estado) ? fs.readFileSync(paths.estado, 'utf8') : null,
    cursor: fs.existsSync(paths.cursor) ? fs.readFileSync(paths.cursor, 'utf8') : null,
  };
}

test('bootstrap canônico aplica primeira revisão sem expor cursor no schema v2', () => {
  const paths = pathsTemporarios();
  const resultado = aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, payload());
  assert.equal(resultado.aplicado, true);
  assert.equal(resultado.motivo, 'BOOTSTRAP_CANONICO');

  const agregado = JSON.parse(fs.readFileSync(paths.estado, 'utf8'));
  const cursor = JSON.parse(fs.readFileSync(paths.cursor, 'utf8'));
  assert.equal(agregado.schemaVersion, 2);
  assert.equal(agregado.projetos['ds-mensal'].estado, 'ABERTA');
  assert.equal(cursor.projetos['ds-mensal'].lastRevision, 1);
  assert.equal(cursor.projetos['ds-mensal'].lastEventType, 'ABRIR');
  const publico = JSON.stringify(agregado);
  assert.equal(publico.includes('lastRevision'), false);
  assert.equal(publico.includes('lastEventKey'), false);
  assert.equal(publico.includes('eventType'), false);
});

test('replay exato e revisão inferior não alteram agregado nem cursor', () => {
  const paths = pathsTemporarios();
  const abrir = payload();
  aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, abrir);
  const depoisAbrir = snapshot(paths);

  const replay = aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, abrir);
  assert.equal(replay.aplicado, false);
  assert.equal(replay.cursorAtualizado, false);
  assert.deepEqual(snapshot(paths), depoisAbrir);

  aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, payload({
    eventType: 'ATUALIZAR',
    revision: '2',
    fechaEm: '2026-09-04T14:00:00-03:00',
    fase: 'PREPARACAO_APOSTAS',
    atualizadoEm: '2026-09-04T12:00:00.000Z',
  }));
  const depoisRevisao2 = snapshot(paths);
  const inferior = aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, abrir);
  assert.equal(inferior.aplicado, false);
  assert.equal(inferior.motivo, 'REVISAO_INFERIOR');
  assert.deepEqual(snapshot(paths), depoisRevisao2);
});

test('mesma revisão ou eventKey com conteúdo divergente falha sem escrever', () => {
  const paths = pathsTemporarios();
  aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, payload());
  aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, payload({
    eventType: 'ATUALIZAR',
    revision: '2',
    fase: 'PREPARACAO_APOSTAS',
    atualizadoEm: '2026-09-04T12:00:00.000Z',
  }));
  const antes = snapshot(paths);
  assert.throws(() => aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, payload({
    eventType: 'ATUALIZAR',
    revision: '2',
    fase: 'APOSTAS_REGISTRADAS',
    atualizadoEm: '2026-09-04T12:01:00.000Z',
  })), /eventKey|revision/);
  assert.deepEqual(snapshot(paths), antes);
});

test('ABRIR e FECHAR repetidos idênticos são no-op público e avançam somente cursor', () => {
  const paths = pathsTemporarios();
  aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, payload());
  const agregadoAberto = fs.readFileSync(paths.estado, 'utf8');

  const abrir2 = aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, payload({
    revision: '2',
    atualizadoEm: '2026-09-04T11:05:00.000Z',
  }));
  assert.equal(abrir2.aplicado, false);
  assert.equal(abrir2.cursorAtualizado, true);
  assert.equal(fs.readFileSync(paths.estado, 'utf8'), agregadoAberto);

  aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, payload({
    ativo: false,
    eventType: 'FECHAR',
    revision: '3',
    estado: 'FECHADA',
    fase: 'ENCERRADA',
    atualizadoEm: '2026-09-04T16:00:00.000Z',
  }));
  const agregadoFechado = fs.readFileSync(paths.estado, 'utf8');
  const fechar4 = aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, payload({
    ativo: false,
    eventType: 'FECHAR',
    revision: '4',
    estado: 'FECHADA',
    fase: 'ENCERRADA',
    atualizadoEm: '2026-09-04T16:01:00.000Z',
  }));
  assert.equal(fechar4.aplicado, false);
  assert.equal(fechar4.cursorAtualizado, true);
  assert.equal(fs.readFileSync(paths.estado, 'utf8'), agregadoFechado);
});

test('nova correlação exige ABRIR revision=1 e reinicia cursor por instância', () => {
  const paths = pathsTemporarios();
  aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, payload());
  assert.throws(() => aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, payload({
    correlationId: 'corr-2',
    eventType: 'ATUALIZAR',
    revision: '2',
  })), /Nova instância/);

  const nova = aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, payload({
    concurso: '3007',
    correlationId: 'corr-2',
    revision: '1',
    abreEm: '2026-09-05T08:00:00-03:00',
    fechaEm: '2026-09-05T13:00:00-03:00',
    atualizadoEm: '2026-09-05T11:00:00.000Z',
    contextoPublico: { concurso: '3007' },
  }));
  assert.equal(nova.aplicado, true);
  const cursor = JSON.parse(fs.readFileSync(paths.cursor, 'utf8'));
  assert.equal(cursor.projetos['ds-mensal'].correlationId, 'corr-2');
  assert.equal(cursor.projetos['ds-mensal'].lastRevision, 1);
});

test('atualizações sequenciais de dois projetos preservam ambos no agregado', () => {
  const paths = pathsTemporarios();
  aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, payload());
  aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, payload({
    projeto: 'lf-mensal',
    concurso: '3551',
    correlationId: 'corr-lf',
    contextoPublico: { concurso: '3551' },
  }));
  const agregado = JSON.parse(fs.readFileSync(paths.estado, 'utf8'));
  assert.equal(agregado.projetos['ds-mensal'].correlationId, 'corr-1');
  assert.equal(agregado.projetos['lf-mensal'].correlationId, 'corr-lf');
});

test('bootstrap legado é aceito só antes de existir cursor canônico do projeto', () => {
  const paths = pathsTemporarios();
  const legado = payload({ eventType: '', revision: '' });
  const primeiro = aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, legado);
  assert.equal(primeiro.aplicado, true);
  assert.equal(fs.existsSync(paths.cursor), false);

  aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, payload());
  assert.throws(
    () => aplicarEstadoOperacionalComCursor(paths.estado, paths.cursor, legado),
    /sem eventType\/revision/,
  );
});
