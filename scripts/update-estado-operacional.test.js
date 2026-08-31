#!/usr/bin/env node
/**
 * Testes locais do atualizador de estado operacional (data/estado-operacional.json).
 * Exercita apenas a lógica Node em /tmp; não executa Apps Script nem chamadas externas.
 */
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { atualizarEstadoOperacional } = require('./update-mensais-alert.js');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'estado-operacional-test-'));
const estadoPath = path.join(tmp, 'estado-operacional.json');

const dadosMega = {
  projeto: 'mega-50mais',
  ativo: true,
  estado: 'ABERTA',
  concurso: '9999',
  abreEm: '2026-08-31T10:00:00Z',
  fechaEm: '2026-08-31T18:00:00-03:00',
  timezone: 'America/Sao_Paulo',
  correlationId: 'corr-mega-1',
  atualizadoEm: '2026-08-31T10:00:00Z',
};

const dadosMilionaria = {
  projeto: 'milionaria',
  ativo: true,
  estado: 'ABERTA',
  concurso: '390',
  abreEm: '2026-09-01T11:00:00Z',
  fechaEm: '2026-09-01T12:00:00-03:00',
  timezone: 'America/Sao_Paulo',
  correlationId: 'corr-mili-1',
  atualizadoEm: '2026-09-01T11:00:00Z',
};

// 1. Projeto desconhecido falha de forma segura (não cria nem corrompe)
{
  const r = atualizarEstadoOperacional(estadoPath, { projeto: 'desconhecido', ativo: true });
  assert.strictEqual(r.atualizado, false);
  assert.strictEqual(fs.existsSync(estadoPath), false);
  console.log('PASS: projeto desconhecido é ignorado com segurança');
}

// 2. Abertura da Mega cria a entrada dela
{
  const r = atualizarEstadoOperacional(estadoPath, dadosMega);
  assert.strictEqual(r.atualizado, true);
  const doc = JSON.parse(fs.readFileSync(estadoPath, 'utf8'));
  assert.strictEqual(doc.schemaVersion, 1);
  assert.strictEqual(doc.projetos['mega-50mais'].estado, 'ABERTA');
  assert.strictEqual(doc.projetos['mega-50mais'].janelaComunidade.aberta, true);
  assert.strictEqual(doc.projetos['mega-50mais'].correlationId, 'corr-mega-1');
  assert.strictEqual(doc.projetos['mega-50mais'].fonteEstado, 'Apps_Scripts');
  assert.strictEqual(doc.projetos['milionaria'], null);
  console.log('PASS: abertura da Mega cria entrada própria');
}

// 3. Atualizar Milionária não apaga a Mega (coexistência)
{
  atualizarEstadoOperacional(estadoPath, dadosMilionaria);
  const doc = JSON.parse(fs.readFileSync(estadoPath, 'utf8'));
  assert.strictEqual(doc.projetos['mega-50mais'].estado, 'ABERTA');
  assert.strictEqual(doc.projetos['mega-50mais'].concurso, '9999');
  assert.strictEqual(doc.projetos['milionaria'].estado, 'ABERTA');
  assert.strictEqual(doc.projetos['milionaria'].concurso, '390');
  console.log('PASS: Mega e Milionária coexistem no mesmo documento');
}

// 4. Idempotência: mesmo evento repetido não altera o arquivo
{
  const antes = fs.readFileSync(estadoPath, 'utf8');
  const r = atualizarEstadoOperacional(estadoPath, dadosMega);
  const depois = fs.readFileSync(estadoPath, 'utf8');
  assert.strictEqual(r.atualizado, false);
  assert.strictEqual(antes, depois);
  console.log('PASS: evento repetido com mesmo estado é idempotente');
}

// 5. Fechamento atualiza a mesma instância preservando concurso/correlationId
{
  const fechamento = Object.assign({}, dadosMilionaria, {
    ativo: false,
    estado: 'FECHADA',
    atualizadoEm: '2026-09-01T12:05:00Z',
  });
  atualizarEstadoOperacional(estadoPath, fechamento);
  const doc = JSON.parse(fs.readFileSync(estadoPath, 'utf8'));
  const mili = doc.projetos['milionaria'];
  assert.strictEqual(mili.estado, 'FECHADA');
  assert.strictEqual(mili.janelaComunidade.aberta, false);
  assert.strictEqual(mili.concurso, '390');
  assert.strictEqual(mili.correlationId, 'corr-mili-1');
  assert.strictEqual(mili.atualizadoEm, '2026-09-01T12:05:00Z');
  console.log('PASS: fechamento atualiza a mesma instância preservando concurso/correlationId');
}

// 6. Sanitização: o documento não pode conter segredos nem dados pessoais
{
  const conteudo = fs.readFileSync(estadoPath, 'utf8');
  for (const segredo of ['GITHUB_TOKEN', 'TELEGRAM_OUTBOUND_SECRET', 'segredo', 'senha', '@gmail.com', 'pix', 'token']) {
    assert.strictEqual(conteudo.toLowerCase().includes(segredo.toLowerCase()), false, `conteúdo não pode conter ${segredo}`);
  }
  const doc = JSON.parse(conteudo);
  const chavesMega = Object.keys(doc.projetos['mega-50mais']).sort();
  assert.deepStrictEqual(chavesMega, ['atualizadoEm', 'concurso', 'correlationId', 'estado', 'fonteEstado', 'janelaComunidade', 'timezone']);
  console.log('PASS: documento sanitizado, somente campos operacionais públicos');
}

// 7. Arquivo corrompido é reconstruído sem perder o projeto válido (falha segura)
{
  fs.writeFileSync(estadoPath, '{ corrompido', 'utf8');
  atualizarEstadoOperacional(estadoPath, dadosMega);
  const doc = JSON.parse(fs.readFileSync(estadoPath, 'utf8'));
  assert.strictEqual(doc.schemaVersion, 1);
  assert.strictEqual(doc.projetos['mega-50mais'].estado, 'ABERTA');
  assert.ok(doc.projetos.hasOwnProperty('milionaria'));
  console.log('PASS: arquivo corrompido é reconstruído com segurança');
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log('update-estado-operacional.test.js: OK');
