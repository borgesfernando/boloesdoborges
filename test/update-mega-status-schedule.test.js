#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const updater = require('../scripts/update-mega-status.js');

const calendar = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'calendario-caixa.json'), 'utf8')
);

function atBrt(isoLocal) {
  return new Date(`${isoLocal}:00-03:00`);
}
function ids(set) {
  return [...set].sort();
}
function selected(isoLocal) {
  return ids(updater.selecionarModalidadesParaConsulta(atBrt(isoLocal), calendar));
}

assert.strictEqual(updater.PRE_DRAW_MINUTES, 0);
assert.strictEqual(updater.POST_DRAW_MINUTES, 150);

// Quarta-feira regular 21h: apenas modalidades que sorteiam na quarta.
assert.deepStrictEqual(selected('2026-09-02T20:59'), []);
assert.deepStrictEqual(
  selected('2026-09-02T21:00'),
  ['duplasena', 'lotofacil', 'maismilionaria', 'quina']
);
assert.deepStrictEqual(
  selected('2026-09-02T23:30'),
  ['duplasena', 'lotofacil', 'maismilionaria', 'quina']
);
assert.deepStrictEqual(selected('2026-09-02T23:31'), []);

// Sábado regular: nenhuma das cinco modalidades do mirror.
assert.deepStrictEqual(selected('2026-09-05T21:00'), []);

// Domingo regular 11h: Mega, +Milionária, Lotofácil e Quina.
assert.deepStrictEqual(
  selected('2026-09-06T11:00'),
  ['lotofacil', 'maismilionaria', 'megasena', 'quina']
);
assert.deepStrictEqual(
  selected('2026-09-06T13:30'),
  ['lotofacil', 'maismilionaria', 'megasena', 'quina']
);
assert.deepStrictEqual(selected('2026-09-06T13:31'), []);

// Exceção da Lotofácil da Independência às 20h substitui sua grade regular.
assert.deepStrictEqual(selected('2026-09-15T19:59'), []);
assert.deepStrictEqual(selected('2026-09-15T20:00'), ['lotofacil']);
assert.deepStrictEqual(selected('2026-09-15T20:50'), ['lotofacil']);
assert.deepStrictEqual(
  selected('2026-09-15T21:00'),
  ['lotofacil', 'megasena', 'quina']
);

// Freshness: antes do sorteio, 30/08 ainda é o último resultado esperado.
const stale385 = { dataApuracao: '30/08/2026', numero: 385, dataProximoConcurso: '02/09/2026' };
assert.strictEqual(
  updater.calcularFreshnessModalidade(calendar, 'maismilionaria', stale385, atBrt('2026-09-02T20:59'), false).freshness,
  'ATUAL'
);

// A partir de 21h, o resultado de 02/09 passa a ser esperado.
const waiting = updater.calcularFreshnessModalidade(
  calendar, 'maismilionaria', stale385, atBrt('2026-09-02T21:05'), true
);
assert.strictEqual(waiting.freshness, 'AGUARDANDO_APURACAO');
assert.strictEqual(waiting.esperadoDataApuracao, '02/09/2026');

const fresh386 = { dataApuracao: '02/09/2026', numero: 386, dataProximoConcurso: '06/09/2026' };
assert.strictEqual(
  updater.calcularFreshnessModalidade(calendar, 'maismilionaria', fresh386, atBrt('2026-09-02T21:05'), true).freshness,
  'ATUAL'
);

// Depois da janela, um snapshot ainda antigo fica explicitamente desatualizado.
assert.strictEqual(
  updater.calcularFreshnessModalidade(calendar, 'maismilionaria', stale385, atBrt('2026-09-03T00:01'), false).freshness,
  'DESATUALIZADO'
);

// O health deve mudar quando freshness muda, mas estabilizar sem timestamp por execução.
const now = atBrt('2026-09-02T21:05');
const snapshotsWaiting = [['maismilionaria', stale385, false, true]];
const health1 = updater.buildHealth(calendar, snapshotsWaiting, now, null);
assert.strictEqual(health1.modalidades.maismilionaria.freshness, 'AGUARDANDO_APURACAO');
const health2 = updater.buildHealth(calendar, snapshotsWaiting, atBrt('2026-09-02T21:10'), health1);
assert.strictEqual(health2.atualizadoEm, health1.atualizadoEm, 'health estável não gera novo timestamp');

// Validação rigorosa do schedule: cada run não-recovery deve estar dentro de uma
// janela real do calendário, e cada tick de 5 min das janelas deve ter cron.
const workflow = fs.readFileSync(
  path.join(__dirname, '..', '.github', 'workflows', 'update-mega-status.yml'),
  'utf8'
);
const crons = [...workflow.matchAll(/- cron: '([^']+)'/g)].map((m) => m[1]);

function fieldMatches(field, value) {
  return field.split(',').some((part) => {
    if (part === '*') return true;
    if (part.startsWith('*/')) return value % Number(part.slice(2)) === 0;
    const rangeStep = part.match(/^(\d+)-(\d+)\/(\d+)$/);
    if (rangeStep) {
      const [, a, b, step] = rangeStep.map(Number);
      return value >= a && value <= b && (value - a) % step === 0;
    }
    const range = part.match(/^(\d+)-(\d+)$/);
    if (range) {
      const a = Number(range[1]), b = Number(range[2]);
      return value >= a && value <= b;
    }
    return Number(part) === value;
  });
}

function cronMatches(cron, date) {
  const [min, hour, dom, month, dow] = cron.trim().split(/\s+/);
  return fieldMatches(min, date.getUTCMinutes()) &&
    fieldMatches(hour, date.getUTCHours()) &&
    fieldMatches(dom, date.getUTCDate()) &&
    fieldMatches(month, date.getUTCMonth() + 1) &&
    fieldMatches(dow, date.getUTCDay());
}
function hasRunAt(date) {
  return crons.some((cron) => cronMatches(cron, date));
}
function isRecovery(date) {
  const brt = updater.getBrtReference(date);
  return brt.getUTCHours() === 6 && brt.getUTCMinutes() === 0;
}
function activeCalendarWindow(date) {
  return updater.LOTERIAS.some(({ id }) =>
    updater.getDrawsForToday(calendar, id, date).some(({ time }) =>
      updater.isInsideCriticalWindow(time, date)
    )
  );
}

// Verifica de 19/07 a 31/12/2026 em resolução de 5 min.
// 1) cron não-recovery nunca roda fora de uma janela real;
// 2) toda janela real possui cron em cada tick.
const start = new Date('2026-07-19T00:00:00Z');
const end = new Date('2027-01-01T03:00:00Z');
for (let ms = start.getTime(); ms <= end.getTime(); ms += 5 * 60 * 1000) {
  const date = new Date(ms);
  const scheduled = hasRunAt(date);
  const active = activeCalendarWindow(date);
  if (scheduled && !isRecovery(date)) {
    assert.ok(active, `cron desnecessário fora de janela: ${date.toISOString()}`);
  }
  if (active) {
    assert.ok(scheduled, `janela sem cobertura de cron: ${date.toISOString()}`);
  }
}

console.log('update-mega-status-schedule.test.js: OK');
