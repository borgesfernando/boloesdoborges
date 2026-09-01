#!/usr/bin/env node
/**
 * Testes locais do validador de consistência entre os textos de apresentação
 * (js/config.js) e o calendário canônico CAIXA (data/calendario-caixa.json).
 *
 * Execute da raiz: node test/validate-projetos-sorteios.test.js
 */
'use strict';
const assert = require('assert');
const validador = require('../scripts/validate-projetos-sorteios.js');

// Parser de dias/horas a partir dos textos de apresentação.
{
  const { dias, horas } = validador.parsearDiasEHoras('segunda a sexta às 21h e domingo às 11h');
  assert.deepStrictEqual([...dias].sort(), ['FRI', 'MON', 'SUN', 'THU', 'TUE', 'WED'], 'range segunda a sexta + domingo');
  assert.deepStrictEqual([...horas].sort(), ['11:00', '21:00'], 'horas do texto');
}
{
  const { dias, horas } = validador.parsearDiasEHoras('segunda, quarta e sexta');
  assert.deepStrictEqual([...dias].sort(), ['FRI', 'MON', 'WED'], 'lista de dias sem horário');
  assert.strictEqual(horas.size, 0, 'sem horário explícito');
}

// Consistência contra o calendário canônico (fonte única).
const projetos = {
  'quina-mensal': { sorteios: 'segunda a sexta às 21h e domingo às 11h' },
  'lf-mensal': { sorteios: 'segunda a sexta às 21h e domingo às 11h' },
  'dupla-sena-mensal': { sorteios: 'segunda, quarta e sexta' }
};

for (const [id, esperado] of [
  ['quina-mensal', 'quina'],
  ['lf-mensal', 'lotofacil'],
  ['dupla-sena-mensal', 'duplasena']
]) {
  const problemas = validador.validarProjeto(id, projetos[id], esperado);
  assert.deepStrictEqual(problemas, [], id + ' consistente com o calendário canônico');
}
console.log('OK: textos de apresentação consistentes com o calendário canônico');

// Drift é detectado.
{
  const problemas = validador.validarProjeto('lf-mensal', { sorteios: 'terça e quinta às 20h' }, 'lotofacil');
  assert.ok(problemas.length > 0, 'drift é detectado');
  console.log('OK: drift detectado para texto divergente');
}

console.log('validate-projetos-sorteios.test.js: OK');
